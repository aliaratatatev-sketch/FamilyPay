import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * GET /api/families - Получить список семей текущего пользователя
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    
    console.log('📋 Fetching families for user:', userId);

    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
          orderBy: {
            joinedAt: 'asc',
          },
        },
        accounts: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: 'asc',
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Found families:', families.length);
    
    return NextResponse.json({ families });
  } catch (error) {
    console.error('❌ Error fetching families:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch families' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/families - Создать новую семью
 * Body: { name: string, currency?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { name, currency } = body;

    // Валидация
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be less than 100 characters' },
        { status: 400 }
      );
    }

    const validCurrencies = ['RUB', 'USD', 'EUR', 'KGS'];
    const selectedCurrency = currency && validCurrencies.includes(currency) 
      ? currency 
      : 'RUB';

    // Создаём семью и добавляем создателя как ADMIN
    const family = await prisma.family.create({
      data: {
        name: name.trim(),
        currency: selectedCurrency,
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
            currency: selectedCurrency,
            color: '#10B981',
            icon: '💵',
            isActive: true,
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
        _count: {
          select: {
            transactions: true,
            budgets: true,
            goals: true,
          },
        },
      },
    });

    console.log('✅ Family created successfully:', {
      familyId: family.id,
      name: family.name,
      creatorId: userId,
      membersCount: family.members.length,
    });

    return NextResponse.json({ family }, { status: 201 });
  } catch (error) {
    console.error('Error creating family:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    );
  }
}
