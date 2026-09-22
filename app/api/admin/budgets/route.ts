import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/budgets - получить все бюджеты
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    const where: any = {};
    if (familyId) where.familyId = familyId;

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        family: true,
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

// POST /api/admin/budgets - создать бюджет
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyId, categoryId, userId, name, amount, currency, period, startDate, endDate, isActive } = body;

    if (!familyId || !categoryId || !userId || !name || !amount || !period || !startDate || !endDate) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const budget = await prisma.budget.create({
      data: {
        familyId,
        categoryId,
        userId,
        name,
        amount,
        currency: currency || 'RUB',
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        family: true,
        category: true,
        user: true
      }
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}

// PATCH /api/admin/budgets - обновить бюджет
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, amount, spent, period, startDate, endDate, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }

    const updateData: any = { name, amount, spent, period, isActive };
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        family: true,
        category: true,
        user: true
      }
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

// DELETE /api/admin/budgets - удалить бюджет
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }

    await prisma.budget.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
