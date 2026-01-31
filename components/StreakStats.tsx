'use client';
import { Flame, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

interface StreakStatsProps {
    currentStreak: number;
    bestStreak: number;
}

export function StreakStats({ currentStreak, bestStreak }: StreakStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2 items-center justify-center">
                 <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-xs">
                     <Flame size={16} className="text-orange-500" />
                     Sequência Atual
                 </div>
                 <span className="text-4xl font-extrabold text-white">
                     {currentStreak} <span className="text-sm font-normal text-zinc-500">dias</span>
                 </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2 items-center justify-center">
                 <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-xs">
                     <Trophy size={16} className="text-yellow-500" />
                     Recorde
                 </div>
                 <span className="text-4xl font-extrabold text-white">
                     {bestStreak} <span className="text-sm font-normal text-zinc-500">dias</span>
                 </span>
            </div>
        </div>
    );
}
