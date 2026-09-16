# 🐘 Установка PostgreSQL на Windows

## Вариант 1: Установка PostgreSQL локально (Рекомендуется)

### Шаг 1: Скачать PostgreSQL

1. Перейдите на официальный сайт: https://www.postgresql.org/download/windows/
2. Нажмите "Download the installer"
3. Скачайте последнюю версию (PostgreSQL 16.x)

### Шаг 2: Установить PostgreSQL

1. Запустите установщик
2. Следуйте инструкциям:
   - **Installation Directory**: оставьте по умолчанию
   - **Select Components**: выберите все (PostgreSQL Server, pgAdmin 4, Command Line Tools)
   - **Data Directory**: оставьте по умолчанию
   - **Password**: установите пароль `postgres` (или запишите свой пароль)
   - **Port**: оставьте `5432`
   - **Locale**: оставьте по умолчанию

3. Дождитесь завершения установки

### Шаг 3: Создать базу данных

После установки откройте **SQL Shell (psql)** из меню Пуск:

```
Server [localhost]: (нажмите Enter)
Database [postgres]: (нажмите Enter)
Port [5432]: (нажмите Enter)
Username [postgres]: (нажмите Enter)
Password: (введите пароль, который вы установили)
```

Создайте базу данных:

```sql
CREATE DATABASE familypay;
```

Проверьте:

```sql
\l
```

Вы должны увидеть `familypay` в списке баз данных.

Выйдите:

```sql
\q
```

### Шаг 4: Обновить .env

Откройте `.env` и обновите `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/familypay?schema=public"
```

Замените `ваш_пароль` на пароль, который вы установили.

### Шаг 5: Запустить миграцию

```powershell
npm run db:migrate
```

Prisma попросит дать название миграции. Введите:

```
init
```

### Шаг 6: Заполнить данными

```powershell
npm run db:seed
```

---

## Вариант 2: Docker Desktop (альтернатива)

### Шаг 1: Установить Docker Desktop

1. Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Установите и перезагрузите компьютер
3. Запустите Docker Desktop

### Шаг 2: Запустить PostgreSQL в контейнере

Откройте PowerShell:

```powershell
docker run --name familypay-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=familypay `
  -p 5432:5432 `
  -d postgres:16
```

Проверьте, что контейнер запущен:

```powershell
docker ps
```

### Шаг 3: Обновить .env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/familypay?schema=public"
```

### Шаг 4: Запустить миграцию

```powershell
npm run db:migrate
```

### Шаг 5: Заполнить данными

```powershell
npm run db:seed
```

---

## Вариант 3: Облачная БД (быстрый старт)

Используйте бесплатный облачный PostgreSQL:

### Supabase (рекомендуется)

1. Перейдите на https://supabase.com/
2. Создайте аккаунт (GitHub, Google или email)
3. Нажмите "New project"
4. Заполните:
   - **Name**: familypay
   - **Database Password**: придумайте пароль (сохраните его!)
   - **Region**: выберите ближайший
5. Нажмите "Create new project"
6. Дождитесь создания (1-2 минуты)
7. Перейдите в **Settings → Database**
8. В разделе "Connection string" скопируйте **URI** (выберите "Session pooler")

### Обновить .env

Вставьте скопированную строку в `.env`:

```env
DATABASE_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Запустить миграцию

```powershell
npm run db:migrate
npm run db:seed
```

---

## Проверка подключения

После настройки базы данных выполните:

```powershell
npm run db:studio
```

Должно открыться Prisma Studio на http://localhost:5555

---

## Устранение проблем

### Ошибка: "Can't reach database server"

**Причина:** PostgreSQL не запущен или неверный порт

**Решение:**
1. Откройте Services (services.msc)
2. Найдите "postgresql-x64-16"
3. Нажмите "Start"

### Ошибка: "password authentication failed"

**Причина:** Неверный пароль в DATABASE_URL

**Решение:**
1. Проверьте пароль в `.env`
2. Убедитесь, что он совпадает с паролем PostgreSQL

### Ошибка: "database familypay does not exist"

**Причина:** База данных не создана

**Решение:**
1. Откройте SQL Shell (psql)
2. Выполните: `CREATE DATABASE familypay;`

---

## Команды для работы с PostgreSQL

### Открыть psql

```powershell
psql -U postgres
```

### Список баз данных

```sql
\l
```

### Подключиться к БД

```sql
\c familypay
```

### Список таблиц

```sql
\dt
```

### Удалить базу данных (осторожно!)

```sql
DROP DATABASE familypay;
CREATE DATABASE familypay;
```

---

## Следующие шаги

После успешной установки:

1. ✅ База данных создана
2. ✅ Миграция применена
3. ✅ Данные заполнены

Запустите приложение:

```powershell
npm run dev
```

Откройте http://localhost:3000

🎉 **Готово!**
