# 💰 FamilyPay

**Приложение для управления семейными финансами**

Современное веб-приложение для учёта доходов и расходов, планирования бюджета и достижения финансовых целей всей семьёй.

---

## ✨ Возможности

- 👨‍👩‍👧‍👦 **Семейный доступ** - приглашайте членов семьи с разными ролями доступа
- 💳 **Множество счетов** - наличные, карты, накопления, инвестиции
- 📊 **Учёт транзакций** - доходы, расходы, переводы между счетами
- 🎯 **Бюджеты** - планируйте расходы по категориям с умными уведомлениями
- 🏆 **Финансовые цели** - копите на отпуск, авто, образование
- 🔄 **Повторяющиеся операции** - автоматизируйте зарплату и регулярные платежи
- 📈 **Аналитика и отчёты** - визуализация расходов и доходов
- 🔔 **Уведомления** - контроль за превышением бюджета и достижением целей
- 🤖 **AI-помощник** - умный анализ расходов и советы по бюджету (Ollama Mistral 7B, локально)

### 🤖 AI-Возможности

FamilyPay интегрирован с **Ollama Mistral 7B** — локальной AI-моделью, которая работает на вашем компьютере:

1. **AI-Чат Ассистент** (`/dashboard/ai-assistant`)
   - Полноценный чат с семейным финансовым советником
   - Ролевые промпты для родителей и детей
   - История разговоров (6 последних сообщений)

2. **AI-Рекомендации для родителей** (`/dashboard/manage-requests`)
   - Анализ запросов денег от детей
   - Рекомендации: одобрить / частично / отклонить
   - Учёт баланса семьи и категории трат

3. **AI-Оценка для детей** (`/dashboard/money-requests`)
   - Автоматическая оценка при создании запроса
   - Предсказание категории и шанса одобрения
   - Советы, как увеличить шансы

4. **AI-Инсайт дня** (`/dashboard`)
   - Ежедневный умный совет на главной странице
   - Анализ текущих трат и баланса
   - Рекомендации по оптимизации бюджета

**✨ Особенности:**
- 🔒 Работает локально — данные не уходят в интернет
- 💰 Бесплатно — не нужны API ключи
- 🇰🇬 Адаптирован для Кыргызстана (сомы, без банковской терминологии)
- ⚡ Быстрые ответы (1-3 секунды)
- 🛡️ Fallback на правила, если Ollama недоступен

**📚 Подробная документация AI:**
- 🚀 [Быстрый старт](./AI-QUICKSTART.md) - запуск за 3 минуты
- 📖 [Обзор функций](./AI-FEATURES-SUMMARY.md) - все AI-фичи
- 🧪 [Тестовые промпты](./AI-TEST-PROMPTS.md) - примеры для тестирования
- 🛠️ [Гайд для разработчиков](./AI-DEVELOPMENT-GUIDE.md) - как добавить новую фичу
- ✅ [Итоги интеграции](./AI-INTEGRATION-COMPLETE.md) - полная сводка проекта

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Подробная инструкция в [DATABASE_SETUP.md](./DATABASE_SETUP.md)

Кратко:
```bash
# Создайте .env файл
cp .env.example .env

# Запустите PostgreSQL (Docker)
docker run --name familypay-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=familypay -p 5432:5432 -d postgres:16

# Примените схему БД
npm run db:push

# Заполните начальными данными
npm run db:seed
```

### 3. Настройка AI (опционально)

Для работы AI-помощника нужен **Ollama**:

```bash
# Установите Ollama (Windows/Mac/Linux)
# https://ollama.com/download

# Скачайте модель Mistral
ollama pull mistral:latest

# Запустите Ollama
ollama serve
```

AI-функции будут работать автоматически. Если Ollama не запущен — включится fallback режим.

**Подробнее:** [AI-QUICKSTART.md](./AI-QUICKSTART.md)

### 4. Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

**📱 Для просмотра на мобильном устройстве:**
- При запуске `npm run dev` появится QR-код в терминале
- Отсканируйте его телефоном (телефон и ПК должны быть в одной WiFi сети)
- Приложение откроется в браузере телефона автоматически

Подробнее: [DEV-MOBILE.md](./DEV-MOBILE.md)

---

## 📚 Документация

### База данных
- 📖 [Схема базы данных](./Схема%20БД.md) - полная документация БД
- 🗃️ [Визуальная схема](./prisma/VISUAL_SCHEMA.txt) - текстовое представление таблиц
- 📋 [Обзор схемы](./prisma/SCHEMA_OVERVIEW.md) - краткая справка
- 🔧 [Полезные SQL-запросы](./prisma/useful_queries.sql) - готовые запросы
- 🛠️ [Настройка БД](./DATABASE_SETUP.md) - пошаговая инструкция

### AI-Интеграция
- 🚀 [Быстрый старт AI](./AI-QUICKSTART.md) - запуск за 3 минуты
- 📖 [Обзор AI-функций](./AI-FEATURES-SUMMARY.md) - все фичи и API
- 🧪 [Тестовые промпты](./AI-TEST-PROMPTS.md) - примеры для проверки
- 🛠️ [Гайд разработчика](./AI-DEVELOPMENT-GUIDE.md) - как добавить AI
- ✅ [Итоги интеграции](./AI-INTEGRATION-COMPLETE.md) - полная сводка

### Адаптивный дизайн
- 📱 [Руководство по адаптивности](./RESPONSIVE-GUIDE.md) - полное руководство
- ✅ [Checklist адаптивности](./RESPONSIVE-CHECKLIST.md) - проверка перед релизом
- 🎨 [Готовые сниппеты](./RESPONSIVE-SNIPPET.md) - копируй и используй
- 📱 [Мобильное тестирование](./DEV-MOBILE.md) - настройка QR-кода
- 🚀 [Быстрый старт](./MOBILE-TESTING-QUICKSTART.md) - 3 шага до тестирования

### Разное
- 🤖 [AI-помощник](./AI-QUICKSTART.md) - интеграция с Ollama Mistral
- 🧪 **Тестовая страница адаптивности** - `/test-responsive`

---

## 🛠️ Технологии

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **AI:** Ollama Mistral 7B (локально)
- **Deployment:** Vercel (готовится)

---

## 📦 Команды

### Разработка

```bash
npm run dev          # Запуск dev-сервера с QR-кодом для мобильных
npm run dev:clean    # Запуск dev-сервера без QR-кода
npm run qr           # Показать QR-код (если сервер уже запущен)
npm run build        # Сборка для production
npm run start        # Запуск production сервера
npm run lint         # Проверка кода
```

### AI

```bash
ollama serve         # Запуск Ollama (для AI-функций)
ollama list          # Список установленных моделей
ollama pull mistral  # Скачать модель Mistral 7B
```

### База данных

```bash
npm run db:generate  # Генерация Prisma Client
npm run db:push      # Применение схемы (без миграций)
npm run db:migrate   # Создание миграции
npm run db:studio    # Открыть Prisma Studio
npm run db:seed      # Заполнить начальными данными
```

---

## 🗂️ Структура проекта

```
familypay/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai/            # AI-endpoints (chat, analyze, evaluate, insight)
│   │   ├── families/      # Управление семьями
│   │   └── transactions/  # Транзакции
│   ├── dashboard/         # Страницы dashboard (с AI)
│   ├── layout.tsx         # Основной layout
│   └── page.tsx           # Главная страница
├── lib/                   # Утилиты и хелперы
│   ├── ai/               # AI-утилиты (Ollama)
│   ├── prisma.ts         # Prisma Client singleton
│   └── types.ts          # TypeScript типы
├── prisma/               # База данных
│   ├── schema.prisma     # Схема БД
│   ├── seed.ts           # Начальные данные
│   └── *.md              # Документация
├── public/               # Статические файлы
├── AI-*.md               # AI-документация (5 файлов)
└── .env                  # Переменные окружения
```

---

## 🎨 Скриншоты

_Coming soon..._

---

## 🗺️ Roadmap

- [x] Схема базы данных
- [x] API для семей и транзакций
- [x] 🤖 AI-помощник для анализа расходов (Ollama Mistral - локальный)
- [x] 🤖 AI-чат ассистент с ролевыми промптами
- [x] 🤖 AI-рекомендации для родителей
- [x] 🤖 AI-оценка запросов для детей
- [x] 🤖 AI-инсайты на главной странице
- [x] Аутентификация (NextAuth.js)
- [x] UI компоненты (Dashboard, транзакции, бюджеты)
- [ ] Графики и аналитика
- [ ] Мобильная версия (адаптивный дизайн)
- [ ] PWA поддержка
- [ ] Экспорт данных (CSV, PDF)
- [ ] Интеграция с банками (Open Banking API)
- [ ] 🤖 AI: кэширование популярных инсайтов
- [ ] 🤖 AI: multilingual support (KG, EN)

---

## 🤝 Контрибьюция

Проект находится в разработке. Контрибьюции приветствуются!

---

## 📄 Лицензия

MIT

---

## 💡 О проекте

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
