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

export type DaySummary = {
  date: Date;
  completed: number;
  total: number;
};

export async function getSummary(): Promise<DaySummary[]> {
  const userId = await getUserId();
  if (!userId) return [];

  // Get start of year (or reasonable window)
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // Last 1 year

  // 1. Get all Logs in range
  const logs = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
      date: { gte: startDate },
      completed: true, // Only counted if completed (or we use count >= goal)
    },
  });

  // 2. Get all Habits to know "Total Possible"
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true, createdAt: true },
  });

  // 3. Group by Date
  // To do this strictly correctly day-by-day is expensive in raw JS if we check "was habit created yet?".
  // For this version (Senior Level V1), we can approximate or do it robustly.
  // Robust: Iterate days.
  
  // Pivot: Since we want a "Month View", maybe we just return the logs and habits 
  // and let the frontend compute the matrix for the specific view?
  // Actually, sending pre-computed is better for Server Components.

  // Let's simplified approach for the "Grid": 
  // We need specific amounts per day.
  
  // Map: DateString -> { completed, total }
  const summaryMap = new Map<string, { completed: number, total: number }>();

  // Initialize logs
  logs.forEach(log => {
    const dateKey = log.date.toISOString().split('T')[0];
    const current = summaryMap.get(dateKey) || { completed: 0, total: 0 };
    current.completed += 1;
    summaryMap.set(dateKey, current);
  });

  // Calculate totals (This is the tricky part - typically done with Raw SQL in Ignite)
  // We will assume "Current Active Habits" apply to all visible history for simplicity 
  // unless user wants strict historical accuracy. 
  // "Ignite" usually assumes simplistic "Total Available" or queries `HabitWeekDays`.
  
  // Let's use current active habit count as denominator for simpler logic initially.
  // Or improve: filter habits created before the log date.
  
  const totalActive = habits.length;

  // Convert Map to Array
  const summary: DaySummary[] = [];
  
  // We should actually generate the array of dates we care about (e.g. this month)
  // But the action just returns "Data we have".
  
  for (const [dateStr, data] of summaryMap) {
    summary.push({
      date: new Date(dateStr),
      completed: data.completed,
      total: totalActive // Simplified
    });
  }

  return summary;
}
