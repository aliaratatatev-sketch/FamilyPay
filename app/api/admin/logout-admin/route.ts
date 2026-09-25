import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteAccessToken } from '@/lib/admin-storage';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`🚪 Admin logout: ${session.user.email}`);

    // Удаляем токен из хранилища
    deleteAccessToken(session.user.email);

    const response = NextResponse.json({
      success: true,
      message: 'Logged out from admin panel',
    });

    // Удаляем cookie с токеном доступа
    response.cookies.delete('admin_access_token');

    return response;
  } catch (error) {
    console.error('❌ Error logging out from admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
