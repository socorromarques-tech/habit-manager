'use client';

import { useRef } from 'react';
import { createHabit } from '@/app/actions';

export default function HabitForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    const title = formData.get('title');
    const goalStr = formData.get('goal');
    
    if (typeof title !== 'string' || !title) return;
    const goal = goalStr ? parseInt(goalStr.toString(), 10) : 1;

    await createHabit(title, goal);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={action} className="flex gap-2 items-end">
      <div className="flex-1">
        <input
          name="title"
          type="text"
          placeholder="Novo hábito (ex: Beber Água)"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>
      <div className="w-24">
        <input
          name="goal"
          type="number"
          min="1"
          defaultValue="1"
          placeholder="Meta"
          title="Quantas vezes ao dia?"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Adicionar
      </button>
    </form>
  );
}
