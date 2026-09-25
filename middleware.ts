import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Список email администраторов
const ADMIN_EMAILS = [
  'aliaratatatev@gmail.com',
  // Добавьте другие email администраторов здесь
];

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Получаем токен пользователя
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Защищаем dashboard (для всех авторизованных пользователей)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('❌ No token, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('✅ Token found, allowing access to dashboard');
  }

  // Защищаем админ панель (только для администраторов)
  if (pathname.startsWith('/admin')) {
    // Проверяем авторизацию
    if (!token) {
      console.log('❌ No token, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Проверяем, является ли пользователь администратором по email
    const userEmail = token.email as string | undefined;
    if (!isAdminEmail(userEmail)) {
      console.log('❌ User is not admin, redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Проверяем токен доступа к админ-панели
    const adminAccessToken = request.cookies.get('admin_access_token')?.value;
    
    if (!adminAccessToken) {
      console.log('❌ No admin access token, redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    console.log('✅ Admin access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/dashboard/:path*', '/dashboard'],
};

