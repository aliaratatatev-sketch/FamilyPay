import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * POST /api/money-requests/:id/reject - Отклонить запрос на деньги
 * Body: {
 *   reason?: string - причина отклонения
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    const moneyRequest = await prisma.moneyRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Проверяем права - только ADMIN или PARENT могут отклонять
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: moneyRequest.familyId,
          userId,
        },
      },
    });

    if (!member || (member.role !== 'ADMIN' && member.role !== 'PARENT')) {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can reject requests' },
        { status: 403 }
      );
    }

    // Проверяем статус
    if (moneyRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only reject pending requests' },
        { status: 400 }
      );
    }

    // Обновляем статус запроса
    const updatedRequest = await prisma.moneyRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approverId: userId,
        processedAt: new Date(),
        rejectionReason: reason,
      },
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

    // Уведомляем отправителя запроса
    await prisma.notification.create({
      data: {
        userId: moneyRequest.requesterId,
        type: 'REQUEST_REJECTED',
        title: 'Запрос отклонен',
        message: reason 
          ? `Ваш запрос на ${moneyRequest.amount} ${moneyRequest.currency} для "${moneyRequest.title}" отклонен. Причина: ${reason}`
          : `Ваш запрос на ${moneyRequest.amount} ${moneyRequest.currency} для "${moneyRequest.title}" отклонен`,
        data: JSON.parse(JSON.stringify({
          moneyRequestId: id,
          familyId: moneyRequest.familyId,
          familyName: moneyRequest.family.name,
          amount: moneyRequest.amount,
          title: moneyRequest.title,
          reason,
        })),
      },
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: 'Money request rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting money request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to reject money request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
