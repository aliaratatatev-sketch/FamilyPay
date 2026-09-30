'use client';

/**
 * Демо-страница для тестирования AI-помощника
 * Доступна по адресу: /demo-ai
 */

import { useState } from 'react';
import AIRecommendationCard from '@/components/ai/AIRecommendationCard';

export default function DemoAIPage() {
  const [amount, setAmount] = useState(500);
  const [category, setCategory] = useState('Развлечения');
  const [comment, setComment] = useState('На кино с друзьями');
  const [familyId] = useState('demo-family-id'); // В реальном приложении из сессии

  const categories = [
    '🛒 Продукты',
    '🎮 Развлечения',
    '🚗 Транспорт',
    '🏠 Жилье',
    '💊 Здоровье',
    '👕 Одежда',
    '📚 Образование',
    '🍽️ Рестораны'
  ];

  const presets = [
    { amount: 500, category: '🎮 Развлечения', comment: 'На кино с друзьями' },
    { amount: 15000, category: '🛒 Продукты', comment: 'Закупка на неделю' },
    { amount: 50000, category: '👕 Одежда', comment: 'Зимняя куртка' },
    { amount: 2000, category: '🍽️ Рестораны', comment: 'Семейный ужин' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            🤖 AI-помощник FamilyPay
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Умный анализ финансовых запросов с помощью Ollama Mistral (локальный AI)
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Бесплатно навсегда • Работает локально
          </div>
        </div>

        {/* Быстрые пресеты */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚡ Быстрые примеры
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  setAmount(preset.amount);
                  setCategory(preset.category);
                  setComment(preset.comment);
                }}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#4FD1C5] dark:hover:border-[#4FD1C5] transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{preset.category.split(' ')[0]}</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {preset.amount.toLocaleString()} сом
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {preset.comment}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Форма запроса */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            💰 Создать запрос на расход
          </h2>

          {/* Сумма */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Сумма
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#4FD1C5] focus:border-transparent dark:bg-gray-900 dark:text-white"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500 dark:text-gray-400">
                сом
              </span>
            </div>
            {/* Быстрые суммы */}
            <div className="flex gap-2 flex-wrap">
              {[500, 1000, 5000, 10000, 25000].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-[#4FD1C5] hover:text-white dark:hover:bg-[#4FD1C5] rounded-lg transition-colors"
                >
                  {value.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Категория */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Категория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#4FD1C5] focus:border-transparent dark:bg-gray-900 dark:text-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Комментарий */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Комментарий
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#4FD1C5] focus:border-transparent dark:bg-gray-900 dark:text-white"
              placeholder="Для чего нужны деньги?"
            />
          </div>
        </div>

        {/* AI Рекомендация */}
        <AIRecommendationCard
          amount={amount}
          category={category}
          comment={comment}
          familyId={familyId}
          autoAnalyze={false}
        />

        {/* Информация */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            ℹ️ Как работает AI-анализ
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Работает полностью локально на вашем компьютере (Ollama Mistral 7B)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Анализирует текущий бюджет категории и остаток средств</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Учитывает последние расходы в этой категории за 30 дней</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Сравнивает с месячным доходом семьи</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Проверяет влияние на финансовые цели и сбережения</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Выдает объективную рекомендацию с обоснованием</span>
            </li>
          </ul>
        </div>

        {/* Футер */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>
            Powered by <strong>Ollama Mistral 7B</strong> (локальный AI)
          </p>
          <p>
            Это демо-страница. В реальном приложении AI интегрирован в модерацию запросов.
          </p>
        </div>
      </div>
    </div>
  );
}
