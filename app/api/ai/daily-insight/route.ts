/**
 * API: AI инсайт дня для дашборда
 * POST /api/ai/daily-insight
 */

import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.8-27b';

interface InsightRequest {
  totalBalance: number;
  monthExpense: number;
  expenseChange: number;
  pendingRequests: number;
  pendingAmount: number;
  topCategory?: string;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InsightRequest = await request.json();
    const {
      totalBalance,
      monthExpense,
      expenseChange,
      pendingRequests,
      pendingAmount,
      topCategory,
      currency
    } = body;

    // Системный промпт для инсайта
    const systemPrompt = `Ты — AI-помощник в семейном финансовом приложении FamilyPay.

ЗАДАЧА: Создай ОДИН короткий инсайт дня на основе данных семьи.

ПРАВИЛА:
- Отвечай ОЧЕНЬ коротко: 1 предложение, максимум 2.
- Используй emoji в начале (📊 💡 🎯 ⚠️ ✅ 💰).
- Будь позитивным и мотивирующим.
- Не используй слова "банк", "инвестиции", "кредит".
- Говори простым языком.
- Отвечай ТОЛЬКО текстом инсайта, без "вот инсайт:" и т.п.`;

    const userMessage = `Данные семьи:
- Баланс: ${totalBalance} ${currency}
- Расходы за месяц: ${monthExpense} ${currency}
- Изменение расходов: ${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}%
- Ожидающих запросов: ${pendingRequests} на сумму ${pendingAmount} ${currency}
${topCategory ? `- Топ категория: ${topCategory}` : ''}

Создай ОДИН короткий инсайт дня (1-2 предложения с emoji).`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    try {
      const apiKey = process.env.GROQ_API_KEY;
      
      if (!apiKey) {
        throw new Error('GROQ_API_KEY not configured');
      }

      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!groqResponse.ok) {
        throw new Error(`Groq API error: ${groqResponse.status}`);
      }

      const data = await groqResponse.json();
      const insight = data.choices?.[0]?.message?.content?.trim();

      if (insight) {
        return NextResponse.json({
          success: true,
          insight: insight
        });
      }

      throw new Error('No response from AI');

    } catch (groqError) {
      console.error('❌ Groq error:', groqError);
      
      // Fallback инсайты
      let insight = '';
      
      if (pendingRequests > 0) {
        insight = `⚠️ ${pendingRequests} ${pendingRequests === 1 ? 'запрос ожидает' : 'запроса ожидают'} вашего одобрения. Общая сумма: ${pendingAmount.toLocaleString()} ${currency}.`;
      } else if (expenseChange < -5) {
        insight = `✅ Отличный результат! Расходы снизились на ${Math.abs(expenseChange).toFixed(1)}% по сравнению с прошлым месяцем.`;
      } else if (expenseChange > 10) {
        insight = `💡 Расходы выросли на ${expenseChange.toFixed(1)}% в этом месяце. Проверьте категории трат.`;
      } else if (totalBalance > 0) {
        insight = `💰 Баланс семьи: ${totalBalance.toLocaleString()} ${currency}. Продолжайте контролировать расходы!`;
      } else {
        insight = `📊 Следите за бюджетом и планируйте крупные траты заранее.`;
      }

      return NextResponse.json({
        success: true,
        insight: insight,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error in daily-insight:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
