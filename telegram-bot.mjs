import { createRequire } from 'module';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен в .env файле!');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram бот запущен и ожидает команд...');

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    `🔐 *Добро пожаловать в FamilyPay Admin Bot!*\n\n` +
    `Этот бот используется для двухфакторной аутентификации.\n\n` +
    `📋 Ваш Chat ID: \`${chatId}\`\n\n` +
    `Скопируйте этот ID и добавьте в .env файл:\n` +
    `\`TELEGRAM_CHAT_ID="${chatId}"\`\n\n` +
    `После настройки вы будете получать коды доступа в этот чат.`,
    { parse_mode: 'Markdown' }
  );
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    `📖 *Справка по боту FamilyPay*\n\n` +
    `*Доступные команды:*\n` +
    `/start - Начать работу и получить Chat ID\n` +
    `/help - Показать эту справку\n` +
    `/chatid - Получить ваш Chat ID\n\n` +
    `Этот бот автоматически отправляет коды верификации для входа в админ-панель.`,
    { parse_mode: 'Markdown' }
  );
});

// Команда /chatid
bot.onText(/\/chatid/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    `📋 Ваш Chat ID: \`${chatId}\`\n\nИспользуйте его в .env файле.`,
    { parse_mode: 'Markdown' }
  );
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

// Обработка всех остальных сообщений
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Пропускаем команды
  if (text && text.startsWith('/')) {
    return;
  }
  
  // Отвечаем на обычные сообщения
  if (text) {
    bot.sendMessage(
      chatId,
      '👋 Я бот для двухфакторной аутентификации FamilyPay.\n\n' +
      'Используйте команду /help для получения справки.'
    );
  }
});

console.log('✅ Бот готов к работе!');
console.log('📝 Отправьте команду /start боту для получения Chat ID');
