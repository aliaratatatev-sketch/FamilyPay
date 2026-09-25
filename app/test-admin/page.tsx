'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { isAdminEmail } from '@/lib/admin-config';

export default function TestAdminPage() {
  const { data: session } = useSession();
  const [checkResult, setCheckResult] = useState<any>(null);

  const testAdminCheck = async () => {
    const response = await fetch('/api/admin/check-access');
    const data = await response.json();
    setCheckResult(data);
  };

  useEffect(() => {
    if (session) {
      testAdminCheck();
    }
  }, [session]);

  const ADMIN_EMAILS = ['aliaratatatev@gmail.com'];

  const userEmail = session?.user?.email || '';
  const isMatchLocal = ADMIN_EMAILS.includes(userEmail.toLowerCase().trim());
  const isMatchFunction = isAdminEmail(userEmail);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">🔍 Тест проверки администратора</h1>

        <div className="space-y-6">
          {/* Информация о сессии */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">📧 Информация о сессии</h2>
            <div className="space-y-2 font-mono text-sm">
              <p><strong>Email:</strong> {session?.user?.email || 'НЕТ'}</p>
              <p><strong>Имя:</strong> {session?.user?.name || 'НЕТ'}</p>
              <p><strong>ID:</strong> {session?.user?.id || 'НЕТ'}</p>
              <p><strong>Роль:</strong> {session?.user?.role || 'НЕТ'}</p>
            </div>
          </div>

          {/* Список администраторов */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">👥 Список администраторов</h2>
            <div className="space-y-1 font-mono text-sm">
              {ADMIN_EMAILS.map((email, idx) => (
                <p key={idx}>• {email}</p>
              ))}
            </div>
          </div>

          {/* Проверка совпадения */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🔍 Проверка совпадения</h2>
            <div className="space-y-2 font-mono text-sm">
              <p><strong>Ваш email:</strong> "{userEmail}"</p>
              <p><strong>Email в нижнем регистре:</strong> "{userEmail.toLowerCase()}"</p>
              <p><strong>Email с trim:</strong> "{userEmail.toLowerCase().trim()}"</p>
              <p><strong>Длина:</strong> {userEmail.length} символов</p>
              <p><strong>Совпадает (локальная проверка)?</strong> {isMatchLocal ? '✅ ДА' : '❌ НЕТ'}</p>
              <p><strong>Совпадает (функция isAdminEmail)?</strong> {isMatchFunction ? '✅ ДА' : '❌ НЕТ'}</p>
              
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <p className="text-xs mb-2">Посимвольное сравнение:</p>
                {userEmail.split('').map((char, idx) => (
                  <span key={idx} className="inline-block px-1 py-0.5 bg-white border text-xs mr-1 mb-1">
                    {char === ' ' ? '␣' : char}
                  </span>
                ))}
              </div>
              
              {!isMatchLocal && userEmail && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-xs">
                    ⚠️ Email не совпадает! Проверьте:
                  </p>
                  <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside">
                    <li>Нет ли лишних пробелов</li>
                    <li>Правильный ли email в конфигурации</li>
                    <li>Совпадает ли регистр букв</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Результат API */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🌐 Результат API /api/admin/check-access</h2>
            {checkResult ? (
              <div className="space-y-2 font-mono text-sm">
                <p><strong>isAdmin:</strong> {checkResult.isAdmin ? '✅ true' : '❌ false'}</p>
                <p><strong>hasAccess:</strong> {checkResult.hasAccess ? '✅ true' : '❌ false'}</p>
                <p><strong>needsVerification:</strong> {checkResult.needsVerification ? '⚠️ true' : 'false'}</p>
                
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Полный ответ:</p>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(checkResult, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Загрузка...</p>
            )}
          </div>

          {/* Кнопка повторной проверки */}
          <button
            onClick={testAdminCheck}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            🔄 Повторить проверку API
          </button>
        </div>
      </div>
    </div>
  );
}
