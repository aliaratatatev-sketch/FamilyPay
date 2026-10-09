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
}

export default function MoneyRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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
        setFamilies(data.families);
        if (data.families.length > 0) {
          setSelectedFamily(data.families[0].id);
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
        requesterId: session?.user?.id || '',
      });

      if (filter !== 'all') {
        params.append('status', filter.toUpperCase());
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

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Вы уверены, что хотите отменить этот запрос?')) return;

    try {
      const response = await fetch(`/api/money-requests/${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRequests();
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при отмене запроса');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Ошибка при отмене запроса');
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

  const selectedFamilyData = families.find(f => f.id === selectedFamily);

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            💸 Запросы на деньги
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Отправляйте запросы родителям на карманные расходы
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Всего запросов</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow p-6">
            <div className="text-sm text-yellow-800 dark:text-yellow-400 mb-1">Ожидают</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
              {requests.filter(r => r.status === 'PENDING').length}
            </div>
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

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Мои запросы
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2"
            >
              <span>+</span>
              <span>Новый запрос</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  filter === f
                    ? 'bg-[#0D6D6E] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f === 'all' ? 'Все' : f === 'pending' ? 'Ожидают' : f === 'approved' ? 'Одобрено' : 'Отклонено'}
              </button>
            ))}
          </div>

          {/* Requests List */}
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Нет запросов
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Создайте свой первый запрос на деньги
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                Создать запрос
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const badge = getStatusBadge(request.status);
                return (
                  <div
                    key={request.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {request.title}
                        </h3>
                        {request.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {request.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>📅 {new Date(request.createdAt).toLocaleDateString('ru-RU')}</span>
                          {request.processedAt && (
                            <span>✓ {new Date(request.processedAt).toLocaleDateString('ru-RU')}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {request.amount} {request.currency}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.text}</span>
                        </span>
                      </div>
                    </div>

                    {request.approver && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span>👤</span>
                        <span>
                          {request.status === 'REJECTED' ? 'Отклонил' : 'Одобрил'}: {request.approver.name || request.approver.email}
                        </span>
                      </div>
                    )}

                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Причина отклонения:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}

                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                        >
                          Отменить запрос
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

      {/* Create Request Modal */}
      {showCreateModal && selectedFamilyData && (
        <CreateRequestModal
          familyId={selectedFamily}
          currency={selectedFamilyData.currency}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadRequests();
          }}
        />
      )}
    </>
  );
}

// Компонент создания запроса
function CreateRequestModal({
  familyId,
  currency,
  onClose,
  onSuccess,
}: {
  familyId: string;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !amount) {
      setError('Заполните название и сумму');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/money-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId,
          amount: amountNum,
          title: title.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании запроса');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании запроса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
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
            Новый запрос на деньги
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Опишите, на что вам нужны деньги
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              На что нужны деньги? *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="Например: Поход в кино"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Сумма ({currency}) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0.00"
              disabled={isLoading}
              step="0.01"
              min="0.01"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Подробное описание (необязательно)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительная информация..."
              disabled={isLoading}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {description.length}/500 символов
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Ваш запрос увидят родители и администраторы семьи. Они смогут его одобрить или отклонить.
            </p>
          </div>

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
              disabled={isLoading || !title.trim() || !amount}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
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
                  Отправка...
                </>
              ) : (
                'Отправить запрос'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
