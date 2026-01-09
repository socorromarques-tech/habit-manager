'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { getSummary, toggleHabitLog, getHabits, deleteHabit } from '@/app/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  useEffect(() => {
     getSummary().then(setSummary);
  }, [selectedDate]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
      
      {/* Left: Heatmap Grid */}
      <div className="flex-1 overflow-x-auto pb-4">
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
              const isSelected = dayjs(date).isSame(selectedDate, 'day');
              // Correct logic: Is the date strictly AFTER today (ignoring time)?
              const isFuture = dayjs(date).isAfter(dayjs(), 'day');
              
              return (
                <HabitDay 
                  key={date.toString()}
                  date={date}
                  defaultCompleted={dayInSummary?.completed}
                  amount={dayInSummary?.total}
                  isSelected={isSelected}
                  onClick={() => !isFuture && setSelectedDate(date)} 
                  isFuture={isFuture}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Side Panel */}
      <div className="w-full md:w-80 min-w-[320px] sticky top-8">
        <DayDetailsPanel 
            date={selectedDate} 
            onUpdate={() => getSummary().then(setSummary)}
        />
      </div>

    </div>
  );
}

function HabitDay({ date, defaultCompleted = 0, amount = 0, isSelected, onClick, isFuture }: any) {
  const completedPercentage = amount > 0 ? Math.round((defaultCompleted / amount) * 100) : 0;
  
  const bgClass = clsx("w-8 h-8 rounded-lg cursor-pointer transition-all border-2", {
    'bg-zinc-900 border-zinc-800': completedPercentage === 0,
    'bg-green-900 border-green-700': completedPercentage > 0 && completedPercentage < 20,
    'bg-green-800 border-green-600': completedPercentage >= 20 && completedPercentage < 40,
    'bg-green-700 border-green-500': completedPercentage >= 40 && completedPercentage < 60,
    'bg-green-600 border-green-500': completedPercentage >= 60 && completedPercentage < 80,
    'bg-green-500 border-green-400': completedPercentage >= 80,
    'ring-2 ring-white ring-offset-2 ring-offset-background': isSelected,
    'opacity-50 cursor-not-allowed': isFuture
  });

  return (
    <div 
      onClick={isFuture ? undefined : onClick}
      className={bgClass}
      title={dayjs(date).format('DD/MM/YYYY')}
    />
  );
}

function DayDetailsPanel({ date, onUpdate }: { date: Date, onUpdate: () => void }) {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // Correct logic here too
  const isFuture = dayjs(date).isAfter(dayjs(), 'day');

  useEffect(() => {
     setLoading(true);
     getHabits().then(h => {
       setHabits(h);
       setLoading(false);
     }); 
  }, [date]);

  async function handleToggle(habitId: string) {
     if (isFuture) {
         toast.error("Você não pode marcar hábitos no futuro! 🔮");
         return;
     }

     await toggleHabitLog(habitId, date);
     getHabits().then(setHabits);
     onUpdate();
  }

  async function handleDelete(habitId: string) {
      if(!confirm("Tem certeza que deseja excluir este hábito?")) return;
      await deleteHabit(habitId);
      toast.success("Hábito excluído!");
      getHabits().then(setHabits);
      onUpdate();
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
               <div key={habit.id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                   <div 
                     onClick={() => handleToggle(habit.id)}
                     className={cn("flex items-center gap-3 cursor-pointer flex-1", isFuture && "opacity-50 cursor-not-allowed")}
                   >
                     <div className={clsx("h-6 w-6 rounded flex items-center justify-center border-2 transition-colors", isCompleted ? "bg-green-500 border-green-500" : "bg-transparent border-zinc-700 group-hover:border-zinc-600")}>
                        {isCompleted && <span className="text-white text-xs font-bold">✔</span>}
                     </div>
                     <span className={clsx("font-semibold text-lg leading-tight transition-colors", isCompleted ? "line-through text-zinc-500" : "text-zinc-100")}>
                       {habit.title}
                     </span>
                   </div>

                   <button 
                      onClick={() => handleDelete(habit.id)}
                      className="text-zinc-500 hover:text-red-500 p-2 transition-colors"
                      title="Excluir"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                   </button>
               </div>
             )
          })
        )}
      </div>
    </div>
  );
}
