import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Пример API route для работы с семьями

// GET /api/families - Получить список семей пользователя
export async function GET(request: NextRequest) {
  try {
    // В реальном приложении userId нужно получать из сессии/токена
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        accounts: {
          where: {
            isActive: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
            goals: true,
          },
        },
      },
    });

    return NextResponse.json(families);
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json(
      { error: 'Failed to fetch families' },
      { status: 500 }
    );
  }
}

// POST /api/families - Создать новую семью
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, currency, userId } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      );
    }

    // Создаём семью и добавляем создателя как ADMIN
    const family = await prisma.family.create({
      data: {
        name,
        currency: currency || 'RUB',
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
        // Создаём базовый счёт "Наличные"
        accounts: {
          create: {
            name: 'Наличные',
            type: 'CASH',
            balance: 0,
            currency: currency || 'RUB',
            color: '#10B981',
            icon: '💵',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        accounts: true,
      },
    });

    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    );
  }
}
