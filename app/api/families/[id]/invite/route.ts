import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { randomBytes } from 'crypto';

/**
 * POST /api/families/:id/invite - Пригласить пользователя в семью
 * Body: { email: string, role?: 'ADMIN' | 'PARENT' | 'TEEN' | 'VIEWER' }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: familyId } = await params;
    const body = await request.json();
    const { email, role = 'VIEWER' } = body;

    // Валидация email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Валидация роли
    const validRoles = ['ADMIN', 'PARENT', 'TEEN', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Проверяем права текущего пользователя
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

    if (member.role !== 'ADMIN' && member.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can invite members' },
        { status: 403 }
      );
    }

    // Проверяем, существует ли пользователь с таким email
    const invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Если пользователь уже в семье
    if (invitedUser) {
      const existingMember = await prisma.familyMember.findUnique({
        where: {
          familyId_userId: {
            familyId,
            userId: invitedUser.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this family' },
          { status: 400 }
        );
      }
    }

    // Проверяем, нет ли уже активного приглашения
    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyId,
        email: email.toLowerCase(),
        expires: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An active invitation already exists for this email' },
        { status: 400 }
      );
    }

    // Генерируем уникальный токен для приглашения
    const token = randomBytes(32).toString('hex');
    
    // Приглашение действительно 7 дней
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Создаём приглашение
    const invitation = await prisma.familyInvitation.create({
      data: {
        familyId,
        email: email.toLowerCase(),
        role,
        token,
        expires: expiresAt,
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // TODO: Отправить email с приглашением
    // В реальном приложении здесь нужно отправить email
    // с ссылкой вида: https://yoursite.com/join?token=${token}

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires: invitation.expires,
        inviteLink: `${process.env.NEXTAUTH_URL}/join?token=${token}`,
      },
      message: 'Invitation created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/families/:id/invite - Получить список приглашений семьи
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: familyId } = await params;

    // Проверяем права доступа
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

    // Получаем список активных приглашений
    const invitations = await prisma.familyInvitation.findMany({
      where: {
        familyId,
        expires: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
