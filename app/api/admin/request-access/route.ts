import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail, VERIFICATION_CODE_EXPIRY } from '@/lib/admin-config';
import {
  generateVerificationCode,
  sendAdminVerificationCode,
} from '@/lib/telegram';
import {
  saveVerificationCode,
  cleanupExpiredCodes,
} from '@/lib/admin-storage';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Проверяем, является ли пользователь администратором
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Генерируем 6-значный код
    const code = generateVerificationCode();
    const expiresAt = Date.now() + VERIFICATION_CODE_EXPIRY;

    // Сохраняем код в глобальное хранилище
    saveVerificationCode(session.user.email, code, expiresAt);

    // Очищаем истекшие коды
    cleanupExpiredCodes();

    // Отправляем код в Telegram
    const sent = await sendAdminVerificationCode(session.user.email, code);

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      );
    }

    console.log(`✅ Verification code sent to ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Код отправлен в Telegram',
      expiresIn: VERIFICATION_CODE_EXPIRY / 1000, // в секундах
    });
  } catch (error) {
    console.error('❌ Error requesting admin access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
