'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminAccessModal from '@/app/components/AdminAccessModal';
import CreateFamilyModal from '@/app/components/CreateFamilyModal';
import NotificationBell from '@/components/NotificationBell';
import { useDashboardLocale } from '@/app/i18n/useDashboardLocale';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

// Компонент круговой диаграммы категорий
const CategoryPieChart = ({ 
  categories, 
  currency, 
  formatAmount,
  t 
}: { 
  categories: any[]; 
  currency: string;
  formatAmount: (amount: number, currency: string) => string;
  t: any;
}) => {
  // Цвета для диаграммы
  const COLORS = [
    '#10b981', // emerald-500
    '#6366f1', // indigo-500
    '#f59e0b', // amber-500
    '#0ea5e9', // sky-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
  ];

  // Демо-данные для примера (без эмодзи)
  const demoData = [
    { name: 'Еда', value: 45000, category: 'Еда' },
    { name: 'Развлечения', value: 28000, category: 'Развлечения' },
    { name: 'Техника', value: 35000, category: 'Техника' },
    { name: 'Транспорт', value: 22000, category: 'Транспорт' },
    { name: 'Дом', value: 18000, category: 'Дом' },
  ];

  // Используем реальные данные или демо-данные
  const hasRealData = categories && categories.length > 0;
  const chartData = hasRealData 
    ? categories.slice(0, 8).map((cat: any) => ({
        name: cat.category || 'Без категории',
        value: Number(cat.total),
        category: cat.category || 'Без категории'
      }))
    : demoData;

  // Кастомная метка для легенды (компактная сетка в 2 колонки)
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs">
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Кастомный тултип
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {payload[0].name}
          </p>
          <p className="text-lg font-bold text-[#0D6D6E] dark:text-[#4FD1C5]">
            {formatAmount(payload[0].value, currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {((payload[0].value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% от общих расходов
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t.sections.topCategories}
        </h2>
        <Link 
          href="/dashboard/transactions"
          className="text-sm text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline"
        >
          {t.sections.details}
        </Link>
      </div>

      <div style={{ width: '100%', height: '360px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="38%"
              labelLine={false}
              outerRadius={75}
              innerRadius={48}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              content={renderLegend}
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {!hasRealData && (
        <div className="mt-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            ℹ️ Демо-данные для примера
          </p>
        </div>
      )}
    </div>
  );
};

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
  const { t } = useDashboardLocale();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

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
        const familiesArray = Array.isArray(data.families) ? data.families : [];
        setFamilies(familiesArray);
        
        // Если у пользователя нет семей, показываем модалку создания
        if (familiesArray.length === 0) {
          setShowCreateFamilyModal(true);
        } else {
          // Выбираем первую семью по умолчанию
          setSelectedFamily(familiesArray[0]);
        }
      } else {
        console.error('Failed to fetch families:', response.statusText);
        setFamilies([]);
      }
    } catch (error) {
      console.error('Error loading families:', error);
      setFamilies([]);
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
        // Загружаем AI-инсайт после получения статистики
        loadAIInsight(data, familyId);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadAIInsight = async (statsData: DashboardStats, familyId: string) => {
    try {
      setIsLoadingInsight(true);
      
      // Получаем pending requests для инсайта
      const requestsResponse = await fetch(`/api/money-requests?familyId=${familyId}&status=PENDING`);
      const requestsData = await requestsResponse.json();
      
      const pendingRequests = requestsData.requests || [];
      const pendingAmount = pendingRequests.reduce((sum: number, req: any) => sum + req.amount, 0);
      
      const response = await fetch('/api/ai/daily-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBalance: statsData.totalBalance,
          monthExpense: statsData.expense,
          expenseChange: statsData.expenseChange,
          pendingRequests: pendingRequests.length,
          pendingAmount: pendingAmount,
          topCategory: statsData.topExpenseCategories[0]?.category?.name,
          currency: selectedFamily?.currency || 'KGS'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiInsight(data.insight || 'Следите за бюджетом и планируйте траты заранее! 💡');
      }
    } catch (error) {
      console.error('Error loading AI insight:', error);
      setAiInsight('Следите за бюджетом и планируйте траты заранее! 💡');
    } finally {
      setIsLoadingInsight(false);
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

  const formatAmount = (amount: number, currency: string = 'KGS') => {
    const symbols: Record<string, string> = {
      KGS: ' сом',
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
      return t.date.today;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t.date.yesterday;
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
        <div className="text-white text-2xl font-semibold">{t.loading}</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Показываем пустоту пока идет редирект
  }

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.welcome.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.welcome.subtitle}
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
              {t.stats.totalBalance}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? (
                <span className="animate-pulse">{t.loading}</span>
              ) : stats ? (
                formatAmount(stats.totalBalance, selectedFamily?.currency)
              ) : (
                '0 сом'
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
              {t.stats.monthExpenses}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? (
                <span className="animate-pulse">{t.loading}</span>
              ) : stats ? (
                formatAmount(stats.expense, selectedFamily?.currency)
              ) : (
                '0 сом'
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
                  {stats.goals.totalCompleted} {t.stats.completed}
                </span>
              )}
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t.stats.activeGoals}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? (
                <span className="animate-pulse">{t.loading}</span>
              ) : stats ? (
                `${stats.goals.totalActive}`
              ) : (
                '0'
              )}
            </p>
          </div>
        </div>

        {/* Welcome and AI Assistant Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>👋</span> {t.welcomeCard.title}
            </h2>
            
            {isLoadingFamilies ? (
              <p className="text-gray-600 dark:text-gray-400">{t.loading}</p>
            ) : families.length === 0 ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {t.welcomeCard.noFamilies.description}
                </p>
                <button 
                  onClick={() => setShowCreateFamilyModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
                >
                  {t.welcomeCard.noFamilies.button}
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                  У вас {families.length} {families.length === 1 ? t.welcomeCard.hasFamilies.count_one : families.length < 5 ? t.welcomeCard.hasFamilies.count_few : t.welcomeCard.hasFamilies.count_many}
                </p>
                <div className="space-y-3 mb-3">
                  {families.slice(0, 2).map((family) => (
                    <div 
                      key={family.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{family.name}</h3>
                        <Link
                          href="/dashboard/family"
                          className="text-xs px-2 py-1 text-[#0D6D6E] dark:text-[#4FD1C5] bg-[#0D6D6E]/10 dark:bg-[#4FD1C5]/10 rounded hover:bg-[#0D6D6E]/20 dark:hover:bg-[#4FD1C5]/20 transition"
                        >
                          {t.welcomeCard.hasFamilies.manage}
                        </Link>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>👥 {family.members.length}</span>
                        <span>💳 {family.accounts.length}</span>
                        <span>💰 {family._count.transactions}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {families.length > 2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    + ещё {families.length - 2}
                  </p>
                )}
                <button 
                  onClick={() => setShowCreateFamilyModal(true)}
                  className="px-4 py-2 text-sm text-[#0D6D6E] dark:text-[#4FD1C5] border border-[#0D6D6E] dark:border-[#4FD1C5] rounded-lg hover:bg-[#0D6D6E]/5 dark:hover:bg-[#4FD1C5]/5 transition font-medium"
                >
                  {t.welcomeCard.hasFamilies.createAnother}
                </button>
              </>
            )}
          </div>

          {/* AI Assistant Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-100/50 to-indigo-100/50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full -translate-y-24 translate-x-24" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🤖</span>
                </div>
                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                  {t.aiAssistant.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t.aiAssistant.title}
              </h3>
              
              {/* AI Insight of the day */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-4">
                {isLoadingInsight ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-purple-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs text-purple-700 dark:text-purple-300">Генерирую инсайт...</span>
                  </div>
                ) : (
                  <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
                    {aiInsight || 'Следите за бюджетом и планируйте траты заранее! 💡'}
                  </p>
                )}
              </div>
              
              <Link href="/dashboard/ai-assistant">
                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 group">
                  <span>{t.aiAssistant.button}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {stats && stats.recentTransactions && stats.recentTransactions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Transactions Widget */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.sections.recentTransactions}
                </h2>
                <Link 
                  href="/dashboard/transactions"
                  className="text-sm text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline"
                >
                  {t.sections.viewAll}
                </Link>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentTransactions.slice(0, 5).map((transaction: any) => (
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

            {/* Active Goals Widget */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.sections.financialGoals}
                </h2>
                <Link 
                  href="/dashboard/goals"
                  className="text-sm text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline"
                >
                  {t.sections.viewAll}
                </Link>
              </div>
              {stats.goals && stats.goals.active && stats.goals.active.length > 0 ? (
                <div className="space-y-4">
                  {stats.goals.active.slice(0, 3).map((goal: any) => {
                    const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                    return (
                      <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {goal.icon} {goal.name}
                          </h3>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatAmount(Number(goal.currentAmount), goal.currency)}</span>
                          <span>{formatAmount(Number(goal.targetAmount), goal.currency)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t.goals.noGoals}
                  </p>
                  <Link
                    href="/dashboard/goals"
                    className="inline-block px-4 py-2 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-lg hover:shadow-lg transition"
                  >
                    {t.goals.createButton}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accounts and Budgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Accounts Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.sections.accounts}
              </h2>
              <Link 
                href="/dashboard/accounts"
                className="text-sm text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline"
              >
                {t.sections.manage}
              </Link>
            </div>
            {selectedFamily && selectedFamily.accounts && selectedFamily.accounts.length > 0 ? (
              <div className="space-y-3">
                {selectedFamily.accounts.slice(0, 4).map((account: any) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white">
                        {account.icon || '💳'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatAmount(Number(account.balance), account.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💳</div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t.accounts.noAccounts}
                </p>
                <Link
                  href="/dashboard/accounts"
                  className="inline-block px-4 py-2 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-lg hover:shadow-lg transition"
                >
                  {t.accounts.addButton}
                </Link>
              </div>
            )}
          </div>

          {/* Top Expenses Widget */}
          <CategoryPieChart 
            categories={stats?.topExpenseCategories || []}
            currency={selectedFamily?.currency || 'KGS'}
            formatAmount={formatAmount}
            t={t}
          />
        </div>
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
    </>
  );
}
