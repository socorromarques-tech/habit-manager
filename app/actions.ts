'use server';

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Define Validation Schema
const CreateHabitSchema = z.object({
  title: z.string().min(3, "O nome do hábito precisa ter pelo menos 3 letras"),
  goal: z.number().min(1, "A meta deve ser pelo menos 1 vez ao dia").max(100, "Meta muito alta!"),
});

// Helper to get current user ID
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  if ((session.user as any).id) {
      return (session.user as any).id as string;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user?.id;
}

export async function createHabit(title: string, goal: number = 1) {
  const userId = await getUserId();
  if (!userId) throw new Error('Você precisa estar logado.');

  // Validate Input
  const result = CreateHabitSchema.safeParse({ title, goal });
  if (!result.success) {
    const errorMessage = result.error.issues.map(i => i.message).join(', ');
    throw new Error(errorMessage);
  }

  await prisma.habit.create({
    data: {
      title,
      goal,
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
            gte: new Date(new Date().setDate(new Date().getDate() - 365)), 
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
      userId,
    },
  });

  revalidatePath('/');
}

export async function updateHabitProgress(habitId: string, date: Date) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const habit = await prisma.habit.findUnique({
    where: { id: habitId, userId },
  });
  if (!habit) throw new Error('Habit not found');

  const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: normalizedDate,
      },
    },
  });

  let newCount = 1;
  if (existingLog) {
    if (existingLog.count >= habit.goal) {
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
      revalidatePath('/');
      return;
    } else {
      newCount = existingLog.count + 1;
    }
    
    await prisma.habitLog.update({
      where: { id: existingLog.id },
      data: { 
        count: newCount,
        completed: newCount >= habit.goal
      },
    });
  } else {
    await prisma.habitLog.create({
      data: {
        habitId,
        date: normalizedDate,
        count: 1,
        completed: 1 >= habit.goal,
      },
    });
  }

  revalidatePath('/');
}
