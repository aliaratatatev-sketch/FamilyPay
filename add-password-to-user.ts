import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function addPasswordToUser() {
  try {
    const email = 'aliaratalexey@gmail.com'; // Ваш Gmail
    const password = 'mypassword123'; // Ваш новый пароль (замените на свой)

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ Пользователь не найден:', email);
      console.log('💡 Сначала войдите через Google, чтобы создать аккаунт');
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Обновляем пользователя
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Пароль успешно добавлен!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('💡 Теперь можете войти через форму входа');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPasswordToUser();
