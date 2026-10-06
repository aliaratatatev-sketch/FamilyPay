import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Get all notifications for the user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get("isRead");
    const limit = searchParams.get("limit");

    const where: any = { userId: user.id };
    if (isRead !== null) {
      where.isRead = isRead === "true";
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("deleteAll");

    if (deleteAll === "true") {
      // Delete all read notifications
      await prisma.notification.deleteMany({
        where: {
          userId: user.id,
          isRead: true,
        },
      });
    } else if (notificationId) {
      // Delete specific notification
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Notifications deleted" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
