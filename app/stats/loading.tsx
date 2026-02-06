export default function StatsLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-zinc-800 rounded animate-pulse" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Best habit skeleton */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-zinc-800 rounded animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
            <div className="h-6 w-36 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Weekday chart skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="flex justify-between items-end h-32 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-zinc-800 rounded-t-lg animate-pulse"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
              <div className="h-3 w-6 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Monthly progress skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="h-6 w-40 bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="flex justify-between items-end h-32 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-zinc-800 rounded-t-lg animate-pulse"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
              <div className="h-3 w-8 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Habits list skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex flex-col gap-2">
                <div className="h-5 w-32 bg-zinc-700 rounded animate-pulse" />
                <div className="h-3 w-20 bg-zinc-700 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1">
                  <div className="h-3 w-16 bg-zinc-700 rounded animate-pulse" />
                  <div className="h-5 w-10 bg-zinc-700 rounded animate-pulse" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="h-3 w-12 bg-zinc-700 rounded animate-pulse" />
                  <div className="h-5 w-8 bg-zinc-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
