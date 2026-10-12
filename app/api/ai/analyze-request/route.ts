/**
 * API: AI анализ запроса на деньги для родителя
 * POST /api/ai/analyze-request
 */

import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'mistral:latest';

interface AnalyzeRequest {
  title: string;
  amount: number;
  currency: string;
  description?: string;
  familyBalance: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { title, amount, currency, description, familyBalance } = body;

    // Системный промпт для AI
    const systemPrompt = `Ты — финансовый советник для родителей в приложении FamilyPay.

ЗАДАЧА: Дай короткую рекомендацию родителю по запросу ребёнка на деньги.

ПРАВИЛА:
- Отвечай ОЧЕНЬ коротко: 1-2 предложения.
- Оцени процент от баланса.
- Не упоминай банки, инвестиции, документы.
- Формат: "Запрашиваемая сумма составляет X% от баланса. [Рекомендация]."
- Рекомендация: "Рекомендуем одобрять" / "Можно одобрить частично" / "Лучше отложить"
- Будь конкретным и практичным.`;

    const userMessage = `Ребёнок просит: "${title}"${description ? ` (${description})` : ''}
Сумма: ${amount} ${currency}
Баланс семьи: ${familyBalance} ${currency}

Дай короткую рекомендацию родителю (1-2 предложения).`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

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

      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.status}`);
      }

      const data = await ollamaResponse.json();
      const aiRecommendation = data.message?.content?.trim();

      if (aiRecommendation) {
        return NextResponse.json({
          success: true,
          recommendation: aiRecommendation
        });
      }

      throw new Error('No response from AI');

    } catch (ollamaError) {
      console.error('❌ Ollama error:', ollamaError);
      
      // Fallback расчёт
      const percentage = ((amount / familyBalance) * 100).toFixed(1);
      let recommendation = '';
      
      if (parseFloat(percentage) > 20) {
        recommendation = `Запрашиваемая сумма составляет ${percentage}% от баланса. Это довольно много — лучше одобрить частично или отложить.`;
      } else if (parseFloat(percentage) > 10) {
        recommendation = `Запрашиваемая сумма составляет ${percentage}% от баланса. Можно одобрить частично.`;
      } else {
        recommendation = `Запрашиваемая сумма составляет ${percentage}% от баланса. Рекомендуем одобрить.`;
      }

      return NextResponse.json({
        success: true,
        recommendation: recommendation,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error in analyze-request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
