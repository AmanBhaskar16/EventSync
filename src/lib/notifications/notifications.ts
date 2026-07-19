
// Helper to create DB notification + emit real-time event

import { prisma } from "@/lib/db/prisma";
import type { NotificationType } from "@/types/notifications";

type CreateNotificationInput = {
  userId:  string;
  type:    NotificationType;
  title:   string;
  message: string;
  link?:   string;
};

export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId:  input.userId,
        type:    input.type,
        title:   input.title,
        message: input.message,
        link:    input.link ?? null,
      },
      select: {
        id: true, 
        type: true, 
        title: true,
        message: true, 
        link: true, 
        isRead: true, 
        createdAt: true,
      },
    });

    // Emit real-time notification if Socket.io server is running
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const io = (global as any).io;
    if (io && typeof io.sendNotification === "function") {
      io.sendNotification(input.userId, {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
      });
    }

    return notification;
  } catch (err) {
    console.error("[CREATE_NOTIFICATION]", err);
  }
}