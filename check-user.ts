import { prisma } from './lib/prisma';

async function checkUser() {
  try {
    const email = 'aliaratalexey@gmail.com';
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true,
      },
    });

    if (user) {
      console.log('✅ Пользователь найден:');
      console.log('📧 Email:', user.email);
      console.log('👤 Имя:', user.name);
      console.log('🔑 Есть пароль:', !!user.password ? 'Да' : 'Нет');
      console.log('👮 Роль:', user.role);
      console.log('📅 Создан:', user.createdAt);
    } else {
      console.log('❌ Пользователь не найден');
      console.log('💡 Войдите через Google чтобы создать аккаунт');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
