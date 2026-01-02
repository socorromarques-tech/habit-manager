export default function Home() {
  // Mock data for visualization
  const days = Array.from({ length: 365 }, (_, i) => {
    // Randomly assign a level 0-4
    const level = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
    return level;
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="py-6">
        <h1 className="text-3xl font-bold tracking-tight">Meus Hábitos</h1>
        <p className="text-muted-foreground">Visualize sua consistência diária.</p>
      </header>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Visão Geral (Mock)</h2>
        <div className="flex flex-wrap gap-1">
          {days.map((level, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-sm ${
                level === 0
                  ? "bg-muted"
                  : level === 1
                  ? "bg-green-900"
                  : level === 2
                  ? "bg-green-700"
                  : level === 3
                  ? "bg-green-500"
                  : "bg-green-300"
              }`}
              title={`Dia ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card de Hábito Exemplo */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Beber Água</h3>
            <span className="text-xs text-muted-foreground">🔥 12 dias</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Meta: 2L por dia</p>
          <button className="mt-4 w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Marcar como Feito
          </button>
        </div>

         <div className="rounded-lg border bg-card p-4 shadow-sm border-dashed flex items-center justify-center h-32 text-muted-foreground hover:bg-accent cursor-pointer transition-colors">
            + Novo Hábito
        </div>
      </div>
    </div>
  );
}
