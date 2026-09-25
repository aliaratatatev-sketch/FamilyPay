/**
 * Telegram Bot API для отправки кодов верификации
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ Telegram credentials not configured');
    return false;
  }

  try {
    const message: TelegramMessage = {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
    };

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      }
    );

    const data = await response.json();
    
    if (!data.ok) {
      console.error('❌ Telegram API error:', data);
      return false;
    }

    console.log('✅ Telegram message sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send Telegram message:', error);
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendAdminVerificationCode(
  email: string,
  code: string
): Promise<boolean> {
  const message = `
🔐 <b>Код доступа к админ-панели</b>

Email: <code>${email}</code>
Код: <code>${code}</code>

⏰ Код действителен 5 минут
  `.trim();

  return sendTelegramMessage(message);
}
