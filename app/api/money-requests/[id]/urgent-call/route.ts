import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * POST /api/money-requests/:id/urgent-call - Отправить срочное уведомление членам семьи
 * Отправляет push-уведомления всем администраторам и родителям семьи
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;

    // Находим запрос
    const moneyRequest = await prisma.moneyRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!moneyRequest) {
      return NextResponse.json(
        { error: 'Запрос не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что пользователь является автором запроса
    if (moneyRequest.requesterId !== userId) {
      return NextResponse.json(
        { error: 'Только автор запроса может отправить срочный вызов' },
        { status: 403 }
      );
    }

    // Проверяем статус - срочный вызов доступен только для PENDING запросов
    if (moneyRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Срочный вызов доступен только для запросов в ожидании' },
        { status: 400 }
      );
    }

    // Находим всех админов и родителей семьи (кроме автора запроса)
    const familyMembers = await prisma.familyMember.findMany({
      where: {
        familyId: moneyRequest.familyId,
        role: {
          in: ['ADMIN', 'PARENT'],
        },
        userId: {
          not: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (familyMembers.length === 0) {
      return NextResponse.json(
        { error: 'В семье нет администраторов или родителей для уведомления' },
        { status: 400 }
      );
    }

    // Создаем срочные уведомления для всех администраторов и родителей
    const notifications = await Promise.all(
      familyMembers.map((member) =>
        prisma.notification.create({
          data: {
            userId: member.userId,
            type: 'URGENT_REQUEST',
            title: '🚨 Срочный запрос на деньги!',
            message: `${moneyRequest.requester.name || moneyRequest.requester.email} срочно нуждается в ${moneyRequest.amount} ${moneyRequest.currency} для "${moneyRequest.title}". Пожалуйста, рассмотрите запрос как можно скорее!`,
            data: JSON.parse(JSON.stringify({
              moneyRequestId: id,
              familyId: moneyRequest.familyId,
              familyName: moneyRequest.family.name,
              amount: moneyRequest.amount,
              currency: moneyRequest.currency,
              title: moneyRequest.title,
              requesterId: moneyRequest.requesterId,
              requesterName: moneyRequest.requester.name || moneyRequest.requester.email,
              isUrgent: true,
            })),
          },
        })
      )
    );

    // Создаем запись о срочном вызове (для статистики)
    await prisma.$executeRaw`
      INSERT INTO urgent_calls (money_request_id, called_by, called_at)
      VALUES (${id}, ${userId}, NOW())
      ON CONFLICT (money_request_id) DO NOTHING
    `.catch(() => {
      // Игнорируем ошибку если таблица не существует
      // Это опциональная функция для статистики
    });

    return NextResponse.json({
      success: true,
      message: 'Срочное уведомление отправлено членам семьи',
      notifiedUsers: familyMembers.length,
      notifiedMembers: familyMembers.map(m => ({
        name: m.user.name || m.user.email,
        role: m.role,
      })),
    });
  } catch (error) {
    console.error('Error sending urgent call:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Не удалось отправить срочный вызов',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
