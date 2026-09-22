'use client';

import { useEffect, useState } from 'react';

interface Budget {
  id: string;
  name: string;
  amount: string;
  spent: string;
  currency: string;
  period: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  family: { name: string };
  category: { name: string; icon: string | null };
  user: { name: string | null; email: string };
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/budgets');
      const data = await res.json();
      setBudgets(data.budgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить бюджет?')) return;
    try {
      await fetch(`/api/admin/budgets?id=${id}`, { method: 'DELETE' });
      loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const getProgress = (spent: string, amount: string) => {
    const percentage = (parseFloat(spent) / parseFloat(amount)) * 100;
    return Math.min(percentage, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-orange-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Бюджеты</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление бюджетами семей</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const progress = getProgress(budget.spent, budget.amount);
            const remaining = parseFloat(budget.amount) - parseFloat(budget.spent);
            
            return (
              <div key={budget.id} className="p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white text-xl">
                      {budget.category.icon || '📈'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{budget.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {budget.category.name} • {budget.period}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Прогресс</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Потрачено</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {parseFloat(budget.spent).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Лимит</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {parseFloat(budget.amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Осталось</p>
                    <p className={`text-lg font-bold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Семья: {budget.family.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(budget.startDate).toLocaleDateString('ru-RU')} — {new Date(budget.endDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${budget.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'}`}>
                    {budget.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
