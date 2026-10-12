/**
 * API: AI оценка запроса на деньги для ребенка
 * POST /api/ai/evaluate-request
 */

import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'mistral:latest';

interface EvaluateRequest {
  title: string;
  amount: number;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluateRequest = await request.json();
    const { title, amount, description } = body;

    if (!title || !amount) {
      return NextResponse.json(
        { error: 'Title and amount are required' },
        { status: 400 }
      );
    }

    // Системный промпт для оценки
    const systemPrompt = `Ты — AI-помощник в семейном приложении FamilyPay.

ЗАДАЧА: Оцени запрос ребёнка на деньги.

ФОРМАТ ОТВЕТА (строго JSON):
{
  "category": "Название категории (Развлечения/Еда/Одежда/Учёба/Транспорт/Игры/Другое)",
  "approvalChance": "Высокий/Средний/Низкий",
  "reason": "Краткая причина оценки (1 предложение)"
}

ПРАВИЛА:
- Определи категорию трат по описанию.
- Оцени шанс одобрения родителем (Высокий если полезно/необходимо, Средний если допустимо, Низкий если развлечение/роскошь).
- Причина должна быть понятной ребёнку.
- Отвечай ТОЛЬКО JSON без дополнительного текста.`;

    const userMessage = `Ребёнок просит деньги:
Название: "${title}"${description ? `\nОписание: "${description}"` : ''}
Сумма: ${amount} сом

Оцени этот запрос.`;

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
            temperature: 0.3,
            num_predict: 150,
          }
        }),
      });

      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.status}`);
      }

      const data = await ollamaResponse.json();
      const aiReply = data.message?.content?.trim();

      if (aiReply) {
        // Парсим JSON из ответа
        const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const evaluation = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            category: evaluation.category || 'Другое',
            approvalChance: evaluation.approvalChance || 'Средний',
            reason: evaluation.reason || 'Зависит от решения родителя'
          });
        }
      }

      throw new Error('Invalid AI response');

    } catch (ollamaError) {
      console.error('❌ Ollama error:', ollamaError);
      
      // Fallback определение категории
      const lowerTitle = title.toLowerCase();
      const lowerDesc = (description || '').toLowerCase();
      const combined = `${lowerTitle} ${lowerDesc}`;
      
      let category = 'Другое';
      let approvalChance = 'Средний';
      let reason = 'Зависит от решения родителя';
      
      if (combined.match(/игр|донат|скин|геймс|game|play/i)) {
        category = 'Игры';
        approvalChance = amount > 1000 ? 'Низкий' : 'Средний';
        reason = amount > 1000 
          ? 'Большая сумма на игры — родители могут не одобрить'
          : 'Небольшая сумма, есть шанс на одобрение';
      } else if (combined.match(/кино|театр|концерт|развлечен|парк|аттракцион/i)) {
        category = 'Развлечения';
        approvalChance = amount > 2000 ? 'Средний' : 'Высокий';
        reason = 'Досуг важен для отдыха';
      } else if (combined.match(/еда|кафе|ресторан|бургер|пицц|еды/i)) {
        category = 'Еда';
        approvalChance = 'Высокий';
        reason = 'Еда — базовая потребность';
      } else if (combined.match(/одежд|обувь|кроссовк|куртк|джинс/i)) {
        category = 'Одежда';
        approvalChance = amount > 5000 ? 'Средний' : 'Высокий';
        reason = amount > 5000 ? 'Дорогая покупка требует обсуждения' : 'Необходимые вещи обычно одобряют';
      } else if (combined.match(/книг|тетрад|учебн|школ|курс|репетитор/i)) {
        category = 'Учёба';
        approvalChance = 'Высокий';
        reason = 'Образование — приоритет для родителей';
      } else if (combined.match(/транспорт|проезд|такси|метро|автобус/i)) {
        category = 'Транспорт';
        approvalChance = 'Высокий';
        reason = 'Транспорт — необходимость';
      }

      return NextResponse.json({
        success: true,
        category,
        approvalChance,
        reason,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error in evaluate-request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
