'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationBell from '../../components/NotificationBell';

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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MoneyRequest | null>(null);

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
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: '⏳', text: 'Ожидает' },
      APPROVED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: '✅', text: 'Одобрено' },
      REJECTED: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '❌', text: 'Отклонено' },
      COMPLETED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '💰', text: 'Выполнено' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: '🚫', text: 'Отменено' },
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
            <NotificationBell />
            
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            👨‍💼 Управление запросами
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  {pendingCount} {pendingCount === 1 ? 'запрос ожидает' : 'запросов ожидают'} вашего решения
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Рассмотрите запросы как можно скорее
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Всего запросов</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow p-6">
            <div className="text-sm text-yellow-800 dark:text-yellow-400 mb-1">Ожидают</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">{pendingCount}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow p-6">
            <div className="text-sm text-green-800 dark:text-green-400 mb-1">Одобрено</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-300">
              {requests.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED').length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow p-6">
            <div className="text-sm text-red-800 dark:text-red-400 mb-1">Отклонено</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-300">
              {requests.filter(r => r.status === 'REJECTED').length}
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Запросы
            </h2>
            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'pending'
                    ? 'bg-[#0D6D6E] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Ожидают ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
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
            <div className="space-y-4">
              {requests.map((request) => {
                const badge = getStatusBadge(request.status);
                const isPending = request.status === 'PENDING';
                
                return (
                  <div
                    key={request.id}
                    className={`border-2 rounded-xl p-5 transition ${
                      isPending
                        ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {request.requester.name?.charAt(0) || request.requester.email?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {request.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                              <span>{badge.icon}</span>
                              <span>{badge.text}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            От: {request.requester.name || request.requester.email}
                          </p>
                          {request.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {request.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>📅 {new Date(request.createdAt).toLocaleDateString('ru-RU', { 
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                            {request.processedAt && (
                              <span>✓ {new Date(request.processedAt).toLocaleDateString('ru-RU')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {request.amount} {request.currency}
                        </div>
                      </div>
                    </div>

                    {request.approver && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 ml-16">
                        <span>👤</span>
                        <span>
                          {request.status === 'REJECTED' ? 'Отклонил' : 'Одобрил'}: {request.approver.name || request.approver.email}
                        </span>
                      </div>
                    )}

                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3 ml-16">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Причина отклонения:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}

                    {isPending && (
                      <div className="flex gap-2 ml-16">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApproveModal(true);
                          }}
                          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                        >
                          <span>✅</span>
                          <span>Одобрить</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectModal(true);
                          }}
                          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                        >
                          <span>❌</span>
                          <span>Отклонить</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && selectedFamilyData && (
        <ApproveModal
          request={selectedRequest}
          family={selectedFamilyData}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            setShowApproveModal(false);
            setSelectedRequest(null);
            loadRequests();
          }}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <RejectModal
          request={selectedRequest}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
            loadRequests();
          }}
        />
      )}
    </div>
  );
}

// Компонент одобрения запроса
function ApproveModal({
  request,
  family,
  onClose,
  onSuccess,
}: {
  request: MoneyRequest;
  family: Family;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/money-requests/${request.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при одобрении запроса');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при одобрении запроса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Одобрить запрос?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {request.requester.name || request.requester.email} просит {request.amount} {request.currency}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            📝 {request.title}
          </p>
          {request.description && (
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {request.description}
            </p>
          )}
        </div>

        {family.accounts && family.accounts.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Списать со счета (необязательно)
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Только одобрить (не списывать)</option>
              {family.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.balance} {account.currency}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💡 Если выбрать счет, деньги будут автоматически списаны и создана транзакция
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Одобрение...
              </>
            ) : (
              <>
                <span>✅</span>
                <span>Одобрить</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Компонент отклонения запроса
function RejectModal({
  request,
  onClose,
  onSuccess,
}: {
  request: MoneyRequest;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReject = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/money-requests/${request.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отклонении запроса');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при отклонении запроса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Отклонить запрос?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {request.requester.name || request.requester.email} просит {request.amount} {request.currency}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            📝 {request.title}
          </p>
          {request.description && (
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {request.description}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Причина отклонения (необязательно)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Объясните, почему вы отклоняете этот запрос..."
            disabled={isLoading}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            💡 Рекомендуем указать причину, чтобы ребенок понял ваше решение
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Отклонение...
              </>
            ) : (
              <>
                <span>❌</span>
                <span>Отклонить</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
