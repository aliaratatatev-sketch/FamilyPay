// app/api/finik/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createFinikPayment } from '@/lib/finik';

/**
 * POST /api/finik/create-payment
 * Создает платеж в Finik с фиксированной суммой 5 сомов
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Получение данных из запроса
    const body = await request.json();
    const { workId, workTopic, userId } = body;

    // 2. Валидация данных
    if (!workId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: workId and userId are required' },
        { status: 400 }
      );
    }

    // 3. ЖЕСТКО ЗАФИКСИРОВАННАЯ СУММА - 5 сомов
    const FIXED_AMOUNT = 5;

    // 4. Создание данных для платежа
    const paymentData = {
      amount: FIXED_AMOUNT,
      workId,
      workTopic: workTopic || 'Подписка FamilyPay',
      userId,
    };

    console.log(`[FINIK] Creating payment: ${FIXED_AMOUNT} KGS for user ${userId}`);

    // 5. Создание платежа в Finik
    const paymentUrl = await createFinikPayment(paymentData);

    // 6. Возврат URL платежной страницы
    return NextResponse.json({
      success: true,
      paymentUrl,
      amount: FIXED_AMOUNT,
    });

  } catch (error) {
    console.error('Error creating Finik payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
