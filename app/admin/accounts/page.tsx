'use client';

import { useEffect, useState } from 'react';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  family: {
    name: string;
  };
  _count: {
    transactions: number;
    goalAllocations: number;
  };
}

const ACCOUNT_TYPES = [
  { value: 'CASH', label: 'Наличные', icon: '💵' },
  { value: 'BANK_ACCOUNT', label: 'Банковский счёт', icon: '🏦' },
  { value: 'CARD', label: 'Карта', icon: '💳' },
  { value: 'SAVINGS', label: 'Накопления', icon: '🏦' },
  { value: 'INVESTMENT', label: 'Инвестиции', icon: '📈' },
  { value: 'DEBT', label: 'Долг', icon: '💰' },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    familyId: '',
    name: '',
    type: 'CASH',
    balance: '0',
    currency: 'RUB',
    description: '',
    color: '#4FD1C5',
    icon: '💵',
    isActive: true
  });

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/accounts');
      const data = await res.json();
      setAccounts(data.accounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await fetch('/api/admin/accounts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAccount.id, ...formData })
        });
      } else {
        await fetch('/api/admin/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      setEditingAccount(null);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить счёт?')) return;
    try {
      await fetch(`/api/admin/accounts?id=${id}`, { method: 'DELETE' });
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      familyId: '',
      name: '',
      type: 'CASH',
      balance: '0',
      currency: 'RUB',
      description: '',
      color: '#4FD1C5',
      icon: '💵',
      isActive: true
    });
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      familyId: '',
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      description: account.description || '',
      color: account.color || '#4FD1C5',
      icon: account.icon || '💳',
      isActive: account.isActive
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Финансовые счета</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление счетами и балансами</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать счёт
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all ${
                !account.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: account.color ? `${account.color}20` : '#4FD1C520' }}
                  >
                    {account.icon || '💳'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {account.name}
                      {!account.isActive && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          Неактивен
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(account)}
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-[#0D6D6E]/10 to-[#4FD1C5]/10">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Баланс</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {parseFloat(account.balance).toLocaleString()} {account.currency === 'RUB' ? '₽' : account.currency}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{account._count.transactions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Операций</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{account._count.goalAllocations}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">На цели</p>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-white/5 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Семья: <span className="font-semibold text-gray-900 dark:text-white">{account.family.name}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111d2b] rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingAccount ? 'Редактировать счёт' : 'Создать счёт'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingAccount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID семьи*</label>
                  <input
                    type="text"
                    required
                    value={formData.familyId}
                    onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Название*</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Тип*</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const type = ACCOUNT_TYPES.find(t => t.value === e.target.value);
                    setFormData({ ...formData, type: e.target.value, icon: type?.icon || '💳' });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                >
                  {ACCOUNT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Баланс</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Валюта</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                  >
                    <option value="RUB">RUB (₽)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="KGS">KGS (с)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Иконка</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Цвет</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#4FD1C5] focus:ring-[#4FD1C5]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Счёт активен</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAccount(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold hover:shadow-lg transition-all"
                >
                  {editingAccount ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
