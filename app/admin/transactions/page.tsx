'use client';

import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: string;
  currency: string;
  description: string | null;
  date: string;
  location: string | null;
  family: { name: string };
  account: { name: string };
  category: { name: string; icon: string | null } | null;
  user: { name: string | null; email: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transactions?page=${page}&limit=20${typeFilter ? `&type=${typeFilter}` : ''}`);
      const data = await res.json();
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить транзакцию?')) return;
    try {
      await fetch(`/api/admin/transactions?id=${id}`, { method: 'DELETE' });
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
      case 'EXPENSE': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      case 'TRANSFER': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INCOME': return '📥';
      case 'EXPENSE': return '📤';
      case 'TRANSFER': return '🔄';
      default: return '💸';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INCOME': return 'Доход';
      case 'EXPENSE': return 'Расход';
      case 'TRANSFER': return 'Перевод';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Транзакции</h1>
          <p className="text-gray-600 dark:text-gray-400">История всех финансовых операций</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            typeFilter === '' ? 'bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white' : 'bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/10'
          }`}
        >
          Все
        </button>
        <button
          onClick={() => setTypeFilter('INCOME')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            typeFilter === 'INCOME' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/10'
          }`}
        >
          📥 Доходы
        </button>
        <button
          onClick={() => setTypeFilter('EXPENSE')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            typeFilter === 'EXPENSE' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/10'
          }`}
        >
          📤 Расходы
        </button>
        <button
          onClick={() => setTypeFilter('TRANSFER')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            typeFilter === 'TRANSFER' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/10'
          }`}
        >
          🔄 Переводы
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Дата</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Тип</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Описание</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Категория</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Счёт</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Сумма</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(tx.date).toLocaleDateString('ru-RU')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(tx.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(tx.type)}`}>
                        <span>{getTypeIcon(tx.type)}</span>
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{tx.description || 'Без описания'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tx.user.name || tx.user.email} • {tx.family.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {tx.category ? (
                        <div className="flex items-center gap-2">
                          <span>{tx.category.icon}</span>
                          <span className="text-sm text-gray-900 dark:text-white">{tx.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">{tx.account.name}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`text-lg font-bold ${
                        tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' :
                        tx.type === 'EXPENSE' ? 'text-red-600 dark:text-red-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '−' : ''}
                        {parseFloat(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tx.currency}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Назад
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Страница {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Далее
          </button>
        </div>
      )}
    </div>
  );
}
