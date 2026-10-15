import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * POST /api/money-requests/:id/approve - Одобрить запрос на деньги и списать со счета
 * Body: {
 *   accountId: string - ID счета для списания
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

    // Валидация обязательного параметра
    if (!accountId) {
      return NextResponse.json(
        { error: 'Необходимо выбрать счет для списания' },
        { status: 400 }
      );
    }

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
        { error: 'Запрос не найден' },
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
        { error: 'Доступ запрещен. Только администраторы и родители могут одобрять запросы' },
        { status: 403 }
      );
    }

    // Проверяем статус
    if (moneyRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Можно одобрить только запросы в статусе ожидания' },
        { status: 400 }
      );
    }

    // Проверяем, что счет принадлежит семье
    const account = await prisma.financialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Счет не найден' },
        { status: 404 }
      );
    }

    if (account.familyId !== moneyRequest.familyId) {
      return NextResponse.json(
        { error: 'Счет не принадлежит семье' },
        { status: 403 }
      );
    }

    // КРИТИЧЕСКАЯ ПРОВЕРКА: достаточно ли средств на счету
    const currentBalance = Number(account.balance);
    const requestAmount = Number(moneyRequest.amount);

    if (currentBalance < requestAmount) {
      return NextResponse.json(
        { 
          error: `Недостаточно средств на счете. Доступно: ${currentBalance.toFixed(2)} ${account.currency}, требуется: ${requestAmount.toFixed(2)} ${moneyRequest.currency}` 
        },
        { status: 400 }
      );
    }

    // Используем транзакцию БД для атомарности операции
    const result = await prisma.$transaction(async (tx) => {
      // 1. Создаем транзакцию расхода
      const transaction = await tx.transaction.create({
        data: {
          familyId: moneyRequest.familyId,
          accountId: account.id,
          userId,
          type: 'EXPENSE',
          amount: moneyRequest.amount,
          currency: moneyRequest.currency,
          description: `${moneyRequest.title} - запрос от ${moneyRequest.requester.name || moneyRequest.requester.email}`,
          date: new Date(),
        },
      });

      // 2. Списываем сумму со счета
      const newBalance = new Decimal(account.balance).minus(new Decimal(moneyRequest.amount));
      
      await tx.financialAccount.update({
        where: { id: account.id },
        data: { balance: newBalance },
      });

      // 3. Обновляем статус запроса на COMPLETED и привязываем счет и транзакцию
      const updatedRequest = await tx.moneyRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          approverId: userId,
          accountId: account.id,
          transactionId: transaction.id,
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
          account: {
            select: {
              id: true,
              name: true,
              balance: true,
              currency: true,
            },
          },
        },
      });

      // 4. Уведомляем отправителя запроса
      await tx.notification.create({
        data: {
          userId: moneyRequest.requesterId,
          type: 'REQUEST_APPROVED',
          title: 'Запрос одобрен! ✅',
          message: `Ваш запрос на ${moneyRequest.amount} ${moneyRequest.currency} для "${moneyRequest.title}" одобрен и выполнен. Средства списаны со счета ${account.name}`,
          data: JSON.parse(JSON.stringify({
            moneyRequestId: id,
            familyId: moneyRequest.familyId,
            familyName: moneyRequest.family.name,
            amount: moneyRequest.amount,
            title: moneyRequest.title,
            transactionId: transaction.id,
            accountName: account.name,
            accountId: account.id,
          })),
        },
      });

      return { updatedRequest, transaction, newBalance };
    });

    return NextResponse.json({
      success: true,
      request: result.updatedRequest,
      transaction: result.transaction,
      newBalance: result.newBalance.toNumber(),
      message: 'Запрос одобрен, деньги успешно списаны со счета',
    });
  } catch (error) {
    console.error('Error approving money request:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Не удалось одобрить запрос',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
