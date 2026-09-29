import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * GET /api/dashboard/stats - Получить статистику для dashboard
 * Query params: familyId (required)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const familyId = request.nextUrl.searchParams.get('familyId');

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

    // Получаем текущий месяц
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Получаем прошлый месяц для сравнения
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // 1. Общий баланс всех счетов
    const accounts = await prisma.financialAccount.findMany({
      where: {
        familyId,
        isActive: true,
      },
      select: {
        balance: true,
        currency: true,
      },
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // 2. Доходы за текущий месяц
    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        familyId,
        type: 'INCOME',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const income = Number(currentMonthIncome._sum.amount || 0);

    // 3. Расходы за текущий месяц
    const currentMonthExpense = await prisma.transaction.aggregate({
      where: {
        familyId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const expense = Number(currentMonthExpense._sum.amount || 0);

    // 4. Расходы за прошлый месяц (для процента изменения)
    const lastMonthExpense = await prisma.transaction.aggregate({
      where: {
        familyId,
        type: 'EXPENSE',
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const lastExpense = Number(lastMonthExpense._sum.amount || 0);
    const expenseChange = lastExpense > 0 
      ? ((expense - lastExpense) / lastExpense) * 100 
      : 0;

    // 5. Активные цели
    const goals = await prisma.goal.findMany({
      where: {
        familyId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        targetAmount: true,
        currentAmount: true,
        icon: true,
        color: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    const totalGoals = await prisma.goal.count({
      where: {
        familyId,
        status: 'ACTIVE',
      },
    });

    const completedGoals = await prisma.goal.count({
      where: {
        familyId,
        status: 'COMPLETED',
      },
    });

    // 6. Последние транзакции
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        familyId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
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
      take: 5,
    });

    // 7. Топ категорий расходов за месяц
    const topCategories = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        familyId,
        type: 'EXPENSE',
        categoryId: {
          not: null,
        },
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 5,
    });

    // Получаем информацию о категориях
    const categoryIds = topCategories
      .map(cat => cat.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    });

    const topExpenseCategories = topCategories.map(cat => {
      const category = categories.find(c => c.id === cat.categoryId);
      return {
        categoryId: cat.categoryId,
        categoryName: category?.name || 'Без категории',
        categoryIcon: category?.icon || '💸',
        categoryColor: category?.color || '#EF4444',
        amount: Number(cat._sum.amount || 0),
      };
    });

    // 8. Количество счетов
    const accountsCount = await prisma.financialAccount.count({
      where: {
        familyId,
        isActive: true,
      },
    });

    // 9. Количество транзакций за месяц
    const transactionsCount = await prisma.transaction.count({
      where: {
        familyId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // 10. Баланс изменение (доходы - расходы)
    const balanceChange = income - expense;
    const balanceChangePercent = totalBalance > 0 
      ? (balanceChange / totalBalance) * 100 
      : 0;

    return NextResponse.json({
      totalBalance,
      balanceChange,
      balanceChangePercent,
      income,
      expense,
      expenseChange,
      goals: {
        active: goals,
        totalActive: totalGoals,
        totalCompleted: completedGoals,
      },
      recentTransactions,
      topExpenseCategories,
      accountsCount,
      transactionsCount,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
