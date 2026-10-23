import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBudgetAmounts() {
  console.log('Starting to fix budget amounts...');

  try {
    // Получаем все бюджеты
    const budgets = await prisma.budget.findMany();
    
    console.log(`Found ${budgets.length} budgets to check`);

    let fixedCount = 0;

    for (const budget of budgets) {
      // Конвертируем amount и spent в число
      const currentAmount = parseFloat(String(budget.amount));
      const currentSpent = parseFloat(String(budget.spent));

      console.log(`Budget ${budget.id}: amount=${budget.amount} (${currentAmount}), spent=${budget.spent} (${currentSpent})`);

      // Обновляем бюджет с правильными значениями
      await prisma.budget.update({
        where: { id: budget.id },
        data: {
          amount: currentAmount,
          spent: currentSpent,
        },
      });

      fixedCount++;
      console.log(`✓ Fixed budget ${budget.id}: ${budget.name}`);
    }

    console.log(`\n✅ Successfully fixed ${fixedCount} budgets`);

    // Получаем все цели
    const goals = await prisma.goal.findMany();
    
    console.log(`\nFound ${goals.length} goals to check`);

    let fixedGoalsCount = 0;

    for (const goal of goals) {
      // Конвертируем targetAmount и currentAmount в число
      const targetAmount = parseFloat(String(goal.targetAmount));
      const currentAmount = parseFloat(String(goal.currentAmount));

      console.log(`Goal ${goal.id}: target=${goal.targetAmount} (${targetAmount}), current=${goal.currentAmount} (${currentAmount})`);

      // Обновляем цель с правильными значениями
      await prisma.goal.update({
        where: { id: goal.id },
        data: {
          targetAmount: targetAmount,
          currentAmount: currentAmount,
        },
      });

      fixedGoalsCount++;
      console.log(`✓ Fixed goal ${goal.id}: ${goal.name}`);
    }

    console.log(`\n✅ Successfully fixed ${fixedGoalsCount} goals`);

  } catch (error) {
    console.error('Error fixing amounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixBudgetAmounts()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to fix amounts:', error);
    process.exit(1);
  });
