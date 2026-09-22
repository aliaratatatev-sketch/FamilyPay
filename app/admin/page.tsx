'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '../i18n/LocaleContext';
import { adminTranslations } from '../i18n';

interface Stats {
  overview: {
    users: number;
    families: number;
    transactions: number;
    accounts: number;
    categories: number;
    budgets: number;
    goals: number;
  };
  recentTransactions: Record<string, { count: number; total: string }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    description: string;
    createdAt: string;
    user: {
      name: string | null;
      email: string;
    };
  }>;
  topFamilies: Array<{
    id: string;
    name: string;
    currency: string;
    _count: {
      transactions: number;
      members: number;
      accounts: number;
    };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();
  const t = adminTranslations[locale];

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t.dashboard.loading}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{t.dashboard.error}</p>
      </div>
    );
  }

  const statCards = [
    { name: t.dashboard.stats.users, value: stats.overview.users, icon: '👥', color: 'from-blue-500 to-blue-600', link: '/admin/users' },
    { name: t.dashboard.stats.families, value: stats.overview.families, icon: '👨‍👩‍👧‍👦', color: 'from-green-500 to-green-600', link: '/admin/families' },
    { name: t.dashboard.stats.transactions, value: stats.overview.transactions, icon: '💸', color: 'from-purple-500 to-purple-600', link: '/admin/transactions' },
    { name: t.dashboard.stats.accounts, value: stats.overview.accounts, icon: '💳', color: 'from-orange-500 to-orange-600', link: '/admin/accounts' },
    { name: t.dashboard.stats.categories, value: stats.overview.categories, icon: '📁', color: 'from-pink-500 to-pink-600', link: '/admin/categories' },
    { name: t.dashboard.stats.budgets, value: stats.overview.budgets, icon: '📈', color: 'from-teal-500 to-teal-600', link: '/admin/budgets' },
    { name: t.dashboard.stats.goals, value: stats.overview.goals, icon: '🎯', color: 'from-indigo-500 to-indigo-600', link: '/admin/goals' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.dashboard.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t.dashboard.subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.link}
            className="group relative p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {stat.icon}
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#4FD1C5] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Transactions Summary */}
      {stats.recentTransactions && Object.keys(stats.recentTransactions).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl">
                📥
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.dashboard.recentTransactions.income}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.recentTransactions.INCOME?.count || 0}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.dashboard.recentTransactions.amount}: <span className="font-semibold text-green-600">{parseFloat(stats.recentTransactions.INCOME?.total || '0').toLocaleString()} ₽</span>
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl">
                📤
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.dashboard.recentTransactions.expense}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.recentTransactions.EXPENSE?.count || 0}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.dashboard.recentTransactions.amount}: <span className="font-semibold text-red-600">{parseFloat(stats.recentTransactions.EXPENSE?.total || '0').toLocaleString()} ₽</span>
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl">
                🔄
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.dashboard.recentTransactions.transfer}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.recentTransactions.TRANSFER?.count || 0}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.dashboard.recentTransactions.amount}: <span className="font-semibold text-blue-600">{parseFloat(stats.recentTransactions.TRANSFER?.total || '0').toLocaleString()} ₽</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            {t.dashboard.recentActivity.title}
          </h2>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#4FD1C5] mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.user.name || activity.user.email} • {new Date(activity.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Families */}
        <div className="rounded-2xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            {t.dashboard.topFamilies.title}
          </h2>
          <div className="space-y-3">
            {stats.topFamilies.map((family, idx) => (
              <Link
                key={family.id}
                href={`/admin/families?id=${family.id}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-bold">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#4FD1C5] transition-colors">
                    {family.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>👥 {family._count.members}</span>
                    <span>💳 {family._count.accounts}</span>
                    <span>💸 {family._count.transactions}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#4FD1C5] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
