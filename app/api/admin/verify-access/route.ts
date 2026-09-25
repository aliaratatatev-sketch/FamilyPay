import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail, ACCESS_TOKEN_EXPIRY } from '@/lib/admin-config';
import {
  getVerificationCode,
  deleteVerificationCode,
  saveAccessToken,
} from '@/lib/admin-storage';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('🔐 Verify-access called for:', session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await req.json();

    console.log('📝 Received code:', code);

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    // Проверяем, является ли пользователь администратором
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Получаем сохраненный код
    const savedData = getVerificationCode(session.user.email);

    console.log('💾 Saved data:', savedData ? 'found' : 'NOT FOUND');

    if (!savedData) {
      return NextResponse.json(
        { error: 'Код подтверждения не найден. Пожалуйста, запросите новый.' },
        { status: 404 }
      );
    }

    // Проверяем срок действия
    if (savedData.expiresAt < Date.now()) {
      deleteVerificationCode(session.user.email);
      return NextResponse.json(
        { error: 'Код истек. Пожалуйста, запросите новый.' },
        { status: 410 }
      );
    }

    console.log('🔍 Comparing codes:', {
      received: code,
      saved: savedData.code,
      match: savedData.code === code,
    });

    // Проверяем код
    if (savedData.code !== code) {
      return NextResponse.json(
        { error: 'Неверный код подтверждения' },
        { status: 400 }
      );
    }

    // Код верный, удаляем его
    deleteVerificationCode(session.user.email);

    // Создаем токен доступа
    const accessToken = generateAccessToken();
    const tokenExpiry = Date.now() + ACCESS_TOKEN_EXPIRY;
    
    saveAccessToken(session.user.email, tokenExpiry);

    console.log(`✅ Admin access granted to ${session.user.email}`);

    const response = NextResponse.json({
      success: true,
      message: 'Доступ предоставлен',
      accessToken,
      expiresIn: ACCESS_TOKEN_EXPIRY / 1000, // в секундах
    });

    // Устанавливаем cookie с токеном доступа
    response.cookies.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_EXPIRY / 1000,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ Error verifying admin access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateAccessToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
