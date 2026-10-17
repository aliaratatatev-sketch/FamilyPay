'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MoneyRequest {
  id: string;
  amount: number;
  currency: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  processedAt: string | null;
  rejectionReason: string | null;
  requester: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  approver: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
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
  accounts: { id: string; name: string; balance: number; currency: string }[];
}

export default function ManageRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    
    if (status === 'authenticated') {
      loadFamilies();
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedFamily) {
      loadRequests();
    }
  }, [selectedFamily, filter]);

  useEffect(() => {
    // Проверяем URL параметры для автоскролла к конкретному запросу
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('requestId');
    
    if (requestId && requests.length > 0) {
      // Небольшая задержка для рендеринга
      setTimeout(() => {
        const element = document.getElementById(`request-${requestId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Добавляем временную подсветку
          element.style.boxShadow = '0 0 0 3px rgba(13, 109, 110, 0.3)';
          setTimeout(() => {
            element.style.boxShadow = '';
          }, 2000);
        }
      }, 300);
    }
  }, [requests]);

  const loadFamilies = async () => {
    try {
      const response = await fetch('/api/families?t=' + Date.now());
      const data = await response.json();
      
      if (response.ok && data.families) {
        // Фильтруем семьи где пользователь ADMIN или PARENT
        const manageable = data.families.filter((f: any) => {
          const member = f.members.find((m: any) => m.user.id === session?.user?.id);
          return member && (member.role === 'ADMIN' || member.role === 'PARENT');
        });
        
        setFamilies(manageable);
        if (manageable.length > 0) {
          setSelectedFamily(manageable[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading families:', error);
    }
  };

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        familyId: selectedFamily,
      });

      if (filter === 'pending') {
        params.append('status', 'PENDING');
      }

      const response = await fetch(`/api/money-requests?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        const requestsData = data.requests || [];
        setRequests(requestsData);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', text: 'Ожидает' },
      APPROVED: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', text: 'Одобрено' },
      REJECTED: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', text: 'Отклонено' },
      COMPLETED: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', text: 'Выполнено' },
      CANCELLED: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', text: 'Отменено' },
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 text-xl">Загрузка...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (families.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Нет доступа
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            У вас нет прав для управления запросами. Обратитесь к администратору семьи.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const selectedFamilyData = families.find(f => f.id === selectedFamily);
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  // Функция для склонения слова "запрос"
  const getRequestWord = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'запросов';
    }

    if (lastDigit === 1) {
      return 'запрос';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'запроса';
    }

    return 'запросов';
  };

  // Функция для склонения глагола "ожидать"
  const getWaitVerb = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'ожидают';
    }

    if (lastDigit === 1) {
      return 'ожидает';
    }

    return 'ожидают';
  };

  return (
    <>
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            👨‍💼 Управление запросами
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Рассматривайте запросы на деньги от членов семьи
          </p>
        </div>

        {/* Family Selector */}
        {families.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Выберите семью
            </label>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Alert for pending requests */}
        {pendingCount > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <span className="text-xl sm:text-2xl shrink-0">⚠️</span>
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base text-yellow-900 dark:text-yellow-200 break-words">
                  {pendingCount} {getRequestWord(pendingCount)} {getWaitVerb(pendingCount)} вашего решения
                </p>
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                  Рассмотрите запросы как можно скорее
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Всего запросов</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-400 mb-1">Ожидают</div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-900 dark:text-yellow-300">{pendingCount}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-green-800 dark:text-green-400 mb-1">Одобрено</div>
            <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-300">
              {requests.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED').length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-red-800 dark:text-red-400 mb-1">Отклонено</div>
            <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-300">
              {requests.filter(r => r.status === 'REJECTED').length}
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Запросы
            </h2>
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  filter === 'pending'
                    ? 'bg-[#0D6D6E] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Ожидают ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-[#0D6D6E] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Все
              </button>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Нет запросов
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'pending' ? 'Все запросы обработаны!' : 'Пока нет запросов от членов семьи'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => {
                const badge = getStatusBadge(request.status);
                const isPending = request.status === 'PENDING';
                
                return (
                  <div
                    id={`request-${request.id}`}
                    key={request.id}
                    className={`py-4 px-3 sm:px-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                      isPending ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Avatar & Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-semibold shrink-0">
                          {request.requester.name?.charAt(0) || request.requester.email?.charAt(0) || '?'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white break-words">
                              {request.title}
                            </h3>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badge.color} w-fit`}>
                              {badge.text}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                            {request.requester.name || request.requester.email}
                            {request.description && (
                              <span className="ml-2 text-gray-500 dark:text-gray-500">
                                • {request.description.length > 50 ? request.description.slice(0, 50) + '...' : request.description}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                        {/* Amount */}
                        <div className="text-left sm:text-right">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {request.amount} {request.currency}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(request.createdAt).toLocaleDateString('ru-RU', { 
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        {isPending ? (
                          <div className="shrink-0">
                            <Link
                              href={`/dashboard/manage-requests/${request.id}`}
                              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white text-sm font-semibold rounded-lg hover:shadow-lg transition whitespace-nowrap"
                            >
                              Рассмотреть
                            </Link>
                          </div>
                        ) : (
                          <div className="shrink-0 text-right">
                            {request.approver && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                                {request.status === 'REJECTED' ? 'Отклонил' : 'Одобрил'}:
                                <br />
                                {request.approver.name || request.approver.email}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                        <p className="text-xs text-red-800 dark:text-red-200 break-words">
                          <strong>Причина:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
