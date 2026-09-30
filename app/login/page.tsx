'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Проверяем наличие ошибки в URL параметрах
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'AccessDenied') {
      setError('Доступ запрещен. Ваш аккаунт не зарегистрирован в системе.');
    } else if (errorParam) {
      setError('Произошла ошибка при входе. Попробуйте снова.');
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Используем redirect: false для обработки ошибок
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      });
      
      if (result?.error) {
        setError('Доступ запрещен. Ваш аккаунт не зарегистрирован в системе.');
        setLoading(false);
      } else if (result?.ok) {
        // Успешный вход, перенаправляем вручную
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // Вход
        const result = await signIn('credentials', {
          username: email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Неверные учетные данные');
        } else {
          // Перенаправление на dashboard
          router.push('/dashboard');
        }
      } else if (mode === 'register') {
        // Регистрация - отправляем код
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (response.ok) {
          // Переключаемся на режим верификации
          setMode('verify');
          setError('');
        } else {
          setError(data.error || 'Ошибка регистрации');
        }
      } else if (mode === 'verify') {
        // Верификация кода
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code: verificationCode }),
        });

        const data = await response.json();

        if (response.ok) {
          // После успешной верификации, автоматически входим
          const result = await signIn('credentials', {
            username: email,
            password,
            redirect: false,
          });

          if (!result?.error) {
            router.push('/dashboard');
          }
        } else {
          setError(data.error || 'Ошибка верификации');
        }
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <Link href="/" className="flex justify-center mb-6">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/logo.png"
                alt="FamilyPay"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Tab Switcher */}
          {mode !== 'verify' && (
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Войти
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Регистрация
              </button>
            </div>
          )}

          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {mode === 'login' ? 'Добро пожаловать!' : mode === 'register' ? 'Создать аккаунт' : 'Подтверждение Email'}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {mode === 'login'
              ? 'Войдите для управления финансами'
              : mode === 'register'
              ? 'Зарегистрируйтесь и начните прямо сейчас'
              : `Введите 6-значный код, отправленный на ${email}`}
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'verify' ? (
              // Режим верификации - только поле кода
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Код подтверждения
                </label>
                <input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                  placeholder="000000"
                  required
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Проверьте ваш почтовый ящик
                </p>
              </div>
            ) : (
              <>
                {mode === 'register' && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Имя
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent outline-none transition"
                      placeholder="Ваше имя"
                      required
                      autoComplete="name"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent outline-none transition"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={6}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : mode === 'register' ? 'Зарегистрироваться' : 'Подтвердить'}
            </button>
          </form>

          {/* Divider - только для режимов login и register */}
          {mode !== 'verify' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    или
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Войти через Google</span>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-white/80 hover:text-white transition-colors duration-200"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
