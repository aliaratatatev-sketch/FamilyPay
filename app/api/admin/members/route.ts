import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/members - получить всех членов семей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    const where: any = {};
    if (familyId) where.familyId = familyId;

    const members = await prisma.familyMember.findMany({
      where,
      orderBy: { joinedAt: 'desc' },
      include: {
        family: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/admin/members - добавить члена семьи
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyId, userId, role } = body;

    if (!familyId || !userId || !role) {
      return NextResponse.json({ error: 'Family ID, user ID and role are required' }, { status: 400 });
    }

    // Проверка существования связи
    const existing = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'User is already a member of this family' }, { status: 400 });
    }

    const member = await prisma.familyMember.create({
      data: {
        familyId,
        userId,
        role
      },
      include: {
        family: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

// PATCH /api/admin/members - обновить роль члена семьи
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ error: 'Member ID and role are required' }, { status: 400 });
    }

    const member = await prisma.familyMember.update({
      where: { id },
      data: { role },
      include: {
        family: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

// DELETE /api/admin/members - удалить члена семьи
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    await prisma.familyMember.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
