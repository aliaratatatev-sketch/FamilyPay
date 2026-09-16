import { Prisma } from '@prisma/client';

// Типы для работы с Prisma

// Семья с участниками и счетами
export type FamilyWithMembers = Prisma.FamilyGetPayload<{
  include: {
    members: {
      include: {
        user: true;
      };
    };
    accounts: true;
  };
}>;

// Транзакция с полной информацией
export type TransactionWithDetails = Prisma.TransactionGetPayload<{
  include: {
    account: true;
    category: true;
    user: true;
  };
}>;

// Бюджет с категорией
export type BudgetWithCategory = Prisma.BudgetGetPayload<{
  include: {
    category: true;
  };
}>;

// Цель с пополнениями
export type GoalWithAllocations = Prisma.GoalGetPayload<{
  include: {
    allocations: {
      include: {
        account: true;
      };
    };
  };
}>;

// Пользователь с семьями
export type UserWithFamilies = Prisma.UserGetPayload<{
  include: {
    familyMembers: {
      include: {
        family: true;
      };
    };
  };
}>;

// Финансовый счёт с балансом и транзакциями
export type AccountWithTransactions = Prisma.FinancialAccountGetPayload<{
  include: {
    transactions: {
      include: {
        category: true;
      };
      orderBy: {
        date: 'desc';
      };
      take: 10;
    };
  };
}>;

// Статистика по категории
export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

// Баланс по периоду
export interface PeriodBalance {
  date: Date;
  income: number;
  expense: number;
  balance: number;
}

// Статистика бюджета
export interface BudgetStats {
  budgetId: string;
  budgetName: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'ok' | 'warning' | 'danger' | 'exceeded';
}

// Прогресс цели
export interface GoalProgress {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  percentage: number;
  daysRemaining?: number;
}

// Фильтры для транзакций
export interface TransactionFilters {
  familyId: string;
  accountId?: string;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  tags?: string[];
}

// Параметры пагинации
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Результат с пагинацией
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Настройки уведомлений пользователя
export interface NotificationSettings {
  budgetAlerts: boolean;
  goalMilestones: boolean;
  recurringReminders: boolean;
  lowBalance: boolean;
  largeExpenses: boolean;
  largeExpenseThreshold: number;
}
