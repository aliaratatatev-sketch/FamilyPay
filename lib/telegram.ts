// Используем встроенный fetch для отправки сообщений в Telegram
export async function sendTelegramCode(chatId: string, code: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN не установлен в .env');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔐 Ваш код доступа к админ-панели FamilyPay:\n\n<b>${code}</b>\n\nКод действителен 5 минут.`,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      console.error('Ошибка Telegram API:', data);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка отправки сообщения в Telegram:', error);
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
