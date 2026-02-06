'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

dayjs.locale('pt-br');

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

interface MonthlyCalendarProps {
    logs: { date: string | Date; completed: boolean }[];
}

export function MonthlyCalendar({ logs }: MonthlyCalendarProps) {
    const [currentDate, setCurrentDate] = useState(dayjs());

    // Generate days for the grid
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startWeekday = startOfMonth.day();
    const daysInMonth = currentDate.daysInMonth();

    const calendarGrid = [];

    // Empty slots for previous month
    for (let i = 0; i < startWeekday; i++) {
        calendarGrid.push(null);
    }

    // Days of actual month
    for (let i = 1; i <= daysInMonth; i++) {
        calendarGrid.push(startOfMonth.date(i));
    }

    function isCompleted(date: dayjs.Dayjs) {
        return logs.some(log => dayjs(log.date).isSame(date, 'day') && log.completed);
    }

    function changeMonth(delta: number) {
        setCurrentDate(prev => prev.add(delta, 'month'));
    }

    return (
        <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full">
             <div className="flex items-center justify-between">
                 <h3 className="font-bold text-lg capitalize text-zinc-100">
                     {currentDate.format('MMMM YYYY')}
                 </h3>
                 
                 <div className="flex gap-2">
                     <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white">
                         <ChevronLeft size={20} />
                     </button>
                     <button onClick={() => changeMonth(1)} disabled={currentDate.isSame(dayjs(), 'month')} className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer disabled:cursor-default">
                         <ChevronRight size={20} />
                     </button>
                 </div>
             </div>

             <div className="grid grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
                 {weekDays.map((day, i) => (
                     <div key={`${day}-${i}`} className="text-zinc-500 text-xs sm:text-sm font-bold text-center py-2 uppercase">
                         {day}
                     </div>
                 ))}

                 {calendarGrid.map((date, i) => {
                     if (!date) {
                         return <div key={`empty-${i}`} className="aspect-square" />;
                     }
                     
                     const completed = isCompleted(date);
                     const isFuture = date.isAfter(dayjs(), 'day');
                     const isToday = date.isSame(dayjs(), 'day');

                     return (
                         <div 
                            key={date.toString()} 
                            className={clsx("aspect-square rounded-lg flex items-center justify-center text-sm sm:text-base font-medium border relative group transition-all",
                                completed ? "bg-green-600 border-green-500 text-white" : "bg-black/20 border-white/5 text-zinc-400",
                                isToday && !completed && "border-zinc-500 text-zinc-100",
                                isFuture && "opacity-30"
                            )}
                         >
                             {date.date()}
                         </div>
                     )
                 })}
             </div>
        </div>
    );
}
