/**
 * API: AI анализ запроса на деньги для родителя
 * POST /api/ai/analyze-request
 * 
 * ВАЖНО: Вся математика рассчитывается на TypeScript ДО вызова Ollama
 */

import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'mistral:latest';

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
    const systemPrompt = `Ты — финансовый советник для родителей в приложении FamilyPay.

ЗАДАЧА: Дай короткую рекомендацию родителю по запросу ребёнка на деньги.

⛔ СТРОГИЕ ПРАВИЛА:
- Используй ТОЛЬКО переданные точные математические данные (exactPercent%, remainingBalance).
- НЕ вычисляй проценты заново. НЕ пересчитывай остаток.
- Отвечай ОЧЕНЬ коротко: 1-2 предложения.
- НЕ упоминай банки, инвестиции, документы.
- Рекомендация: "Рекомендуем одобрить" / "Можно одобрить частично" / "Лучше отложить"
- Будь конкретным и практичным.`;

    const userMessage = `Ребёнок просит: "${title}"${description ? ` (${description})` : ''}
Запрошенная сумма: ${amount} ${currency}
Счет: ${accountName}
Баланс счета: ${accountBalance} ${currency}
Точный процент от баланса: ${exactPercent}%
Остаток после покупки: ${remainingBalance} ${currency}

Дай короткую рекомендацию родителю (1-2 предложения), используя ТОЛЬКО эти данные.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    let aiRecommendation = '';

    try {
      const ollamaResponse = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.5,
            num_predict: 150,
          }
        }),
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        aiRecommendation = data.message?.content?.trim() || '';
      }
    } catch (ollamaError) {
      console.error('❌ Ollama error:', ollamaError);
    }

    // Fallback если Ollama не ответила
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
