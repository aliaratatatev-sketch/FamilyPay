'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminAccessModal({ isOpen, onClose }: AdminAccessModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && !isCodeSent) {
      requestCode();
    }
  }, [isOpen]);

  useEffect(() => {
    if (expiresIn > 0) {
      const timer = setTimeout(() => {
        setExpiresIn((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [expiresIn]);

  const requestCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/request-access', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке кода');
      }

      setIsCodeSent(true);
      setExpiresIn(data.expiresIn || 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Неверный код');
      }

      // Успешно! Переходим в админ-панель
      router.push('/admin');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Разрешаем только цифры
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6 && !isLoading) {
      verifyCode();
    }
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Вход в админ-панель
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Введите код из Telegram
          </p>
        </div>

        {!isCodeSent ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0D6D6E] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Отправка кода...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                6-значный код
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                disabled={isLoading}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                autoFocus
              />
              {expiresIn > 0 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  ⏰ Код действителен: {formatTime(expiresIn)}
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={verifyCode}
              disabled={code.length !== 6 || isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                  Проверка...
                </span>
              ) : (
                'Подтвердить'
              )}
            </button>

            <button
              onClick={requestCode}
              disabled={isLoading || expiresIn > 240}
              className="w-full mt-3 py-2 px-4 text-sm text-gray-600 dark:text-gray-400 hover:text-[#0D6D6E] dark:hover:text-[#4FD1C5] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить новый код
            </button>
          </>
        )}
      </div>
    </div>
  );
}
