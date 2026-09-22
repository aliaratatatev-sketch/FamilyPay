'use client';

import { useEffect, useState } from 'react';

interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetAmount: string;
  currentAmount: string;
  currency: string;
  targetDate: string | null;
  status: string;
  color: string | null;
  icon: string | null;
  family: { name: string };
  user: { name: string | null; email: string };
  allocations: Array<{
    id: string;
    amount: string;
    date: string;
    account: { name: string };
  }>;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/goals${statusFilter ? `?status=${statusFilter}` : ''}`);
      const data = await res.json();
      setGoals(data.goals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGoals();
  }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить цель?')) return;
    try {
      await fetch(`/api/admin/goals?id=${id}`, { method: 'DELETE' });
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getProgress = (current: string, target: string) => {
    const percentage = (parseFloat(current) / parseFloat(target)) * 100;
    return Math.min(percentage, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      case 'PAUSED': return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Активна';
      case 'COMPLETED': return 'Достигнута';
      case 'CANCELLED': return 'Отменена';
      case 'PAUSED': return 'Приостановлена';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Финансовые цели</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление целями накоплений</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === '' ? 'bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white' : 'bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/10'
          }`}
        >
          Все
        </button>
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === 'ACTIVE' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/10'
          }`}
        >
          🎯 Активные
        </button>
        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === 'COMPLETED' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/10'
          }`}
        >
          ✅ Достигнутые
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = getProgress(goal.currentAmount, goal.targetAmount);
            const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
            
            return (
              <div key={goal.id} className="p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: goal.color ? `${goal.color}20` : '#4FD1C520' }}
                    >
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {goal.description || 'Без описания'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(goal.status)}`}>
                      {getStatusLabel(goal.status)}
                    </span>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Прогресс</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Накоплено</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {parseFloat(goal.currentAmount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Цель</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {parseFloat(goal.targetAmount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Осталось</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {goal.allocations.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Последние пополнения ({goal.allocations.length}):
                    </p>
                    <div className="space-y-1">
                      {goal.allocations.slice(0, 2).map((allocation) => (
                        <div key={allocation.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300">{allocation.account.name}</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            +{parseFloat(allocation.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Семья: {goal.family.name}</p>
                    {goal.targetDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Цель до: {new Date(goal.targetDate).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
