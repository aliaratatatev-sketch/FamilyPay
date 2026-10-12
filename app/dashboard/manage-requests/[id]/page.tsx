'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

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
  } | null;
  family: {
    id: string;
    name: string;
    currency: string;
  };
  account: {
    id: string;
    name: string;
    balance: number;
    currency: string;
  } | null;
}

interface AIAnalysis {
  recommendation: string;
  exactPercent: number;
  remainingBalance: number;
  requestAmount: number;
  accountBalance: number;
  accountName: string;
}

interface Family {
  id: string;
  name: string;
  currency: string;
  accounts: { id: string; name: string; balance: number; currency: string }[];
}

export default function RequestDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const requestId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [request, setRequest] = useState<MoneyRequest | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    
    if (status === 'authenticated' && requestId) {
      loadRequest();
      loadFamilies();
    }
  }, [status, requestId, router]);

  useEffect(() => {
    if (request && request.status === 'PENDING') {
      loadAIAnalysis();
    }
  }, [request]);

  const loadRequest = async () => {
    if (!requestId) {
      console.error('No request ID');
      router.replace('/dashboard/manage-requests');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/money-requests/${requestId}`);
      const data = await response.json();
      
      if (response.ok) {
        setRequest(data.request);
      } else {
        console.error('Failed to load request:', data);
        router.replace('/dashboard/manage-requests');
      }
    } catch (error) {
      console.error('Error loading request:', error);
      router.replace('/dashboard/manage-requests');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFamilies = async () => {
    try {
      const response = await fetch('/api/families?t=' + Date.now());
      const data = await response.json();
      
      if (response.ok && data.families) {
        const manageable = data.families.filter((f: any) => {
          const member = f.members.find((m: any) => m.user.id === session?.user?.id);
          return member && (member.role === 'ADMIN' || member.role === 'PARENT');
        });
        setFamilies(manageable);
      }
    } catch (error) {
      console.error('Error loading families:', error);
    }
  };

  const loadAIAnalysis = async () => {
    if (!request) return;

    setAiLoading(true);
    try {
      // Если есть привязанный счёт - используем его
      if (request.account) {
        const response = await fetch('/api/ai/analyze-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: request.id,
            title: request.title,
            amount: request.amount,
            currency: request.currency,
            description: request.description,
            accountId: request.account.id,
            accountBalance: request.account.balance,
            accountName: request.account.name,
          })
        });

        if (response.ok) {
          const data = await response.json();
          setAiAnalysis(data.analysis);
        }
      } else {
        // Fallback: используем общий баланс семьи
        const family = families.find(f => f.id === request.family.id);
        if (family && family.accounts && family.accounts.length > 0) {
          const totalBalance = family.accounts.reduce((sum, acc) => sum + acc.balance, 0);
          const mainAccount = family.accounts[0];
          
          const response = await fetch('/api/ai/analyze-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestId: request.id,
              title: request.title,
              amount: request.amount,
              currency: request.currency,
              description: request.description,
              accountId: mainAccount.id,
              accountBalance: totalBalance,
              accountName: 'Общий баланс семьи',
            })
          });

          if (response.ok) {
            const data = await response.json();
            setAiAnalysis(data.analysis);
          }
        }
      }
    } catch (error) {
      console.error('Error loading AI analysis:', error);
    } finally {
      setAiLoading(false);
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

  if (!request) {
    return null;
  }

  const badge = getStatusBadge(request.status);
  const isPending = request.status === 'PENDING';
  const selectedFamilyData = families.find(f => f.id === request.family.id);

  return (
    <>
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/manage-requests"
            className="inline-flex items-center text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к списку
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {request.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Запрос от {request.requester.name || request.requester.email}
              </p>
            </div>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>
              {badge.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Детали запроса
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Сумма</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {request.amount} {request.currency}
                  </span>
                </div>

                {request.description && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Описание</p>
                    <p className="text-gray-900 dark:text-white">{request.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Создан</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(request.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  
                  {request.processedAt && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Обработан</p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(request.processedAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  )}
                </div>

                {request.account && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      Счет для списания
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg text-blue-800 dark:text-blue-300">{request.account.name}</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                        {request.account.balance} {request.account.currency}
                      </p>
                    </div>
                  </div>
                )}

                {request.approver && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {request.status === 'REJECTED' ? 'Отклонил' : 'Одобрил'}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {request.approver.name || request.approver.email}
                    </p>
                  </div>
                )}

                {request.rejectionReason && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                      Причина отклонения
                    </p>
                    <p className="text-red-800 dark:text-red-300">{request.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Analysis */}
            {isPending && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-1">
                      AI-Анализ и рекомендации
                    </h2>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Умный помощник для принятия решения
                    </p>
                  </div>
                </div>

                {aiLoading ? (
                  <div className="flex items-center gap-3 py-4">
                    <svg className="animate-spin h-6 w-6 text-purple-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-purple-700 dark:text-purple-300">AI анализирует запрос...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    {/* Математика */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">От баланса</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                          {aiAnalysis.exactPercent}%
                        </p>
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Остаток после</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-200">
                          {aiAnalysis.remainingBalance} {request.currency}
                        </p>
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Счет</p>
                        <p className="text-sm font-bold text-purple-900 dark:text-purple-200 truncate">
                          {aiAnalysis.accountName}
                        </p>
                      </div>
                    </div>

                    {/* Рекомендация AI */}
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">
                        📋 Рекомендация
                      </p>
                      <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                        {aiAnalysis.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    Не удалось загрузить AI-анализ
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requester Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Запросил
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-semibold text-lg">
                  {request.requester.name?.charAt(0) || request.requester.email?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {request.requester.name || 'Без имени'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {request.requester.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isPending && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Действия
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
                  >
                    ✓ Одобрить
                  </button>
                  <button
                    onClick={() => alert('Запрос отложен для последующего рассмотрения')}
                    className="w-full py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    ⏸ Отложить
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-3 px-4 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    ✗ Отклонить
                  </button>
                </div>
              </div>
            )}

            {/* Family Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Семья
              </h3>
              <p className="text-gray-900 dark:text-white font-semibold mb-2">
                {request.family.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Валюта: {request.family.currency}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Approve Modal */}
      {showApproveModal && selectedFamilyData && (
        <ApproveModal
          request={request}
          family={selectedFamilyData}
          onClose={() => setShowApproveModal(false)}
          onSuccess={() => {
            setShowApproveModal(false);
            router.push('/dashboard/manage-requests');
          }}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          request={request}
          onClose={() => setShowRejectModal(false)}
          onSuccess={() => {
            setShowRejectModal(false);
            router.push('/dashboard/manage-requests');
          }}
        />
      )}
    </>
  );
}

// Компонент одобрения запроса с выбором банка
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
  const [step, setStep] = useState<'bank' | 'confirm'>('bank');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const banks = [
    { id: 'sber', name: 'Сбер', icon: '🟢', color: 'from-green-500 to-green-600' },
    { id: 'odengi', name: 'О!Деньги', icon: '🟠', color: 'from-orange-500 to-orange-600' },
    { id: 'mbank', name: 'MBANK', icon: '🔵', color: 'from-blue-500 to-blue-600' },
    { id: 'cash', name: 'Наличные', icon: '💵', color: 'from-emerald-500 to-emerald-600' },
  ];

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setStep('confirm');
  };

  const handleApprove = async () => {
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch(`/api/money-requests/${request.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedBank }),
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

  const selectedBankData = banks.find(b => b.id === selectedBank);

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

        {step === 'bank' ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💳</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Выберите банк оплаты
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {request.requester.name || request.requester.email} • {request.amount} {request.currency}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                📝 {request.title}
              </p>
              {request.description && (
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  {request.description}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank.id)}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-[#0D6D6E] dark:hover:border-[#4FD1C5] transition-all hover:shadow-lg group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${bank.color} flex items-center justify-center text-2xl`}>
                      {bank.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#0D6D6E] dark:group-hover:text-[#4FD1C5] transition">
                        {bank.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {bank.id === 'cash' ? 'Наличный расчет' : 'Онлайн перевод'}
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-[#0D6D6E] dark:group-hover:text-[#4FD1C5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Отмена
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedBankData?.color} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-3xl">{selectedBankData?.icon}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Подтвердите платеж
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Через {selectedBankData?.name}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Получатель</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {request.requester.name || request.requester.email}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Назначение</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {request.title}
                </span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Сумма</span>
                  <span className="text-2xl font-bold text-[#0D6D6E] dark:text-[#4FD1C5]">
                    {request.amount} {request.currency}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('bank')}
                disabled={isLoading}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Обработка...
                  </>
                ) : (
                  'Одобрить'
                )}
              </button>
            </div>
          </>
        )}
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
    if (!reason.trim()) {
      setError('Укажите причину отклонения');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/money-requests/${request.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
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
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✗</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Отклонить запрос
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {request.requester.name || request.requester.email} • {request.amount} {request.currency}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            📝 {request.title}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Причина отклонения <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Объясните, почему запрос отклонен..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D6D6E] dark:focus:ring-[#4FD1C5] focus:border-transparent"
            disabled={isLoading}
          />
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
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Обработка...
              </>
            ) : (
              'Отклонить'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
