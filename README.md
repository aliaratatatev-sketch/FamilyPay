# FamilyPay - Система управления семейными финансами

Веб-приложение для управления финансами семьи с поддержкой нескольких языков (Русский, Кыргызский, English).

## Основные возможности

- 👨‍👩‍👧‍👦 **Управление семьями** - создание и управление несколькими семьями
- 💳 **Счета и транзакции** - отслеживание счетов, доходов и расходов
- 📊 **Бюджеты** - установка и контроль бюджетов по категориям
- 🎯 **Финансовые цели** - постановка и достижение финансовых целей
- 🤖 **AI-ассистент** - интеллектуальный помощник на базе Groq AI
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- 🌍 **Мультиязычность** - Русский, Кыргызский, English

## Технологии

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: PostgreSQL
- **Аутентификация**: NextAuth.js
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Иконки**: Lucide React

## Установка и настройка

### 1. Клонирование репозитория

```bash
git clone https://github.com/aliaratatatev-sketch/FamilyPay.git
cd FamilyPay
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Затем отредактируйте `.env` и заполните следующие обязательные переменные:

#### База данных (обязательно)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/familypay?schema=public"
```

#### NextAuth (обязательно)
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="сгенерируйте-с-помощью-openssl-rand-base64-32"
```

#### Groq AI (обязательно для AI-ассистента)
Получите бесплатный API ключ на https://console.groq.com/
```env
GROQ_API_KEY="ваш-groq-api-ключ"
```

#### Email (опционально)
Для отправки уведомлений через Gmail:
```env
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="ваш-app-password"
MAIL_FROM="FamilyPay <your-email@gmail.com>"
```

#### Telegram Bot (опционально)
Для 2FA через Telegram:
```env
TELEGRAM_BOT_TOKEN="ваш-telegram-bot-token"
TELEGRAM_CHAT_ID="ваш-telegram-chat-id"
```

### 4. Настройка базы данных

```bash
# Создание миграций
npx prisma migrate dev

# Генерация Prisma Client
npx prisma generate
```

### 5. Запуск приложения

Режим разработки:
```bash
npm run dev
```

Продакшн сборка:
```bash
npm run build
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## Структура проекта

```
FamilyPay/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── dashboard/         # Страницы дашборда
│   ├── admin/             # Админ панель
│   └── i18n/              # Локализация
├── components/            # React компоненты
├── lib/                   # Утилиты и хелперы
├── prisma/               # Схема БД и миграции
├── public/               # Статические файлы
└── types/                # TypeScript типы
```

## Безопасность

⚠️ **ВАЖНО:**

1. **Никогда** не коммитьте файл `.env` в git
2. **Никогда** не публикуйте API ключи в коде или документации
3. Используйте сильные пароли для базы данных
4. Регулярно обновляйте зависимости: `npm audit fix`
5. Для продакшена используйте HTTPS и безопасное хранение секретов

## Деплой

### Vercel (рекомендуется)

1. Создайте проект на Vercel
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения в настройках проекта
4. Деплой произойдет автоматически

### Другие платформы

Приложение совместимо с любой платформой, поддерживающей Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## Документация API

API документация доступна в файле `FINIK_INTEGRATION_GUIDE.md` для интеграции платежной системы Finik.

## Лицензия

MIT License - свободное использование в коммерческих и некоммерческих проектах.

## Поддержка

Если у вас возникли вопросы или проблемы:
- Создайте Issue в GitHub
- Email: aliaratatatev@gmail.com

## Разработка

Для внесения вклада в проект:
1. Форкните репозиторий
2. Создайте ветку для фичи: `git checkout -b feature/amazing-feature`
3. Закоммитьте изменения: `git commit -m 'Add amazing feature'`
4. Отправьте в ветку: `git push origin feature/amazing-feature`
5. Откройте Pull Request

---

Сделано с ❤️ для семей
