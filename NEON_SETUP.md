# 🐘 Настройка Neon PostgreSQL

Neon — это serverless PostgreSQL база данных в облаке с бесплатным тарифом.

## Шаг 1: Получить строку подключения из Neon

1. Откройте Neon Console (у вас уже открыт): https://console.neon.tech
2. Выберите ваш проект `familypay` (или как вы его назвали)
3. Перейдите в **Dashboard** → **Connection Details**
4. Скопируйте **Connection string** (он выглядит примерно так):

```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## Шаг 2: Обновить .env

Откройте файл `.env` и вставьте вашу строку подключения:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require"
```

**Важно:** Замените `YOUR_USER`, `YOUR_PASSWORD`, `YOUR_HOST` на реальные значения из Neon Console!

## Шаг 3: Применить миграцию к Neon

```powershell
npx prisma migrate deploy
```

Эта команда применит все миграции к вашей облачной базе данных.

Или создайте новую миграцию:

```powershell
npx prisma migrate dev --name init_neon
```

## Шаг 4: Заполнить начальными данными

```powershell
npx tsx prisma/seed.ts
```

## Шаг 5: Проверить в Neon Console

1. Обновите страницу в Neon Console
2. Перейдите в **Tables**
3. Вы должны увидеть 16 таблиц!

## Шаг 6: Открыть Prisma Studio

```powershell
npx prisma studio
```

Теперь Prisma Studio будет работать с Neon базой данных.

---

## Альтернатива: Использовать pgAdmin или SQL Editor в Neon

В Neon Console есть встроенный **SQL Editor**:

1. Перейдите в **SQL Editor** в левом меню
2. Выполните запрос:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public';
```

Вы увидите список всех таблиц.

---

## Преимущества Neon

✅ **Бесплатный тариф**: 0.5 GB хранилища, 3 проекта  
✅ **Автоматические бэкапы**: Point-in-time recovery  
✅ **Branching**: Создавайте копии базы для тестирования  
✅ **Масштабирование**: Serverless автоматически  
✅ **SSL**: Безопасное подключение из коробки  

---

## Устранение проблем

### Ошибка: "Can't reach database server"

**Причина:** Неверная строка подключения

**Решение:**
1. Проверьте DATABASE_URL в .env
2. Убедитесь, что строка содержит `?sslmode=require`
3. Проверьте, что пароль правильный (без спецсимволов в URL, или в URL-encoded виде)

### Ошибка: "password authentication failed"

**Причина:** Неверный пароль

**Решение:**
1. Сбросьте пароль в Neon Console: Settings → Reset password
2. Скопируйте новую строку подключения

### Таблицы не создались

**Решение:**
```powershell
# Попробуйте push вместо migrate
npx prisma db push

# Или пересоздайте миграцию
npx prisma migrate reset
npx tsx prisma/seed.ts
```

---

## Сравнение: SQLite vs Neon

| Функция | SQLite (локально) | Neon (облако) |
|---------|-------------------|---------------|
| Установка | Не требуется | Регистрация на сайте |
| Скорость | Очень быстро | Зависит от интернета |
| Доступ из других устройств | ❌ | ✅ |
| Бэкапы | Вручную | Автоматически |
| Масштабирование | ❌ | ✅ |
| Для production | ❌ | ✅ |
| Для разработки | ✅ | ✅ |

---

## Рекомендация

**Для локальной разработки:** SQLite (быстро, просто)  
**Для production / команды:** Neon или другой PostgreSQL

---

## Переключение между SQLite и Neon

Вы можете иметь оба варианта и переключаться:

### Для работы с SQLite локально:

`.env`:
```env
DATABASE_URL="file:./dev.db"
```

И скопируйте SQLite схему:
```powershell
Copy-Item prisma\schema-sqlite.prisma prisma\schema.prisma -Force
```

### Для работы с Neon:

`.env`:
```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/neondb?sslmode=require"
```

И скопируйте PostgreSQL схему:
```powershell
Copy-Item prisma\schema-postgres.prisma.backup prisma\schema.prisma -Force
```

---

## Следующие шаги

После успешного подключения к Neon:

1. ✅ Обновите страницу Neon Console - увидите таблицы
2. ✅ Запустите Prisma Studio - `npx prisma studio`
3. ✅ Запустите приложение - `npm run dev`

🎉 **Готово! Теперь у вас облачная база данных!**
