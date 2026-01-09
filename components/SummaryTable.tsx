'use client';

import { useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { getSummary, toggleHabitLog, getHabits, deleteHabit } from '@/app/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import 'dayjs/locale/pt-br';
import HabitForm from './HabitForm';

dayjs.locale('pt-br');

// Generate days to fill the grid (from start of year)
const generateSummaryDates = () => {
  const startOfYear = dayjs().startOf('year');
  const startWeekday = startOfYear.day(); 
  
  const dates = [];
  
  for (let i = 0; i < startWeekday; i++) {
    dates.push(null);
  }

  for (let i = 0; i < 18 * 7; i++) {
    dates.push(startOfYear.add(i, 'days'));
  }

  return dates;
};

const summaryDates = generateSummaryDates();
const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function SummaryTable() {
  const [summary, setSummary] = useState<any[]>([]);
  
  useEffect(() => {
     getSummary().then(setSummary);
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row gap-12 items-start justify-center">
      
      {/* Left: Heatmap Grid */}
      <div className="flex-1 overflow-x-auto pb-4 max-w-2xl">
        <div className="flex gap-2">
          {/* Labels */}
          <div className="grid grid-rows-7 grid-flow-row gap-2 pt-0.5">
            {weekDays.map((weekDay, i) => (
              <div key={`${weekDay}-${i}`} className="text-zinc-500 text-xs h-8 flex items-center justify-center font-bold">
                {weekDay}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-rows-7 grid-flow-col gap-2">
            {summaryDates.map((dateObj, i) => {
              if (!dateObj) {
                  return <div key={`empty-${i}`} className="w-8 h-8" />;
              }

              const date = dateObj.toDate();
              const dayInSummary = summary.find((day) => dayjs(date).isSame(day.date, 'day'));
              const isFuture = dayjs(date).isAfter(dayjs(), 'day');
              
              return (
                <HabitDay 
                  key={date.toString()}
                  date={date}
                  defaultCompleted={dayInSummary?.completed}
                  amount={dayInSummary?.total}
                  isFuture={isFuture}
                  onUpdate={() => getSummary().then(setSummary)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Create Habit Form */}
      <div className="w-full md:w-[400px]">
         <h2 className="text-3xl font-extrabold mb-6 leading-tight">Criar Hábito</h2>
         <HabitForm />
      </div>

    </div>
  );
}

function HabitDay({ date, defaultCompleted = 0, amount = 0, isFuture, onUpdate }: any) {
  const completedPercentage = amount > 0 ? Math.round((defaultCompleted / amount) * 100) : 0;
  
  const bgClass = clsx("w-8 h-8 rounded-lg cursor-pointer transition-all border-2", {
    'bg-zinc-900 border-zinc-800': completedPercentage === 0,
    'bg-green-900 border-green-700': completedPercentage > 0 && completedPercentage < 20,
    'bg-green-800 border-green-600': completedPercentage >= 20 && completedPercentage < 40,
    'bg-green-700 border-green-500': completedPercentage >= 40 && completedPercentage < 60,
    'bg-green-600 border-green-500': completedPercentage >= 60 && completedPercentage < 80,
    'bg-green-500 border-green-400': completedPercentage >= 80,
    'opacity-50 cursor-not-allowed': isFuture
  });

  if (isFuture) {
      return (
        <div 
            className={bgClass} 
            title="Futuro bloqueado" 
        />
      );
  }

  return (
    <Popover.Root>
      <Popover.Trigger 
        className={bgClass}
        title={dayjs(date).format('DD/MM/YYYY')}
      />
      <Popover.Portal>
        <Popover.Content className="min-w-[320px] p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col shadow-xl focus:outline-none z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <span className="font-semibold text-zinc-400 capitalize">{dayjs(date).format('dddd')}</span>
          <span className="mt-1 font-extrabold leading-tight text-3xl">{dayjs(date).format('DD/MM')}</span>

          <div className="h-2 rounded-xl bg-zinc-800 mt-4 w-full">
            <div 
              className="h-full rounded-xl bg-green-500 transition-all"
              style={{ width: `${completedPercentage}%` }}
            />
          </div>

          <HabitsList date={date} onUpdate={onUpdate} />
          <Popover.Arrow height={8} width={16} className="fill-zinc-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function HabitsList({ date, onUpdate }: { date: Date, onUpdate: () => void }) {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
     getHabits().then(allHabits => {
       // Filter: Only show habits scheduled for this Week Day
       const dayOfWeek = dayjs(date).day();
       const relevantHabits = allHabits.filter((h: any) => h.weekDays.includes(dayOfWeek));
       setHabits(relevantHabits);
       setLoading(false);
     }); 
  }, [date]);

  async function handleToggle(habitId: string) {
     await toggleHabitLog(habitId, date);
     // Re-fetch logic
     getHabits().then(all => {
       const dayOfWeek = dayjs(date).day();
       setHabits(all.filter((h: any) => h.weekDays.includes(dayOfWeek)));
     });
     onUpdate();
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
        {loading ? (
           <span className="text-zinc-500">Carregando...</span>
        ) : habits.length === 0 ? (
           <span className="text-zinc-500">Nenhum hábito para hoje.</span>
        ) : (
          habits.map(habit => {
             const isCompleted = habit.logs.some((l:any) => dayjs(l.date).isSame(date, 'day') && l.completed);
             
             return (
               <div key={habit.id} onClick={() => handleToggle(habit.id)} className="flex items-center gap-3 group focus:outline-none cursor-pointer">
                 <div className={clsx("h-8 w-8 rounded-lg flex items-center justify-center border-2 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors", isCompleted ? "bg-green-500 border-green-500" : "bg-zinc-900 border-zinc-800 group-hover:border-zinc-700")}>
                    {isCompleted && <span className="text-white font-bold">✔</span>}
                 </div>
                 <span className={clsx("font-semibold text-xl leading-tight transition-colors", isCompleted ? "line-through text-zinc-400" : "text-white")}>
                   {habit.title}
                 </span>
               </div>
             )
          })
        )}
    </div>
  )
}
