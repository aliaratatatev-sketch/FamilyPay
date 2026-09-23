# 🔐 Настройка двухфакторной аутентификации через Telegram

## Обзор
Система использует Telegram бот для отправки 6-значных кодов верификации при входе в админ-панель.

## Шаг 1: Получение токена бота

1. Откройте Telegram и найдите бота [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя бота (например: "FamilyPay Admin")
   - Введите username бота (например: "familypay_admin_bot")
4. Получите токен бота (выглядит как: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Шаг 2: Получение Chat ID

### Вариант 1: Через скрипт бота
1. Добавьте токен бота в `.env` файл:
   ```env
   TELEGRAM_BOT_TOKEN="ваш_токен_бота"
   ```

2. Запустите бота:
   ```bash
   npm run telegram:bot
   ```

3. Найдите своего бота в Telegram и отправьте команду `/start`
4. Бот отправит вам ваш Chat ID
5. Скопируйте Chat ID

### Вариант 2: Вручную
1. Отправьте любое сообщение вашему боту
2. Откройте в браузере: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
3. Найдите значение `"chat":{"id":123456789}`
4. Это ваш Chat ID

## Шаг 3: Настройка переменных окружения

Откройте файл `.env` и заполните:

```env
# Telegram Bot для 2FA
TELEGRAM_BOT_TOKEN="ваш_токен_бота_от_BotFather"
TELEGRAM_CHAT_ID="ваш_chat_id"
```

**Пример:**
```env
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="987654321"
```

## Шаг 4: Запуск системы

### Запуск Telegram бота (в отдельном терминале):
```bash
npm run telegram:bot
```

### Запуск Next.js приложения:
```bash
npm run dev
```

## Шаг 5: Тестирование

1. Откройте браузер: `http://localhost:3000/login`
2. Введите учетные данные:
   - **Логин:** `admin`
   - **Пароль:** `admin123`
3. Нажмите "Продолжить"
4. Проверьте Telegram - вы получите 6-значный код
5. Введите код на странице входа
6. Вы будете перенаправлены в админ-панель

## 🔧 Настройка учетных данных

Для изменения логина и пароля отредактируйте файл:
`app/api/auth/send-code/route.ts`

```typescript
const ADMIN_CREDENTIALS = {
  username: 'ваш_логин',
  password: 'ваш_пароль', // Используйте хеширование в продакшене!
};
```

**⚠️ ВАЖНО:** В продакшене используйте безопасное хранение паролей (bcrypt, argon2).

## 📱 Команды бота

- `/start` - Начать работу и получить Chat ID
- `/help` - Показать справку
- `/chatid` - Получить ваш Chat ID

## 🔒 Безопасность

### Рекомендации для production:
1. **Хеширование паролей:** Используйте bcrypt или argon2
2. **HTTPS:** Обязательно используйте HTTPS в продакшене
3. **Rate limiting:** Добавьте ограничение на количество попыток входа
4. **Логирование:** Логируйте все попытки входа
5. **Webhook вместо polling:** Используйте webhook для Telegram бота в продакшене

### Пример с bcrypt:
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

```typescript
import bcrypt from 'bcrypt';

// Хеширование пароля
const hashedPassword = await bcrypt.hash('admin123', 10);

// Проверка пароля
const isValid = await bcrypt.compare(password, hashedPassword);
```

## 🐛 Troubleshooting

### Бот не отправляет сообщения:
1. Проверьте, что токен правильный
2. Убедитесь, что вы отправили `/start` боту
3. Проверьте Chat ID
4. Проверьте логи в консоли

### Ошибка "TELEGRAM_BOT_TOKEN не установлен":
1. Проверьте файл `.env`
2. Перезапустите сервер после изменения `.env`
3. Убедитесь, что файл `.env` в корне проекта

### Код не принимается:
1. Проверьте, что код не истек (действует 5 минут)
2. Проверьте, что код не был использован ранее
3. Проверьте подключение к базе данных

## 📊 База данных

Коды верификации хранятся в таблице `admin_verification_codes`:
- `code` - 6-значный код
- `username` - имя пользователя
- `chatId` - ID чата Telegram
- `expires` - время истечения (5 минут)
- `used` - флаг использования

## 🚀 Дальнейшие улучшения

1. Добавить поддержку нескольких администраторов
2. Интеграция с базой пользователей
3. История входов
4. Уведомления о подозрительной активности
5. Настройка времени жизни кода
6. Backup коды на случай недоступности Telegram

## 📝 Структура файлов

```
familypay/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── send-code/route.ts    # Отправка кода
│   │       ├── verify-code/route.ts  # Проверка кода
│   │       └── logout/route.ts       # Выход
│   └── login/
│       └── page.tsx                  # Страница входа
├── lib/
│   └── telegram.ts                   # Telegram функции
├── middleware.ts                     # Защита роутов
└── telegram-bot.js                   # Telegram бот
```

## 💡 Примеры использования

### Получение кода программно:
```typescript
const response = await fetch('/api/auth/send-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    username: 'admin', 
    password: 'admin123' 
  }),
});
```

### Проверка кода:
```typescript
const response = await fetch('/api/auth/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: '123456' }),
});
```

---

**Готово!** Теперь ваша админ-панель защищена двухфакторной аутентификацией через Telegram! 🎉
