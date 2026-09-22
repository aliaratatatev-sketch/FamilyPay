'use client';

import { useEffect, useState } from 'react';

interface Family {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  createdBy: {
    name: string | null;
    email: string;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  _count: {
    accounts: number;
    transactions: number;
    budgets: number;
    goals: number;
    categories: number;
  };
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [formData, setFormData] = useState({ name: '', currency: 'RUB', createdById: '' });

  const loadFamilies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/families?search=${search}`);
      const data = await res.json();
      setFamilies(data.families);
    } catch (error) {
      console.error('Error loading families:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFamilies();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFamily) {
        await fetch('/api/admin/families', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingFamily.id, name: formData.name, currency: formData.currency })
        });
      } else {
        await fetch('/api/admin/families', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      setEditingFamily(null);
      setFormData({ name: '', currency: 'RUB', createdById: '' });
      loadFamilies();
    } catch (error) {
      console.error('Error saving family:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить семью? Это удалит все связанные данные!')) return;
    try {
      await fetch(`/api/admin/families?id=${id}`, { method: 'DELETE' });
      loadFamilies();
    } catch (error) {
      console.error('Error deleting family:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Семьи</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление семьями и их членами</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать семью
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Поиск семей..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111d2b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
        />
        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {families.map((family) => (
            <div key={family.id} className="p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white text-xl">
                    👨‍👩‍👧‍👦
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{family.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Создана {new Date(family.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingFamily(family);
                      setFormData({ name: family.name, currency: family.currency, createdById: '' });
                      setShowModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(family.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{family.members.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Члены</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{family._count.accounts}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Счета</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{family._count.transactions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Операции</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{family._count.budgets}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Бюджеты</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{family._count.goals}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Цели</p>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-white/5 pt-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Члены семьи:</p>
                <div className="space-y-1">
                  {family.members.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">{member.user.name || member.user.email}</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[#4FD1C5]/10 text-[#0D6D6E] dark:text-[#4FD1C5]">
                        {member.role}
                      </span>
                    </div>
                  ))}
                  {family.members.length > 3 && (
                    <p className="text-xs text-gray-500">+{family.members.length - 3} ещё</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111d2b] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingFamily ? 'Редактировать семью' : 'Создать семью'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              {!editingFamily && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID создателя*</label>
                  <input
                    type="text"
                    required
                    value={formData.createdById}
                    onChange={(e) => setFormData({ ...formData, createdById: e.target.value })}
                    placeholder="ID пользователя-администратора"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFamily(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold hover:shadow-lg transition-all"
                >
                  {editingFamily ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
