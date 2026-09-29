import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * GET /api/accounts - Получить список счетов пользователя
 * Query params: ?familyId=xxx (опционально - фильтр по семье)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const familyId = request.nextUrl.searchParams.get('familyId');

    // Если указан familyId, проверяем членство в семье
    if (familyId) {
      const member = await prisma.familyMember.findUnique({
        where: {
          familyId_userId: {
            familyId,
            userId,
          },
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: 'Access denied. You are not a member of this family' },
          { status: 403 }
        );
      }

      // Получаем счета конкретной семьи
      const accounts = await prisma.financialAccount.findMany({
        where: {
          familyId,
          isActive: true,
        },
        orderBy: [
          { createdAt: 'asc' },
        ],
        include: {
          family: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
        },
      });

      return NextResponse.json({ accounts });
    }

    // Если familyId не указан, получаем счета всех семей пользователя
    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const familyIds = families.map(f => f.id);

    const accounts = await prisma.financialAccount.findMany({
      where: {
        familyId: {
          in: familyIds,
        },
        isActive: true,
      },
      orderBy: [
        { familyId: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        family: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounts - Создать новый счёт
 * Body: { familyId: string, name: string, type: AccountType, balance?: number, currency?: string, description?: string, color?: string, icon?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { familyId, name, type, balance, currency, description, color, icon } = body;

    // Валидация обязательных полей
    if (!familyId || !name || !type) {
      return NextResponse.json(
        { error: 'familyId, name, and type are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be less than 100 characters' },
        { status: 400 }
      );
    }

    // Валидация типа счёта
    const validTypes = ['CASH', 'BANK_ACCOUNT', 'CARD', 'SAVINGS', 'INVESTMENT', 'DEBT'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid account type. Allowed: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Проверяем права пользователя в семье
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Access denied. You are not a member of this family' },
        { status: 403 }
      );
    }

    if (member.role !== 'ADMIN' && member.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Access denied. Only admins and parents can create accounts' },
        { status: 403 }
      );
    }

    // Получаем валюту семьи по умолчанию
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { currency: true },
    });

    // Валидация баланса
    let accountBalance = 0;
    if (balance !== undefined && balance !== null) {
      const balanceNum = Number(balance);
      if (isNaN(balanceNum)) {
        return NextResponse.json(
          { error: 'Balance must be a valid number' },
          { status: 400 }
        );
      }
      accountBalance = balanceNum;
    }

    // Создаём счёт
    const account = await prisma.financialAccount.create({
      data: {
        familyId,
        name: name.trim(),
        type,
        balance: accountBalance,
        currency: currency || family?.currency || 'RUB',
        description: description?.trim() || null,
        color: color || null,
        icon: icon || null,
        isActive: true,
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
