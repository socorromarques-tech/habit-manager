import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SummaryTable } from "@/components/SummaryTable";
import HabitForm from "@/components/HabitForm";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Habit Manager
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Controle sua rotina, alcance suas metas. O jeito simples e visual de evoluir.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-16 py-8">
      
      {/* Header / Form Section */}
      <div className="flex flex-col gap-4">
         <h2 className="text-3xl font-bold">Meu Painel</h2>
         <div className="w-full max-w-xl">
            <HabitForm />
         </div>
      </div>

      {/* The Ignite Grid */}
      <div className="w-full">
        <SummaryTable />
      </div>

    </div>
  );
}
