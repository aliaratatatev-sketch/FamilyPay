import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * Проверить доступ пользователя к транзакции
 */
async function checkTransactionAccess(transactionId: string, userId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: {
      id: true,
      familyId: true,
      type: true,
      amount: true,
      accountId: true,
      toAccountId: true,
      categoryId: true,
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

  if (!transaction) {
    return { hasAccess: false, transaction: null, member: null };
  }

  const member = transaction.family.members[0];
  
  if (!member) {
    return { hasAccess: false, transaction: null, member: null };
  }

  return { hasAccess: true, transaction, member };
}

/**
 * GET /api/transactions/:id - Получить детали транзакции
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const transactionId = params.id;

    const { hasAccess } = await checkTransactionAccess(transactionId, userId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied or transaction not found' },
        { status: 403 }
      );
    }

    // Получаем полные данные транзакции
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
        user: {
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

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/transactions/:id - Обновить транзакцию
 * Body: { amount?, description?, categoryId?, date?, location?, tags? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const transactionId = params.id;
    const body = await request.json();

    const { hasAccess, transaction: existingTransaction, member } = await checkTransactionAccess(transactionId, userId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied or transaction not found' },
        { status: 403 }
      );
    }

    // Только админы и родители могут редактировать транзакции
    if (member?.role !== 'ADMIN' && member?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can update transactions' },
        { status: 403 }
      );
    }

    const { amount, description, categoryId, date, location, tags } = body;
    const updateData: any = {};

    // Валидация и подготовка данных
    if (amount !== undefined) {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number' },
          { status: 400 }
        );
      }

      // Если сумма изменилась, нужно обновить балансы
      const oldAmount = Number(existingTransaction!.amount);
      const amountDiff = amountValue - oldAmount;

      if (amountDiff !== 0) {
        await prisma.$transaction(async (tx) => {
          // Обновляем баланс счёта
          const balanceChange = existingTransaction!.type === 'INCOME' 
            ? amountDiff 
            : -amountDiff;

          await tx.financialAccount.update({
            where: { id: existingTransaction!.accountId },
            data: {
              balance: {
                increment: balanceChange,
              },
            },
          });

          // Если это перевод, обновляем счёт-получатель
          if (existingTransaction!.type === 'TRANSFER' && existingTransaction!.toAccountId) {
            await tx.financialAccount.update({
              where: { id: existingTransaction!.toAccountId },
              data: {
                balance: {
                  increment: amountDiff,
                },
              },
            });
          }

          // Если это расход, обновляем бюджеты
          if (existingTransaction!.type === 'EXPENSE' && existingTransaction!.categoryId) {
            const now = new Date();
            await tx.budget.updateMany({
              where: {
                familyId: existingTransaction!.familyId,
                categoryId: existingTransaction!.categoryId,
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
              },
              data: {
                spent: {
                  increment: amountDiff,
                },
              },
            });
          }
        });
      }

      updateData.amount = amountValue;
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId || null;
    }

    if (date !== undefined) {
      updateData.date = date ? new Date(date) : new Date();
    }

    if (location !== undefined) {
      updateData.location = location || null;
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : [];
    }

    // Обновляем транзакцию
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Логируем действие
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'Transaction',
        entityId: transactionId,
        description: `Updated transaction`,
        metadata: { changes: updateData },
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transactions/:id - Удалить транзакцию
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const transactionId = params.id;

    const { hasAccess, transaction: existingTransaction, member } = await checkTransactionAccess(transactionId, userId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied or transaction not found' },
        { status: 403 }
      );
    }

    // Только админы и родители могут удалять транзакции
    if (member?.role !== 'ADMIN' && member?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can delete transactions' },
        { status: 403 }
      );
    }

    // Удаляем транзакцию и откатываем балансы
    await prisma.$transaction(async (tx) => {
      const amount = Number(existingTransaction!.amount);

      // Откатываем баланс счёта-источника
      const balanceChange = existingTransaction!.type === 'INCOME' 
        ? -amount 
        : amount;

      await tx.financialAccount.update({
        where: { id: existingTransaction!.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      // Если это перевод, откатываем баланс счёта-получателя
      if (existingTransaction!.type === 'TRANSFER' && existingTransaction!.toAccountId) {
        await tx.financialAccount.update({
          where: { id: existingTransaction!.toAccountId },
          data: {
            balance: {
              increment: -amount,
            },
          },
        });
      }

      // Если это расход, откатываем бюджеты
      if (existingTransaction!.type === 'EXPENSE' && existingTransaction!.categoryId) {
        const now = new Date();
        await tx.budget.updateMany({
          where: {
            familyId: existingTransaction!.familyId,
            categoryId: existingTransaction!.categoryId,
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          data: {
            spent: {
              increment: -amount,
            },
          },
        });
      }

      // Удаляем транзакцию
      await tx.transaction.delete({
        where: { id: transactionId },
      });

      // Логируем действие
      await tx.activityLog.create({
        data: {
          userId,
          action: 'DELETE',
          entityType: 'Transaction',
          entityId: transactionId,
          description: `Deleted ${existingTransaction!.type.toLowerCase()} transaction`,
          metadata: {
            amount: amount,
            type: existingTransaction!.type,
          },
        },
      });
    });

    return NextResponse.json({ 
      success: true,
      message: 'Transaction deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
