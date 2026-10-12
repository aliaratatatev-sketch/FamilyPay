/**
 * API: Получение одного запроса на деньги
 * GET /api/money-requests/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: requestId } = await context.params;

    // Получаем запрос с полной информацией
    const moneyRequest = await prisma.moneyRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        approver: {
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
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Проверяем доступ: должен быть членом семьи
    const member = await prisma.familyMember.findFirst({
      where: {
        familyId: moneyRequest.familyId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      request: moneyRequest,
    });

  } catch (error) {
    console.error('Error fetching money request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
