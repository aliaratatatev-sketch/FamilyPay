import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * POST /api/families/join - Принять приглашение в семью
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Valid token is required' },
        { status: 400 }
      );
    }

    // Ищем приглашение по токену
    const invitation = await prisma.familyInvitation.findUnique({
      where: { token },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Проверяем, не истекло ли приглашение
    if (invitation.expires < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Получаем email текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Проверяем, что email совпадает
    if (currentUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation is for a different email address' },
        { status: 403 }
      );
    }

    // Проверяем, не является ли пользователь уже членом семьи
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: invitation.familyId,
          userId: userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this family' },
        { status: 400 }
      );
    }

    // Добавляем пользователя в семью
    const member = await prisma.familyMember.create({
      data: {
        familyId: invitation.familyId,
        userId: userId,
        role: invitation.role,
      },
      include: {
        family: {
          include: {
            members: {
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
            },
            accounts: {
              where: {
                isActive: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Удаляем использованное приглашение
    await prisma.familyInvitation.delete({
      where: { id: invitation.id },
    });

    return NextResponse.json({
      member,
      message: `Successfully joined ${invitation.family.name}`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error joining family:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to join family' },
      { status: 500 }
    );
  }
}
