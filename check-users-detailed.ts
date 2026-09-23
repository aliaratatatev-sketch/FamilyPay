import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка пользователей в базе данных...\n');

  const users = await prisma.user.findMany({
    include: {
      accounts: true,
      sessions: true,
      familyMembers: {
        include: {
          family: true,
        },
      },
    },
  });

  console.log(`📊 Всего пользователей: ${users.length}\n`);

  users.forEach((user, index) => {
    console.log(`👤 Пользователь #${index + 1}:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Имя: ${user.name || 'не указано'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Роль: ${user.role}`);
    console.log(`   Email подтверждён: ${user.emailVerified ? 'Да' : 'Нет'}`);
    console.log(`   Создан: ${user.createdAt.toLocaleString('ru-RU')}`);
    console.log(`   Обновлён: ${user.updatedAt.toLocaleString('ru-RU')}`);
    
    if (user.accounts.length > 0) {
      console.log(`   🔗 Подключенные аккаунты:`);
      user.accounts.forEach(account => {
        console.log(`      - ${account.provider} (${account.type})`);
      });
    }
    
    if (user.familyMembers.length > 0) {
      console.log(`   👨‍👩‍👧‍👦 Семьи:`);
      user.familyMembers.forEach(member => {
        console.log(`      - ${member.family.name} (роль: ${member.role})`);
      });
    }
    
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
