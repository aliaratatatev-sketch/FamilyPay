'use client';

/**
 * Компонент отображения AI-рекомендации
 */

import { useState, useEffect } from 'react';

interface AIRecommendation {
  decision: 'approve' | 'reject' | 'defer' | 'consider';
  confidence: number;
  reasoning: string;
  warnings: string[];
  suggestions: string[];
  impact: {
    onBudget: string;
    onGoals: string;
    onSavings: string;
  };
}

interface Props {
  amount: number;
  category: string;
  comment?: string;
  familyId: string;
  autoAnalyze?: boolean;
}

export default function AIRecommendationCard({
  amount,
  category,
  comment,
  familyId,
  autoAnalyze = false
}: Props) {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Автоматический анализ при изменении данных
  useEffect(() => {
    if (autoAnalyze && amount > 0 && category) {
      analyzeExpense();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, category, familyId, autoAnalyze]);

  const analyzeExpense = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category, comment, familyId })
      });

      if (!response.ok) {
        throw new Error('Ошибка анализа');
      }

      const data = await response.json();
      setRecommendation(data.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка AI');
    } finally {
      setLoading(false);
    }
  };

  if (!recommendation && !loading && !error && !autoAnalyze) {
    return (
      <button
        onClick={analyzeExpense}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <span className="text-xl">🤖</span>
        <span className="font-medium">Получить AI-рекомендацию</span>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin text-2xl">🤖</div>
          <div>
            <p className="text-gray-600 font-medium">AI анализирует запрос...</p>
            <p className="text-sm text-gray-500">Учитываю бюджет, историю и цели</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-red-800 font-medium">Ошибка AI-анализа</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={analyzeExpense}
              className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation) return null;

  const decisionStyles = {
    approve: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      icon: '✅',
      title: 'Рекомендуется одобрить',
      titleColor: 'text-green-800'
    },
    consider: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      icon: '💡',
      title: 'Можно одобрить',
      titleColor: 'text-blue-800'
    },
    defer: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      icon: '⏰',
      title: 'Лучше отложить',
      titleColor: 'text-yellow-800'
    },
    reject: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      icon: '❌',
      title: 'Рекомендуется отклонить',
      titleColor: 'text-red-800'
    }
  };

  const style = decisionStyles[recommendation.decision];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-5 space-y-4`}>
      {/* Заголовок */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{style.icon}</span>
          <div>
            <h3 className={`font-bold text-lg ${style.titleColor}`}>
              {style.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600">Уверенность AI:</span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${recommendation.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {recommendation.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Обоснование */}
      <div className="bg-white bg-opacity-60 rounded-lg p-3">
        <p className="text-gray-800 leading-relaxed">{recommendation.reasoning}</p>
      </div>

      {/* Предупреждения */}
      {recommendation.warnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase">⚠️ Предупреждения</p>
          <ul className="space-y-1">
            {recommendation.warnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Рекомендации */}
      {recommendation.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase">💡 Советы</p>
          <ul className="space-y-1">
            {recommendation.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Влияние */}
      <div className="border-t border-gray-300 border-opacity-30 pt-3">
        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">📊 Влияние</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white bg-opacity-60 rounded p-2">
            <p className="text-xs text-gray-600 mb-1">На бюджет</p>
            <p className="text-sm font-medium text-gray-800">{recommendation.impact.onBudget}</p>
          </div>
          <div className="bg-white bg-opacity-60 rounded p-2">
            <p className="text-xs text-gray-600 mb-1">На цели</p>
            <p className="text-sm font-medium text-gray-800">{recommendation.impact.onGoals}</p>
          </div>
          <div className="bg-white bg-opacity-60 rounded p-2">
            <p className="text-xs text-gray-600 mb-1">На сбережения</p>
            <p className="text-sm font-medium text-gray-800">{recommendation.impact.onSavings}</p>
          </div>
        </div>
      </div>

      {/* Дисклеймер */}
      <div className="flex items-start gap-2 pt-2 border-t border-gray-300 border-opacity-30">
        <span className="text-xs text-gray-500 leading-relaxed">
          ℹ️ Это рекомендация AI-помощника на основе ваших данных. Финальное решение всегда за вами.
        </span>
      </div>

      {/* Кнопка повторного анализа */}
      {!autoAnalyze && (
        <button
          onClick={analyzeExpense}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          🔄 Пересчитать
        </button>
      )}
    </div>
  );
}
