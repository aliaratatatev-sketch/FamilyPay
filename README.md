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
- 🤖 **AI-помощник** - умный анализ расходов (Ollama Mistral, локально, бесплатно)

### 🧪 Демо AI-помощника

Протестируйте AI-анализ расходов:
```
http://localhost:3000/demo-ai
```

**Локальный AI** (Ollama Mistral 7B) анализирует сумму, категорию, бюджет и дает умные рекомендации!  
Работает на вашем компьютере, без интернета, без API ключей.

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

### 3. Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## 📚 Документация

- 📖 [Схема базы данных](./Схема%20БД.md) - полная документация БД
- 🗃️ [Визуальная схема](./prisma/VISUAL_SCHEMA.txt) - текстовое представление таблиц
- 📋 [Обзор схемы](./prisma/SCHEMA_OVERVIEW.md) - краткая справка
- 🔧 [Полезные SQL-запросы](./prisma/useful_queries.sql) - готовые запросы
- 🛠️ [Настройка БД](./DATABASE_SETUP.md) - пошаговая инструкция
- 🤖 **AI-помощник** - работает из коробки, тестируйте на `/demo-ai`

---

## 🛠️ Технологии

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (готовится)
- **Deployment:** Vercel (готовится)

---

## 📦 Команды

### Разработка

```bash
npm run dev          # Запуск dev-сервера
npm run build        # Сборка для production
npm run start        # Запуск production сервера
npm run lint         # Проверка кода
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
│   │   ├── families/      # Управление семьями
│   │   └── transactions/  # Транзакции
│   ├── layout.tsx         # Основной layout
│   └── page.tsx           # Главная страница
├── lib/                   # Утилиты и хелперы
│   ├── prisma.ts         # Prisma Client singleton
│   └── types.ts          # TypeScript типы
├── prisma/               # База данных
│   ├── schema.prisma     # Схема БД
│   ├── seed.ts           # Начальные данные
│   └── *.md              # Документация
├── public/               # Статические файлы
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
- [ ] Аутентификация (NextAuth.js)
- [ ] UI компоненты (Dashboard, транзакции, бюджеты)
- [ ] Графики и аналитика
- [ ] Мобильная версия
- [ ] PWA поддержка
- [ ] Экспорт данных (CSV, PDF)
- [ ] Интеграция с банками (Open Banking API)

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
