'use server';

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper to get current user ID
async function getUserId() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user?.id;
}

export async function createHabit(title: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  await prisma.habit.create({
    data: {
      title,
      userId,
    },
  });

  revalidatePath('/');
}

export async function getHabits() {
  const userId = await getUserId();
  if (!userId) return [];

  return await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 365)), // Last 365 days
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteHabit(habitId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  await prisma.habit.delete({
    where: {
      id: habitId,
      userId, // Ensure ownership
    },
  });

  revalidatePath('/');
}

export async function toggleHabitLog(habitId: string, date: Date) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  // Verify ownership
  const habit = await prisma.habit.findUnique({
    where: { id: habitId, userId },
  });
  if (!habit) throw new Error('Habit not found');

  // Normalize date to midnight UTC
  const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: normalizedDate,
      },
    },
  });

  if (existingLog) {
    if (existingLog.completed) {
      // Toggle off (delete log)
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
    } else {
      // Should not usually happen given our schema, but set to completed true
      await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed: true },
      });
    }
  } else {
    // Create new log
    await prisma.habitLog.create({
      data: {
        habitId,
        date: normalizedDate,
        completed: true,
      },
    });
  }

  revalidatePath('/');
}
