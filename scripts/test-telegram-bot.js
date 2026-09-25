/**
 * Тестовый скрипт для проверки работы Telegram бота
 * 
 * Использование:
 * node scripts/test-telegram-bot.js
 */

require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function testBot() {
  console.log('🤖 Тестирование Telegram бота...\n');

  // 1. Проверка переменных окружения
  console.log('1️⃣ Проверка переменных окружения:');
  
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('   ❌ TELEGRAM_BOT_TOKEN не найден в .env');
    process.exit(1);
  }
  console.log('   ✅ TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN.substring(0, 10) + '...');

  if (!TELEGRAM_CHAT_ID) {
    console.error('   ❌ TELEGRAM_CHAT_ID не найден в .env');
    process.exit(1);
  }
  console.log('   ✅ TELEGRAM_CHAT_ID:', TELEGRAM_CHAT_ID);
  console.log('');

  // 2. Проверка бота
  console.log('2️⃣ Проверка бота:');
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );
    const data = await response.json();

    if (!data.ok) {
      console.error('   ❌ Бот не найден:', data);
      process.exit(1);
    }

    console.log('   ✅ Бот активен');
    console.log('   📛 Имя:', data.result.first_name);
    console.log('   🔗 Username:', '@' + data.result.username);
    console.log('   🆔 ID:', data.result.id);
  } catch (error) {
    console.error('   ❌ Ошибка при проверке бота:', error.message);
    process.exit(1);
  }
  console.log('');

  // 3. Отправка тестового сообщения
  console.log('3️⃣ Отправка тестового сообщения:');
  try {
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `
🧪 <b>Тестовое сообщение</b>

Это тестовое сообщение для проверки бота.

Тестовый код: <code>${testCode}</code>

Если вы видите это сообщение, бот настроен правильно! ✅
    `.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('   ❌ Ошибка при отправке сообщения:', data);
      process.exit(1);
    }

    console.log('   ✅ Сообщение отправлено!');
    console.log('   📩 Message ID:', data.result.message_id);
    console.log('   📅 Дата:', new Date(data.result.date * 1000).toLocaleString('ru-RU'));
  } catch (error) {
    console.error('   ❌ Ошибка при отправке сообщения:', error.message);
    process.exit(1);
  }
  console.log('');

  // 4. Проверка доступа к чату
  console.log('4️⃣ Проверка доступа к чату:');
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('   ❌ Чат не найден:', data);
      console.log('\n   💡 Совет: Убедитесь, что вы:');
      console.log('      1. Запустили бота командой /start');
      console.log('      2. Отправили хотя бы одно сообщение боту');
      console.log('      3. Используете правильный TELEGRAM_CHAT_ID');
      process.exit(1);
    }

    console.log('   ✅ Доступ к чату есть');
    console.log('   👤 Тип чата:', data.result.type);
    
    if (data.result.first_name) {
      console.log('   📛 Имя:', data.result.first_name, data.result.last_name || '');
    }
    
    if (data.result.username) {
      console.log('   🔗 Username:', '@' + data.result.username);
    }
  } catch (error) {
    console.error('   ❌ Ошибка при проверке чата:', error.message);
    process.exit(1);
  }
  console.log('');

  // Итог
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ Все проверки пройдены успешно!');
  console.log('');
  console.log('🎉 Telegram бот настроен правильно и готов к работе.');
  console.log('');
  console.log('💡 Следующие шаги:');
  console.log('   1. Запустите приложение: npm run dev');
  console.log('   2. Войдите в аккаунт с email администратора');
  console.log('   3. Нажмите "🔐 Админ-панель" на Dashboard');
  console.log('   4. Введите код из Telegram');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testBot().catch((error) => {
  console.error('\n❌ Неожиданная ошибка:', error);
  process.exit(1);
});
