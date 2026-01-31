import { getHabitDetails } from '@/app/actions';
import { StreakStats } from '@/components/StreakStats';
import { MonthlyCalendar } from '@/components/MonthlyCalendar';
import { getCategory } from '@/lib/categories';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export default async function HabitDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const habit = await getHabitDetails(id);

    if (!habit) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <span className="text-zinc-400">Hábito não encontrado.</span>
                <Link href="/" className="text-green-500 hover:underline">Voltar para o início</Link>
            </div>
        )
    }

    const category = getCategory(habit.category);

    return (
        <div className="w-full flex justify-center py-8 px-8">
            <div className="w-full max-w-[800px] flex flex-col gap-8">
                
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <Link href="/" className="self-start text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                    
                    <div className="flex flex-col gap-2">
                        {category && (
                            <span className="self-start text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border flex items-center gap-2" style={{color: category.color, borderColor: category.color}}>
                                <category.icon size={12} /> {category.name}
                            </span>
                        )}
                        <h1 className="text-3xl font-extrabold leading-tight">{habit.title}</h1>
                        <span className="text-zinc-400 text-lg">Criado em {dayjs(habit.createdAt).format('DD/MM/YYYY')}</span>
                    </div>

                    {habit.description && (
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl italic text-zinc-300 flex gap-4">
                             <div className="h-full w-1 rounded-full" style={{backgroundColor: category ? category.color : '#22c55e'}} />
                             <span>"{habit.description}"</span>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                <StreakStats currentStreak={habit.currentStreak} bestStreak={habit.bestStreak} />

                {/* Visual History Calendar */}
                <div className="flex flex-col gap-4 mt-4">
                     <h3 className="font-bold text-xl flex items-center gap-2">
                        <Calendar size={20} className="text-green-500" />
                        Histórico
                     </h3>
                     
                     <MonthlyCalendar logs={habit.logs} />
                </div>

            </div>
        </div>
    );
}
