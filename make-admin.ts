import { prisma } from './lib/prisma';

async function makeAdmin() {
  try {
    const email = 'test@example.com'; // Измените на нужный email
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ Пользователь не найден:', email);
      return;
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log('✅ Пользователь назначен администратором!');
    console.log('📧 Email:', email);
    console.log('👮 Новая роль: ADMIN');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
