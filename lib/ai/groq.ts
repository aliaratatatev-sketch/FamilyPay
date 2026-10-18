/**
 * Groq AI Integration
 * Fast AI inference using Groq Cloud API
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

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.8-27b'; // Qwen 2.5 - мощная модель с поддержкой русского языка

/**
 * Анализ запроса на расход с помощью Groq AI
 */
export async function analyzeExpenseRequest(
  request: ExpenseAnalysisRequest
): Promise<AIRecommendation> {
  console.log('🤖 Groq: Starting analysis...');

  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ GROQ_API_KEY not found, using fallback');
      return getFallbackRecommendation(request);
    }

    const messages = buildChatMessages(request);
    
    console.log('🚀 Calling Groq API...');
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('No response from Groq');
    }

    console.log('✅ Got response from Groq');
    return parseAIResponse(text);
    
  } catch (error) {
    console.error('❌ Ошибка Groq:', error);
    return getFallbackRecommendation(request);
  }
}

/**
 * Построение сообщений для Groq Chat API
 */
function buildChatMessages(request: ExpenseAnalysisRequest) {
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

  let userContent = `Проанализируй запрос на расход:

ЗАПРОС:
Сумма: ${amount} сом
Категория: ${category}
${comment ? `Комментарий: "${comment}"` : ''}

КОНТЕКСТ:
Месячный доход: ${monthlyIncome} сом
Сбережения: ${totalSavings} сом
`;

  if (currentBudget) {
    userContent += `
Бюджет "${currentBudget.category}":
- Лимит: ${currentBudget.limit} сом/месяц
- Потрачено: ${currentBudget.spent} сом
- Осталось: ${currentBudget.remaining} сом
`;
  }

  if (recentExpenses.length > 0) {
    userContent += `\nПоследние расходы в "${category}":\n`;
    recentExpenses.slice(0, 5).forEach((e, i) => {
      userContent += `${i + 1}. ${e.amount} сом (${new Date(e.date).toLocaleDateString('ru-RU')})\n`;
    });
  }

  if (goals && goals.length > 0) {
    userContent += '\nФинансовые цели:\n';
    goals.forEach((goal, i) => {
      const progress = Math.round((goal.current / goal.target) * 100);
      userContent += `${i + 1}. ${goal.name}: ${goal.current}/${goal.target} сом (${progress}%)\n`;
    });
  }

  return [
    {
      role: 'system',
      content: `Ты — AI-помощник для семейных финансов FamilyPay. Проанализируй запрос на расход и дай рекомендацию.

ВАЖНО:
- Отвечай ТОЛЬКО на русском языке
- Будь тактичным, но честным
- Используй только предоставленные данные
- Твоя рекомендация — это совет, решение принимает человек

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

Ответь ТОЛЬКО валидным JSON без дополнительного текста.`
    },
    {
      role: 'user',
      content: userContent
    }
  ];
}

/**
 * Парсинг ответа от Groq
 */
function parseAIResponse(text: string): AIRecommendation {
  try {
    const parsed = JSON.parse(text);

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
 * Fallback если Groq недоступен
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
    reasoning: 'AI временно недоступен. Используется базовая проверка.',
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
