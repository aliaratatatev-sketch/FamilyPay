import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * POST /api/money-requests/:id/approve - Одобрить запрос на деньги
 * Body: {
 *   paymentMethod?: string - метод оплаты (sber, odengi, mbank, cash)
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
    const { paymentMethod } = body;

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

    // Проверяем права - только ADMIN или PARENT могут одобрять
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
        { error: 'Access denied. Only admins and parents can approve requests' },
        { status: 403 }
      );
    }

    // Проверяем статус
    if (moneyRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only approve pending requests' },
        { status: 400 }
      );
    }

    // MockBank: Имитация банковского перевода
    let transaction = null;
    if (paymentMethod) {
      const bankNames: Record<string, string> = {
        sber: 'Сбер',
        odengi: 'О!Деньги',
        mbank: 'MBANK',
        cash: 'Наличные',
      };

      // Ищем любой счет семьи для привязки транзакции (требование схемы)
      const familyAccount = await prisma.financialAccount.findFirst({
        where: { familyId: moneyRequest.familyId },
      });

      if (!familyAccount) {
        // Если нет счетов, просто одобряем без транзакции
        const updatedRequest = await prisma.moneyRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approverId: userId,
            processedAt: new Date(),
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

        await prisma.notification.create({
          data: {
            userId: moneyRequest.requesterId,
            type: 'REQUEST_APPROVED',
            title: 'Запрос одобрен! ✅',
            message: `Ваш запрос на ${moneyRequest.amount} ${moneyRequest.currency} для "${moneyRequest.title}" одобрен`,
            data: JSON.parse(JSON.stringify({
              moneyRequestId: id,
              familyId: moneyRequest.familyId,
              familyName: moneyRequest.family.name,
              amount: moneyRequest.amount,
              title: moneyRequest.title,
            })),
          },
        });

        return NextResponse.json({
          success: true,
          request: updatedRequest,
          message: 'Money request approved successfully',
        });
      }

      // Создаем транзакцию с информацией о банке
      transaction = await prisma.transaction.create({
        data: {
          familyId: moneyRequest.familyId,
          accountId: familyAccount.id,
          userId,
          type: 'EXPENSE',
          amount: moneyRequest.amount,
          currency: moneyRequest.currency,
          description: `${moneyRequest.title} (через ${bankNames[paymentMethod] || paymentMethod}) - запрос от ${moneyRequest.requester.name || moneyRequest.requester.email}`,
          date: new Date(),
        },
      });
    }

    // Обновляем статус запроса
    const updatedRequest = await prisma.moneyRequest.update({
      where: { id },
      data: {
        status: transaction ? 'COMPLETED' : 'APPROVED',
        approverId: userId,
        processedAt: new Date(),
        transactionId: transaction?.id,
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
        type: 'REQUEST_APPROVED',
        title: 'Запрос одобрен! ✅',
        message: `Ваш запрос на ${moneyRequest.amount} ${moneyRequest.currency} для "${moneyRequest.title}" одобрен`,
        data: JSON.parse(JSON.stringify({
          moneyRequestId: id,
          familyId: moneyRequest.familyId,
          familyName: moneyRequest.family.name,
          amount: moneyRequest.amount,
          title: moneyRequest.title,
          transactionId: transaction?.id,
        })),
      },
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      transaction,
      message: 'Money request approved successfully',
    });
  } catch (error) {
    console.error('Error approving money request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to approve money request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
