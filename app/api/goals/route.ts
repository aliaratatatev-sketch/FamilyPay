import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/goals - Get all goals for user's families
export async function GET(request: Request) {
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

    const familyIds = user.familyMembers.map((fm) => fm.familyId);

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");
    const status = searchParams.get("status");

    const where: any = {
      familyId: familyId ? familyId : { in: familyIds },
    };

    if (status) {
      where.status = status;
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        family: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: Request) {
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

    const body = await request.json();
    console.log('Received goal data:', body); // Debug log
    
    const { 
      name, 
      description, 
      targetAmount, 
      currentAmount, 
      deadline, // Will map to targetDate
      familyId, 
      categoryId, // Not in schema, will ignore
      priority // Not in schema, will ignore
    } = body;

    // Validate required fields
    if (!name || !targetAmount || !familyId) {
      console.error('Validation failed:', { name, targetAmount, familyId }); // Debug log
      return NextResponse.json(
        { error: "Name, target amount, and family are required" },
        { status: 400 }
      );
    }

    // Check if user is member of the family
    const isMember = user.familyMembers.some((fm) => fm.familyId === familyId);
    if (!isMember) {
      return NextResponse.json(
        { error: "Not a member of this family" },
        { status: 403 }
      );
    }

    // Check role - only ADMIN and PARENT can create goals
    const familyMember = user.familyMembers.find((fm) => fm.familyId === familyId);
    if (!familyMember || !["ADMIN", "PARENT"].includes(familyMember.role)) {
      return NextResponse.json(
        { error: "Only admins and parents can create goals" },
        { status: 403 }
      );
    }

    // Get family currency
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { currency: true },
    });

    const goal = await prisma.goal.create({
      data: {
        name,
        description,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        targetDate: deadline ? new Date(deadline) : null,
        familyId,
        userId: user.id,
        currency: family?.currency || "KGS",
        status: "ACTIVE",
      },
      include: {
        family: { select: { name: true } },
      },
    });

    // Create notification for all family members
    const familyMembers = await prisma.familyMember.findMany({
      where: { familyId },
      include: { user: true },
    });

    await Promise.all(
      familyMembers
        .filter((fm) => fm.userId !== user.id)
        .map((fm) =>
          prisma.notification.create({
            data: {
              userId: fm.userId,
              type: "GOAL_CREATED",
              title: "Новая цель создана",
              message: `${user.name || user.email} создал цель: ${name}`,
              relatedId: goal.id,
            },
          })
        )
    );

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create goal",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
