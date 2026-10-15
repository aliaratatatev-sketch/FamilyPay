import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Токен приглашения не найден" },
        { status: 400 }
      );
    }

    // Находим приглашение
    const invitation = await prisma.familyInvitation.findUnique({
      where: { token },
      include: {
        family: {
          select: {
            name: true,
            currency: true,
          },
        },
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

    return NextResponse.json({
      familyName: invitation.family.name,
      currency: invitation.family.currency,
      role: invitation.role,
      email: invitation.email,
    });
  } catch (error) {
    console.error("Ошибка при получении информации о приглашении:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при получении информации" },
      { status: 500 }
    );
  }
}
