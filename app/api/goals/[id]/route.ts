import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/goals/[id] - Get a specific goal
export async function GET(
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
      include: {
        family: { select: { name: true } },
        category: { select: { name: true, color: true } },
      },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Check if user is member of the goal's family
    const isMember = user.familyMembers.some((fm) => fm.familyId === goal.familyId);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

// PUT /api/goals/[id] - Update a goal
export async function PUT(
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
    const familyMember = user.familyMembers.find((fm) => fm.familyId === goal.familyId);
    if (!familyMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Only ADMIN and PARENT can update goals
    if (!["ADMIN", "PARENT"].includes(familyMember.role)) {
      return NextResponse.json(
        { error: "Only admins and parents can update goals" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, targetAmount, currentAmount, deadline, categoryId, priority, status } = body;

    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(targetAmount !== undefined && { targetAmount: parseFloat(targetAmount) }),
        ...(currentAmount !== undefined && { currentAmount: parseFloat(currentAmount) }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(categoryId !== undefined && { categoryId }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
      },
      include: {
        family: { select: { name: true } },
        category: { select: { name: true, color: true } },
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id] - Delete a goal
export async function DELETE(
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
    const familyMember = user.familyMembers.find((fm) => fm.familyId === goal.familyId);
    if (!familyMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Only ADMIN and PARENT can delete goals
    if (!["ADMIN", "PARENT"].includes(familyMember.role)) {
      return NextResponse.json(
        { error: "Only admins and parents can delete goals" },
        { status: 403 }
      );
    }

    await prisma.goal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
