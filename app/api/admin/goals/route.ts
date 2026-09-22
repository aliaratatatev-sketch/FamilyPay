import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/goals - получить все цели
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const status = searchParams.get('status');

    const where: any = {};
    if (familyId) where.familyId = familyId;
    if (status) where.status = status;

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        family: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        allocations: {
          include: {
            account: true
          }
        }
      }
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST /api/admin/goals - создать цель
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyId, userId, name, description, targetAmount, currentAmount, currency, targetDate, status, color, icon } = body;

    if (!familyId || !userId || !name || !targetAmount) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        familyId,
        userId,
        name,
        description,
        targetAmount,
        currentAmount: currentAmount || 0,
        currency: currency || 'RUB',
        targetDate: targetDate ? new Date(targetDate) : null,
        status: status || 'ACTIVE',
        color,
        icon
      },
      include: {
        family: true,
        user: true
      }
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// PATCH /api/admin/goals - обновить цель
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, targetAmount, currentAmount, targetDate, status, color, icon } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const updateData: any = { name, description, targetAmount, currentAmount, status, color, icon };
    if (targetDate) updateData.targetDate = new Date(targetDate);

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        family: true,
        user: true
      }
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

// DELETE /api/admin/goals - удалить цель
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    await prisma.goal.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
