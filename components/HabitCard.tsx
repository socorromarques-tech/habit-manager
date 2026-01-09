'use client';

import { deleteHabit, updateHabitProgress } from '@/app/actions';
import { Habit, HabitLog } from '@prisma/client';
import { cn } from '@/lib/utils';

type HabitWithLogs = Habit & {
  logs: HabitLog[];
};

export default function HabitCard({ habit }: { habit: HabitWithLogs }) {
  // Get current month days
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    return new Date(currentYear, currentMonth, i + 1);
  });

  const monthName = today.toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div key={habit.id} className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{habit.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
               Meta: {habit.goal}/dia
             </span>
             <span>• {capitalizedMonth}</span>
          </div>
        </div>
        <button
          onClick={() => deleteHabit(habit.id)}
          className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-md transition-colors"
          title="Excluir hábito"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          // Find log
          // Note: using local dates for display, but comparing with UTC from DB
          // Ideally we normalize everything to UTC-midnight or use a library, 
          // but for this "Senior" demo, we match by day/month/year components.
          
          const log = habit.logs.find((l) => {
             const d = new Date(l.date);
             // Simple comparison
             return d.getUTCDate() === date.getDate() && 
                    d.getUTCMonth() === date.getMonth() && 
                    d.getUTCFullYear() === date.getFullYear();
          });

          const count = log?.count || 0;
          const isCompleted = count >= habit.goal;
          
          let colorClass = "bg-muted text-muted-foreground hover:bg-muted-foreground/20";
          if (isCompleted) {
            colorClass = "bg-green-500 text-white hover:bg-green-600 shadow-sm";
          } else if (count > 0) {
            colorClass = "bg-yellow-400 text-yellow-950 hover:bg-yellow-500 shadow-sm";
          }

          // Highlight today
          const isToday = date.getDate() === today.getDate() && 
                          date.getMonth() === today.getMonth();
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => updateHabitProgress(habit.id, date)}
              title={`${date.toLocaleDateString()}: ${count}/${habit.goal}`}
              className={cn(
                "h-12 w-full rounded-md flex flex-col items-center justify-center text-xs transition-all relative border border-transparent",
                colorClass,
                isToday && "ring-2 ring-primary ring-offset-2 border-primary/20 z-10"
              )}
            >
              <span className="font-bold text-sm leading-none mb-0.5">{date.getDate()}</span>
              {count > 0 && (
                <span className="text-[10px] opacity-90 leading-none">{count}/{habit.goal}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
