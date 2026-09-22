import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/families - получить все семьи
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search ? {
      name: { contains: search, mode: 'insensitive' as const }
    } : {};

    const [families, total] = await Promise.all([
      prisma.family.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          _count: {
            select: {
              accounts: true,
              transactions: true,
              budgets: true,
              goals: true,
              categories: true
            }
          }
        }
      }),
      prisma.family.count({ where })
    ]);

    return NextResponse.json({
      families,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json({ error: 'Failed to fetch families' }, { status: 500 });
  }
}

// POST /api/admin/families - создать семью
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, currency, createdById } = body;

    if (!name || !createdById) {
      return NextResponse.json({ error: 'Name and creator ID are required' }, { status: 400 });
    }

    const family = await prisma.family.create({
      data: {
        name,
        currency: currency || 'RUB',
        createdById,
        members: {
          create: {
            userId: createdById,
            role: 'ADMIN'
          }
        }
      },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({ family }, { status: 201 });
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json({ error: 'Failed to create family' }, { status: 500 });
  }
}

// PATCH /api/admin/families - обновить семью
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, currency } = body;

    if (!id) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    const family = await prisma.family.update({
      where: { id },
      data: { name, currency },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({ family });
  } catch (error) {
    console.error('Error updating family:', error);
    return NextResponse.json({ error: 'Failed to update family' }, { status: 500 });
  }
}

// DELETE /api/admin/families - удалить семью
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    await prisma.family.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Family deleted successfully' });
  } catch (error) {
    console.error('Error deleting family:', error);
    return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 });
  }
}
