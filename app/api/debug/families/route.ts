import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

/**
 * DEBUG ENDPOINT - Показывает подробную информацию о семьях пользователя
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    
    console.log('🔍 DEBUG: User ID:', userId);

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log('👤 DEBUG: User found:', user);

    // Получаем всех членов семей, где участвует пользователь
    const memberships = await prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log('👥 DEBUG: Memberships found:', memberships.length);

    // Получаем семьи напрямую
    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        accounts: true,
      },
    });

    console.log('🏠 DEBUG: Families found:', families.length);

    return NextResponse.json({
      debug: true,
      userId,
      user,
      memberships,
      families,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
    
    return NextResponse.json(
      {
        error: 'Debug endpoint error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
