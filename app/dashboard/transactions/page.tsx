'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  currency: string;
  description: string | null;
  date: string;
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
    image: string | null;
  };
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon: string | null;
}

interface Family {
  id: string;
  name: string;
  currency: string;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      loadTransactions();
    }
  }, [selectedFamilyId, typeFilter, currentPage]);

  const loadFamilies = async () => {
    try {
      const response = await fetch('/api/families');
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

  const loadTransactions = async () => {
    if (!selectedFamilyId) return;
    
    try {
      setIsLoading(true);
      let url = `/api/transactions?familyId=${selectedFamilyId}&page=${currentPage}&pageSize=20`;
      
      if (typeFilter !== 'all') {
        url += `&type=${typeFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, string> = {
      INCOME: '💰',
      EXPENSE: '💸',
      TRANSFER: '🔄',
    };
    return icons[type] || '💵';
  };

  const getTransactionTypeName = (type: string) => {
    const names: Record<string, string> = {
      INCOME: 'Доход',
      EXPENSE: 'Расход',
      TRANSFER: 'Перевод',
    };
    return names[type] || type;
  };

  const formatAmount = (amount: number, type: string, currency: string) => {
    const symbols: Record<string, string> = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      KGS: 'сом',
    };
    
    const symbol = symbols[currency] || currency;
    const formatted = new Intl.NumberFormat('ru-RU').format(amount);
    const sign = type === 'INCOME' ? '+' : type === 'EXPENSE' ? '-' : '';
    const colorClass = type === 'INCOME' ? 'text-green-600' : type === 'EXPENSE' ? 'text-red-600' : 'text-blue-600';
    
    return (
      <span className={`font-semibold ${colorClass}`}>
        {sign}{formatted} {symbol}
      </span>
    );
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
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-bold">
              FP
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
              FamilyPay
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-gray-600 dark:text-gray-400 hover:text-[#0D6D6E] dark:hover:text-[#4FD1C5] transition"
            >
              ← Назад
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Транзакции
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              История доходов и расходов
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedFamilyId || accounts.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>+</span>
            <span>Добавить</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {families.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Семья
                </label>
                <select
                  value={selectedFamilyId}
                  onChange={(e) => {
                    setSelectedFamilyId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип транзакции
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Все транзакции</option>
                <option value="INCOME">Доходы</option>
                <option value="EXPENSE">Расходы</option>
                <option value="TRANSFER">Переводы</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {!selectedFamilyId ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Выберите семью для просмотра транзакций
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0D6D6E] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💸</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Нет транзакций
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {accounts.length === 0 
                ? 'Сначала создайте счёт' 
                : 'Добавьте первую транзакцию'}
            </p>
            {accounts.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                Добавить транзакцию
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                        {transaction.category?.icon || getTransactionIcon(transaction.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {transaction.description || transaction.category?.name || getTransactionTypeName(transaction.type)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                {transaction.account.icon} {transaction.account.name}
                              </span>
                              <span>•</span>
                              <span>{formatDate(transaction.date)}</span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-lg">
                              {formatAmount(Number(transaction.amount), transaction.type, transaction.currency)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {getTransactionTypeName(transaction.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Назад
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Страница {currentPage} из {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперёд →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          familyId={selectedFamilyId}
          accounts={accounts}
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

// Компонент модального окна добавления транзакции
function AddTransactionModal({ 
  familyId,
  accounts,
  onClose, 
  onSuccess 
}: { 
  familyId: string;
  accounts: Account[];
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>('EXPENSE');
  const [formData, setFormData] = useState({
    accountId: accounts[0]?.id || '',
    toAccountId: '',
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Простые категории (позже можно вынести в API)
  const categories = {
    INCOME: [
      { id: 'salary', name: 'Зарплата', icon: '💼' },
      { id: 'freelance', name: 'Фриланс', icon: '💻' },
      { id: 'investment', name: 'Инвестиции', icon: '📈' },
      { id: 'gift', name: 'Подарок', icon: '🎁' },
      { id: 'other_income', name: 'Другое', icon: '💰' },
    ],
    EXPENSE: [
      { id: 'food', name: 'Продукты', icon: '🛒' },
      { id: 'transport', name: 'Транспорт', icon: '🚗' },
      { id: 'entertainment', name: 'Развлечения', icon: '🎉' },
      { id: 'health', name: 'Здоровье', icon: '🏥' },
      { id: 'education', name: 'Образование', icon: '📚' },
      { id: 'bills', name: 'Счета', icon: '📄' },
      { id: 'shopping', name: 'Покупки', icon: '🛍️' },
      { id: 'other_expense', name: 'Другое', icon: '💸' },
    ],
  };

  const currentCategories = transactionType === 'TRANSFER' ? [] : categories[transactionType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount) {
      setError('Заполните все обязательные поля');
      return;
    }

    if (transactionType === 'TRANSFER' && !formData.toAccountId) {
      setError('Выберите счёт получателя');
      return;
    }

    if (transactionType === 'EXPENSE' && !formData.categoryId) {
      setError('Выберите категорию');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
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
          toAccountId: transactionType === 'TRANSFER' ? formData.toAccountId : null,
          categoryId: formData.categoryId || null,
          type: transactionType,
          amount: amount,
          description: formData.description || null,
          date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative my-8">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💸</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Новая транзакция
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип транзакции
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'EXPENSE' as const, label: 'Расход', icon: '💸', color: 'red' },
                { value: 'INCOME' as const, label: 'Доход', icon: '💰', color: 'green' },
                { value: 'TRANSFER' as const, label: 'Перевод', icon: '🔄', color: 'blue' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setTransactionType(type.value);
                    setFormData({ ...formData, categoryId: '', toAccountId: '' });
                  }}
                  disabled={isLoading}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    transactionType === type.value
                      ? 'border-[#0D6D6E] bg-[#0D6D6E]/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#0D6D6E]/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Сумма *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              disabled={isLoading}
              className="w-full px-4 py-3 text-2xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {transactionType === 'TRANSFER' ? 'Со счёта *' : 'Счёт *'}
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.icon} {account.name} ({new Intl.NumberFormat('ru-RU').format(Number(account.balance))} {account.currency})
                </option>
              ))}
            </select>
          </div>

          {/* To Account (for transfers) */}
          {transactionType === 'TRANSFER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                На счёт *
              </label>
              <select
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Выберите счёт</option>
                {accounts
                  .filter(acc => acc.id !== formData.accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.icon} {account.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Category */}
          {transactionType !== 'TRANSFER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Категория {transactionType === 'EXPENSE' ? '*' : ''}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {currentCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, categoryId: category.id })}
                    disabled={isLoading}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      formData.categoryId === category.id
                        ? 'border-[#0D6D6E] bg-[#0D6D6E]/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-[#0D6D6E]/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-xs font-medium">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Комментарий к транзакции"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Дата
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={isLoading}
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
              disabled={isLoading || !formData.amount || !formData.accountId}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
