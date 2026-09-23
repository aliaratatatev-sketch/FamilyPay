// Простой скрипт для получения Chat ID
const https = require('https');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен в .env файле!');
  console.error('📝 Добавьте в .env: TELEGRAM_BOT_TOKEN="ваш_токен"');
  process.exit(1);
}

console.log('🤖 Инструкция:');
console.log('1. Откройте Telegram');
console.log(`2. Найдите своего бота (поиск по токену или имени)`);
console.log('3. Отправьте боту любое сообщение');
console.log('4. Этот скрипт покажет ваш Chat ID');
console.log('\n⏳ Ожидаю сообщения от вас...\n');

// Проверяем обновления каждые 2 секунды
let offset = 0;

function checkUpdates() {
  const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=10`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        
        if (!json.ok) {
          console.error('❌ Ошибка:', json.description);
          if (json.description && json.description.includes('token')) {
            console.error('Проверьте правильность TELEGRAM_BOT_TOKEN');
          }
          process.exit(1);
        }
        
        if (json.result && json.result.length > 0) {
          json.result.forEach((update) => {
            if (update.message) {
              const chatId = update.message.chat.id;
              const username = update.message.from.username || update.message.from.first_name;
              
              console.log('\n✅ Сообщение получено!');
              console.log(`👤 От: ${username}`);
              console.log(`📋 Chat ID: ${chatId}`);
              console.log(`\n📝 Добавьте в .env файл:\nTELEGRAM_CHAT_ID="${chatId}"\n`);
              
              // Отправляем приветственное сообщение
              sendMessage(chatId, 
                `🔐 Добро пожаловать в FamilyPay Admin Bot!\n\n` +
                `Ваш Chat ID: ${chatId}\n\n` +
                `Добавьте этот ID в .env файл:\n` +
                `TELEGRAM_CHAT_ID="${chatId}"\n\n` +
                `После настройки вы будете получать коды доступа в этот чат.`
              );
              
              offset = update.update_id + 1;
            }
          });
        }
      } catch (error) {
        console.error('❌ Ошибка парсинга:', error.message);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Ошибка соединения:', error.message);
  });
}

function sendMessage(chatId, text) {
  const data = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Приветственное сообщение отправлено в Telegram');
    }
  });
  
  req.on('error', (error) => {
    console.error('❌ Ошибка отправки сообщения:', error.message);
  });
  
  req.write(data);
  req.end();
}

// Проверяем каждые 2 секунды
const interval = setInterval(checkUpdates, 2000);

// Первая проверка сразу
checkUpdates();

// Останавливаем через 5 минут
setTimeout(() => {
  clearInterval(interval);
  console.log('\n⏱️  Время ожидания истекло. Перезапустите скрипт при необходимости.');
  process.exit(0);
}, 300000);
