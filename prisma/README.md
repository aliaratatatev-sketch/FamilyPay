# Работа с базой данных Prisma

## Установка

```bash
npm install
```

## Настройка базы данных

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Отредактируйте `DATABASE_URL` в файле `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/familypay?schema=public"
```

## Команды

### Генерация Prisma Client
```bash
npm run db:generate
```

### Применение схемы к БД (без миграций, для разработки)
```bash
npm run db:push
```

### Создание и применение миграции
```bash
npm run db:migrate
```

### Заполнение БД начальными данными
```bash
npm run db:seed
```

### Открытие Prisma Studio (GUI для БД)
```bash
npm run db:studio
```

## Рабочий процесс

### Первоначальная настройка

1. Установите PostgreSQL локально или используйте Docker:
```bash
docker run --name familypay-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=familypay -p 5432:5432 -d postgres:16
```

2. Примените схему:
```bash
npm run db:push
```

3. Заполните начальными данными:
```bash
npm run db:seed
```

4. Откройте Prisma Studio для проверки:
```bash
npm run db:studio
```

### Изменение схемы

1. Отредактируйте `prisma/schema.prisma`

2. Создайте миграцию:
```bash
npm run db:migrate
```

3. Prisma Client будет обновлён автоматически

### Использование в коде

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Пример: Получить все семьи пользователя
const families = await prisma.family.findMany({
  where: {
    members: {
      some: {
        userId: userId
      }
    }
  },
  include: {
    members: true,
    accounts: true
  }
});
```

## Docker Compose (опционально)

Создайте `docker-compose.yml` в корне проекта:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: familypay
      POSTGRES_PASSWORD: password
      POSTGRES_DB: familypay
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Запуск:
```bash
docker-compose up -d
```

## Полезные ссылки

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
