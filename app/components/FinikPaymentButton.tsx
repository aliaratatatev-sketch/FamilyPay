// app/components/FinikPaymentButton.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FinikPaymentButtonProps {
  planName: string;
  workId?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function FinikPaymentButton({ 
  planName, 
  workId = 'subscription', 
  className = '',
  children
}: FinikPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handlePayment = async () => {
    // Проверка авторизации
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Вызов API для создания платежа (сумма зафиксирована на сервере - 5 KGS)
      const response = await fetch('/api/finik/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId: workId,
          workTopic: `Подписка ${planName}`,
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // 2. Редирект на платежную страницу Finik
      if (data.paymentUrl) {
        console.log(`[FINIK] Redirecting to payment page for ${data.amount} KGS`);
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (err) {
      console.error('[FINIK] Payment error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка создания платежа');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={className || `block w-full min-h-[44px] py-3 sm:py-3.5 text-center rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center border-2 border-[#0D6D6E]/30 dark:border-[#4FD1C5]/30 text-[#0D6D6E] dark:text-[#4FD1C5] hover:border-[#0D6D6E] dark:hover:border-[#4FD1C5] hover:bg-[#0D6D6E]/5 dark:hover:bg-[#4FD1C5]/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Создание платежа...
          </span>
        ) : (
          children || 'Оплатить 5 сом'
        )}
      </button>
      
      {error && (
        <p className="text-red-600 dark:text-red-400 mt-2 text-xs sm:text-sm text-center">
          {error}
        </p>
      )}
    </div>
  );
}
