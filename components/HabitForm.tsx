'use client';

import { useRef, useState, useEffect } from 'react';
import { createHabit, updateHabit } from '@/app/actions';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CATEGORIES } from '@/lib/categories';
import { clsx } from 'clsx';

const weekDays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

interface HabitFormProps {
    initialData?: {
        id: string;
        title: string;
        description?: string | null;
        weekDays: number[];
        category?: string | null;
        goal?: number;
    } | null;
    onSuccess?: () => void;
}

export default function HabitForm({ initialData, onSuccess }: HabitFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
      if (initialData) {
          setTitle(initialData.title);
          setDescription(initialData.description || '');
          setSelectedWeekDays(initialData.weekDays);
          setCategory(initialData.category || undefined);
      } else {
          setTitle('');
          setDescription('');
          setSelectedWeekDays([]);
          setCategory(undefined);
      }
  }, [initialData]);


  async function action(formData: FormData) {
    const titleEntry = formData.get('title');
    const descEntry = formData.get('description');
    const goal = 1; 

    if (typeof titleEntry !== 'string' || !titleEntry) return;
    const desc = typeof descEntry === 'string' ? descEntry : undefined;
    
    if (selectedWeekDays.length === 0) {
        toast.error("Selecione pelo menos um dia da semana!");
        return;
    }

    try {
      if (initialData) {
         await updateHabit(initialData.id, titleEntry, goal, selectedWeekDays, desc, category);
         toast.success("Hábito atualizado com sucesso!");
      } else {
         await createHabit(titleEntry, goal, selectedWeekDays, desc, category);
         toast.success("Hábito criado com sucesso!");
      }

      formRef.current?.reset();
      setTitle('');
      setDescription('');
      setSelectedWeekDays([]);
      setCategory(undefined);
      
      if (onSuccess) {
          onSuccess();
      }

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao salvar hábito.");
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
    <form ref={formRef} action={action} className="flex flex-col gap-6 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-semibold leading-tight text-zinc-100">
            {initialData ? 'Editar hábito' : 'Qual seu novo hábito?'}
          </label>
          <input
            name="title"
            id="title"
            type="text"
            placeholder="ex.: Exercícios, dormir bem, etc..."
            className="p-4 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
      </div>

       <div className="flex flex-col gap-2">
          <label className="font-semibold leading-tight text-zinc-100">
            Categoria
          </label>
          <div className="grid grid-cols-2 gap-4"> 
              {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={clsx("p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all", 
                            category === cat.id 
                            ? `bg-white/10 border-white text-white`
                            : "bg-zinc-800 border-transparent text-zinc-400 hover:border-zinc-700"
                        )}
                        style={{ borderColor: category === cat.id ? cat.color : undefined }}
                      >
                          <Icon size={24} color={category === cat.id ? cat.color : 'currentColor'} />
                          <span className="text-sm font-bold truncate">{cat.name}</span>
                      </button>
                  )
              })}
          </div>
      </div>


      <div className="flex flex-col gap-2">
          <label htmlFor="description" className="font-semibold leading-tight text-zinc-100">
            Qual sua motivação?
          </label>
          <textarea
            name="description"
            id="description"
            placeholder="ex.: Para ter mais energia durante o dia..."
            className="p-4 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-zinc-900 resize-none h-24"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        {initialData ? 'Salvar alterações' : 'Confirmar'}
      </button>
    </form>
  );
}
