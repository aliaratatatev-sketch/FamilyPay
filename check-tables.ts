import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  console.log('🔍 Проверка таблиц в Neon PostgreSQL...\n');

  try {
    // Получаем список всех таблиц
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('✅ Найдено таблиц:', tables.length);
    console.log('\n📋 Список таблиц:\n');
    
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.tablename}`);
    });

    // Проверяем количество записей в каждой таблице
    console.log('\n\n📊 Количество записей в таблицах:\n');

    const counts = await Promise.all([
      prisma.user.count(),
      prisma.account.count(),
      prisma.session.count(),
      prisma.verificationToken.count(),
      prisma.family.count(),
      prisma.familyMember.count(),
      prisma.familyInvitation.count(),
      prisma.financialAccount.count(),
      prisma.category.count(),
      prisma.transaction.count(),
      prisma.recurringTransaction.count(),
      prisma.budget.count(),
      prisma.goal.count(),
      prisma.goalAllocation.count(),
      prisma.notification.count(),
      prisma.activityLog.count(),
    ]);

    console.log(`  users:                   ${counts[0]}`);
    console.log(`  accounts:                ${counts[1]}`);
    console.log(`  sessions:                ${counts[2]}`);
    console.log(`  verification_tokens:     ${counts[3]}`);
    console.log(`  families:                ${counts[4]}`);
    console.log(`  family_members:          ${counts[5]}`);
    console.log(`  family_invitations:      ${counts[6]}`);
    console.log(`  financial_accounts:      ${counts[7]}`);
    console.log(`  categories:              ${counts[8]} ✨ (начальные данные)`);
    console.log(`  transactions:            ${counts[9]}`);
    console.log(`  recurring_transactions:  ${counts[10]}`);
    console.log(`  budgets:                 ${counts[11]}`);
    console.log(`  goals:                   ${counts[12]}`);
    console.log(`  goal_allocations:        ${counts[13]}`);
    console.log(`  notifications:           ${counts[14]}`);
    console.log(`  activity_logs:           ${counts[15]}`);

    console.log('\n\n🎉 База данных успешно проверена!');
    
    // Проверка миграций
    const migrations = await prisma.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name 
      FROM _prisma_migrations 
      ORDER BY finished_at DESC;
    `;

    console.log('\n\n📝 Примененные миграции:\n');
    migrations.forEach((migration, index) => {
      console.log(`  ${index + 1}. ${migration.migration_name}`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
