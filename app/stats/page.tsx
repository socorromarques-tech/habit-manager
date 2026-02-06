import { getOverallStats, getHabitsWithStreaks } from '@/app/actions';
import { Flame, Trophy, Target, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default async function StatsPage() {
  const stats = await getOverallStats();
  const habits = await getHabitsWithStreaks();

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Estatisticas</h1>
        <Link 
          href="/" 
          className="text-zinc-400 hover:text-white text-sm"
        >
          Voltar
        </Link>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Target className="text-green-500" />}
          label="Habitos Ativos"
          value={stats.totalHabits}
        />
        <StatCard 
          icon={<Calendar className="text-blue-500" />}
          label="Total Concluidos"
          value={stats.totalCompletions}
        />
        <StatCard 
          icon={<Flame className="text-orange-500" />}
          label="Maior Streak"
          value={`${stats.bestStreak} dias`}
        />
        <StatCard 
          icon={<TrendingUp className="text-purple-500" />}
          label="Taxa (30 dias)"
          value={`${stats.completionRate}%`}
        />
      </div>

      {/* Melhor Habito */}
      {stats.bestHabit && (
        <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border border-orange-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Habito em destaque</p>
              <p className="text-xl font-bold text-white">{stats.bestHabit}</p>
            </div>
          </div>
        </div>
      )}

      {/* Estatisticas por Dia da Semana */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-zinc-400" />
          Conclusoes por Dia da Semana
        </h2>
        <div className="flex justify-between items-end h-32 gap-2">
          {stats.weekdayStats.map((day) => {
            const maxCount = Math.max(...stats.weekdayStats.map(d => d.count), 1);
            const height = (day.count / maxCount) * 100;
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-green-600 rounded-t-lg transition-all"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-xs text-zinc-500">{day.day}</span>
                <span className="text-xs text-zinc-400 font-bold">{day.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progresso Mensal */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Progresso Mensal</h2>
        <div className="flex justify-between items-end h-32 gap-2">
          {stats.monthlyProgress.map((month) => {
            const rate = month.total > 0 ? (month.completed / month.total) * 100 : 0;
            return (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-blue-600 rounded-t-lg transition-all"
                  style={{ height: `${Math.max(rate, 4)}%` }}
                />
                <span className="text-xs text-zinc-500">{month.month}</span>
                <span className="text-xs text-zinc-400">{Math.round(rate)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de Habitos com Streaks */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Seus Habitos</h2>
        <div className="flex flex-col gap-3">
          {habits.length === 0 ? (
            <p className="text-zinc-500 text-sm">Nenhum habito cadastrado.</p>
          ) : (
            habits.map(habit => (
              <div key={habit.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-semibold">{habit.title}</span>
                  <span className="text-xs text-zinc-500">{habit.totalCompleted} conclusoes</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-500">Streak atual</span>
                    <span className="font-bold text-orange-400 flex items-center gap-1">
                      <Flame size={14} /> {habit.currentStreak}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-500">Recorde</span>
                    <span className="font-bold text-yellow-400">{habit.longestStreak}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
