# 🚀 Быстрый старт с базой данных

## Шаг 1: Установка PostgreSQL

### Вариант А: Docker (рекомендуется)

```bash
docker run --name familypay-db \
  -e POSTGRES_USER=familypay \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=familypay \
  -p 5432:5432 \
  -d postgres:16
```

### Вариант Б: Локальная установка

Скачайте и установите PostgreSQL с [официального сайта](https://www.postgresql.org/download/)

## Шаг 2: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
DATABASE_URL="postgresql://familypay:your_password@localhost:5432/familypay?schema=public"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Сгенерируйте секретный ключ:
```bash
openssl rand -base64 32
```

## Шаг 3: Установка зависимостей

```bash
npm install
```

## Шаг 4: Применение схемы БД

```bash
npm run db:push
```

Эта команда:
- Создаст все таблицы в БД
- Сгенерирует Prisma Client

## Шаг 5: Заполнение начальными данными

```bash
npm run db:seed
```

Эта команда создаст:
- 15 системных категорий расходов
- 6 системных категорий доходов

## Шаг 6: Проверка

Откройте Prisma Studio для просмотра БД:

```bash
npm run db:studio
```

Откроется браузер на `http://localhost:5555`

## Шаг 7: Запуск приложения

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

---

## 📊 Prisma Studio

Prisma Studio - это GUI для работы с базой данных:

```bash
npm run db:studio
```

Возможности:
- ✅ Просмотр всех таблиц
- ✅ Добавление/редактирование/удаление записей
- ✅ Фильтрация и сортировка
- ✅ Просмотр связей между таблицами

---

## 🔄 Миграции

### Создание новой миграции

После изменения `prisma/schema.prisma`:

```bash
npm run db:migrate
```

Prisma попросит дать название миграции (например: "add_user_avatar")

### Применение миграций в production

```bash
npx prisma migrate deploy
```

---

## 🛠 Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run db:generate` | Генерация Prisma Client |
| `npm run db:push` | Применение схемы без миграций (для разработки) |
| `npm run db:migrate` | Создание и применение миграции |
| `npm run db:studio` | Открыть Prisma Studio |
| `npm run db:seed` | Заполнить БД начальными данными |
| `npx prisma db pull` | Обновить схему из существующей БД |
| `npx prisma format` | Форматировать schema.prisma |
| `npx prisma validate` | Проверить schema.prisma на ошибки |

---

## 🐛 Устранение проблем

### Ошибка подключения к БД

```
Error: P1001: Can't reach database server
```

**Решение:**
1. Проверьте, что PostgreSQL запущен
2. Проверьте `DATABASE_URL` в `.env`
3. Убедитесь, что порт 5432 свободен

### Prisma Client не найден

```
Error: Cannot find module '@prisma/client'
```

**Решение:**
```bash
npm install
npm run db:generate
```

### Таблицы не созданы

**Решение:**
```bash
npm run db:push
```

### Сброс базы данных (удалит все данные!)

```bash
npx prisma migrate reset
npm run db:seed
```

---

## 📚 Дополнительные ресурсы

- [Полная схема БД](./Схема%20БД.md)
- [Документация Prisma](https://www.prisma.io/docs)
- [PostgreSQL документация](https://www.postgresql.org/docs/)
- [Next.js + Prisma гайд](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)

---

## ✅ Готово!

Теперь у вас есть:
- ✅ PostgreSQL база данных
- ✅ Полная схема таблиц
- ✅ Системные категории
- ✅ Prisma Client для работы с БД
- ✅ Инструменты для разработки

Можете начинать разработку! 🎉
