import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/transactions - получить все транзакции
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const familyId = searchParams.get('familyId');
    const type = searchParams.get('type');
    const accountId = searchParams.get('accountId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (familyId) where.familyId = familyId;
    if (type) where.type = type;
    if (accountId) where.accountId = accountId;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          family: true,
          account: true,
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST /api/admin/transactions - создать транзакцию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyId, accountId, categoryId, userId, type, amount, currency, description, date, location, receipt, tags, toAccountId } = body;

    if (!familyId || !accountId || !userId || !type || !amount) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        familyId,
        accountId,
        categoryId,
        userId,
        type,
        amount,
        currency: currency || 'RUB',
        description,
        date: date ? new Date(date) : new Date(),
        location,
        receipt,
        tags: tags || [],
        toAccountId
      },
      include: {
        family: true,
        account: true,
        category: true,
        user: true
      }
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

// DELETE /api/admin/transactions - удалить транзакцию
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
