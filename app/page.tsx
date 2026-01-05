import { getHabits } from './actions';
import HabitForm from '@/components/HabitForm';
import HabitCard from '@/components/HabitCard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions); // Pass options!
  const habits = await getHabits();

  return (
    <div className="flex flex-col gap-8">
      <header className="py-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Hábitos</h1>
          <p className="text-muted-foreground">Visualize sua consistência diária.</p>
        </div>
      </header>

      {session ? (
        <>
          <section className="rounded-xl border bg-card p-6 shadow-sm">
             <h2 className="mb-4 text-lg font-semibold">Novo Hábito</h2>
             <HabitForm />
          </section>

          <section className="grid gap-6">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
            {habits.length === 0 && (
              <p className="text-center text-muted-foreground py-10">
                Você ainda não tem nenhum hábito cadastrado.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Bem-vindo ao Habit Manager</h2>
          <p className="text-muted-foreground mb-6">
            Faça login para começar a rastrear seus hábitos.
          </p>
        </section>
      )}
    </div>
  );
}
