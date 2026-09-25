import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('🔍 Check-access API called');
    console.log('📧 Session user email:', session?.user?.email);
    console.log('📧 Session raw:', JSON.stringify(session, null, 2));

    if (!session?.user?.email) {
      console.log('❌ No email in session');
      return NextResponse.json(
        { hasAccess: false, isAdmin: false },
        { status: 200 }
      );
    }

    const userEmail = session.user.email;
    const isAdmin = isAdminEmail(userEmail);
    
    console.log('🔐 Is admin check:', {
      email: userEmail,
      emailLength: userEmail.length,
      emailCharCodes: userEmail.split('').map(c => c.charCodeAt(0)),
      isAdmin,
    });
    
    if (!isAdmin) {
      console.log('❌ User is not in admin list');
      return NextResponse.json(
        { hasAccess: false, isAdmin: false, debugEmail: userEmail },
        { status: 200 }
      );
    }

    // Проверяем наличие токена доступа
    const accessToken = req.cookies.get('admin_access_token')?.value;
    
    console.log('🍪 Admin access token:', accessToken ? 'exists' : 'missing');
    
    // Если токена нет, нужна авторизация
    if (!accessToken) {
      console.log('⚠️ Admin email confirmed, but needs verification');
      return NextResponse.json(
        { hasAccess: false, isAdmin: true, needsVerification: true },
        { status: 200 }
      );
    }

    // Токен есть, доступ предоставлен
    console.log('✅ Full admin access granted');
    return NextResponse.json(
      { hasAccess: true, isAdmin: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error checking admin access:', error);
    return NextResponse.json(
      { hasAccess: false, isAdmin: false, error: String(error) },
      { status: 500 }
    );
  }
}
