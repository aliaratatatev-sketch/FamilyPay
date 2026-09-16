import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/transactions - Получить транзакции с фильтрами
export async function GET(request: NextRequest) {
  try {
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
      data: transactions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Создать новую транзакцию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      familyId,
      accountId,
      categoryId,
      userId,
      type,
      amount,
      description,
      date,
      toAccountId,
      location,
      tags,
    } = body;

    // Валидация обязательных полей
    if (!familyId || !accountId || !userId || !type || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
