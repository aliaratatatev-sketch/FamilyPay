import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/categories - получить категории для пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // INCOME или EXPENSE
    const familyId = searchParams.get('familyId');

    // Получаем пользователя с его семьями
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        familyMembers: {
          include: {
            family: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Собираем ID семей пользователя
    const userFamilyIds = user.familyMembers.map(fm => fm.family.id);

    // Если указан familyId, проверяем доступ
    if (familyId && !userFamilyIds.includes(familyId)) {
      return NextResponse.json({ error: 'Access denied to this family' }, { status: 403 });
    }

    const where: any = {
      OR: [
        { isSystem: true }, // Системные категории доступны всем
        { familyId: { in: familyId ? [familyId] : userFamilyIds } } // Категории семей пользователя
      ]
    };

    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' }, // Системные категории первыми
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
        isSystem: true,
        parentId: true,
        familyId: true,
        parent: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
