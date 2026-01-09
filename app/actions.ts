'use server';

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const CreateHabitSchema = z.object({
  title: z.string().min(3, "O nome do hábito precisa ter pelo menos 3 letras"),
  goal: z.number().min(1).optional(),
  weekDays: z.array(z.number().min(0).max(6)).min(1, "Selecione pelo menos um dia!"),
});

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

export async function createHabit(title: string, goal: number = 1, weekDays: number[] = [0,1,2,3,4,5,6]) {
  const userId = await getUserId();
  if (!userId) throw new Error('Você precisa estar logado.');

  const result = CreateHabitSchema.safeParse({ title, goal, weekDays });
  if (!result.success) {
    const errorMessage = result.error.issues.map(i => i.message).join(', ');
    throw new Error(errorMessage);
  }

  await prisma.habit.create({
    data: {
      title,
      goal,
      userId,
      weekDays: weekDays,
    },
  });

  revalidatePath('/');
}

// Get Habits (Filtered for a specific date if provided, otherwise all)
// Note: In client, we usually fetch all then filter, or we can fetch only relevant.
// For Ignite grid, getting all is easier for optimistic updates, then filtering in JS.
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
         }
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

// Renamed for clarity, kept alias below
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

  // Toggle Logic (Simple Checklist)
  if (existingLog) {
     // If exists, delete it (Uncheck)
     await prisma.habitLog.delete({
        where: { id: existingLog.id },
     });
  } else {
     // Create (Check)
     await prisma.habitLog.create({
        data: {
            habitId,
            date: normalizedDate,
            count: 1,
            completed: true,
        },
     });
  }

  revalidatePath('/');
}

// Alias
export async function toggleHabitLog(habitId: string, date: Date) {
  return updateHabitProgress(habitId, date);
}

export type DaySummary = {
  date: Date;
  completed: number;
  total: number;
};

export async function getSummary(): Promise<DaySummary[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); 

  const logs = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
      date: { gte: startDate },
      completed: true, 
    },
  });

  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true, createdAt: true, weekDays: true },
  });

  const summaryMap = new Map<string, { completed: number, total: number }>();

  logs.forEach(log => {
    const dateKey = log.date.toISOString().split('T')[0];
    const current = summaryMap.get(dateKey) || { completed: 0, total: 0 };
    current.completed += 1;
    summaryMap.set(dateKey, current);
  });

  // Calculate totals per day (considering recurrence)
  // This is expensive to do for EVERY day in JS for a year. 
  // Simplified: Return completed map, and let Client calculate totals based on Habits + Date?
  // Or do it here for the *rendered* days?
  // Let's do a quick approximation for populated days + today
  
  // Actually, client needs "Map of Date -> Info". 
  // If we return just the array of days with activity, empty days are... empty.
  // But to color the grid correctly (Gray vs Green), we need to know if there WAS a goal.
  // If total=0, it's disabled/hidden? No, usually empty gray.
  
  // Let's return the logged days. The client can compute "Total" for a specific square if needed,
  // or we compute it here for the *logged* days.
  // For the heatmap, "Gray" means 0 completed. But we need denominator to know shade.
  // If we don't know denominator for empty days, we assume 0?
  
  // Better approach for V2:
  // Iterate strictly over the days we want to show? No, too many.
  // Let's stick to: Return Logs.
  // BUT we need `total` for the `completed/total` ratio.
  
  // Compute total for each day present in logs:
  for (const [dateStr, data] of summaryMap) {
      const dateDate = new Date(dateStr);
      const dayOfWeek = dateDate.getUTCDay(); // 0-6
      
      // Filter habits active on this day
      const possibleHabits = habits.filter(h => 
          h.weekDays.includes(dayOfWeek) && 
          h.createdAt <= dateDate // Created before or on this day
      );
      
      data.total = possibleHabits.length;
      summaryMap.set(dateStr, data);
  }

  const summary: DaySummary[] = [];
  for (const [dateStr, data] of summaryMap) {
    summary.push({
      date: new Date(dateStr),
      completed: data.completed,
      total: data.total
    });
  }

  return summary;
}
