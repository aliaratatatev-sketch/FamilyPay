// app/api/finik/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyFinikWebhook, 
  isTimestampValid, 
  FinikWebhookData 
} from '@/lib/finik';

/**
 * POST /api/finik/webhook
 * Обрабатывает webhook от Finik после завершения платежа
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Получение заголовков
    const signature = request.headers.get('signature');
    const timestamp = request.headers.get('x-api-timestamp');
    const host = request.headers.get('host');

    if (!signature || !timestamp) {
      console.error('[FINIK_WEBHOOK] Missing signature or timestamp');
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 400 }
      );
    }

    // 2. Проверка актуальности timestamp (защита от replay-атак)
    if (!isTimestampValid(timestamp)) {
      console.error('[FINIK_WEBHOOK] Timestamp is too old or invalid');
      return NextResponse.json(
        { error: 'Invalid timestamp' },
        { status: 400 }
      );
    }

    // 3. Получение тела запроса
    const body: FinikWebhookData = await request.json();

    console.log('[FINIK_WEBHOOK] Received webhook:', {
      status: body.status,
      amount: body.amount,
      transactionId: body.transactionId
    });

    // 4. Подготовка заголовков для верификации
    const headers: Record<string, string> = {
      'host': host || '',
    };

    // 5. Верификация подписи
    const webhookPath = '/api/finik/webhook';
    const isValid = await verifyFinikWebhook(
      signature, 
      timestamp, 
      body as any, 
      headers, 
      webhookPath
    );
    
    if (!isValid) {
      console.error('[FINIK_WEBHOOK] Invalid signature');
      
      // В продакшене всегда отклоняем невалидные подписи
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // 6. Извлечение метаданных
    let metadata: { 
      userId?: string; 
      workId?: string; 
      paymentId?: string 
    } = {};
    
    try {
      if (body.data && body.data.metadata) {
        if (typeof body.data.metadata === 'string') {
          metadata = JSON.parse(body.data.metadata);
        } else {
          metadata = body.data.metadata as typeof metadata;
        }
      }
    } catch (error) {
      console.error('[FINIK_WEBHOOK] Error parsing metadata:', error);
    }

    // 7. Обработка успешного платежа
    if (body.status === 'SUCCEEDED' || body.status === 'succeeded') {
      const { userId, workId } = metadata;

      console.log(`[FINIK_WEBHOOK] ✅ Payment SUCCESS: ${body.amount} KGS | User: ${userId} | Work: ${workId} | TX: ${body.transactionId}`);

      // ЗДЕСЬ ВАША ЛОГИКА ОБРАБОТКИ УСПЕШНОГО ПЛАТЕЖА
      // Например:
      // - Обновление статуса подписки в БД
      // - Отправка email уведомления
      // - Активация доступа
      
      // Пример (раскомментируйте и адаптируйте под вашу схему):
      /*
      if (userId && workId) {
        await prisma.subscription.create({
          data: {
            userId: userId,
            amount: body.amount,
            transactionId: body.transactionId,
            status: 'ACTIVE',
            paidAt: new Date(body.transactionDate),
          },
        });
      }
      */
    } 
    // 8. Обработка неудачного платежа
    else if (body.status === 'FAILED' || body.status === 'failed') {
      const { userId, workId } = metadata;
      console.error('[FINIK_WEBHOOK] ❌ Payment FAILED:', { userId, workId, amount: body.amount });
      
      // ЗДЕСЬ ВАША ЛОГИКА ОБРАБОТКИ НЕУДАЧНОГО ПЛАТЕЖА
    }

    // 9. Возврат успешного ответа
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[FINIK_WEBHOOK] Error processing webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
