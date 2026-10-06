import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * PUT /api/families/:id/members/:userId - Изменить роль участника
 * Body: { role: 'ADMIN' | 'PARENT' | 'TEEN' | 'VIEWER' }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const currentUserId = await getCurrentUserId();
    const { id: familyId, userId: targetUserId } = await params;
    const body = await request.json();
    const { role } = body;

    // Валидация роли
    const validRoles = ['ADMIN', 'PARENT', 'TEEN', 'VIEWER'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required (ADMIN, PARENT, TEEN, VIEWER)' },
        { status: 400 }
      );
    }

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

    if (currentMember.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only admins can change member roles' },
        { status: 403 }
      );
    }

    // Проверяем, что целевой пользователь является членом семьи
    const targetMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: targetUserId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: 'User is not a member of this family' },
        { status: 404 }
      );
    }

    // Проверяем, что пользователь не пытается изменить свою собственную роль
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    // Проверяем, что создатель семьи остаётся админом
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { createdById: true },
    });

    if (family?.createdById === targetUserId && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change the role of the family creator from ADMIN' },
        { status: 400 }
      );
    }

    // Обновляем роль
    const updatedMember = await prisma.familyMember.update({
      where: {
        familyId_userId: {
          familyId,
          userId: targetUserId,
        },
      },
      data: { role },
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
    });

    return NextResponse.json({ 
      member: updatedMember,
      message: 'Role updated successfully',
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/families/:id/members/:userId - Удалить участника из семьи
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const currentUserId = await getCurrentUserId();
    const { id: familyId, userId: targetUserId } = await params;

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

    // Пользователь может удалить себя или админ может удалить других
    const canDelete = 
      currentUserId === targetUserId || 
      currentMember.role === 'ADMIN';

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Access denied. Only admins can remove other members' },
        { status: 403 }
      );
    }

    // Проверяем, что целевой пользователь является членом семьи
    const targetMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: targetUserId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: 'User is not a member of this family' },
        { status: 404 }
      );
    }

    // Нельзя удалить создателя семьи
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { createdById: true },
    });

    if (family?.createdById === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot remove the family creator. Delete the family instead' },
        { status: 400 }
      );
    }

    // Удаляем участника
    await prisma.familyMember.delete({
      where: {
        familyId_userId: {
          familyId,
          userId: targetUserId,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
