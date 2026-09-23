import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('✅ Пользователь уже существует:', email);
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER',
      },
    });

    console.log('✅ Тестовый пользователь создан!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User ID:', user.id);
  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
