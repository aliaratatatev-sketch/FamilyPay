import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

  // Защищаем админ панель (только для ADMIN)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      console.log('❌ No token, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Проверяем роль пользователя
    if (token.role !== 'ADMIN') {
      console.log('❌ User is not admin, redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    console.log('✅ Admin token found, allowing access');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/dashboard/:path*', '/dashboard'],
};

