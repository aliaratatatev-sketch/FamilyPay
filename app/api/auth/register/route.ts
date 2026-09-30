import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateVerificationCode, sendVerificationCode } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Генерируем 6-значный код
    const code = generateVerificationCode();

    // Удаляем старые неиспользованные коды для этого email
    await prisma.emailVerificationCode.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    // Сохраняем код в базе данных
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут
    await prisma.emailVerificationCode.create({
      data: {
        code,
        email,
        name,
        password: hashedPassword,
        expires: expiresAt,
      },
    });

    // Отправляем код на email
    const sent = await sendVerificationCode(email, code, name);

    if (!sent) {
      return NextResponse.json(
        { error: 'Ошибка отправки кода. Проверьте настройки SMTP в .env' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Код подтверждения отправлен на ваш email',
        email, // Возвращаем email для фронтенда
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}
