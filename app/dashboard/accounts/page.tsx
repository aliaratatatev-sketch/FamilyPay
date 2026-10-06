'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  family: {
    id: string;
    name: string;
    currency: string;
  };
}

interface Family {
  id: string;
  name: string;
  currency: string;
}

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    
    if (status === 'authenticated') {
      loadFamilies();
      loadAccounts();
    }
  }, [status, router]);

  const loadFamilies = async () => {
    try {
      const response = await fetch('/api/families');
      const data = await response.json();
      
      if (response.ok) {
        setFamilies(data.families || []);
      }
    } catch (error) {
      console.error('Error loading families:', error);
    }
  };

  const loadAccounts = async (familyId?: string) => {
    try {
      setIsLoading(true);
      const url = familyId && familyId !== 'all' 
        ? `/api/accounts?familyId=${familyId}`
        : '/api/accounts';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFamilyChange = (familyId: string) => {
    setSelectedFamilyId(familyId);
    loadAccounts(familyId);
  };

  const getAccountIcon = (type: string, customIcon?: string | null) => {
    if (customIcon) return customIcon;
    
    const icons: Record<string, string> = {
      CASH: '💵',
      BANK_ACCOUNT: '🏦',
      CARD: '💳',
      SAVINGS: '🏦',
      INVESTMENT: '📈',
      DEBT: '💳',
    };
    
    return icons[type] || '💰';
  };

  const getAccountTypeName = (type: string) => {
    const names: Record<string, string> = {
      CASH: 'Наличные',
      BANK_ACCOUNT: 'Банковский счёт',
      CARD: 'Карта',
      SAVINGS: 'Накопления',
      INVESTMENT: 'Инвестиции',
      DEBT: 'Долг',
    };
    
    return names[type] || type;
  };

  const formatBalance = (balance: number, currency: string) => {
    const symbols: Record<string, string> = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      KGS: 'сом',
    };
    
    const symbol = symbols[currency] || currency;
    const formatted = new Intl.NumberFormat('ru-RU').format(balance);
    
    return `${formatted} ${symbol}`;
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => {
      // Конвертация в основную валюту (упрощённо, без реальных курсов)
      return sum + Number(acc.balance);
    }, 0);
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
              Счета
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Управление финансовыми счетами
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2"
          >
            <span>+</span>
            <span>Добавить счёт</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-2xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-lg opacity-90 mb-2">Общий баланс</h2>
          <p className="text-4xl font-bold mb-4">
            {formatBalance(getTotalBalance(), 'RUB')}
          </p>
          <div className="flex gap-6 text-sm opacity-90">
            <div>
              <span className="block">Счетов:</span>
              <span className="text-2xl font-semibold">{accounts.length}</span>
            </div>
            <div>
              <span className="block">Семей:</span>
              <span className="text-2xl font-semibold">{families.length}</span>
            </div>
          </div>
        </div>

        {/* Filter by Family */}
        {families.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Фильтр по семье
            </label>
            <select
              value={selectedFamilyId}
              onChange={(e) => handleFamilyChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Все семьи</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Accounts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0D6D6E] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка счетов...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Нет счетов
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Создайте первый счёт для отслеживания финансов
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              Создать счёт
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={() => {
                  // TODO: Implement edit
                }}
                onDelete={async () => {
                  if (confirm(`Удалить счёт "${account.name}"?`)) {
                    try {
                      const response = await fetch(`/api/accounts/${account.id}`, {
                        method: 'DELETE',
                      });
                      
                      if (response.ok) {
                        loadAccounts(selectedFamilyId);
                      } else {
                        const data = await response.json();
                        alert(data.error || 'Ошибка при удалении счёта');
                      }
                    } catch (error) {
                      console.error('Error deleting account:', error);
                      alert('Ошибка при удалении счёта');
                    }
                  }
                }}
                formatBalance={formatBalance}
                getAccountIcon={getAccountIcon}
                getAccountTypeName={getAccountTypeName}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Account Modal */}
      {showCreateModal && (
        <CreateAccountModal
          families={families}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAccounts(selectedFamilyId);
          }}
        />
      )}
    </div>
  );
}

// Компонент модального окна создания счёта
function CreateAccountModal({ 
  families, 
  onClose, 
  onSuccess 
}: { 
  families: Family[]; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    familyId: families[0]?.id || '',
    name: '',
    type: 'CASH',
    balance: '0',
    currency: 'RUB',
    description: '',
    color: '#10B981',
    icon: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const accountTypes = [
    { value: 'CASH', label: 'Наличные', icon: '💵' },
    { value: 'BANK_ACCOUNT', label: 'Банковский счёт', icon: '🏦' },
    { value: 'CARD', label: 'Карта', icon: '💳' },
    { value: 'SAVINGS', label: 'Накопления', icon: '🏦' },
    { value: 'INVESTMENT', label: 'Инвестиции', icon: '📈' },
    { value: 'DEBT', label: 'Долг', icon: '💳' },
  ];

  const currencies = [
    { code: 'RUB', name: 'Российский рубль', symbol: '₽' },
    { code: 'USD', name: 'Доллар США', symbol: '$' },
    { code: 'EUR', name: 'Евро', symbol: '€' },
    { code: 'KGS', name: 'Киргизский сом', symbol: 'сом' },
  ];

  const colors = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', 
    '#EF4444', '#EC4899', '#6366F1', '#14B8A6'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Введите название счёта');
      return;
    }

    if (!formData.familyId) {
      setError('Выберите семью');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance) || 0,
          icon: formData.icon || accountTypes.find(t => t.value === formData.type)?.icon,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании счёта');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании счёта');
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
            <span className="text-3xl">💳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Добавить счёт
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Создайте новый счёт для учёта финансов
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {families.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Семья
              </label>
              <select
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              Название счёта *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Основная карта"
              disabled={isLoading}
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип счёта *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  disabled={isLoading}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    formData.type === type.value
                      ? 'border-[#0D6D6E] bg-[#0D6D6E]/10 dark:bg-[#0D6D6E]/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#0D6D6E]/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Начальный баланс
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Валюта
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание (опционально)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание счёта"
              disabled={isLoading}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Цвет
            </label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  disabled={isLoading}
                  className={`w-10 h-10 rounded-lg transition ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-[#0D6D6E] dark:ring-offset-gray-800'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Создание...' : 'Создать счёт'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Компонент карточки счёта с действиями
function AccountCard({
  account,
  onEdit,
  onDelete,
  formatBalance,
  getAccountIcon,
  getAccountTypeName,
}: {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
  formatBalance: (balance: number, currency: string) => string;
  getAccountIcon: (type: string, customIcon?: string | null) => string;
  getAccountTypeName: (type: string) => string;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition relative group"
      style={{
        borderLeft: account.color ? `4px solid ${account.color}` : undefined,
      }}
    >
      {/* Actions Menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition"
        >
          ⋮
        </button>
        
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-20">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <span>✏️</span>
                <span>Редактировать</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <span>🗑️</span>
                <span>Удалить</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
          {getAccountIcon(account.type, account.icon)}
        </div>
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
          {getAccountTypeName(account.type)}
        </span>
      </div>

      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
        {account.name}
      </h3>
      
      {account.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {account.description}
        </p>
      )}

      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {formatBalance(Number(account.balance), account.currency)}
      </p>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {account.family.name}
        </p>
      </div>
    </div>
  );
}
