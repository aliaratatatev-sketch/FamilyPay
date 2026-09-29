'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminAccessModal from '../components/AdminAccessModal';
import CreateFamilyModal from '../components/CreateFamilyModal';

interface Family {
  id: string;
  name: string;
  currency: string;
  members: any[];
  accounts: any[];
  _count: {
    transactions: number;
    budgets: number;
    goals: number;
  };
}

interface DashboardStats {
  totalBalance: number;
  balanceChange: number;
  balanceChangePercent: number;
  income: number;
  expense: number;
  expenseChange: number;
  goals: {
    active: any[];
    totalActive: number;
    totalCompleted: number;
  };
  recentTransactions: any[];
  topExpenseCategories: any[];
  accountsCount: number;
  transactionsCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    // Если точно не авторизован, редирект
    if (status === 'unauthenticated') {
      console.log('🔴 User unauthenticated, redirecting to /login');
      router.replace('/login');
    }
    
    if (status === 'authenticated') {
      console.log('✅ User authenticated:', session?.user?.email);
      checkAdminAccess();
      loadFamilies();
    }
  }, [status, router, session]);

  const checkAdminAccess = async () => {
    try {
      console.log('🔍 Checking admin access...');
      const response = await fetch('/api/admin/check-access');
      const data = await response.json();
      
      console.log('📋 Admin access response:', data);
      console.log('📧 Current user email:', session?.user?.email);
      
      setIsAdmin(data.isAdmin || false);
      setHasAdminAccess(data.hasAccess || false);
      
      if (data.isAdmin) {
        console.log('✅ User is admin, button will be visible');
      } else {
        console.log('❌ User is NOT admin, button will be hidden');
      }
    } catch (error) {
      console.error('❌ Error checking admin access:', error);
    }
  };

  const loadFamilies = async () => {
    try {
      setIsLoadingFamilies(true);
      const response = await fetch('/api/families');
      const data = await response.json();
      
      if (response.ok) {
        setFamilies(data.families || []);
        
        // Если у пользователя нет семей, показываем модалку создания
        if (!data.families || data.families.length === 0) {
          setShowCreateFamilyModal(true);
        } else {
          // Выбираем первую семью по умолчанию
          setSelectedFamily(data.families[0]);
        }
      }
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setIsLoadingFamilies(false);
    }
  };

  const loadStats = async (familyId: string) => {
    try {
      setIsLoadingStats(true);
      const response = await fetch(`/api/dashboard/stats?familyId=${familyId}`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (selectedFamily) {
      loadStats(selectedFamily.id);
    }
  }, [selectedFamily]);

  const handleFamilyCreated = () => {
    // Перезагружаем список семей после создания
    loadFamilies();
  };

  const formatAmount = (amount: number, currency: string = 'RUB') => {
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
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    }
  };

  const handleAdminPanelClick = () => {
    if (hasAdminAccess) {
      router.push('/admin');
    } else {
      setShowAdminModal(true);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5]">
        <div className="text-white text-2xl font-semibold">Загрузка...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Показываем пустоту пока идет редирект
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-bold">
              FP
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
              FamilyPay
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Добро пожаловать,
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {session?.user?.name || session?.user?.email}
              </p>
            </div>

            <Link
              href="/dashboard/profile"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
            >
              <span>👤</span>
              <span>Профиль</span>
            </Link>
            
            {isAdmin && (
              <button
                onClick={handleAdminPanelClick}
                className="px-4 py-2 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
              >
                <span>🔐</span>
                <span>Админ-панель</span>
              </button>
            )}
            
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Личный кабинет
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управляйте финансами вашей семьи
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              {stats && stats.balanceChangePercent !== 0 && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  stats.balanceChangePercent > 0 
                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                    : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                }`}>
                  {stats.balanceChangePercent > 0 ? '+' : ''}{stats.balanceChangePercent.toFixed(1)}%
                </span>
              )}
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Общий баланс
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? (
                <span className="animate-pulse">Загрузка...</span>
              ) : stats ? (
                formatAmount(stats.totalBalance, selectedFamily?.currency)
              ) : (
                '0 ₽'
              )}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              {stats && stats.expenseChange !== 0 && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  stats.expenseChange > 0 
                    ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                    : 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                }`}>
                  {stats.expenseChange > 0 ? '+' : ''}{stats.expenseChange.toFixed(1)}%
                </span>
              )}
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Расходы за месяц
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? (
                <span className="animate-pulse">Загрузка...</span>
              ) : stats ? (
                formatAmount(stats.expense, selectedFamily?.currency)
              ) : (
                '0 ₽'
              )}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              {stats && stats.goals.totalActive > 0 && (
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20 px-2 py-1 rounded">
                  {stats.goals.totalCompleted} завершено
                </span>
              )}
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Активные цели
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? (
                <span className="animate-pulse">Загрузка...</span>
              ) : stats ? (
                `${stats.goals.totalActive}`
              ) : (
                '0'
              )}
            </p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-2xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">
            🎉 Добро пожаловать в FamilyPay!
          </h2>
          
          {isLoadingFamilies ? (
            <p className="text-white/90">Загрузка...</p>
          ) : families.length === 0 ? (
            <>
              <p className="text-white/90 mb-6">
                Начните управлять финансами вашей семьи прямо сейчас. Создайте первую семью,
                добавьте счета и начните отслеживать расходы.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCreateFamilyModal(true)}
                  className="px-6 py-3 bg-white text-[#0D6D6E] font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                  Создать семью
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-white/90 mb-4">
                У вас {families.length} {families.length === 1 ? 'семья' : 'семьи'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {families.map((family) => (
                  <div 
                    key={family.id} 
                    className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{family.name}</h3>
                      <Link
                        href="/dashboard/family"
                        className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition"
                      >
                        Управление →
                      </Link>
                    </div>
                    <div className="flex gap-4 text-sm text-white/80">
                      <span>👥 {family.members.length}</span>
                      <span>💳 {family.accounts.length}</span>
                      <span>💰 {family._count.transactions}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowCreateFamilyModal(true)}
                className="mt-4 px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition"
              >
                + Создать ещё одну семью
              </button>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/transactions">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <span className="text-2xl">💸</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Добавить доход
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Зарплата, подработка
              </p>
            </div>
          </Link>

          <Link href="/dashboard/transactions">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Добавить расход
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Покупки, счета
              </p>
            </div>
          </Link>

          <Link href="/dashboard/accounts">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Счета
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats ? `${stats.accountsCount} счетов` : 'Управление счетами'}
              </p>
            </div>
          </Link>

          <Link href="/dashboard/transactions">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Транзакции
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats ? `${stats.transactionsCount} за месяц` : 'История операций'}
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Transactions */}
        {stats && stats.recentTransactions && stats.recentTransactions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Последние транзакции
              </h2>
              <Link 
                href="/dashboard/transactions"
                className="text-sm text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline"
              >
                Смотреть все →
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.recentTransactions.map((transaction: any) => (
                <div key={transaction.id} className="py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">
                      {transaction.category?.icon || (transaction.type === 'INCOME' ? '💰' : transaction.type === 'EXPENSE' ? '💸' : '🔄')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {transaction.description || transaction.category?.name || transaction.type}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.account.name} • {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className={`font-semibold flex-shrink-0 ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 
                    transaction.type === 'EXPENSE' ? 'text-red-600' : 
                    'text-blue-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : transaction.type === 'EXPENSE' ? '-' : ''}
                    {formatAmount(Number(transaction.amount), transaction.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info - только для администраторов */}
        {isAdmin && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
              🔍 Отладочная информация (только для администраторов):
            </p>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 font-mono">
              <p>Email: {session?.user?.email || 'Нет email'}</p>
              <p>Имя: {session?.user?.name || 'Нет имени'}</p>
              <p>Роль в БД: {session?.user?.role || 'Нет роли'}</p>
              <p>isAdmin (состояние): {isAdmin ? '✅ Да' : '❌ Нет'}</p>
              <p>hasAdminAccess (состояние): {hasAdminAccess ? '✅ Да' : '❌ Нет'}</p>
            </div>
          </div>
        )}
      </main>
      
      {/* Admin Access Modal */}
      <AdminAccessModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
      
      {/* Create Family Modal */}
      <CreateFamilyModal
        isOpen={showCreateFamilyModal}
        onClose={() => setShowCreateFamilyModal(false)}
        onSuccess={handleFamilyCreated}
      />
    </div>
  );
}
