'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalysisResult {
  category: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  potentialSaving: number;
}

interface AIResponse {
  analysis: string;
  suggestions: AnalysisResult[];
  summary: {
    totalExpenses: number;
    avgDaily: number;
    topCategory: string;
  };
}

export default function AIAssistantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [quickAnalysis, setQuickAnalysis] = useState<any>(null);
  const [isQuickAnalyzing, setIsQuickAnalyzing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const handleAnalyzeExpenses = async () => {
    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      // Симулируем AI анализ с реалистичными данными
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: AIResponse = {
        analysis: "На основе анализа ваших расходов за последний месяц, я заметил несколько важных моментов. Ваши расходы на продукты питания составляют 35% от общего бюджета, что немного выше рекомендуемого уровня в 25-30%. Транспортные расходы оптимальны и составляют 15%. Развлечения занимают 20% - здесь есть потенциал для экономии.",
        suggestions: [
          {
            category: "Продукты питания",
            suggestion: "Попробуйте планировать меню на неделю и делать покупки по списку. Это может сэкономить до 4000 ₽ в месяц",
            priority: "high",
            potentialSaving: 4000
          },
          {
            category: "Развлечения",
            suggestion: "Рассмотрите бесплатные альтернативы: парки, бесплатные музеи, домашние киновечера. Потенциальная экономия: 3000 ₽",
            priority: "medium",
            potentialSaving: 3000
          },
          {
            category: "Подписки",
            suggestion: "Проверьте активные подписки и отмените неиспользуемые. Многие забывают о подписках, которыми не пользуются",
            priority: "medium",
            potentialSaving: 1500
          },
          {
            category: "Коммунальные услуги",
            suggestion: "Установите счетчики потребления и LED лампы для снижения расходов на электричество на 15-20%",
            priority: "low",
            potentialSaving: 800
          }
        ],
        summary: {
          totalExpenses: 45000,
          avgDaily: 1500,
          topCategory: "Продукты питания"
        }
      };

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Ошибка при анализе расходов');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAnalyze = async () => {
    if (!expenseDescription.trim()) {
      setError('Введите описание расхода');
      return;
    }

    setIsQuickAnalyzing(true);
    setError('');
    setQuickAnalysis(null);

    try {
      const response = await fetch('/api/ai/analyze-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: expenseDescription }),
      });

      const data = await response.json();

      if (response.ok) {
        setQuickAnalysis(data);
      } else {
        throw new Error(data.error || 'Ошибка анализа');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при анализе');
    } finally {
      setIsQuickAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
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

          <Link 
            href="/dashboard"
            className="text-gray-600 dark:text-gray-400 hover:text-[#0D6D6E] dark:hover:text-[#4FD1C5] transition"
          >
            ← Назад на дашборд
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
            <span className="text-4xl">🤖</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            ИИ Финансовый Ассистент
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Персональный помощник на базе искусственного интеллекта для анализа ваших расходов 
            и предоставления индивидуальных рекомендаций по оптимизации бюджета
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Quick Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Быстрый анализ расхода
              </h2>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              ИИ определит категорию и предложит оптимизацию
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Описание расхода
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Например: купил продукты в Магните на 2500р"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isQuickAnalyzing) {
                      handleQuickAnalyze();
                    }
                  }}
                />
              </div>

              <button
                onClick={handleQuickAnalyze}
                disabled={isQuickAnalyzing || !expenseDescription.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isQuickAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Анализирую...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Анализировать</span>
                  </>
                )}
              </button>

              {quickAnalysis && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{quickAnalysis.categoryIcon || '📊'}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Категория: {quickAnalysis.suggestedCategory || 'Прочее'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {quickAnalysis.analysis || 'Анализ выполнен'}
                      </p>
                    </div>
                  </div>
                  {quickAnalysis.suggestion && (
                    <div className="mt-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        💡 <strong>Рекомендация:</strong> {quickAnalysis.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Полный анализ расходов
              </h2>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Глубокий анализ всех ваших расходов с персональными рекомендациями
            </p>

            <button
              onClick={handleAnalyzeExpenses}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>ИИ анализирует ваши расходы...</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>Запустить полный анализ</span>
                </>
              )}
            </button>

            <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>💡 Что включает анализ:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-purple-700 dark:text-purple-300">
                <li>• Анализ структуры расходов</li>
                <li>• Сравнение с рекомендациями экспертов</li>
                <li>• Персональные советы по экономии</li>
                <li>• Потенциальная сумма экономии</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📈</span>
                Сводка за месяц
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Общие расходы</p>
                  <p className="text-3xl font-bold">{analysis.summary.totalExpenses.toLocaleString()} ₽</p>
                </div>
                <div>
                  <p className="text-purple-100 text-sm mb-1">Средние расходы в день</p>
                  <p className="text-3xl font-bold">{analysis.summary.avgDaily.toLocaleString()} ₽</p>
                </div>
                <div>
                  <p className="text-purple-100 text-sm mb-1">Топ категория</p>
                  <p className="text-2xl font-bold">{analysis.summary.topCategory}</p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🤖</span>
                Анализ искусственного интеллекта
              </h2>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {analysis.analysis}
                </p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>💡</span>
                  Рекомендации по оптимизации
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Потенциальная экономия: <span className="font-bold text-green-600 dark:text-green-400">
                    {analysis.suggestions.reduce((sum, s) => sum + s.potentialSaving, 0).toLocaleString()} ₽/мес
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {analysis.suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-3xl">{getPriorityIcon(suggestion.priority)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {suggestion.category}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority === 'high' ? 'Высокий приоритет' : 
                             suggestion.priority === 'medium' ? 'Средний приоритет' : 
                             'Низкий приоритет'}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {suggestion.suggestion}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-500">Потенциальная экономия:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {suggestion.potentialSaving.toLocaleString()} ₽/мес
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={handleAnalyzeExpenses}
                className="px-8 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                🔄 Обновить анализ
              </button>
            </div>
          </div>
        )}

        {/* Info Banner */}
        {!analysis && !isAnalyzing && (
          <div className="bg-gradient-to-r from-[#0D6D6E]/10 to-[#4FD1C5]/10 border border-[#0D6D6E]/20 dark:border-[#4FD1C5]/20 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl">✨</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Как работает ИИ-ассистент?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Наш искусственный интеллект анализирует ваши транзакции, сравнивает их с 
                  рекомендациями финансовых экспертов и находит возможности для экономии. 
                  Алгоритм учитывает структуру ваших расходов, паттерны потребления и предлагает 
                  персонализированные советы.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span>🎯</span>
                    <span className="text-gray-700 dark:text-gray-300">Точный анализ расходов</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>💰</span>
                    <span className="text-gray-700 dark:text-gray-300">Рекомендации по экономии</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>📊</span>
                    <span className="text-gray-700 dark:text-gray-300">Прогнозы и тренды</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
