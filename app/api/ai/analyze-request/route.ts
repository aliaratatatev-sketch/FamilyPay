/**
 * API: AI анализ запроса на деньги для родителя
 * POST /api/ai/analyze-request
 * 
 * ВАЖНО: Вся математика рассчитывается на TypeScript ДО вызова Ollama
 */

import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.8-27b';

interface AnalyzeRequest {
  requestId: string;
  title: string;
  amount: number;
  currency: string;
  description?: string | null;
  accountId: string;
  accountBalance: number;
  accountName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { 
      requestId, 
      title, 
      amount, 
      currency, 
      description, 
      accountId, 
      accountBalance, 
      accountName 
    } = body;

    // ✅ ВСЯ МАТЕМАТИКА СТРОГО НА TYPESCRIPT
    const exactPercent = Math.round((amount / accountBalance) * 100);
    const remainingBalance = accountBalance - amount;

    // Системный промпт для AI с ЗАПРЕТОМ на самостоятельные вычисления
    const systemPrompt = `Ты — строгий и разумный финансовый консультант для родителей по воспитанию финансовой грамотности у подростков.

ЗАДАЧА: Оцени адекватность запроса подростка на деньги и дай рекомендацию родителю.

⛔ АБСОЛЮТНЫЙ ЗАПРЕТ НА МАТЕМАТИКУ:
- НИКОГДА не упоминай цифры, суммы, проценты или остатки в своём ответе.
- НЕ вычисляй и НЕ пиши баланс, остаток или процент от счета.
- Ответ должен содержать ТОЛЬКО логическую оценку запроса.

СТРОГАЯ ОЦЕНКА ПО КАТЕГОРИЯМ:
- Еда, учеба, здоровье, транспорт → ОДОБРИТЬ (это базовые потребности)
- Развлечения, свидания, хотелки, дорогие покупки → ОТКЛОНИТЬ и рекомендовать копить самому из карманных денег
- Одежда, спорт → оценивать по обоснованности и разумности суммы

ФОРМАТ ОТВЕТА: 1-2 предложения с конкретной рекомендацией и краткой мотивацией.`;

    const userMessage = `Название запроса: "${title}"
${description ? `Описание: ${description}` : 'Описание отсутствует'}

Оцени адекватность этого запроса. Дай короткую рекомендацию (1-2 предложения): одобрить, отклонить или одобрить частично. Объясни почему, НЕ упоминая цифры.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    let aiRecommendation = '';

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
          temperature: 0.5,
          max_tokens: 200,
        }),
      });

      if (groqResponse.ok) {
        const data = await groqResponse.json();
        aiRecommendation = data.choices?.[0]?.message?.content?.trim() || '';
      }
    } catch (groqError) {
      console.error('❌ Groq error:', groqError);
    }

    // Fallback если AI не ответил
    if (!aiRecommendation) {
      if (exactPercent > 50) {
        aiRecommendation = `Запрашиваемая сумма составляет ${exactPercent}% от баланса счета. Это очень много — лучше отложить или одобрить частично.`;
      } else if (exactPercent > 20) {
        aiRecommendation = `Запрашиваемая сумма составляет ${exactPercent}% от баланса. Можно одобрить частично, оставив резерв.`;
      } else {
        aiRecommendation = `Запрашиваемая сумма составляет ${exactPercent}% от баланса. Рекомендуем одобрить.`;
      }
    }

    // Возвращаем полный анализ с готовыми расчётами
    return NextResponse.json({
      success: true,
      analysis: {
        recommendation: aiRecommendation,
        exactPercent: exactPercent,
        remainingBalance: remainingBalance,
        requestAmount: amount,
        accountBalance: accountBalance,
        accountName: accountName,
      }
    });

  } catch (error) {
    console.error('Error in analyze-request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
