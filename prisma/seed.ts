import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало заполнения БД начальными данными...');

  // Системные категории расходов
  const expenseCategories = [
    { name: 'Продукты', icon: '🛒', color: '#10B981' },
    { name: 'Транспорт', icon: '🚗', color: '#3B82F6' },
    { name: 'ЖКХ', icon: '🏠', color: '#EF4444' },
    { name: 'Здоровье', icon: '🏥', color: '#EC4899' },
    { name: 'Развлечения', icon: '🎮', color: '#8B5CF6' },
    { name: 'Образование', icon: '📚', color: '#F59E0B' },
    { name: 'Одежда', icon: '👔', color: '#06B6D4' },
    { name: 'Рестораны', icon: '🍽️', color: '#F97316' },
    { name: 'Путешествия', icon: '✈️', color: '#14B8A6' },
    { name: 'Связь', icon: '📱', color: '#6366F1' },
    { name: 'Красота', icon: '💄', color: '#EC4899' },
    { name: 'Подарки', icon: '🎁', color: '#A855F7' },
    { name: 'Спорт', icon: '⚽', color: '#22C55E' },
    { name: 'Домашние животные', icon: '🐕', color: '#84CC16' },
    { name: 'Прочее', icon: '📦', color: '#64748B' },
  ];

  // Системные категории доходов
  const incomeCategories = [
    { name: 'Зарплата', icon: '💼', color: '#10B981' },
    { name: 'Фриланс', icon: '💻', color: '#3B82F6' },
    { name: 'Инвестиции', icon: '📈', color: '#8B5CF6' },
    { name: 'Подарки', icon: '🎁', color: '#EC4899' },
    { name: 'Продажа', icon: '💰', color: '#F59E0B' },
    { name: 'Прочее', icon: '💵', color: '#64748B' },
  ];

  console.log('📁 Создание системных категорий расходов...');
  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: { id: `system-expense-${category.name.toLowerCase()}` },
      update: {},
      create: {
        id: `system-expense-${category.name.toLowerCase()}`,
        name: category.name,
        type: 'EXPENSE',
        icon: category.icon,
        color: category.color,
        isSystem: true, // PostgreSQL: boolean
      },
    });
  }

  console.log('📁 Создание системных категорий доходов...');
  for (const category of incomeCategories) {
    await prisma.category.upsert({
      where: { id: `system-income-${category.name.toLowerCase()}` },
      update: {},
      create: {
        id: `system-income-${category.name.toLowerCase()}`,
        name: category.name,
        type: 'INCOME',
        icon: category.icon,
        color: category.color,
        isSystem: true, // PostgreSQL: boolean
      },
    });
  }

  console.log('✅ Заполнение БД завершено!');
  console.log(`   - Создано ${expenseCategories.length} категорий расходов`);
  console.log(`   - Создано ${incomeCategories.length} категорий доходов`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
