import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Выход выполнен успешно',
  });

  // Удаляем cookie
  response.cookies.delete('admin_session');

  return response;
}
