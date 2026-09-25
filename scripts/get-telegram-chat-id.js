/**
 * Скрипт для получения Chat ID в Telegram
 * 
 * Использование:
 * 1. Создайте бота через @BotFather и получите токен
 * 2. Запустите бота в Telegram и отправьте ему любое сообщение
 * 3. Установите TELEGRAM_BOT_TOKEN в .env
 * 4. Запустите: node scripts/get-telegram-chat-id.js
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function getChatId() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in .env');
    console.log('Пожалуйста, добавьте TELEGRAM_BOT_TOKEN в .env файл');
    process.exit(1);
  }

  try {
    console.log('🔍 Получение последних обновлений...\n');
    
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`
    );
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('❌ Ошибка Telegram API:', data);
      process.exit(1);
    }
    
    if (!data.result || data.result.length === 0) {
      console.log('⚠️  Обновления не найдены');
      console.log('\nИнструкции:');
      console.log('1. Найдите вашего бота в Telegram');
      console.log('2. Запустите бота командой /start');
      console.log('3. Отправьте любое сообщение боту');
      console.log('4. Запустите этот скрипт снова\n');
      process.exit(0);
    }
    
    console.log('✅ Найдены следующие чаты:\n');
    
    const chats = new Map();
    
    data.result.forEach((update) => {
      const chat = update.message?.chat;
      if (chat && !chats.has(chat.id)) {
        chats.set(chat.id, chat);
        
        console.log('📱 Chat ID:', chat.id);
        console.log('   Тип:', chat.type);
        
        if (chat.username) {
          console.log('   Username:', '@' + chat.username);
        }
        
        if (chat.first_name || chat.last_name) {
          console.log('   Имя:', [chat.first_name, chat.last_name].filter(Boolean).join(' '));
        }
        
        if (chat.title) {
          console.log('   Название:', chat.title);
        }
        
        console.log('');
      }
    });
    
    console.log('💡 Добавьте один из Chat ID в .env файл:');
    console.log('TELEGRAM_CHAT_ID="your-chat-id-here"\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Загружаем .env
try {
  require('dotenv').config();
} catch (error) {
  // dotenv не установлен, ничего страшного
}

getChatId();
