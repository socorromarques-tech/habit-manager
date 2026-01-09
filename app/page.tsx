import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SummaryTable } from "@/components/SummaryTable";

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
    <div className="w-full flex items-center justify-center py-8">
      {/* Centered Ignite Layout */}
      <div className="w-full max-w-[1248px] px-8">
        <SummaryTable />
      </div>
    </div>
  );
}
