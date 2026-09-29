import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { Prisma } from '@prisma/client';

/**
 * GET /api/transactions - Получить транзакции с фильтрами
 * Query params: familyId, accountId, categoryId, type, startDate, endDate, page, pageSize
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = request.nextUrl;
    
    const familyId = searchParams.get('familyId');
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    if (!familyId) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    // Проверяем членство в семье
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Access denied. You are not a member of this family' },
        { status: 403 }
      );
    }

    // Построение фильтров
    const where: Prisma.TransactionWhereInput = {
      familyId,
      ...(accountId && { accountId }),
      ...(categoryId && { categoryId }),
      ...(type && { type: type as 'INCOME' | 'EXPENSE' | 'TRANSFER' }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    // Получаем общее количество для пагинации
    const total = await prisma.transaction.count({ where });

    // Получаем транзакции
    const transactions = await prisma.transaction.findMany({
      where,
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
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions - Создать новую транзакцию
 * Body: { familyId, accountId, type, amount, categoryId?, description?, date?, toAccountId?, location?, tags? }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const {
      familyId,
      accountId,
      categoryId,
      type,
      amount,
      description,
      date,
      toAccountId,
      location,
      tags,
    } = body;

    // Валидация обязательных полей
    if (!familyId || !accountId || !type || !amount) {
      return NextResponse.json(
        { error: 'familyId, accountId, type, and amount are required' },
        { status: 400 }
      );
    }

    // Валидация типа транзакции
    const validTypes = ['INCOME', 'EXPENSE', 'TRANSFER'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type. Allowed: INCOME, EXPENSE, TRANSFER' },
        { status: 400 }
      );
    }

    // Для перевода требуется toAccountId
    if (type === 'TRANSFER' && !toAccountId) {
      return NextResponse.json(
        { error: 'toAccountId is required for TRANSFER transactions' },
        { status: 400 }
      );
    }

    // Для расходов требуется категория
    if (type === 'EXPENSE' && !categoryId) {
      return NextResponse.json(
        { error: 'categoryId is required for EXPENSE transactions' },
        { status: 400 }
      );
    }

    // Валидация суммы
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Проверяем права пользователя в семье
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Access denied. You are not a member of this family' },
        { status: 403 }
      );
    }

    // Проверяем, что счёт принадлежит этой семье
    const account = await prisma.financialAccount.findFirst({
      where: {
        id: accountId,
        familyId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or does not belong to this family' },
        { status: 404 }
      );
    }

    // Если это перевод, проверяем счёт-получатель
    if (type === 'TRANSFER' && toAccountId) {
      const toAccount = await prisma.financialAccount.findFirst({
        where: {
          id: toAccountId,
          familyId,
        },
      });

      if (!toAccount) {
        return NextResponse.json(
          { error: 'Destination account not found or does not belong to this family' },
          { status: 404 }
        );
      }

      if (accountId === toAccountId) {
        return NextResponse.json(
          { error: 'Cannot transfer to the same account' },
          { status: 400 }
        );
      }
    }

    // Используем транзакцию БД для атомарности
    const result = await prisma.$transaction(async (tx) => {
      // Создаём транзакцию
      const transaction = await tx.transaction.create({
        data: {
          familyId,
          accountId,
          categoryId: categoryId || null,
          userId,
          type,
          amount: parseFloat(amount),
          description: description || null,
          date: date ? new Date(date) : new Date(),
          toAccountId: toAccountId || null,
          location: location || null,
          tags: tags || [],
        },
        include: {
          account: true,
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Обновляем баланс счёта-источника
      const amountValue = parseFloat(amount);
      const balanceChange =
        type === 'INCOME' ? amountValue : -amountValue;

      await tx.financialAccount.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      // Если это перевод, обновляем баланс счёта-получателя
      if (type === 'TRANSFER' && toAccountId) {
        await tx.financialAccount.update({
          where: { id: toAccountId },
          data: {
            balance: {
              increment: amountValue,
            },
          },
        });
      }

      // Если это расход, обновляем поле spent в активных бюджетах этой категории
      if (type === 'EXPENSE' && categoryId) {
        const now = new Date();
        await tx.budget.updateMany({
          where: {
            familyId,
            categoryId,
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          data: {
            spent: {
              increment: amountValue,
            },
          },
        });
      }

      // Логируем действие
      await tx.activityLog.create({
        data: {
          userId,
          action: 'CREATE',
          entityType: 'Transaction',
          entityId: transaction.id,
          description: `Created ${type.toLowerCase()} transaction: ${description || 'No description'}`,
          metadata: {
            amount: amountValue,
            category: categoryId,
          },
        },
      });

      return transaction;
    });

    return NextResponse.json({ transaction: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
