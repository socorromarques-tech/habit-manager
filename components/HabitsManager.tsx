'use client';

import { useState, useEffect } from 'react';
import { getHabits, deleteHabit } from '@/app/actions';
import { Trash2, Plus, X, Pencil, Quote } from 'lucide-react'; 
import { toast } from 'sonner';
import { clsx } from 'clsx';
import HabitForm from './HabitForm';
import Link from 'next/link';
import { getCategory } from '@/lib/categories';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function HabitsManager({ onUpdate }: { onUpdate: () => void }) {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any | null>(null);

  useEffect(() => {
     loadHabits();
  }, [isCreating, editingHabit]); 

  function loadHabits() {
    getHabits().then(h => {
        setHabits(h);
        setLoading(false);
    });
  }

  async function handleDelete(habitId: string) {
    if(!confirm("Tem certeza que deseja excluir permanentemente este hábito?")) return;
    await deleteHabit(habitId);
    toast.success("Hábito removido.");
    loadHabits();
    onUpdate(); 
  }
  
  function handleEdit(habit: any) {
      setEditingHabit(habit);
      setIsCreating(true); 
  }

  function closeForm() {
      setIsCreating(false);
      setEditingHabit(null);
  }

  if (isCreating || editingHabit) {
      return (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
              <button 
                onClick={closeForm}
                className="self-start text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1"
              >
                  <X size={14} /> Cancelar
              </button>
              <h3 className="font-bold text-xl">{editingHabit ? 'Editar Hábito' : 'Novo Hábito'}</h3>
              
              <HabitForm 
                 initialData={editingHabit} 
                 onSuccess={closeForm}
              />
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
        <button 
            onClick={() => setIsCreating(true)}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
        >
            <Plus size={20} />
            Novo Hábito
        </button>

        <div className="flex flex-col gap-3">
            <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider">Seus Hábitos ({habits.length})</h3>
            
            {loading ? (
                <div className="text-zinc-500 text-sm">Carregando...</div>
            ) : habits.length === 0 ? (
                <div className="text-zinc-500 text-sm text-center py-8">Nenhum hábito cadastrado.</div>
            ) : (
                habits.map(habit => {
                    const category = getCategory(habit.category);
                    const borderColor = category ? category.color : 'zinc-800'; // Fallback logic would be better with CSS var or specific handling
                    
                    return (
                    <div 
                        key={habit.id} 
                        className="bg-zinc-900 border p-4 rounded-xl flex flex-col gap-2 group transition-colors relative overflow-hidden"
                        style={{ borderColor: category ? category.color : undefined }}
                    >
                        {/* Thin colored line on left instead of full border if preferred, but border is nice */}
                        
                        <div className="flex justify-between items-start z-10">
                            <div className="flex flex-col gap-1">
                                {category && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: category.color}}>
                                        <category.icon size={12} /> {category.name}
                                    </span>
                                )}
                                <Link href={`/habits/${habit.id}`} className="font-bold text-lg leading-tight hover:underline hover:text-green-400 transition-colors">
                                    {habit.title}
                                </Link>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleEdit(habit)}
                                    className="p-1 text-zinc-600 hover:text-violet-500 transition-colors"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(habit.id)}
                                    className="p-1 text-zinc-600 hover:text-red-500 transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {habit.description && (
                            <div className="flex gap-2 items-start mt-1 mb-2 text-zinc-400 text-sm italic z-10">
                                <Quote size={12} className="min-w-[12px] mt-1 opacity-50" />
                                <span className="line-clamp-2">{habit.description}</span>
                            </div>
                        )}

                        <div className="flex gap-1 mt-auto z-10">
                            {weekDays.map((day, i) => (
                                <div 
                                    key={i}
                                    className={clsx("w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border", 
                                        habit.weekDays.includes(i) 
                                            ? "bg-green-900 border-green-800 text-green-400" 
                                            : "bg-transparent border-zinc-800 text-zinc-600 opacity-50"
                                    )}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                )})
            )}
        </div>
    </div>
  );
}
