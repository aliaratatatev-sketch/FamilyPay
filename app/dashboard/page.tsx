'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminAccessModal from '../components/AdminAccessModal';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    // Если точно не авторизован, редирект
    if (status === 'unauthenticated') {
      console.log('🔴 User unauthenticated, redirecting to /login');
      router.replace('/login');
    }
    
    if (status === 'authenticated') {
      console.log('✅ User authenticated:', session?.user?.email);
      checkAdminAccess();
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
                {session.user?.name || session.user?.email}
              </p>
            </div>
            
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
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                +12%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Общий баланс
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              0 ₽
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                Этот месяц
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Расходы
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              0 ₽
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20 px-2 py-1 rounded">
                75%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Цели
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              0 / 0
            </p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-2xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">
            🎉 Добро пожаловать в FamilyPay!
          </h2>
          <p className="text-white/90 mb-6">
            Начните управлять финансами вашей семьи прямо сейчас. Создайте первую семью,
            добавьте счета и начните отслеживать расходы.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white text-[#0D6D6E] font-semibold rounded-lg hover:bg-gray-100 transition">
              Создать семью
            </button>
            <button className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition">
              Добавить счёт
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition group">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <span className="text-2xl">💸</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Добавить доход
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Зарплата, подработка
            </p>
          </button>

          <button className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition group">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <span className="text-2xl">🛒</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Добавить расход
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Покупки, счета
            </p>
          </button>

          <button className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition group">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Создать цель
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Накопления, мечты
            </p>
          </button>

          <button className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Бюджеты
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Планирование расходов
            </p>
          </button>
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
            🔍 Отладочная информация:
          </p>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 font-mono">
            <p>Email: {session?.user?.email || 'Нет email'}</p>
            <p>Имя: {session?.user?.name || 'Нет имени'}</p>
            <p>Роль в БД: {session?.user?.role || 'Нет роли'}</p>
            <p>isAdmin (состояние): {isAdmin ? '✅ Да' : '❌ Нет'}</p>
            <p>hasAdminAccess (состояние): {hasAdminAccess ? '✅ Да' : '❌ Нет'}</p>
          </div>
        </div>

        {session.user?.role === 'ADMIN' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              🔑 Вы администратор по роли БД. <Link href="/admin" className="underline font-semibold">Перейти в админ-панель</Link>
            </p>
          </div>
        )}
      </main>
      
      {/* Admin Access Modal */}
      <AdminAccessModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  );
}
