/**
 * API: AI анализ запроса на расход
 * POST /api/ai/analyze-expense
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeExpenseRequest, type ExpenseAnalysisRequest } from '@/lib/ai/ollama';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Endpoint called (Ollama)');
    
    // Временно отключаем проверку авторизации для тестирования
    // TODO: включить авторизацию в продакшене
    /*
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    */

    // Получение данных из запроса
    const body = await request.json();
    const {
      amount,
      category,
      comment,
      familyId
    } = body;

    // Валидация
    if (!amount || !category) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }

    // Временно пропускаем проверку доступа к семье для демо
    // В продакшене нужно раскомментировать этот блок
    /*
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        familyMembers: {
          where: { familyId },
          include: {
            family: true
          }
        }
      }
    });

    if (!user || user.familyMembers.length === 0) {
      return NextResponse.json(
        { error: 'Нет доступа к этой семье' },
        { status: 403 }
      );
    }
    */

    // Сбор контекста для AI (упрощенная версия для демо)
    
    // Для полноценной работы нужно:
    // 1. Реальный familyId из авторизации
    // 2. Данные из БД (бюджеты, транзакции, цели)
    
    // Пока используем моковые данные для демонстрации
    const budget = null;
    const recentExpenses: any[] = [];
    const monthlyIncome = { _sum: { amount: 100000 } }; // моковый доход
    const totalSavings = 50000; // моковые сбережения
    const goals: any[] = [];

    // Формирование запроса к AI
    const aiRequest: ExpenseAnalysisRequest = {
      amount: parseFloat(amount),
      category,
      comment,
      currentBudget: null, // пока без бюджета
      recentExpenses: [],
      monthlyIncome: monthlyIncome._sum.amount ? parseFloat(monthlyIncome._sum.amount.toString()) : 100000,
      totalSavings,
      goals: []
    };

    // Вызов AI анализа
    const recommendation = await analyzeExpenseRequest(aiRequest);

    return NextResponse.json({
      success: true,
      recommendation,
      context: {
        budgetAvailable: null,
        recentExpensesCount: 0,
        monthlyIncome: 100000,
        totalSavings: 50000
      }
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
