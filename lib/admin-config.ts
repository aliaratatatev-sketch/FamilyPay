/**
 * Конфигурация администраторов
 * Список email-адресов с доступом к админ-панели
 */

export const ADMIN_EMAILS = [
  'aliaratatatev@gmail.com',
  // Добавьте другие email администраторов здесь
];

/**
 * Проверяет, является ли email администратором
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    console.log('⚠️ isAdminEmail: email is null or undefined');
    return false;
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  const isAdmin = ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(normalizedEmail);
  
  console.log('🔍 isAdminEmail check:', {
    originalEmail: email,
    normalizedEmail,
    adminEmails: ADMIN_EMAILS,
    result: isAdmin
  });
  
  return isAdmin;
}

/**
 * Время жизни кода верификации в миллисекундах (5 минут)
 */
export const VERIFICATION_CODE_EXPIRY = 5 * 60 * 1000;

/**
 * Время жизни токена доступа к админ-панели (1 час)
 * После истечения этого времени потребуется новый код из Telegram
 */
export const ACCESS_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 час
