'use client';

import { useRef } from 'react';
import { createHabit } from '@/app/actions';

export default function HabitForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    const title = formData.get('title');
    if (typeof title !== 'string' || !title) return;

    await createHabit(title);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={action} className="flex gap-2">
      <input
        name="title"
        type="text"
        placeholder="Novo hábito (ex: Ler 10 páginas)"
        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Adicionar
      </button>
    </form>
  );
}
