# Быстрый старт: Доступ к админ-панели

## 🚀 Краткая инструкция

### 1. Настройте Telegram бота (один раз)

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Сохраните токен бота
4. Запустите вашего бота и отправьте ему любое сообщение

### 2. Получите Chat ID (один раз)

```bash
node scripts/get-telegram-chat-id.js
```

Или откройте в браузере:
```
https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
```

### 3. Обновите .env

```env
TELEGRAM_BOT_TOKEN="ваш-токен-бота"
TELEGRAM_CHAT_ID="ваш-chat-id"
```

### 4. Добавьте администраторов

Отредактируйте `lib/admin-config.ts`:
```typescript
export const ADMIN_EMAILS = [
  'aliaratatatev@gmail.com',
  'your-email@example.com',  // Добавьте свой email
];
```

И `middleware.ts`:
```typescript
const ADMIN_EMAILS = [
  'aliaratatatev@gmail.com',
  'your-email@example.com',  // Добавьте свой email
];
```

### 5. Готово! 🎉

Теперь:
1. Войдите в аккаунт с email администратора
2. На Dashboard появится кнопка **"🔐 Админ-панель"**
3. Нажмите на неё
4. Введите код из Telegram
5. Вы в админ-панели!

## 📝 Использование

### Первый вход
- Нажмите "🔐 Админ-панель" в Dashboard
- Код автоматически отправится в Telegram
- Введите 6-значный код
- Готово!

### Последующие входы
При каждом входе в админ-панель потребуется новый код из Telegram.

### Выход
В админ-панели (левое меню внизу):
- **🚪 Выйти из админ-панели** — вернуться в Dashboard
- **Выйти** — полный выход из аккаунта

## ⚙️ Настройки

### Изменить время действия кода
В `lib/admin-config.ts`:
```typescript
export const VERIFICATION_CODE_EXPIRY = 5 * 60 * 1000; // 5 минут
```

### Добавить нескольких администраторов
Просто добавьте email в массив `ADMIN_EMAILS` в двух файлах:
- `lib/admin-config.ts`
- `middleware.ts`

## 🔍 Проверка работы

### Проверьте, что бот работает:
```bash
curl "https://api.telegram.org/bot<ВАШ_ТОКЕН>/getMe"
```

Должен вернуть информацию о боте.

### Проверьте, что вы в списке администраторов:
Откройте `lib/admin-config.ts` и убедитесь, что ваш email там есть.

### Проверьте переменные окружения:
```bash
# В PowerShell
echo $env:TELEGRAM_BOT_TOKEN
echo $env:TELEGRAM_CHAT_ID
```

## 🆘 Помощь

**Код не приходит?**
- Проверьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
- Убедитесь, что бот запущен (/start)
- Проверьте логи сервера

**"Access denied"?**
- Ваш email должен быть в ADMIN_EMAILS
- Проверьте регистр букв

**"Invalid code"?**
- Код действителен 5 минут
- Запросите новый код

## 📚 Подробная документация

Смотрите [ADMIN_ACCESS.md](./ADMIN_ACCESS.md) для полной документации.

---

**Текущий администратор:** aliaratatatev@gmail.com
