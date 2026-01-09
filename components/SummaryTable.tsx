'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { getSummary, toggleHabitLog, getHabits } from '@/app/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

// Generate days to fill the grid (from start of year)
const summaryDates = Array.from({ length: 18 * 7 }).map((_, i) => {
  return dayjs().startOf('year').add(i, 'days');
});

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function SummaryTable() {
  const [summary, setSummary] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  useEffect(() => {
     getSummary().then(setSummary);
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
      
      {/* Left Column: The Heatmap Grid */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-2">
          {/* Weekday Labels */}
          <div className="grid grid-rows-7 grid-flow-row gap-2 pt-0.5">
            {weekDays.map((weekDay, i) => (
              <div 
                key={`${weekDay}-${i}`} 
                className="text-zinc-500 text-xs h-8 flex items-center justify-center font-bold"
              >
                {weekDay}
              </div>
            ))}
          </div>

          {/* The Grid */}
          <div className="grid grid-rows-7 grid-flow-col gap-2">
            {summaryDates.map((date) => {
              const dayInSummary = summary.find((day) => dayjs(date).isSame(day.date, 'day'));
              const isSelected = dayjs(date).isSame(selectedDate, 'day');
              
              return (
                <HabitDay 
                  key={date.toString()}
                  date={date.toDate()}
                  defaultCompleted={dayInSummary?.completed}
                  amount={dayInSummary?.total}
                  isSelected={isSelected}
                  onClick={() => setSelectedDate(date.toDate())}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: The Side Panel (Mini Screen) */}
      <div className="w-full md:w-80 min-w-[320px] sticky top-8">
        <DayDetailsPanel date={selectedDate} />
      </div>

    </div>
  );
}

function HabitDay({ 
  date, 
  defaultCompleted = 0, 
  amount = 0, 
  isSelected,
  onClick 
}: { 
  date: Date, 
  defaultCompleted?: number, 
  amount?: number, 
  isSelected?: boolean,
  onClick: () => void
}) {
  const completedPercentage = amount > 0 ? Math.round((defaultCompleted / amount) * 100) : 0;
  
  // Green scale logic - Smaller squares (w-8 h-8)
  const bgClass = clsx("w-8 h-8 rounded-lg cursor-pointer transition-all border-2", {
    'bg-zinc-900 border-zinc-800': completedPercentage === 0,
    'bg-green-900 border-green-700': completedPercentage > 0 && completedPercentage < 20,
    'bg-green-800 border-green-600': completedPercentage >= 20 && completedPercentage < 40,
    'bg-green-700 border-green-500': completedPercentage >= 40 && completedPercentage < 60,
    'bg-green-600 border-green-500': completedPercentage >= 60 && completedPercentage < 80,
    'bg-green-500 border-green-400': completedPercentage >= 80,
    'ring-2 ring-white ring-offset-2 ring-offset-background': isSelected
  });

  return (
    <div 
      onClick={onClick}
      className={bgClass}
      // No Title/Tooltip to keep it extremely clean as requested
    />
  );
}

function DayDetailsPanel({ date }: { date: Date }) {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
     setLoading(true);
     getHabits().then(h => {
       setHabits(h);
       setLoading(false);
     }); 
  }, [date]); // Refresh when date changes (or optimize to fetch once and filter)

  async function handleToggle(habitId: string) {
     await toggleHabitLog(habitId, date);
     
     // Optimistic update
     setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
           const wasCompleted = h.logs.some((l:any) => dayjs(l.date).isSame(date, 'day') && l.completed);
           const newLogs = wasCompleted 
              ? h.logs.filter((l:any) => !dayjs(l.date).isSame(date, 'day'))
              : [...h.logs, { date: date.toISOString(), completed: true }];
           return { ...h, logs: newLogs };
        }
        return h;
     }));
  }
  
  const completedCount = habits.filter(h => h.logs.some((l:any) => dayjs(l.date).isSame(date, 'day') && l.completed)).length;
  const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col shadow-xl">
      <span className="font-semibold text-zinc-400 capitalize">{dayjs(date).format('dddd')}</span>
      <span className="mt-1 font-extrabold leading-tight text-3xl">{dayjs(date).format('DD/MM')}</span>

      <div className="h-2 rounded-xl bg-zinc-800 mt-4 w-full">
        <div 
          className="h-full rounded-xl bg-green-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
           <span className="text-zinc-500">Carregando...</span>
        ) : habits.length === 0 ? (
           <span className="text-zinc-500">Nenhum hábito cadastrado.</span>
        ) : (
          habits.map(habit => {
             const isCompleted = habit.logs.some((l:any) => dayjs(l.date).isSame(date, 'day') && l.completed);
             
             return (
               <div key={habit.id} onClick={() => handleToggle(habit.id)} className="flex items-center gap-3 group focus:outline-none cursor-pointer p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                 <div className={clsx("h-6 w-6 rounded flex items-center justify-center border-2 transition-colors", isCompleted ? "bg-green-500 border-green-500" : "bg-transparent border-zinc-700 group-hover:border-zinc-600")}>
                    {isCompleted && <span className="text-white text-xs font-bold">✔</span>}
                 </div>
                 <span className={clsx("font-semibold text-lg leading-tight transition-colors", isCompleted ? "line-through text-zinc-500" : "text-zinc-100")}>
                   {habit.title}
                 </span>
               </div>
             )
          })
        )}
      </div>
    </div>
  );
}
