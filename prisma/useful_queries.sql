-- Полезные SQL-запросы для FamilyPay

-- ============================================
-- АНАЛИТИКА И ОТЧЁТЫ
-- ============================================

-- 1. Общий баланс семьи по всем счетам
SELECT 
  f.id as family_id,
  f.name as family_name,
  SUM(fa.balance) as total_balance,
  COUNT(fa.id) as accounts_count
FROM families f
JOIN financial_accounts fa ON f.id = fa."familyId"
WHERE fa."isActive" = true
GROUP BY f.id, f.name;

-- 2. Топ-10 категорий расходов за месяц
SELECT 
  c.name as category,
  c.icon,
  COUNT(t.id) as transactions_count,
  SUM(t.amount) as total_amount
FROM transactions t
JOIN categories c ON t."categoryId" = c.id
WHERE 
  t."familyId" = 'YOUR_FAMILY_ID'
  AND t.type = 'EXPENSE'
  AND t.date >= DATE_TRUNC('month', CURRENT_DATE)
  AND t.date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY c.id, c.name, c.icon
ORDER BY total_amount DESC
LIMIT 10;

-- 3. Динамика доходов и расходов по месяцам
SELECT 
  DATE_TRUNC('month', t.date) as month,
  SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END) as income,
  SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END) as expense,
  SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE -t.amount END) as net
FROM transactions t
WHERE 
  t."familyId" = 'YOUR_FAMILY_ID'
  AND t.date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', t.date)
ORDER BY month DESC;

-- 4. Состояние всех бюджетов на текущий момент
SELECT 
  b.name as budget_name,
  c.name as category_name,
  b.amount as limit_amount,
  b.spent as spent_amount,
  b.amount - b.spent as remaining,
  ROUND((b.spent / b.amount * 100)::numeric, 2) as spent_percentage,
  CASE 
    WHEN b.spent >= b.amount THEN 'exceeded'
    WHEN b.spent >= b.amount * 0.8 THEN 'danger'
    WHEN b.spent >= b.amount * 0.5 THEN 'warning'
    ELSE 'ok'
  END as status
FROM budgets b
JOIN categories c ON b."categoryId" = c.id
WHERE 
  b."familyId" = 'YOUR_FAMILY_ID'
  AND b."isActive" = true
  AND b."startDate" <= CURRENT_DATE
  AND b."endDate" >= CURRENT_DATE
ORDER BY spent_percentage DESC;

-- 5. Прогресс по всем активным целям
SELECT 
  g.name as goal_name,
  g."targetAmount",
  g."currentAmount",
  g."targetAmount" - g."currentAmount" as remaining,
  ROUND((g."currentAmount" / g."targetAmount" * 100)::numeric, 2) as progress_percentage,
  g."targetDate",
  CASE 
    WHEN g."targetDate" IS NOT NULL 
    THEN (g."targetDate" - CURRENT_DATE) 
    ELSE NULL 
  END as days_remaining
FROM goals g
WHERE 
  g."familyId" = 'YOUR_FAMILY_ID'
  AND g.status = 'ACTIVE'
ORDER BY progress_percentage DESC;

-- 6. История транзакций по счёту
SELECT 
  t.date,
  t.type,
  t.amount,
  t.description,
  c.name as category,
  c.icon as category_icon,
  u.name as created_by
FROM transactions t
LEFT JOIN categories c ON t."categoryId" = c.id
JOIN users u ON t."userId" = u.id
WHERE t."accountId" = 'YOUR_ACCOUNT_ID'
ORDER BY t.date DESC
LIMIT 50;

-- 7. Средние расходы по дням недели
SELECT 
  TO_CHAR(t.date, 'Day') as day_of_week,
  EXTRACT(DOW FROM t.date) as day_number,
  COUNT(t.id) as transactions_count,
  ROUND(AVG(t.amount)::numeric, 2) as avg_amount,
  SUM(t.amount) as total_amount
FROM transactions t
WHERE 
  t."familyId" = 'YOUR_FAMILY_ID'
  AND t.type = 'EXPENSE'
  AND t.date >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY day_of_week, day_number
ORDER BY day_number;

-- 8. Самые крупные транзакции за период
SELECT 
  t.date,
  t.type,
  t.amount,
  t.description,
  c.name as category,
  fa.name as account,
  u.name as created_by
FROM transactions t
JOIN financial_accounts fa ON t."accountId" = fa.id
LEFT JOIN categories c ON t."categoryId" = c.id
JOIN users u ON t."userId" = u.id
WHERE 
  t."familyId" = 'YOUR_FAMILY_ID'
  AND t.date >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY t.amount DESC
LIMIT 20;

-- ============================================
-- УПРАВЛЕНИЕ ДАННЫМИ
-- ============================================

-- 9. Пересчитать баланс счёта на основе транзакций
WITH account_balance AS (
  SELECT 
    "accountId",
    SUM(
      CASE 
        WHEN type = 'INCOME' THEN amount
        WHEN type = 'EXPENSE' THEN -amount
        WHEN type = 'TRANSFER' AND "accountId" = "toAccountId" THEN 0
        WHEN type = 'TRANSFER' THEN -amount
        ELSE 0
      END
    ) as calculated_balance
  FROM transactions
  WHERE "accountId" = 'YOUR_ACCOUNT_ID'
  GROUP BY "accountId"
)
UPDATE financial_accounts fa
SET balance = ab.calculated_balance
FROM account_balance ab
WHERE fa.id = ab."accountId";

-- 10. Пересчитать поле spent для бюджета
WITH budget_spent AS (
  SELECT 
    b.id as budget_id,
    COALESCE(SUM(t.amount), 0) as total_spent
  FROM budgets b
  LEFT JOIN transactions t ON 
    t."categoryId" = b."categoryId"
    AND t."familyId" = b."familyId"
    AND t.type = 'EXPENSE'
    AND t.date >= b."startDate"
    AND t.date <= b."endDate"
  WHERE b.id = 'YOUR_BUDGET_ID'
  GROUP BY b.id
)
UPDATE budgets b
SET spent = bs.total_spent
FROM budget_spent bs
WHERE b.id = bs.budget_id;

-- 11. Пересчитать currentAmount для цели
WITH goal_amount AS (
  SELECT 
    "goalId",
    COALESCE(SUM(amount), 0) as total_allocated
  FROM goal_allocations
  WHERE "goalId" = 'YOUR_GOAL_ID'
  GROUP BY "goalId"
)
UPDATE goals g
SET "currentAmount" = ga.total_allocated
FROM goal_amount ga
WHERE g.id = ga."goalId";

-- ============================================
-- ПРОВЕРКА ЦЕЛОСТНОСТИ ДАННЫХ
-- ============================================

-- 12. Найти транзакции без категории (для расходов)
SELECT 
  t.id,
  t.date,
  t.amount,
  t.description,
  fa.name as account
FROM transactions t
JOIN financial_accounts fa ON t."accountId" = fa.id
WHERE 
  t.type IN ('INCOME', 'EXPENSE')
  AND t."categoryId" IS NULL
  AND t."familyId" = 'YOUR_FAMILY_ID'
ORDER BY t.date DESC;

-- 13. Найти неактивные счета с ненулевым балансом
SELECT 
  id,
  name,
  type,
  balance,
  "updatedAt"
FROM financial_accounts
WHERE 
  "isActive" = false
  AND balance != 0
  AND "familyId" = 'YOUR_FAMILY_ID';

-- 14. Найти бюджеты с некорректным spent
SELECT 
  b.id,
  b.name,
  b.spent as recorded_spent,
  COALESCE(SUM(t.amount), 0) as actual_spent,
  b.spent - COALESCE(SUM(t.amount), 0) as difference
FROM budgets b
LEFT JOIN transactions t ON 
  t."categoryId" = b."categoryId"
  AND t."familyId" = b."familyId"
  AND t.type = 'EXPENSE'
  AND t.date >= b."startDate"
  AND t.date <= b."endDate"
WHERE b."familyId" = 'YOUR_FAMILY_ID'
GROUP BY b.id, b.name, b.spent
HAVING ABS(b.spent - COALESCE(SUM(t.amount), 0)) > 0.01;

-- ============================================
-- СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ
-- ============================================

-- 15. Активность членов семьи
SELECT 
  u.name,
  fm.role,
  COUNT(DISTINCT t.id) as transactions_count,
  COUNT(DISTINCT b.id) as budgets_count,
  COUNT(DISTINCT g.id) as goals_count,
  MAX(t.date) as last_transaction_date
FROM family_members fm
JOIN users u ON fm."userId" = u.id
LEFT JOIN transactions t ON t."userId" = u.id AND t."familyId" = fm."familyId"
LEFT JOIN budgets b ON b."userId" = u.id AND b."familyId" = fm."familyId"
LEFT JOIN goals g ON g."userId" = u.id AND g."familyId" = fm."familyId"
WHERE fm."familyId" = 'YOUR_FAMILY_ID'
GROUP BY u.id, u.name, fm.role
ORDER BY transactions_count DESC;

-- 16. История действий пользователя
SELECT 
  al.action,
  al."entityType",
  al.description,
  al."createdAt"
FROM activity_logs al
WHERE al."userId" = 'YOUR_USER_ID'
ORDER BY al."createdAt" DESC
LIMIT 50;

-- ============================================
-- УВЕДОМЛЕНИЯ
-- ============================================

-- 17. Непрочитанные уведомления пользователя
SELECT 
  n.type,
  n.title,
  n.message,
  n."createdAt"
FROM notifications n
WHERE 
  n."userId" = 'YOUR_USER_ID'
  AND n."isRead" = false
ORDER BY n."createdAt" DESC;

-- 18. Статистика по уведомлениям
SELECT 
  type,
  COUNT(*) as total_count,
  SUM(CASE WHEN "isRead" = true THEN 1 ELSE 0 END) as read_count,
  SUM(CASE WHEN "isRead" = false THEN 1 ELSE 0 END) as unread_count
FROM notifications
WHERE "userId" = 'YOUR_USER_ID'
GROUP BY type;

-- ============================================
-- ОЧИСТКА СТАРЫХ ДАННЫХ
-- ============================================

-- 19. Удалить прочитанные уведомления старше 30 дней
DELETE FROM notifications
WHERE 
  "isRead" = true
  AND "createdAt" < CURRENT_DATE - INTERVAL '30 days';

-- 20. Архивировать завершённые цели старше года
UPDATE goals
SET status = 'COMPLETED'
WHERE 
  status = 'ACTIVE'
  AND "currentAmount" >= "targetAmount"
  AND "updatedAt" < CURRENT_DATE - INTERVAL '1 year';

-- ============================================
-- ПОЛЕЗНЫЕ ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================

-- 21. Создать представление для быстрого доступа к статистике семьи
CREATE OR REPLACE VIEW family_statistics AS
SELECT 
  f.id as family_id,
  f.name as family_name,
  COUNT(DISTINCT fm.id) as members_count,
  COUNT(DISTINCT fa.id) as accounts_count,
  COALESCE(SUM(CASE WHEN fa."isActive" = true THEN fa.balance ELSE 0 END), 0) as total_balance,
  COUNT(DISTINCT t.id) as total_transactions,
  COUNT(DISTINCT b.id) as active_budgets,
  COUNT(DISTINCT g.id) as active_goals
FROM families f
LEFT JOIN family_members fm ON f.id = fm."familyId"
LEFT JOIN financial_accounts fa ON f.id = fa."familyId"
LEFT JOIN transactions t ON f.id = t."familyId"
LEFT JOIN budgets b ON f.id = b."familyId" AND b."isActive" = true
LEFT JOIN goals g ON f.id = g."familyId" AND g.status = 'ACTIVE'
GROUP BY f.id, f.name;

-- Использование:
-- SELECT * FROM family_statistics WHERE family_id = 'YOUR_FAMILY_ID';
