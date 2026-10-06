import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * Проверить, является ли пользователь членом семьи
 */
async function checkFamilyMembership(familyId: string, userId: string) {
  const member = await prisma.familyMember.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId,
      },
    },
  });
  
  return member;
}

/**
 * GET /api/families/:id - Получить детали семьи
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: familyId } = await params;

    // Проверяем, является ли пользователь членом семьи
    const member = await checkFamilyMembership(familyId, userId);
    
    if (!member) {
      return NextResponse.json(
        { error: 'Access denied. You are not a member of this family' },
        { status: 403 }
      );
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
          orderBy: {
            joinedAt: 'asc',
          },
        },
        accounts: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
            goals: true,
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

    // Добавляем роль текущего пользователя в ответ
    return NextResponse.json({ 
      family,
      userRole: member.role,
    });
  } catch (error) {
    console.error('Error fetching family:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch family' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/families/:id - Обновить семью
 * Body: { name?: string, currency?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: familyId } = await params;
    const body = await request.json();

    // Проверяем, является ли пользователь админом семьи
    const member = await checkFamilyMembership(familyId, userId);
    
    if (!member) {
      return NextResponse.json(
        { error: 'Access denied. You are not a member of this family' },
        { status: 403 }
      );
    }

    if (member.role !== 'ADMIN' && member.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can update family' },
        { status: 403 }
      );
    }

    const { name, currency } = body;
    const updateData: any = {};

    // Валидация и подготовка данных для обновления
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

    if (currency !== undefined) {
      const validCurrencies = ['RUB', 'USD', 'EUR', 'KGS'];
      if (!validCurrencies.includes(currency)) {
        return NextResponse.json(
          { error: 'Invalid currency. Allowed: RUB, USD, EUR, KGS' },
          { status: 400 }
        );
      }
      updateData.currency = currency;
    }

    // Обновляем семью
    const family = await prisma.family.update({
      where: { id: familyId },
      data: updateData,
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
        _count: {
          select: {
            transactions: true,
            budgets: true,
            goals: true,
          },
        },
      },
    });

    return NextResponse.json({ family });
  } catch (error) {
    console.error('Error updating family:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update family' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/families/:id - Удалить семью
 * Может удалить только создатель семьи (createdBy)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: familyId } = await params;

    // Проверяем существование семьи
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: {
        createdById: true,
      },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Только создатель может удалить семью
    if (family.createdById !== userId) {
      return NextResponse.json(
        { error: 'Access denied. Only the creator can delete the family' },
        { status: 403 }
      );
    }

    // Удаляем семью (каскадное удаление настроено в схеме)
    await prisma.family.delete({
      where: { id: familyId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Family deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting family:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete family' },
      { status: 500 }
    );
  }
}
