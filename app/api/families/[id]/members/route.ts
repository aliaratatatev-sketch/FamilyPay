import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * GET /api/families/:id/members - Получить список участников семьи
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: familyId } = await params;

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

    // Получаем всех участников
    const members = await prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/families/:id/members - Добавить участника в семью по user ID
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUserId = await getCurrentUserId();
    const { id: familyId } = await params;

    // Проверяем права текущего пользователя
    const currentMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: currentUserId,
        },
      },
    });

    if (!currentMember) {
      return NextResponse.json(
        { error: 'Access denied. You are not a member of this family' },
        { status: 403 }
      );
    }

    // Только ADMIN и PARENT могут добавлять участников
    if (currentMember.role !== 'ADMIN' && currentMember.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Only admins and parents can add members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Проверяем, не является ли пользователь уже членом семьи
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this family' },
        { status: 400 }
      );
    }

    // Получаем информацию о семье для уведомления
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { id: true, name: true },
    });

    // Создаем нового члена семьи и уведомление в транзакции
    const [newMember, notification] = await prisma.$transaction([
      prisma.familyMember.create({
        data: {
          familyId,
          userId,
          role: role || 'VIEWER',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          type: 'FAMILY_INVITE',
          title: 'Приглашение в семью',
          message: `Вы были добавлены в семью "${family?.name || 'Без названия'}"`,
          data: JSON.parse(JSON.stringify({
            familyId,
            familyName: family?.name,
            role: role || 'VIEWER',
          })),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `${userToAdd.name || userToAdd.email} successfully added to the family`,
    });
  } catch (error) {
    console.error('Error adding member:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to add member',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
