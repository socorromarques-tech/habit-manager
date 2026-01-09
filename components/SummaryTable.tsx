'use client';

import { useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { getSummary, toggleHabitLog, getHabits } from '@/app/actions'; // We need a way to get habits for the modal
import { Habit } from '@prisma/client';
import { toast } from 'sonner';

// Generate dates from beginning of year
const summaryDates = Array.from({ length: 18 * 7 }).map((_, i) => {
  return dayjs().startOf('year').add(i, 'days');
});

export function SummaryTable() {
  const [summary, setSummary] = useState<any[]>([]);
  
  useEffect(() => {
     getSummary().then(setSummary);
  }, []);

  return (
    <div className="w-full flex items-center justify-center overflow-x-scroll">
      <div className="grid grid-rows-7 grid-flow-col gap-3">
        {summaryDates.map((date) => {
          const dayInSummary = summary.find((day) => dayjs(date).isSame(day.date, 'day'));
          
          return (
            <HabitDay 
              key={date.toString()}
              date={date.toDate()}
              defaultCompleted={dayInSummary?.completed}
              amount={dayInSummary?.total}
            />
          );
        })}
      </div>
    </div>
  );
}

function HabitDay({ date, defaultCompleted = 0, amount = 0 }: { date: Date, defaultCompleted?: number, amount?: number }) {
  const completedPercentage = amount > 0 ? Math.round((defaultCompleted / amount) * 100) : 0;
  
  // Green scale logic
  const bgClass = clsx("w-10 h-10 border-2 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-background", {
    'bg-zinc-900 border-zinc-800': completedPercentage === 0,
    'bg-green-900 border-green-700': completedPercentage > 0 && completedPercentage < 20,
    'bg-green-800 border-green-600': completedPercentage >= 20 && completedPercentage < 40,
    'bg-green-700 border-green-500': completedPercentage >= 40 && completedPercentage < 60,
    'bg-green-600 border-green-500': completedPercentage >= 60 && completedPercentage < 80,
    'bg-green-500 border-green-400': completedPercentage >= 80,
  });

  return (
    <Popover.Root>
      <Popover.Trigger 
        className={bgClass}
        title={`${dayjs(date).format('DD/MM')} - ${defaultCompleted}/${amount}`}
      />
      <Popover.Portal>
        <Popover.Content className="min-w-[320px] p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col shadow-xl focus:outline-none z-50 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
          <span className="font-semibold text-zinc-400">{dayjs(date).format('dddd')}</span>
          <span className="mt-1 font-extrabold leading-tight text-3xl">{dayjs(date).format('DD/MM')}</span>

          <div className="h-2 rounded-xl bg-zinc-800 mt-4 w-full">
            <div 
              className="h-full rounded-xl bg-green-500 transition-all"
              style={{ width: `${completedPercentage}%` }}
            />
          </div>

          <HabitsList date={date} />
          <Popover.Arrow height={8} width={16} className="fill-zinc-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function HabitsList({ date }: { date: Date }) {
  // Simplification: Fetching habits client side for now or need server action
  // For V1 Senior, let's just show a static list or fetch via server action on mount
  const [habits, setHabits] = useState<any[]>([]);
  
  useEffect(() => {
     // Ideally pass habits as prop or fetch
     // Reuse getHabits but we need to know status for THIS date
     // Implementing a dedicated action `getHabitsForDay(date)` would be better.
     // For now, mockup or simple fetch
     getHabits().then(setHabits); 
  }, []);

  async function handleToggle(habitId: string) {
     await toggleHabitLog(habitId, date);
     toast.success("Atualizado!");
     // Need to refetch or optimist update?
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {habits.map(habit => {
         // Check if completed on this date
         // This logic belongs in backend for efficiency but doing client side map for speed
         const isCompleted = habit.logs.some((l:any) => dayjs(l.date).isSame(date, 'day') && l.completed);
         
         return (
           <div key={habit.id} onClick={() => handleToggle(habit.id)} className="flex items-center gap-3 group focus:outline-none cursor-pointer">
             <div className={clsx("h-8 w-8 rounded-lg flex items-center justify-center border-2 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500", isCompleted ? "bg-green-500 border-green-500" : "bg-zinc-900 border-zinc-800 group-hover:border-zinc-700")}>
                {isCompleted && "✔"}
             </div>
             <span className={clsx("font-semibold text-xl leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400", isCompleted && "line-through text-zinc-400")}>
               {habit.title}
             </span>
           </div>
         )
      })}
    </div>
  )
}
