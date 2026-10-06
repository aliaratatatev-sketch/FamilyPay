import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * GET /api/budgets/:id - Получить детали бюджета
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;

    const budget = await prisma.budget.findUnique({
      where: { id },
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
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Проверяем доступ
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: budget.familyId,
          userId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error fetching budget:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/budgets/:id - Обновить бюджет
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    const body = await request.json();

    const existingBudget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Проверяем доступ
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: existingBudget.familyId,
          userId,
        },
      },
    });

    if (!member || (member.role !== 'ADMIN' && member.role !== 'PARENT')) {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can update budgets' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.alertAt50 !== undefined) updateData.alertAt50 = body.alertAt50;
    if (body.alertAt80 !== undefined) updateData.alertAt80 = body.alertAt80;
    if (body.alertAt100 !== undefined) updateData.alertAt100 = body.alertAt100;

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error updating budget:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budgets/:id - Удалить бюджет
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;

    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Проверяем доступ
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: budget.familyId,
          userId,
        },
      },
    });

    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only admins can delete budgets' },
        { status: 403 }
      );
    }

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Budget deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
