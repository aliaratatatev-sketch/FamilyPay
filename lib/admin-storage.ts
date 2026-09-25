/**
 * Глобальное хранилище для кодов верификации и токенов доступа админ-панели
 * Использует in-memory Map для development
 * В production рекомендуется использовать Redis
 */

interface VerificationData {
  code: string;
  expiresAt: number;
}

interface AccessTokenData {
  expiresAt: number;
}

// Глобальное хранилище кодов верификации
// email -> { code, expiresAt }
const verificationCodes = new Map<string, VerificationData>();

// Глобальное хранилище токенов доступа
// email -> { expiresAt }
const adminAccessTokens = new Map<string, AccessTokenData>();

/**
 * Сохранить код верификации
 */
export function saveVerificationCode(
  email: string,
  code: string,
  expiresAt: number
): void {
  verificationCodes.set(email, { code, expiresAt });
  console.log(`💾 Saved verification code for ${email}, expires at ${new Date(expiresAt).toLocaleTimeString()}`);
}

/**
 * Получить код верификации
 */
export function getVerificationCode(
  email: string
): VerificationData | undefined {
  return verificationCodes.get(email);
}

/**
 * Удалить код верификации
 */
export function deleteVerificationCode(email: string): void {
  verificationCodes.delete(email);
  console.log(`🗑️ Deleted verification code for ${email}`);
}

/**
 * Сохранить токен доступа
 */
export function saveAccessToken(email: string, expiresAt: number): void {
  adminAccessTokens.set(email, { expiresAt });
  console.log(`💾 Saved access token for ${email}`);
}

/**
 * Проверить токен доступа
 */
export function hasValidAccessToken(email: string): boolean {
  const data = adminAccessTokens.get(email);

  if (!data) {
    return false;
  }

  if (data.expiresAt < Date.now()) {
    adminAccessTokens.delete(email);
    return false;
  }

  return true;
}

/**
 * Удалить токен доступа
 */
export function deleteAccessToken(email: string): void {
  adminAccessTokens.delete(email);
  console.log(`🗑️ Deleted access token for ${email}`);
}

/**
 * Очистить истекшие коды
 */
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [email, data] of verificationCodes.entries()) {
    if (data.expiresAt < now) {
      verificationCodes.delete(email);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired verification codes`);
  }
}

/**
 * Получить статистику хранилища (для отладки)
 */
export function getStorageStats() {
  return {
    verificationCodes: verificationCodes.size,
    accessTokens: adminAccessTokens.size,
  };
}
