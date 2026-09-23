// Простой скрипт для получения Chat ID через getUpdates
const https = require('https');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен в .env файле!');
  process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/getUpdates`;

console.log('🔍 Получаем последние обновления от бота...\n');

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
        console.log('\n📝 Инструкция:');
        console.log('1. Найдите своего бота в Telegram');
        console.log('2. Отправьте ему любое сообщение (например: /start)');
        console.log('3. Запустите этот скрипт снова');
        process.exit(1);
      }
      
      if (json.result && json.result.length > 0) {
        console.log('✅ Найдены сообщения:\n');
        
        const chatIds = new Set();
        json.result.forEach((update, index) => {
          if (update.message) {
            const chatId = update.message.chat.id;
            const username = update.message.from.username || update.message.from.first_name;
            const text = update.message.text || '(медиа)';
            
            chatIds.add(chatId);
            
            console.log(`[${index + 1}]`);
            console.log(`   От: ${username}`);
            console.log(`   Chat ID: ${chatId}`);
            console.log(`   Сообщение: ${text}`);
            console.log('');
          }
        });
        
        if (chatIds.size > 0) {
          const chatIdArray = Array.from(chatIds);
          console.log('📋 Ваш Chat ID:', chatIdArray[0]);
          console.log(`\n✏️  Добавьте в .env файл:\nTELEGRAM_CHAT_ID="${chatIdArray[0]}"\n`);
        }
      } else {
        console.log('⚠️  Нет новых сообщений');
        console.log('\n📝 Инструкция:');
        console.log('1. Найдите своего бота в Telegram через @BotFather');
        console.log('2. Откройте чат с вашим ботом');
        console.log('3. Отправьте любое сообщение (например: /start или "привет")');
        console.log('4. Запустите этот скрипт снова: npm run telegram:get-id');
      }
    } catch (error) {
      console.error('❌ Ошибка:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('❌ Ошибка соединения:', error.message);
});
