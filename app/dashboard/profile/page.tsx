'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    
    if (status === 'authenticated' && session?.user) {
      setUserId(session.user.id || '');
    }
  }, [status, router, session]);

  const handleCopyId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  return (\n    <>\n      {/* Main Content */}\n      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Мой профиль
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управление вашим профилем и настройками
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5]" />
          
          {/* Profile info */}
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="w-32 h-32 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center">
                <span className="text-5xl">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '👤'}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Имя
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {session?.user?.name || 'Не указано'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {session?.user?.email || 'Не указано'}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ваш ID пользователя
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                      {userId || 'Загрузка...'}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className={`px-4 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white hover:shadow-lg'
                    }`}
                  >
                    {copied ? (
                      <>
                        <span>✓</span>
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <span>📋</span>
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  💡 Используйте этот ID, чтобы другие пользователи могли добавить вас в свою семью
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Как добавить участника в семью?
              </h3>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>1. Попросите пользователя скопировать его ID из профиля</li>
                <li>2. Перейдите в раздел "Управление семьёй"</li>
                <li>3. Нажмите кнопку "Пригласить"</li>
                <li>4. Выберите "По ID" и вставьте скопированный ID</li>
                <li>5. Выберите роль и нажмите "Добавить"</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🔐</span>
            Безопасность
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Пароль
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Последнее изменение: Неизвестно
                </p>
              </div>
              <button className="px-4 py-2 text-[#0D6D6E] dark:text-[#4FD1C5] border border-[#0D6D6E]/30 dark:border-[#4FD1C5]/30 rounded-lg hover:bg-[#0D6D6E]/10 dark:hover:bg-[#4FD1C5]/10 transition font-medium">
                Изменить
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Двухфакторная аутентификация
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Дополнительный уровень безопасности
                </p>
              </div>
              <button className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
                Настроить
              </button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            Информация об аккаунте
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Дата регистрации</span>
              <span className="text-gray-900 dark:text-white font-medium">Неизвестно</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Роль</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {session?.user?.role === 'SUPER_ADMIN' ? 'Супер-администратор' : 'Пользователь'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Статус аккаунта</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                Активен
              </span>
            </div>
          </div>
        </div>
      </main>`n    </>`n  );
}
