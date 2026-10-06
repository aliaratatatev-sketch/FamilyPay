import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * GET /api/money-requests - Получить список запросов на деньги
 * Query params: 
 *   - familyId: string (optional) - фильтр по семье
 *   - status: string (optional) - фильтр по статусу
 *   - requesterId: string (optional) - фильтр по отправителю
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const status = searchParams.get('status');
    const requesterId = searchParams.get('requesterId');

    // Базовый фильтр
    const where: any = {};

    // Если указана семья, проверяем доступ
    if (familyId) {
      const member = await prisma.familyMember.findUnique({
        where: {
          familyId_userId: {
            familyId,
            userId,
          },
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: 'Access denied. You are not a member of this family' },
          { status: 403 }
        );
      }

      where.familyId = familyId;
    } else {
      // Получаем все семьи пользователя
      const familyMembers = await prisma.familyMember.findMany({
        where: { userId },
        select: { familyId: true },
      });

      const familyIds = familyMembers.map((fm) => fm.familyId);
      where.familyId = { in: familyIds };
    }

    // Применяем дополнительные фильтры
    if (status) {
      where.status = status;
    }

    if (requesterId) {
      where.requesterId = requesterId;
    }

    // Получаем запросы
    const requests = await prisma.moneyRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching money requests:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch money requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/money-requests - Создать новый запрос на деньги
 * Body: {
 *   familyId: string,
 *   amount: number,
 *   title: string,
 *   description?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { familyId, amount, title, description } = body;

    // Валидация
    if (!familyId || !amount || !title) {
      return NextResponse.json(
        { error: 'Family ID, amount, and title are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Проверяем, является ли пользователь членом семьи
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Access denied. You are not a member of this family' },
        { status: 403 }
      );
    }

    // Получаем информацию о семье
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { 
        id: true, 
        name: true,
        currency: true,
        members: {
          where: {
            role: {
              in: ['ADMIN', 'PARENT'],
            },
          },
          select: {
            userId: true,
          },
        },
      },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Создаем запрос на деньги
    const moneyRequest = await prisma.moneyRequest.create({
      data: {
        familyId,
        requesterId: userId,
        amount,
        currency: family.currency,
        title,
        description,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    // Создаем уведомления для всех родителей/админов
    const notifications = family.members.map((m) => ({
      userId: m.userId,
      type: 'MONEY_REQUEST' as const,
      title: 'Новый запрос на деньги',
      message: `${moneyRequest.requester.name || moneyRequest.requester.email} запрашивает ${amount} ${family.currency} на "${title}"`,
      data: JSON.parse(JSON.stringify({
        moneyRequestId: moneyRequest.id,
        familyId,
        familyName: family.name,
        requesterId: userId,
        amount,
        title,
      })),
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    return NextResponse.json({
      success: true,
      request: moneyRequest,
      message: 'Money request created successfully',
    });
  } catch (error) {
    console.error('Error creating money request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create money request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
