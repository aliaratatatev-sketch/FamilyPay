# Обзор схемы БД FamilyPay

## 📊 Статистика

- **Всего таблиц:** 16
- **Enum типов:** 9
- **Индексов:** 12+
- **Связей:** 40+

---

## 🎯 Основные сущности

### 1. User (Пользователь)
**Назначение:** Аутентификация и профиль пользователя

**Ключевые связи:**
- Может быть членом нескольких семей
- Создаёт транзакции, бюджеты, цели
- Получает уведомления

### 2. Family (Семья)
**Назначение:** Группировка финансовых данных

**Ключевые связи:**
- Имеет членов с ролями (Admin, Parent, Teen, Viewer)
- Содержит счета, транзакции, бюджеты, цели
- Имеет свои категории (опционально)

### 3. FinancialAccount (Финансовый счёт)
**Назначение:** Учёт денег на разных счетах

**Типы:**
- CASH (Наличные)
- BANK_ACCOUNT (Банковский счёт)
- CARD (Карта)
- SAVINGS (Накопления)
- INVESTMENT (Инвестиции)
- DEBT (Долг/кредит)

### 4. Transaction (Транзакция)
**Назначение:** Запись всех денежных операций

**Типы:**
- INCOME (Доход)
- EXPENSE (Расход)
- TRANSFER (Перевод между счетами)

**Особенности:**
- Автоматически обновляет баланс счетов
- Обновляет поле `spent` в бюджетах
- Поддерживает теги, геолокацию, чеки

### 5. Category (Категория)
**Назначение:** Классификация доходов и расходов

**Особенности:**
- Иерархическая структура (подкатегории)
- Системные категории (нельзя удалить)
- Семейные категории (можно создавать свои)

### 6. Budget (Бюджет)
**Назначение:** Планирование и контроль расходов

**Периоды:**
- WEEKLY (Недельный)
- MONTHLY (Месячный)
- QUARTERLY (Квартальный)
- YEARLY (Годовой)

**Уведомления:**
- При достижении 50%, 80%, 100% лимита

### 7. Goal (Финансовая цель)
**Назначение:** Накопление на крупные покупки

**Статусы:**
- ACTIVE (Активная)
- COMPLETED (Достигнута)
- CANCELLED (Отменена)
- PAUSED (Приостановлена)

---

## 🔐 Безопасность

### Изоляция данных
- Все данные привязаны к `familyId`
- Роли ограничивают доступ к операциям
- Каскадное удаление при удалении семьи

### Аудит
- ActivityLog записывает все действия
- Хранится кто, что, когда и с какими параметрами

### Роли в семье

| Роль | Права |
|------|-------|
| ADMIN | Полный доступ, управление членами |
| PARENT | Управление финансами, создание бюджетов/целей |
| TEEN | Просмотр + свои транзакции |
| VIEWER | Только просмотр |

---

## 📈 Производительность

### Индексы

**Transaction:**
```prisma
@@index([familyId, date])    // Быстрая выборка по периодам
@@index([accountId])          // История счёта
@@index([categoryId])         // Отчёты по категориям
@@index([userId])             // Персональная история
```

**Budget:**
```prisma
@@index([familyId, startDate, endDate])  // Активные бюджеты
```

**Goal:**
```prisma
@@index([familyId, status])  // Активные цели
```

**Notification:**
```prisma
@@index([userId, isRead])    // Непрочитанные
```

---

## 🔄 Типичные операции

### Создание транзакции с обновлением баланса

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Создать транзакцию
  const transaction = await tx.transaction.create({...});
  
  // 2. Обновить баланс счёта
  await tx.financialAccount.update({
    where: { id: accountId },
    data: { balance: { increment: amount } }
  });
  
  // 3. Обновить spent в бюджетах (если расход)
  if (type === 'EXPENSE') {
    await tx.budget.updateMany({
      where: { categoryId, isActive: true, ... },
      data: { spent: { increment: amount } }
    });
  }
  
  // 4. Залогировать действие
  await tx.activityLog.create({...});
  
  return transaction;
});
```

### Получение статистики за период

```typescript
const stats = await prisma.transaction.groupBy({
  by: ['categoryId', 'type'],
  where: {
    familyId,
    date: { gte: startDate, lte: endDate }
  },
  _sum: { amount: true },
  _count: true
});
```

### Проверка прогресса бюджета

```typescript
const budget = await prisma.budget.findUnique({
  where: { id: budgetId },
  include: { category: true }
});

const percentage = (budget.spent / budget.amount) * 100;
const status = percentage >= 100 ? 'exceeded' 
  : percentage >= 80 ? 'danger'
  : percentage >= 50 ? 'warning'
  : 'ok';
```

---

## 🎨 Типовые запросы

### Дашборд семьи

```typescript
const dashboard = await prisma.family.findUnique({
  where: { id: familyId },
  include: {
    accounts: {
      where: { isActive: true },
      select: { id: true, name: true, balance: true, type: true }
    },
    budgets: {
      where: { 
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      include: { category: true }
    },
    goals: {
      where: { status: 'ACTIVE' },
      orderBy: { targetDate: 'asc' }
    },
    _count: {
      select: {
        transactions: true,
        members: true
      }
    }
  }
});
```

### История транзакций с фильтрами

```typescript
const transactions = await prisma.transaction.findMany({
  where: {
    familyId,
    type: 'EXPENSE',
    date: { gte: startOfMonth, lte: endOfMonth },
    category: { type: 'EXPENSE' }
  },
  include: {
    account: { select: { name: true, icon: true } },
    category: { select: { name: true, icon: true, color: true } },
    user: { select: { name: true, image: true } }
  },
  orderBy: { date: 'desc' },
  take: 50
});
```

### Топ категорий расходов

```typescript
const topCategories = await prisma.transaction.groupBy({
  by: ['categoryId'],
  where: {
    familyId,
    type: 'EXPENSE',
    date: { gte: startDate, lte: endDate }
  },
  _sum: { amount: true },
  _count: true,
  orderBy: { _sum: { amount: 'desc' } },
  take: 10
});

// Дополнить информацией о категориях
const categories = await prisma.category.findMany({
  where: { id: { in: topCategories.map(c => c.categoryId!) } }
});
```

---

## 🚀 Оптимизация

### Batch операции

```typescript
// Создание нескольких транзакций одновременно
await prisma.transaction.createMany({
  data: transactions,
  skipDuplicates: true
});
```

### Select только нужные поля

```typescript
// Вместо всего объекта user
const transaction = await prisma.transaction.findUnique({
  where: { id },
  include: {
    user: {
      select: { id: true, name: true, image: true }
    }
  }
});
```

### Использование курсоров для больших выборок

```typescript
const transactions = await prisma.transaction.findMany({
  take: 100,
  cursor: { id: lastTransactionId },
  skip: 1, // Пропустить курсор
  orderBy: { date: 'desc' }
});
```

---

## 📝 Миграции

### Naming Convention

```
YYYYMMDDHHMMSS_descriptive_name
```

Примеры:
- `20260916_init` - Начальная схема
- `20260917_add_tags_to_transactions` - Добавление тегов
- `20260918_create_notifications_table` - Новая таблица

### Rollback миграции

```bash
# Откатить последнюю миграцию
npx prisma migrate resolve --rolled-back <migration_name>

# Применить миграции заново
npx prisma migrate deploy
```

---

## 🔮 Расширяемость

Схема спроектирована для будущих расширений:

✅ **JSON поля** для метаданных без изменения схемы  
✅ **Мультивалютность** уже встроена  
✅ **Теги** для гибкой фильтрации  
✅ **Подкатегории** иерархической структурой  
✅ **Система ролей** для разграничения доступа  
✅ **Аудит** всех действий  
✅ **Повторяющиеся транзакции** для автоматизации  

---

## 📚 Дополнительная информация

- [Полная документация схемы](../Схема%20БД.md)
- [Быстрый старт](../DATABASE_SETUP.md)
- [Примеры API routes](../app/api/)
- [Типы TypeScript](../lib/types.ts)
