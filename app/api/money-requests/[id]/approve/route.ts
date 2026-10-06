import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * POST /api/money-requests/:id/approve - Одобрить запрос на деньги
 * Body: {
 *   accountId?: string - из какого счета перевести (опционально)
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
    const { accountId } = body;

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

    // Если указан счет, создаем транзакцию
    let transaction = null;
    if (accountId) {
      // Проверяем, что счет существует и принадлежит семье
      const account = await prisma.financialAccount.findFirst({
        where: {
          id: accountId,
          familyId: moneyRequest.familyId,
        },
      });

      if (!account) {
        return NextResponse.json(
          { error: 'Account not found or does not belong to this family' },
          { status: 404 }
        );
      }

      // Проверяем баланс
      if (Number(account.balance) < Number(moneyRequest.amount)) {
        return NextResponse.json(
          { error: 'Insufficient balance in the selected account' },
          { status: 400 }
        );
      }

      // Создаем транзакцию
      transaction = await prisma.transaction.create({
        data: {
          familyId: moneyRequest.familyId,
          accountId,
          userId,
          type: 'EXPENSE',
          amount: moneyRequest.amount,
          currency: moneyRequest.currency,
          description: `${moneyRequest.title} (запрос от ${moneyRequest.requester.name || moneyRequest.requester.email})`,
          date: new Date(),
        },
      });

      // Обновляем баланс счета
      await prisma.financialAccount.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: moneyRequest.amount,
          },
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
