'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationBell from '../../components/NotificationBell';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  currency: string;
  description: string | null;
  date: string;
  createdAt: string;
  account: {
    id: string;
    name: string;
    type: string;
    color: string | null;
    icon: string | null;
  };
  category: {
    id: string;
    name: string;
    type: string;
    color: string | null;
    icon: string | null;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface Family {
  id: string;
  name: string;
  currency: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    
    if (status === 'authenticated') {
      loadFamilies();
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedFamilyId) {
      loadAccounts(selectedFamilyId);
      loadCategories(selectedFamilyId);
      loadTransactions();
    }
  }, [selectedFamilyId]);

  const loadFamilies = async () => {
    try {
      const response = await fetch('/api/families?t=' + Date.now());
      const data = await response.json();
      
      if (response.ok && data.families && data.families.length > 0) {
        setFamilies(data.families);
        setSelectedFamilyId(data.families[0].id);
      }
    } catch (error) {
      console.error('Error loading families:', error);
    }
  };

  const loadAccounts = async (familyId: string) => {
    try {
      const response = await fetch(`/api/accounts?familyId=${familyId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadCategories = async (familyId: string) => {
    try {
      const response = await fetch(`/api/categories?familyId=${familyId}`);
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/transactions?familyId=${selectedFamilyId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Фильтр по типу
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Фильтр по дате
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        
        if (dateFilter === 'today') {
          return transactionDate >= today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return transactionDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return transactionDate >= monthAgo;
        }
        
        return true;
      });
    }

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        t.category?.name.toLowerCase().includes(query) ||
        t.account.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      KGS: 'сом',
    };
    
    const symbol = symbols[currency] || currency;
    const formatted = new Intl.NumberFormat('ru-RU').format(amount);
    
    return `${formatted} ${symbol}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня, ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера, ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTransactionStats = () => {
    const filtered = getFilteredTransactions();
    const income = filtered.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filtered.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
    
    return { income, expense, total: income - expense, count: filtered.length };
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 text-xl">Загрузка...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const filteredTransactions = getFilteredTransactions();
  const stats = getTransactionStats();
  const selectedFamily = families.find(f => f.id === selectedFamilyId);

  return (\n    <>\n      {/* Main Content */}\n      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              💰 Транзакции
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              История всех операций
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2"
          >
            <span>+</span>
            <span>Добавить</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Всего операций</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.count}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow p-6">
            <div className="text-sm text-green-800 dark:text-green-400 mb-1">Доходы</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-300">
              +{formatAmount(stats.income, selectedFamily?.currency || 'RUB')}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow p-6">
            <div className="text-sm text-red-800 dark:text-red-400 mb-1">Расходы</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-300">
              -{formatAmount(stats.expense, selectedFamily?.currency || 'RUB')}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow p-6">
            <div className="text-sm text-blue-800 dark:text-blue-400 mb-1">Баланс</div>
            <div className={`text-2xl font-bold ${
              stats.total >= 0 
                ? 'text-green-900 dark:text-green-300' 
                : 'text-red-900 dark:text-red-300'
            }`}>
              {stats.total >= 0 ? '+' : ''}{formatAmount(stats.total, selectedFamily?.currency || 'RUB')}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Family Selector */}
            {families.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Семья
                </label>
                <select
                  value={selectedFamilyId}
                  onChange={(e) => setSelectedFamilyId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Поиск
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по описанию, категории..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип операции
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'INCOME', 'EXPENSE', 'TRANSFER'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      typeFilter === type
                        ? 'bg-[#0D6D6E] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type === 'all' ? 'Все' : type === 'INCOME' ? 'Доходы' : type === 'EXPENSE' ? 'Расходы' : 'Переводы'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Период
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'today', 'week', 'month'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setDateFilter(period)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      dateFilter === period
                        ? 'bg-[#0D6D6E] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {period === 'all' ? 'Все время' : period === 'today' ? 'Сегодня' : period === 'week' ? 'Неделя' : 'Месяц'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0D6D6E] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Загрузка транзакций...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Нет транзакций
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || typeFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Попробуйте изменить фильтры'
                  : 'Добавьте первую транзакцию'
                }
              </p>
              {!searchQuery && typeFilter === 'all' && dateFilter === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
                >
                  Добавить транзакцию
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ 
                      backgroundColor: transaction.category?.color || transaction.account.color || '#10B981',
                      opacity: 0.9 
                    }}
                  >
                    {transaction.category?.icon || 
                     transaction.account.icon || 
                     (transaction.type === 'INCOME' ? '💰' : transaction.type === 'EXPENSE' ? '💸' : '🔄')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {transaction.description || transaction.category?.name || 'Без описания'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        transaction.type === 'INCOME' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : transaction.type === 'EXPENSE'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {transaction.type === 'INCOME' ? 'Доход' : transaction.type === 'EXPENSE' ? 'Расход' : 'Перевод'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>{transaction.account.name}</span>
                      {transaction.category && <span>• {transaction.category.name}</span>}
                      <span>• {formatDate(transaction.date)}</span>
                      <span>• {transaction.user.name || transaction.user.email}</span>
                    </div>
                  </div>

                  <div className={`text-xl font-bold flex-shrink-0 ${
                    transaction.type === 'INCOME' 
                      ? 'text-green-600 dark:text-green-400' 
                      : transaction.type === 'EXPENSE'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : transaction.type === 'EXPENSE' ? '-' : ''}
                    {formatAmount(Number(transaction.amount), transaction.currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && selectedFamily && (
        <AddTransactionModal
          familyId={selectedFamilyId}
          currency={selectedFamily.currency}
          accounts={accounts}
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadTransactions();
            loadAccounts(selectedFamilyId);
          }}
        />
      )}
    </div>
  );
}

// Компонент добавления транзакции
function AddTransactionModal({
  familyId,
  currency,
  accounts,
  categories,
  onClose,
  onSuccess,
}: {
  familyId: string;
  currency: string;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE' | 'TRANSFER',
    accountId: accounts[0]?.id || '',
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount) {
      setError('Заполните обязательные поля');
      return;
    }

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId,
          accountId: formData.accountId,
          categoryId: formData.categoryId || null,
          type: formData.type,
          amount: amountNum,
          currency,
          description: formData.description.trim() || null,
          date: new Date(formData.date).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании транзакции');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании транзакции');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.type === formData.type || formData.type === 'TRANSFER'
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative my-8">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Добавить транзакцию
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Записать доход или расход
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип операции *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['INCOME', 'EXPENSE', 'TRANSFER'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type, categoryId: '' })}
                  disabled={isLoading}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    formData.type === type
                      ? 'border-[#0D6D6E] bg-[#0D6D6E]/10 dark:bg-[#0D6D6E]/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {type === 'INCOME' ? '💰' : type === 'EXPENSE' ? '💸' : '🔄'}
                  </div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {type === 'INCOME' ? 'Доход' : type === 'EXPENSE' ? 'Расход' : 'Перевод'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Счёт *
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Выберите счёт</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.balance} {account.currency}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          {filteredCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Категория
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Без категории</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Сумма ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Дата
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isLoading}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Например: Покупка продуктов"
              disabled={isLoading}
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.accountId || !formData.amount}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
