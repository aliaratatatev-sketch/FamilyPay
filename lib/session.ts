import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

/**
 * Получить текущую сессию пользователя на сервере
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Получить ID текущего пользователя
 * Бросает ошибку если пользователь не авторизован
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  return session.user.id;
}

/**
 * Получить данные текущего пользователя
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}
