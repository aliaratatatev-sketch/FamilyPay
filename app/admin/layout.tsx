'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LocaleProvider, useLocale } from '../i18n/LocaleContext';
import { adminTranslations, Locale, localeNames, locales } from '../i18n';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const t = adminTranslations[locale];

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navigation = [
    { name: t.nav.dashboard, href: '/admin', icon: '📊' },
    { name: t.nav.users, href: '/admin/users', icon: '👥' },
    { name: t.nav.families, href: '/admin/families', icon: '👨‍👩‍👧‍👦' },
    { name: t.nav.categories, href: '/admin/categories', icon: '📁' },
    { name: t.nav.accounts, href: '/admin/accounts', icon: '💳' },
    { name: t.nav.transactions, href: '/admin/transactions', icon: '💸' },
    { name: t.nav.budgets, href: '/admin/budgets', icon: '📈' },
    { name: t.nav.goals, href: '/admin/goals', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1923]">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white dark:bg-[#111d2b] border-r border-gray-200 dark:border-white/5 ${sidebarOpen ? 'w-64' : 'w-0'}`}>
        <div className="h-full px-4 py-6 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-bold text-lg">
              FP
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">FamilyPay</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.header.adminPanel}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white shadow-lg shadow-teal-500/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0D6D6E]/10 to-[#4FD1C5]/10 border border-[#4FD1C5]/20">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t.header.admin}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin User</p>
              <button className="mt-3 text-xs text-[#0D6D6E] dark:text-[#4FD1C5] font-medium hover:underline">
                {t.header.logout}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#111d2b]/80 backdrop-blur-sm border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {localeNames[locale]}
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#111d2b] rounded-xl shadow-lg border border-gray-200 dark:border-white/10 py-2 z-50">
                    {locales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setLocale(loc);
                          setShowLangMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                          locale === loc ? 'text-[#0D6D6E] dark:text-[#4FD1C5] font-semibold' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {localeNames[loc]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                {isDark ? (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </LocaleProvider>
  );
}
