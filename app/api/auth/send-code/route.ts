import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, sendTelegramCode } from '@/lib/telegram';

// Простая проверка учетных данных (замените на свою логику)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // В продакшене используйте хеширование!
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Попытка входа:', { username, passwordLength: password?.length });
    console.log('Ожидается:', ADMIN_CREDENTIALS);

    // Проверяем учетные данные
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      console.log('Неверные учетные данные!');
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    console.log('Учетные данные верны!');

    // Получаем chatId из переменных окружения
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) {
      return NextResponse.json(
        { error: 'Telegram не настроен' },
        { status: 500 }
      );
    }

    // Генерируем 6-значный код
    const code = generateVerificationCode();

    // Сохраняем код в базе данных
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут
    await prisma.adminVerificationCode.create({
      data: {
        code,
        username,
        chatId,
        expires: expiresAt,
      },
    });

    // Отправляем код в Telegram
    const sent = await sendTelegramCode(chatId, code);

    if (!sent) {
      return NextResponse.json(
        { error: 'Ошибка отправки кода в Telegram' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Код отправлен в Telegram',
    });
  } catch (error) {
    console.error('Ошибка при отправке кода:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
