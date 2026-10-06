import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * GET /api/money-requests/:id - Получить детали запроса
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;

    const moneyRequest = await prisma.moneyRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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

    if (!moneyRequest) {
      return NextResponse.json(
        { error: 'Money request not found' },
        { status: 404 }
      );
    }

    // Проверяем доступ - пользователь должен быть членом семьи
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: moneyRequest.familyId,
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

    return NextResponse.json({ request: moneyRequest });
  } catch (error) {
    console.error('Error fetching money request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch money request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/money-requests/:id - Отменить запрос (только автор)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;

    const moneyRequest = await prisma.moneyRequest.findUnique({
      where: { id },
    });

    if (!moneyRequest) {
      return NextResponse.json(
        { error: 'Money request not found' },
        { status: 404 }
      );
    }

    // Проверяем, что это автор запроса
    if (moneyRequest.requesterId !== userId) {
      return NextResponse.json(
        { error: 'Only the requester can cancel this request' },
        { status: 403 }
      );
    }

    // Можно отменить только PENDING запросы
    if (moneyRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending requests' },
        { status: 400 }
      );
    }

    // Отменяем запрос
    await prisma.moneyRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Money request cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling money request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to cancel money request' },
      { status: 500 }
    );
  }
}
