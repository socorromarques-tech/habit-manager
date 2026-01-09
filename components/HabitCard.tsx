'use client';

import { deleteHabit, updateHabitProgress } from '@/app/actions';
import { Habit, HabitLog } from '@prisma/client';
import { cn } from '@/lib/utils';

type HabitWithLogs = Habit & {
  logs: HabitLog[];
};

export default function HabitCard({ habit }: { habit: HabitWithLogs }) {
  // Generate last 365 days
  const today = new Date();
  const days = Array.from({ length: 365 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (364 - i));
    return d;
  });

  return (
    <div key={habit.id} className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{habit.title}</h3>
          <p className="text-sm text-muted-foreground">
             Meta: {habit.goal}x ao dia
          </p>
        </div>
        <button
          onClick={() => deleteHabit(habit.id)}
          className="text-muted-foreground hover:text-destructive"
          title="Excluir hábito"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {days.map((date) => {
          // Check if log exists for this date
          const log = habit.logs.find((l) => {
            const logDate = new Date(l.date);
            return (
              logDate.getUTCDate() === date.getUTCDate() &&
              logDate.getUTCMonth() === date.getUTCMonth() &&
              logDate.getUTCFullYear() === date.getUTCFullYear()
            );
          });
          
          const count = log?.count || 0;
          const isCompleted = !!log?.completed;

          // Color logic
          let colorClass = "bg-muted hover:bg-muted-foreground/30";
          if (isCompleted) {
            colorClass = "bg-green-500 hover:bg-green-600";
          } else if (count > 0) {
            // Partial progress - Yellow/Orange
            // Calculate opacity or simplified step
            colorClass = "bg-yellow-400 hover:bg-yellow-500";
          }

          return (
            <button
              key={date.toISOString()}
              onClick={() => updateHabitProgress(habit.id, date)}
              title={`${date.toLocaleDateString()}: ${count}/${habit.goal}`}
              className={cn(
                "h-3 w-3 rounded-sm transition-colors",
                colorClass
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
