import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Необходимо войти в систему" },
        { status: 401 }
      );
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Токен приглашения не найден" },
        { status: 400 }
      );
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Находим приглашение
    const invitation = await prisma.familyInvitation.findUnique({
      where: { token },
      include: {
        family: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Приглашение не найдено" },
        { status: 404 }
      );
    }

    // Проверяем, не истекло ли приглашение
    if (invitation.expires < new Date()) {
      return NextResponse.json(
        { error: "Срок действия приглашения истек" },
        { status: 400 }
      );
    }

    // Проверяем, совпадает ли email
    if (invitation.email !== user.email) {
      return NextResponse.json(
        { error: "Это приглашение предназначено для другого пользователя" },
        { status: 403 }
      );
    }

    // Проверяем, не является ли пользователь уже членом семьи
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: invitation.familyId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      // Удаляем приглашение, так как пользователь уже в семье
      await prisma.familyInvitation.delete({
        where: { id: invitation.id },
      });

      return NextResponse.json(
        { error: "Вы уже являетесь членом этой семьи" },
        { status: 400 }
      );
    }

    // Создаем связь FamilyMember
    const familyMember = await prisma.familyMember.create({
      data: {
        familyId: invitation.familyId,
        userId: user.id,
        role: invitation.role,
      },
    });

    // Удаляем использованное приглашение
    await prisma.familyInvitation.delete({
      where: { id: invitation.id },
    });

    // Создаем уведомление для пользователя
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "FAMILY_INVITE",
        title: "Добро пожаловать в семью!",
        message: `Вы успешно присоединились к семье "${invitation.family.name}"`,
      },
    });

    // Создаем запись в журнале активности
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "JOIN",
        entityType: "Family",
        entityId: invitation.familyId,
        description: `${user.name || user.email} присоединился к семье "${invitation.family.name}"`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Вы успешно присоединились к семье",
      familyMember,
    });
  } catch (error) {
    console.error("Ошибка при принятии приглашения:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при принятии приглашения" },
      { status: 500 }
    );
  }
}
