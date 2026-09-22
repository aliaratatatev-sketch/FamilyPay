'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string | null;
  icon: string | null;
  isSystem: boolean;
  parentId: string | null;
  family: { name: string } | null;
  parent: { name: string } | null;
  subcategories: Category[];
  _count: {
    transactions: number;
    budgets: number;
    subcategories: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    color: '#4FD1C5',
    icon: '📁',
    isSystem: false,
    parentId: '',
    familyId: ''
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories${typeFilter ? `?type=${typeFilter}` : ''}`);
      const data = await res.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        parentId: formData.parentId || null,
        familyId: formData.familyId || null
      };

      if (editingCategory) {
        await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, ...payload })
        });
      } else {
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить категорию?')) return;
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'EXPENSE',
      color: '#4FD1C5',
      icon: '📁',
      isSystem: false,
      parentId: '',
      familyId: ''
    });
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#4FD1C5',
      icon: category.icon || '📁',
      isSystem: category.isSystem,
      parentId: category.parentId || '',
      familyId: ''
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Категории</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление категориями доходов и расходов</p>
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
          Создать категорию
        </button>
      </div>

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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.filter(c => !c.parentId).map((category) => (
            <div key={category.id} className="p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color ? `${category.color}20` : '#4FD1C520' }}
                  >
                    {category.icon || '📁'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        category.type === 'INCOME'
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {category.type === 'INCOME' ? 'Доход' : 'Расход'}
                      </span>
                      {category.isSystem && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                          Системная
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {!category.isSystem && (
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{category._count.transactions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Операций</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{category._count.budgets}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Бюджетов</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{category._count.subcategories}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Подкат.</p>
                </div>
              </div>

              {category.subcategories.length > 0 && (
                <div className="border-t border-gray-100 dark:border-white/5 pt-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Подкатегории:</p>
                  <div className="flex flex-wrap gap-1">
                    {category.subcategories.map((sub) => (
                      <span key={sub.id} className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                        {sub.icon} {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {category.family && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Семья: <span className="font-semibold">{category.family.name}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111d2b] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Тип*</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1923] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                >
                  <option value="EXPENSE">Расход</option>
                  <option value="INCOME">Доход</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Иконка</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📁"
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
                    checked={formData.isSystem}
                    onChange={(e) => setFormData({ ...formData, isSystem: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#4FD1C5] focus:ring-[#4FD1C5]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Системная категория (нельзя удалить)</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold hover:shadow-lg transition-all"
                >
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
