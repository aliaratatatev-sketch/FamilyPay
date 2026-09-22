import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/categories - получить все категории
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // INCOME или EXPENSE
    const familyId = searchParams.get('familyId');

    const where: any = {};
    if (type) where.type = type;
    if (familyId) where.familyId = familyId;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        family: true,
        parent: true,
        subcategories: true,
        _count: {
          select: {
            transactions: true,
            budgets: true,
            subcategories: true
          }
        }
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories - создать категорию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, color, icon, parentId, familyId, isSystem } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        color,
        icon,
        parentId,
        familyId: familyId || null,
        isSystem: isSystem || false
      },
      include: {
        family: true,
        parent: true
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PATCH /api/admin/categories - обновить категорию
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, color, icon, parentId, isSystem } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, type, color, icon, parentId, isSystem },
      include: {
        family: true,
        parent: true
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories - удалить категорию
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Проверка на системную категорию
    const category = await prisma.category.findUnique({ where: { id } });
    if (category?.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system category' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
