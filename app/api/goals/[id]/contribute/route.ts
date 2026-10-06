import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/goals/[id]/contribute - Add money to a goal
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { familyMembers: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Check if user is member of the goal's family
    const isMember = user.familyMembers.some((fm) => fm.familyId === goal.familyId);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { amount, accountId, createTransaction } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const contributionAmount = parseFloat(amount);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update goal current amount
      const updatedGoal = await tx.goal.update({
        where: { id: params.id },
        data: {
          currentAmount: {
            increment: contributionAmount,
          },
        },
        include: {
          family: { select: { name: true } },
          category: { select: { name: true, color: true } },
        },
      });

      // Check if goal is completed
      if (updatedGoal.currentAmount >= updatedGoal.targetAmount && updatedGoal.status === "ACTIVE") {
        await tx.goal.update({
          where: { id: params.id },
          data: { status: "COMPLETED" },
        });
        updatedGoal.status = "COMPLETED";
      }

      // Create transaction if accountId is provided
      let transaction = null;
      if (createTransaction && accountId) {
        const account = await tx.account.findUnique({
          where: { id: accountId },
        });

        if (!account) {
          throw new Error("Account not found");
        }

        if (account.balance < contributionAmount) {
          throw new Error("Insufficient balance");
        }

        // Create transaction
        transaction = await tx.transaction.create({
          data: {
            type: "EXPENSE",
            amount: contributionAmount,
            currency: account.currency,
            description: `Вклад в цель: ${goal.name}`,
            accountId,
            familyId: goal.familyId,
            userId: user.id,
            categoryId: goal.categoryId,
          },
        });

        // Update account balance
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              decrement: contributionAmount,
            },
          },
        });
      }

      return { goal: updatedGoal, transaction };
    });

    // Create notification for family members
    const familyMembers = await prisma.familyMember.findMany({
      where: { familyId: goal.familyId },
    });

    await Promise.all(
      familyMembers
        .filter((fm) => fm.userId !== user.id)
        .map((fm) =>
          prisma.notification.create({
            data: {
              userId: fm.userId,
              type: "GOAL_UPDATED",
              title: "Вклад в цель",
              message: `${user.name || user.email} внёс ${contributionAmount} ₽ в цель "${goal.name}"`,
              relatedId: goal.id,
            },
          })
        )
    );

    // If goal completed, notify everyone
    if (result.goal.status === "COMPLETED") {
      await Promise.all(
        familyMembers.map((fm) =>
          prisma.notification.create({
            data: {
              userId: fm.userId,
              type: "GOAL_COMPLETED",
              title: "Цель достигнута! 🎉",
              message: `Цель "${goal.name}" успешно достигнута!`,
              relatedId: goal.id,
            },
          })
        )
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error contributing to goal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to contribute to goal" },
      { status: 500 }
    );
  }
}
