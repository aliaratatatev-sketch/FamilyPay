/**
 * API: AI анализ запроса на расход
 * POST /api/ai/analyze-expense
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Endpoint called');
    
    // Получение данных из запроса
    const body = await request.json();
    const {
      description,
      amount,
      category,
      comment,
      familyId
    } = body;

    // Валидация
    if (!description) {
      return NextResponse.json(
        { error: 'Введите описание расхода' },
        { status: 400 }
      );
    }

    // Симулируем AI анализ для демонстрации
    // В реальной версии здесь будет вызов Ollama или другой AI модели
    const analysis = analyzeExpenseText(description);

    return NextResponse.json({
      success: true,
      suggestedCategory: analysis.category,
      categoryIcon: analysis.icon,
      analysis: analysis.analysis,
      suggestion: analysis.suggestion,
      confidence: analysis.confidence
    });

  } catch (error) {
    console.error('Ошибка AI анализа:', error);
    return NextResponse.json(
      {
        error: 'Ошибка анализа',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

// Функция анализа текста расхода
function analyzeExpenseText(description: string) {
  const lowerDesc = description.toLowerCase();
  
  // Простые правила для категоризации (в реальности будет ML-модель)
  const categories = [
    {
      keywords: ['магнит', 'пятерочка', 'перекресток', 'продукты', 'еда', 'хлеб', 'молоко', 'овощи', 'мясо'],
      category: 'Продукты питания',
      icon: '🛒',
      suggestion: 'Планируйте покупки заранее и используйте список покупок, чтобы избежать импульсивных трат'
    },
    {
      keywords: ['кафе', 'ресторан', 'кофе', 'доставка', 'яндекс еда', 'delivery'],
      category: 'Рестораны и кафе',
      icon: '🍕',
      suggestion: 'Попробуйте готовить дома чаще - это может сэкономить до 50% расходов на питание'
    },
    {
      keywords: ['транспорт', 'такси', 'яндекс', 'метро', 'автобус', 'бензин', 'заправка'],
      category: 'Транспорт',
      icon: '🚗',
      suggestion: 'Рассмотрите использование общественного транспорта или каршеринга для снижения расходов'
    },
    {
      keywords: ['аптека', 'лекарства', 'больница', 'врач', 'медицина'],
      category: 'Здоровье',
      icon: '💊',
      suggestion: 'Здоровье - приоритет. Рассмотрите покупку медицинской страховки для снижения непредвиденных расходов'
    },
    {
      keywords: ['одежда', 'обувь', 'магазин', 'платье', 'куртка', 'джинсы'],
      category: 'Одежда и обувь',
      icon: '👔',
      suggestion: 'Покупайте качественные вещи в сезонные распродажи - это выгоднее, чем частые покупки дешевых вещей'
    },
    {
      keywords: ['кино', 'развлечения', 'концерт', 'театр', 'боулинг', 'игры'],
      category: 'Развлечения',
      icon: '🎮',
      suggestion: 'Ищите бесплатные альтернативы: парки, бесплатные музеи, онлайн-трансляции концертов'
    },
    {
      keywords: ['коммунальные', 'свет', 'вода', 'газ', 'интернет', 'телефон'],
      category: 'Коммунальные услуги',
      icon: '🏠',
      suggestion: 'Установите счетчики и LED-лампы для экономии на коммунальных платежах'
    },
    {
      keywords: ['подписка', 'netflix', 'spotify', 'youtube', 'сервис'],
      category: 'Подписки',
      icon: '📱',
      suggestion: 'Проверьте все подписки и отмените неиспользуемые - часто мы забываем о них'
    }
  ];

  // Поиск подходящей категории
  for (const cat of categories) {
    for (const keyword of cat.keywords) {
      if (lowerDesc.includes(keyword)) {
        return {
          category: cat.category,
          icon: cat.icon,
          analysis: `На основе описания "${description}", ИИ определил, что это расход категории "${cat.category}".`,
          suggestion: cat.suggestion,
          confidence: 0.85
        };
      }
    }
  }

  // Категория по умолчанию
  return {
    category: 'Прочие расходы',
    icon: '💸',
    analysis: `ИИ проанализировал описание "${description}" и отнес его к категории "Прочие расходы".`,
    suggestion: 'Старайтесь быть более конкретными в описании расходов для лучшего анализа',
    confidence: 0.5
  };
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
