import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email и код обязательны' },
        { status: 400 }
      );
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { error: 'Неверный формат кода' },
        { status: 400 }
      );
    }

    // Ищем код в базе данных
    const verificationCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
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

    // Проверяем, не создан ли уже пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email: verificationCode.email,
        name: verificationCode.name,
        password: verificationCode.password, // Уже хешированный
        role: 'USER',
        emailVerified: new Date(), // Помечаем email как подтвержденный
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Помечаем код как использованный
    await prisma.emailVerificationCode.update({
      where: {
        id: verificationCode.id,
      },
      data: {
        used: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email подтвержден, аккаунт создан!',
      user,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Ошибка при подтверждении email' },
      { status: 500 }
    );
  }
}
