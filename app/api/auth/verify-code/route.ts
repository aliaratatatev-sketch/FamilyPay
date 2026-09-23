import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Cookies from 'js-cookie';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Неверный формат кода' },
        { status: 400 }
      );
    }

    // Ищем код в базе данных
    const verificationCode = await prisma.adminVerificationCode.findFirst({
      where: {
        code,
        used: false,
        expires: {
          gte: new Date(),
        },
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Неверный или истекший код' },
        { status: 401 }
      );
    }

    // Помечаем код как использованный
    await prisma.adminVerificationCode.update({
      where: {
        id: verificationCode.id,
      },
      data: {
        used: true,
      },
    });

    // Создаем сессию (простая реализация через cookie)
    const response = NextResponse.json({
      success: true,
      message: 'Вход выполнен успешно',
    });

    // Устанавливаем cookie на 24 часа
    response.cookies.set('admin_session', verificationCode.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 часа
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Ошибка при проверке кода:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
