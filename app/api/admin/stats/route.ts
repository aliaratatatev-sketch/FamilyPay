import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/stats - общая статистика для дашборда
export async function GET(request: NextRequest) {
  try {
    // Параллельно получаем всю статистику
    const [
      totalUsers,
      totalFamilies,
      totalTransactions,
      totalAccounts,
      totalCategories,
      totalBudgets,
      totalGoals,
      recentActivity,
      topFamilies
    ] = await Promise.all([
      // Всего пользователей
      prisma.user.count(),
      
      // Всего семей
      prisma.family.count(),
      
      // Всего транзакций
      prisma.transaction.count(),
      
      // Всего счетов
      prisma.financialAccount.count(),
      
      // Всего категорий
      prisma.category.count(),
      
      // Всего бюджетов
      prisma.budget.count(),
      
      // Всего целей
      prisma.goal.count(),
      
      // Последние 10 действий из журнала
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      
      // Топ-5 семей по количеству транзакций
      prisma.family.findMany({
        take: 5,
        include: {
          _count: {
            select: {
              transactions: true,
              members: true,
              accounts: true
            }
          }
        },
        orderBy: {
          transactions: {
            _count: 'desc'
          }
        }
      })
    ]);

    // Статистика по транзакциям за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        date: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    const stats = {
      overview: {
        users: totalUsers,
        families: totalFamilies,
        transactions: totalTransactions,
        accounts: totalAccounts,
        categories: totalCategories,
        budgets: totalBudgets,
        goals: totalGoals
      },
      recentTransactions: recentTransactions.reduce((acc, item) => {
        acc[item.type] = {
          count: item._count.id,
          total: item._sum.amount?.toString() || '0'
        };
        return acc;
      }, {} as Record<string, { count: number; total: string }>),
      recentActivity,
      topFamilies
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
