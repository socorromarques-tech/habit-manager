'use client';

import { useRef } from 'react';
import { createHabit } from '@/app/actions';
import { toast } from 'sonner';
import { Plus } from 'lucide-react'; // Assuming we might want an icon, or just text

export default function HabitForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    const title = formData.get('title');
    // Goal defaults to 1 for simple "Check" mechanic
    const goal = 1; 
    
    if (typeof title !== 'string' || !title) return;

    try {
      await createHabit(title, goal);
      toast.success("Hábito criado com sucesso!");
      formRef.current?.reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao criar hábito.");
      }
    }
  }

  return (
    <form ref={formRef} action={action} className="w-full max-w-md flex gap-2 items-center bg-zinc-900 p-2 rounded-xl border border-zinc-800 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
      <input
        name="title"
        type="text"
        placeholder="Qual seu novo hábito?"
        className="flex-1 bg-transparent px-3 py-2 text-white placeholder:text-zinc-500 outline-none text-base"
        required
      />
      
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg font-bold flex items-center justify-center transition-colors group"
      >
        <span className="hidden sm:inline mr-2">Confirmar</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </form>
  );
}
