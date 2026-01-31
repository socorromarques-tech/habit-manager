'use server';

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { CreateHabitSchema } from '@/lib/validators';
import dayjs from 'dayjs'; 

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

export async function createHabit(title: string, goal: number = 1, weekDays: number[] = [0,1,2,3,4,5,6], description?: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Você precisa estar logado.');

  const result = CreateHabitSchema.safeParse({ title, goal, weekDays, description });
  if (!result.success) {
    const errorMessage = result.error.issues.map(i => i.message).join(', ');
    throw new Error(errorMessage);
  }

  await prisma.habit.create({
    data: {
      title,
      description,
      goal,
      userId,
      weekDays: weekDays,
    },
  });

  revalidatePath('/');
}

export async function updateHabit(id: string, title: string, goal: number = 1, weekDays: number[], description?: string) {
    const userId = await getUserId();
    if (!userId) throw new Error('Você precisa estar logado.');

    const result = CreateHabitSchema.safeParse({ title, goal, weekDays, description });
    if (!result.success) {
      const errorMessage = result.error.issues.map(i => i.message).join(', ');
      throw new Error(errorMessage);
    }

    const existingHabit = await prisma.habit.findUnique({
        where: { id }
    });

    if (!existingHabit || existingHabit.userId !== userId) {
        throw new Error('Hábito não encontrado ou sem permissão.');
    }

    await prisma.habit.update({
      where: { id },
      data: {
        title,
        description,
        goal,
        weekDays,
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

  if (existingLog) {
     await prisma.habitLog.delete({
        where: { id: existingLog.id },
     });
  } else {
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
    include: { // Include Habit to check weekDays
        habit: true
    }
  });

  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true, createdAt: true, weekDays: true },
  });

  const summaryMap = new Map<string, { completed: number, total: number }>();

  logs.forEach(log => {
    const dateKey = log.date.toISOString().split('T')[0];
    const dateDate = new Date(dateKey);
    const dayOfWeek = dateDate.getUTCDay();

    // FILTER: Only count log if habit allows this weekday
    if (log.habit.weekDays.includes(dayOfWeek)) {
        const current = summaryMap.get(dateKey) || { completed: 0, total: 0 };
        current.completed += 1;
        summaryMap.set(dateKey, current);
    }
  });

  for (const [dateStr, data] of summaryMap) {
      const dateDate = new Date(dateStr);
      const dayOfWeek = dateDate.getUTCDay(); 
      
      const possibleHabits = habits.filter(h => 
          h.weekDays.includes(dayOfWeek) && 
          dayjs(h.createdAt).startOf('day').isBefore(dayjs(dateDate).endOf('day'))
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

export async function getHabitDetails(habitId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const habit = await prisma.habit.findUnique({
    where: { id: habitId, userId },
    include: {
      logs: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!habit) return null;

  // Streak Calculation
  const logs = habit.logs.filter(l => l.completed);
  let currentStreak = 0;
  let bestStreak = 0;

  // Calculate Current Streak
  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (logs.length > 0) {
      const lastLogDate = new Date(logs[0].date);
      lastLogDate.setHours(0,0,0,0);

      if (lastLogDate.getTime() === today.getTime() || lastLogDate.getTime() === yesterday.getTime()) {
          let streakDate = new Date(lastLogDate);
          
          for (const log of logs) {
             const logDate = new Date(log.date);
             logDate.setHours(0,0,0,0);
             
             if (logDate.getTime() === streakDate.getTime()) {
                 currentStreak++;
                 streakDate.setDate(streakDate.getDate() - 1);
             } else {
                 break;
             }
          }
      }
  }

  // Calculate Best Streak
  let tempStreak = 0;
  let prevDate = null;
  const sortedLogs = [...logs].sort((a,b) => a.date.getTime() - b.date.getTime());

  for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0,0,0,0);

      if (prevDate) {
          const expectedDate = new Date(prevDate);
          expectedDate.setDate(expectedDate.getDate() + 1);
          
          if (logDate.getTime() === expectedDate.getTime()) {
              tempStreak++;
          } else if (logDate.getTime() === prevDate.getTime()) {
              // Same day
          } else {
              tempStreak = 1;
          }
      } else {
          tempStreak = 1;
      }

      if (tempStreak > bestStreak) bestStreak = tempStreak;
      prevDate = logDate;
  }

  return {
      ...habit,
      currentStreak,
      bestStreak
  };
}
