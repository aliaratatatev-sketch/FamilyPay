/**
 * API: AI Chat с интеграцией Ollama Mistral
 * POST /api/ai/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'mistral:latest';

interface ChatRequest {
  message: string;
  userRole: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, userRole, conversationHistory = [] } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 AI Chat request:', { 
      userRole, 
      messageLength: message.length,
      historyLength: conversationHistory.length 
    });

    // Построение сообщений с системным промптом и историей
    const messages = buildChatMessages(message, userRole, conversationHistory);

    console.log('📤 Sending to Ollama:', {
      model: OLLAMA_MODEL,
      messagesCount: messages.length,
      systemPromptLength: messages[0]?.content?.length,
      hasSystemRole: messages[0]?.role === 'system'
    });

    // Вызов Ollama с chat API
    try {
      const ollamaResponse = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 300, // Короткие ответы (2-4 предложения)
          }
        }),
      });

      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.status}`);
      }

      const data = await ollamaResponse.json();
      const aiReply = data.message?.content?.trim() || 'Извините, не смог сформировать ответ.';

      console.log('✅ AI response generated');

      return NextResponse.json({
        success: true,
        reply: aiReply,
        model: OLLAMA_MODEL,
      });

    } catch (ollamaError) {
      console.error('❌ Ollama error:', ollamaError);
      
      // Fallback к симуляции при недоступности Ollama
      const fallbackReply = getFallbackResponse(message, userRole);
      
      return NextResponse.json({
        success: true,
        reply: fallbackReply,
        model: 'fallback',
        warning: 'Ollama временно недоступен. Используется базовая логика.'
      });
    }

  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Построение массива сообщений для Ollama Chat API
 */
function buildChatMessages(
  message: string,
  userRole: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): OllamaMessage[] {
  const messages: OllamaMessage[] = [];

  // Системный промпт
  const systemPrompt = getSystemPrompt(userRole);
  messages.push({
    role: 'system',
    content: systemPrompt
  });

  // История разговора (последние 3 пары сообщений)
  const recentHistory = conversationHistory.slice(-6);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  // Текущее сообщение пользователя
  messages.push({
    role: 'user',
    content: message
  });

  return messages;
}

/**
 * Системный промпт в зависимости от роли пользователя
 */
function getSystemPrompt(userRole: string): string {
  const isChild = userRole === 'TEEN' || userRole === 'VIEWER';

  if (isChild) {
    return `Ты — семейный финансовый коуч в приложении FamilyPay.

ПРАВИЛА:
- НИКОГДА не упоминай банки, субсидии, документы, справки и инвестиции.
- Это домашний семейный бюджет в сомах (KGS), где дети просят карманные деньги у родителей.
- Отвечай коротко (2-3 предложения), тепло и по-человечески.
- Если ребенок просит деньги на игры/донаты (например, 5000 сом), ответь примерно так: "5000 сом на донаты — это довольно много для семейного бюджета. Шанс одобрения мал, родители вряд ли согласятся. Попробуй попросить меньшую сумму или накопить часть самому!"
- Используй emoji для дружелюбности 😊
- Говори простым языком, как старший друг.`;
  } else {
    return `Ты — семейный финансовый коуч в приложении FamilyPay.

ПРАВИЛА:
- НИКОГДА не упоминай банки, субсидии, документы, справки и инвестиции.
- Это домашний семейный бюджет в сомах (KGS).
- Отвечай коротко (2-3 предложения), тепло и по-человечески.
- Давай конкретные советы по экономии и планированию семейного бюджета.
- Говори понятным языком без формальностей.`;
  }
}

/**
 * Fallback ответы при недоступности Ollama
 */
function getFallbackResponse(message: string, userRole: string): string {
  const lowerMessage = message.toLowerCase();
  const isChild = userRole === 'TEEN' || userRole === 'VIEWER';

  // Для детей
  if (isChild) {
    if (lowerMessage.includes('копить') || lowerMessage.includes('накопить')) {
      return '🎯 Отличная идея копить! Вот простой план:\n\n1. **Определи цель** - на что ты копишь и сколько нужно денег\n2. **Узнай срок** - когда тебе нужна эта сумма\n3. **Посчитай** - раздели нужную сумму на количество недель\n4. **Откладывай регулярно** - каждую неделю откладывай эту сумму\n\nНапример, если нужно 10,000 сом за 20 недель, откладывай по 500 сом в неделю! 💪';
    }
    
    if (lowerMessage.includes('игр') || lowerMessage.includes('донат') || lowerMessage.includes('скин')) {
      return '🎮 Понимаю, хочется! Вот что повысит шансы на одобрение:\n\n✅ **Что сделать:**\n• Покажи родителям, что ты уже откладываешь деньги\n• Предложи накопить хотя бы половину самостоятельно\n• Объясни, почему это важно для тебя (не просто "все купили")\n• Выбери момент, когда они в хорошем настроении 😊\n\n💡 Реальность: если сумма большая, родители скорее одобрят частичную помощь, а не полную оплату.';
    }
    
    if (lowerMessage.includes('тратить') || lowerMessage.includes('карманные')) {
      return '💰 Карманные деньги - это твоя возможность научиться управлять финансами! Вот простые правила:\n\n✅ **Правило 50/30/20:**\n• 50% - на нужное (транспорт, обеды)\n• 30% - на приятное (развлечения, хобби)\n• 20% - в копилку на большую цель\n\nПопробуй записывать все траты в течение недели - так ты увидишь, куда уходят деньги! 📝';
    }
    
    return '🤔 Хороший вопрос! Я могу помочь тебе:\n\n• Научиться копить деньги на то, что ты хочешь\n• Понять, как убедить родителей в покупке\n• Разобраться, как правильно тратить карманные деньги\n• Составить план накоплений\n\nСпроси меня конкретнее, и я дам практичный совет! 😊';
  }
  
  // Для родителей
  if (lowerMessage.includes('расход') || lowerMessage.includes('анализ')) {
    return '📊 **Анализ расходов за текущий месяц:**\n\nНа основе типичной структуры расходов:\n\n**Основные категории:**\n• Продукты питания: 30-35% (норма)\n• Жильё и коммунальные: 25-30%\n• Транспорт: 10-15%\n• Развлечения: 10-15%\n• Накопления: минимум 10%\n\n**Рекомендации:**\n1. Проверьте категорию с наибольшими расходами\n2. Поищите подписки, которыми не пользуетесь\n3. Планируйте крупные покупки заранее\n\n💡 Хотите детальный анализ? Загляните в раздел "Аналитика"!';
  }
  
  if (lowerMessage.includes('экономи') || lowerMessage.includes('сэкономить')) {
    return '💡 **Быстрые способы сэкономить:**\n\n**На продуктах (300-500 сом/мес):**\n• Планируйте меню на неделю\n• Покупайте по списку (избегайте импульсивных покупок)\n• Используйте кешбэк и акции\n\n**На развлечениях (200-400 сом/мес):**\n• Домашние киновечера вместо кинотеатра\n• Бесплатные парки и музеи\n• Пикники вместо ресторанов\n\n**На подписках (100-200 сом/мес):**\n• Отмените неиспользуемые сервисы\n• Делитесь семейными подписками\n\n📈 Даже небольшие изменения дают 500-1000 сом экономии в месяц!';
  }
  
  return '🤖 Я анализирую финансовые вопросы семьи.\n\n**Могу помочь с:**\n• Анализом структуры расходов\n• Рекомендациями по экономии\n• Планированием финансовых целей\n• Оценкой крупных покупок\n\nЗадайте конкретный вопрос, и я дам детальный ответ! 📊';
}

// OPTIONS для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
