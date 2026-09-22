import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/accounts - получить все счета
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const type = searchParams.get('type');

    const where: any = {};
    if (familyId) where.familyId = familyId;
    if (type) where.type = type;

    const accounts = await prisma.financialAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        family: true,
        _count: {
          select: {
            transactions: true,
            goalAllocations: true
          }
        }
      }
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

// POST /api/admin/accounts - создать счёт
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyId, name, type, balance, currency, description, color, icon, isActive } = body;

    if (!familyId || !name || !type) {
      return NextResponse.json({ error: 'Family ID, name and type are required' }, { status: 400 });
    }

    const account = await prisma.financialAccount.create({
      data: {
        familyId,
        name,
        type,
        balance: balance || 0,
        currency: currency || 'RUB',
        description,
        color,
        icon,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        family: true
      }
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

// PATCH /api/admin/accounts - обновить счёт
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, balance, currency, description, color, icon, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const account = await prisma.financialAccount.update({
      where: { id },
      data: { name, type, balance, currency, description, color, icon, isActive },
      include: {
        family: true
      }
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

// DELETE /api/admin/accounts - удалить счёт
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    await prisma.financialAccount.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
