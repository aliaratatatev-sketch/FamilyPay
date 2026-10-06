import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * Проверить доступ пользователя к счёту
 */
async function checkAccountAccess(accountId: string, userId: string) {
  const account = await prisma.financialAccount.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      familyId: true,
      family: {
        select: {
          members: {
            where: {
              userId,
            },
            select: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!account) {
    return { hasAccess: false, account: null, member: null };
  }

  const member = account.family.members[0];
  
  if (!member) {
    return { hasAccess: false, account: null, member: null };
  }

  return { hasAccess: true, account, member };
}

/**
 * GET /api/accounts/:id - Получить детали счёта
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: accountId } = await params;

    const { hasAccess, account: accountCheck } = await checkAccountAccess(accountId, userId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied or account not found' },
        { status: 403 }
      );
    }

    // Получаем полные данные счёта
    const account = await prisma.financialAccount.findUnique({
      where: { id: accountId },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching account:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/accounts/:id - Обновить счёт
 * Body: { name?: string, description?: string, color?: string, icon?: string, isActive?: boolean }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: accountId } = await params;
    const body = await request.json();

    const { hasAccess, member } = await checkAccountAccess(accountId, userId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied or account not found' },
        { status: 403 }
      );
    }

    // Только админы и родители могут редактировать счета
    if (member?.role !== 'ADMIN' && member?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can update accounts' },
        { status: 403 }
      );
    }

    const { name, description, color, icon, isActive } = body;
    const updateData: any = {};

    // Валидация и подготовка данных
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string' },
          { status: 400 }
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { error: 'Name must be less than 100 characters' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (color !== undefined) {
      updateData.color = color || null;
    }

    if (icon !== undefined) {
      updateData.icon = icon || null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // Обновляем счёт
    const account = await prisma.financialAccount.update({
      where: { id: accountId },
      data: updateData,
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

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error updating account:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounts/:id - Удалить (деактивировать) счёт
 * Вместо физического удаления, устанавливаем isActive = false
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: accountId } = await params;

    const { hasAccess, member } = await checkAccountAccess(accountId, userId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied or account not found' },
        { status: 403 }
      );
    }

    // Только админы могут удалять счета
    if (member?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only admins can delete accounts' },
        { status: 403 }
      );
    }

    // Деактивируем счёт вместо удаления
    await prisma.financialAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Account deactivated successfully' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
