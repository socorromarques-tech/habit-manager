'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { getSummary, toggleHabitLog, getHabits, deleteHabit } from '@/app/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import 'dayjs/locale/pt-br';
import HabitsManager from './HabitsManager';
import { Trash2, Calendar, ListChecks, CheckCircle2 } from 'lucide-react'; 
import { useRouter } from 'next/navigation';

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
  const [activeTab, setActiveTab] = useState<'day' | 'all'>('day');
  const router = useRouter();
  
  const refreshSummary = () => {
    getSummary().then(setSummary);
    router.refresh(); 
  };

  useEffect(() => {
     refreshSummary();
  }, []);

  function handleDayClick(date: Date) {
      setSelectedDate(date);
      setActiveTab('day'); // Switch to Day view
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      
      {/* Layout Split: Heatmap (Left/Top) vs Panel (Right/Bottom) */}
      <div className="w-full max-w-[1248px] flex flex-col lg:flex-row gap-12 items-start justify-center">

        {/* 1. Heatmap Section */}
        <div className="flex-1 overflow-x-auto pb-4 max-w-2xl bg-black/20 p-6 rounded-2xl border border-white/5">
             <div className="flex gap-2">
                <div className="grid grid-rows-7 grid-flow-row gap-2 pt-0.5">
                    {weekDays.map((weekDay, i) => (
                    <div key={`${weekDay}-${i}`} className="text-zinc-500 text-xs h-8 flex items-center justify-center font-bold">
                        {weekDay}
                    </div>
                    ))}
                </div>

                <div className="grid grid-rows-7 grid-flow-col gap-2">
                    {summaryDates.map((dateObj, i) => {
                    if (!dateObj) {
                        return <div key={`empty-${i}`} className="w-8 h-8" />;
                    }

                    const date = dateObj.toDate();
                    const dayInSummary = summary.find((day) => dayjs(date).isSame(day.date, 'day'));
                    const isFuture = dayjs(date).isAfter(dayjs(), 'day');
                    const isSelected = dayjs(date).isSame(selectedDate, 'day');
                    
                    return (
                        <HabitDay 
                          key={date.toString()}
                          date={date}
                          defaultCompleted={dayInSummary?.completed}
                          amount={dayInSummary?.total}
                          isFuture={isFuture}
                          isSelected={isSelected}
                          onClick={() => !isFuture && handleDayClick(date)}
                        />
                    );
                    })}
                </div>
            </div>
        </div>

        {/* 2. Intelligent Side Panel */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
            
            {/* Tabs */}
            <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                <button 
                   onClick={() => setActiveTab('day')}
                   className={clsx("flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all", 
                       activeTab === 'day' ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                   )}
                >
                    <Calendar size={16} /> Dia
                </button>
                <button 
                   onClick={() => setActiveTab('all')}
                   className={clsx("flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all", 
                       activeTab === 'all' ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                   )}
                >
                    <ListChecks size={16} /> Todos os Hábitos
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-black/20 rounded-2xl p-0.5 min-h-[400px]">
                {activeTab === 'day' ? (
                   <DayDetailsView 
                        date={selectedDate} 
                        onUpdate={refreshSummary} 
                   />
                ) : (
                   <HabitsManager 
                        onUpdate={refreshSummary} 
                   />
                )}
            </div>

        </div>

      </div>
    </div>
  );
}

function HabitDay({ date, defaultCompleted = 0, amount = 0, isFuture, isSelected, onClick }: any) {
  const completedPercentage = amount > 0 ? Math.round((defaultCompleted / amount) * 100) : 0;
  
  const bgClass = clsx("w-8 h-8 rounded-lg cursor-pointer transition-all border-2", {
    'bg-zinc-900 border-zinc-800': completedPercentage === 0,
    'bg-green-900 border-green-700': completedPercentage > 0 && completedPercentage < 20,
    'bg-green-800 border-green-600': completedPercentage >= 20 && completedPercentage < 40,
    'bg-green-700 border-green-500': completedPercentage >= 40 && completedPercentage < 60,
    'bg-green-600 border-green-500': completedPercentage >= 60 && completedPercentage < 80,
    'bg-green-500 border-green-400': completedPercentage >= 80,
    'ring-2 ring-white ring-offset-2 ring-offset-zinc-900': isSelected,
    'opacity-50 cursor-not-allowed': isFuture
  });

  return (
    <div 
        onClick={onClick}
        className={bgClass} 
        title={isFuture ? "Futuro bloqueado" : dayjs(date).format('DD/MM/YYYY')} 
    />
  );
}

function DayDetailsView({ date, onUpdate }: { date: Date, onUpdate: () => void }) {
    const [habits, setHabits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const dayOfWeekStr = dayjs(date).format('dddd');
    const dayAndMonth = dayjs(date).format('DD/MM');

    useEffect(() => {
        setLoading(true);
        getHabits().then(allHabits => {
          const dayOfWeek = dayjs(date).day();
          const relevantHabits = allHabits.filter((h: any) => h.weekDays.includes(dayOfWeek));
          setHabits(relevantHabits);
          setLoading(false);
        }); 
    }, [date]);
  
    async function handleToggle(habitId: string) {
       await toggleHabitLog(habitId, date);
       // Optimistic / Reload
       const updatedHabits = habits.map(h => {
           if (h.id === habitId) {
                // Determine new state loosely (real state comes from DB re-fetch, but for snap use toggle)
                // Actually safer to re-fetch
           }
           return h;
       });
       // Just refetch
       getHabits().then(all => {
         const dayOfWeek = dayjs(date).day();
         setHabits(all.filter((h: any) => h.weekDays.includes(dayOfWeek)));
       });
       onUpdate();
    }
  
    return (
      <div className="flex flex-col gap-6 p-4">
         <div className="flex flex-col gap-1">
            <span className="font-semibold text-zinc-400 capitalize">{dayOfWeekStr}</span>
            <span className="font-extrabold leading-tight text-3xl">{dayAndMonth}</span>
         </div>
  
         <div className="h-1 bg-zinc-800 w-full rounded-full" />

         <div className="flex flex-col gap-3">
          {loading ? (
             <span className="text-zinc-500 text-sm">Carregando dia...</span>
          ) : habits.length === 0 ? (
             <span className="text-zinc-500 text-sm py-4">Nenhum hábito planejado para este dia.</span>
          ) : (
            habits.map(habit => {
               const isCompleted = habit.logs.some((l:any) => dayjs(l.date).isSame(date, 'day') && l.completed);
               
               return (
                 <div key={habit.id} onClick={() => handleToggle(habit.id)} className="flex items-center gap-3 group focus:outline-none cursor-pointer bg-zinc-900/50 p-3 rounded-xl border border-transparent hover:border-zinc-700 transition-all">
                   <div className={clsx("h-6 w-6 rounded-md flex items-center justify-center border-2 transition-colors", isCompleted ? "bg-green-500 border-green-500" : "bg-zinc-800 border-zinc-700 group-hover:border-zinc-600")}>
                      {isCompleted && <CheckCircle2 size={16} className="text-white" />}
                   </div>
                   <span className={clsx("font-semibold text-lg leading-tight transition-colors", isCompleted ? "line-through text-zinc-500" : "text-white")}>
                     {habit.title}
                   </span>
                 </div>
               )
            })
          )}
        </div>
      </div>
    )
}
