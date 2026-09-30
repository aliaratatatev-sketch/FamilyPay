/**
 * Ollama AI Integration (Локальный AI)
 * Работает без API ключей, полностью на вашем компьютере
 */

export interface ExpenseAnalysisRequest {
  amount: number;
  category: string;
  comment?: string;
  currentBudget: {
    category: string;
    spent: number;
    limit: number;
    remaining: number;
  } | null;
  recentExpenses: Array<{
    amount: number;
    category: string;
    date: string;
  }>;
  monthlyIncome: number;
  totalSavings: number;
  goals?: Array<{
    name: string;
    current: number;
    target: number;
  }>;
}

export interface AIRecommendation {
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

/**
 * Анализ запроса на расход с помощью Ollama Mistral
 */
export async function analyzeExpenseRequest(
  request: ExpenseAnalysisRequest
): Promise<AIRecommendation> {
  console.log('🤖 Ollama: Starting analysis...');

  try {
    const prompt = buildAnalysisPrompt(request);
    
    console.log('🚀 Calling Ollama Mistral...');
    
    // Вызов Ollama через HTTP API (localhost:11434)
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.response;

    console.log('✅ Got response from Ollama');
    return parseAIResponse(text);
    
  } catch (error) {
    console.error('❌ Ошибка Ollama:', error);
    return getFallbackRecommendation(request);
  }
}

/**
 * Построение промпта для Mistral
 */
function buildAnalysisPrompt(request: ExpenseAnalysisRequest): string {
  const {
    amount,
    category,
    comment,
    currentBudget,
    recentExpenses,
    monthlyIncome,
    totalSavings,
    goals
  } = request;

  let prompt = `Ты — AI-помощник для семейных финансов FamilyPay. Проанализируй запрос на расход и дай рекомендацию.

ВАЖНО:
- Отвечай ТОЛЬКО на русском языке
- Будь тактичным, но честным
- Используй только предоставленные данные
- Твоя рекомендация — это совет, решение принимает человек

ЗАПРОС:
Сумма: ${amount} сом
Категория: ${category}
${comment ? `Комментарий: "${comment}"` : ''}

КОНТЕКСТ:
Месячный доход: ${monthlyIncome} сом
Сбережения: ${totalSavings} сом
`;

  if (currentBudget) {
    prompt += `
Бюджет "${currentBudget.category}":
- Лимит: ${currentBudget.limit} сом/месяц
- Потрачено: ${currentBudget.spent} сом
- Осталось: ${currentBudget.remaining} сом
`;
  }

  if (recentExpenses.length > 0) {
    prompt += `\nПоследние расходы в "${category}":\n`;
    recentExpenses.slice(0, 5).forEach((e, i) => {
      prompt += `${i + 1}. ${e.amount} сом (${new Date(e.date).toLocaleDateString('ru-RU')})\n`;
    });
  }

  if (goals && goals.length > 0) {
    prompt += '\nФинансовые цели:\n';
    goals.forEach((goal, i) => {
      const progress = Math.round((goal.current / goal.target) * 100);
      prompt += `${i + 1}. ${goal.name}: ${goal.current}/${goal.target} сом (${progress}%)\n`;
    });
  }

  prompt += `

ФОРМАТ ОТВЕТА (строго JSON):
{
  "decision": "approve" | "reject" | "defer" | "consider",
  "confidence": 0-100,
  "reasoning": "Краткое объяснение (1-2 предложения)",
  "warnings": ["Предупреждение 1", "Предупреждение 2"],
  "suggestions": ["Совет 1", "Совет 2"],
  "impact": {
    "onBudget": "Влияние на бюджет",
    "onGoals": "Влияние на цели",
    "onSavings": "Влияние на сбережения"
  }
}

ЗНАЧЕНИЯ decision:
- "approve": можно одобрить
- "consider": одобрить с оговорками
- "defer": лучше отложить
- "reject": рекомендуется отклонить

Ответь ТОЛЬКО JSON без дополнительного текста:`;

  return prompt;
}

/**
 * Парсинг ответа от Mistral
 */
function parseAIResponse(text: string): AIRecommendation {
  try {
    // Извлекаем JSON из ответа
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON не найден в ответе');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      decision: parsed.decision || 'consider',
      confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
      reasoning: parsed.reasoning || 'AI не смог проанализировать запрос',
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      impact: {
        onBudget: parsed.impact?.onBudget || 'Неизвестно',
        onGoals: parsed.impact?.onGoals || 'Неизвестно',
        onSavings: parsed.impact?.onSavings || 'Неизвестно'
      }
    };
  } catch (error) {
    console.error('Ошибка парсинга ответа:', error);
    throw error;
  }
}

/**
 * Fallback если Ollama недоступен
 */
function getFallbackRecommendation(
  request: ExpenseAnalysisRequest
): AIRecommendation {
  const { amount, currentBudget, monthlyIncome, totalSavings } = request;

  let decision: AIRecommendation['decision'] = 'consider';
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (currentBudget) {
    const willExceed = amount > currentBudget.remaining;
    if (willExceed) {
      decision = 'defer';
      warnings.push(`Превышение бюджета на ${Math.abs(currentBudget.remaining - amount)} сом`);
    }
  }

  const percentOfIncome = (amount / monthlyIncome) * 100;
  if (percentOfIncome > 10) {
    warnings.push(`Это ${percentOfIncome.toFixed(1)}% от месячного дохода`);
  }

  if (warnings.length === 0) {
    decision = 'approve';
    suggestions.push('Расход вписывается в бюджет');
  }

  return {
    decision,
    confidence: 60,
    reasoning: 'Ollama временно недоступен. Используется базовая проверка.',
    warnings,
    suggestions,
    impact: {
      onBudget: currentBudget
        ? `Останется ${currentBudget.remaining - amount} сом`
        : 'Бюджет не настроен',
      onGoals: 'Данные недоступны',
      onSavings: `${totalSavings} сом без изменений`
    }
  };
}
