import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * GET /api/budgets - Получить список бюджетов
 * Query params: familyId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    let where: any = {};

    if (familyId) {
      // Проверяем доступ к семье
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
      // Получаем бюджеты всех семей пользователя
      const families = await prisma.family.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
        select: { id: true },
      });

      where.familyId = { in: families.map(f => f.id) };
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budgets - Создать новый бюджет
 * Body: { familyId, categoryId, name, amount, period, startDate, endDate }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { familyId, categoryId, name, amount, period, startDate, endDate } = body;

    // Валидация
    if (!familyId || !categoryId || !name || !amount || !period || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Проверяем доступ к семье
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

    // Только ADMIN и PARENT могут создавать бюджеты
    if (member.role !== 'ADMIN' && member.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can create budgets' },
        { status: 403 }
      );
    }

    // Получаем валюту семьи
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { currency: true, name: true },
    });

    // Создаём бюджет
    const budget = await prisma.budget.create({
      data: {
        familyId,
        categoryId,
        userId,
        name,
        amount,
        currency: family?.currency || 'RUB',
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        spent: 0,
        isActive: true,
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
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

    // Создаём уведомление
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Бюджет создан',
        message: `Создан бюджет "${name}" на ${amount} ${family?.currency || 'RUB'}`,
        data: JSON.parse(JSON.stringify({
          budgetId: budget.id,
          familyId,
          familyName: family?.name,
          amount,
          period,
        })),
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create budget',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
