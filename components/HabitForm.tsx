'use client';

import { useRef, useState } from 'react';
import { createHabit } from '@/app/actions';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Checkbox from '@radix-ui/react-checkbox';

const weekDays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export default function HabitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);

  async function action(formData: FormData) {
    const title = formData.get('title');
    const goal = 1; 

    if (typeof title !== 'string' || !title) return;
    if (selectedWeekDays.length === 0) {
        toast.error("Selecione pelo menos um dia da semana!");
        return;
    }

    try {
      await createHabit(title, goal, selectedWeekDays);
      toast.success("Hábito criado com sucesso!");
      formRef.current?.reset();
      setSelectedWeekDays([]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao criar hábito.");
      }
    }
  }
  
  function toggleWeekDay(weekDayIndex: number) {
    if (selectedWeekDays.includes(weekDayIndex)) {
      setSelectedWeekDays(prevState => prevState.filter(day => day !== weekDayIndex));
    } else {
      setSelectedWeekDays(prevState => [...prevState, weekDayIndex]);
    }
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-6 p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
      <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-semibold leading-tight text-zinc-100">
            Qual seu novo hábito?
          </label>
          <input
            name="title"
            id="title"
            type="text"
            placeholder="ex.: Exercícios, dormir bem, etc..."
            className="p-4 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
            required
            autoFocus
          />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold leading-tight text-zinc-100">
          Qual a recorrência?
        </label>
         
        <div className="flex flex-col gap-2 mt-2">
            {weekDays.map((weekDay, index) => (
                <div key={weekDay} className="flex items-center gap-3">
                   <Checkbox.Root 
                        className="w-6 h-6 rounded flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-zinc-900 group"
                        checked={selectedWeekDays.includes(index)}
                        onCheckedChange={() => toggleWeekDay(index)}
                   >
                     <Checkbox.Indicator>
                        <Check size={16} className="text-white" />
                     </Checkbox.Indicator>
                   </Checkbox.Root>
                   <span className="text-white leading-tight">
                        {weekDay}
                   </span>
                </div>
            ))}
        </div>
      </div>
      
      <button
        type="submit"
        className="mt-6 rounded-lg bg-green-600 p-4 flex items-center justify-center gap-3 font-semibold hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
      >
        <Check size={20}  />
        Confirmar
      </button>
    </form>
  );
}
