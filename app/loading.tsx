export default function Loading() {
  return (
    <div className="w-full flex items-center justify-center py-8">
      <div className="w-full max-w-[1248px] px-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        {/* Calendar skeleton */}
        <div className="flex gap-3">
          {/* Days of week header */}
          <div className="flex flex-col gap-3">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((_, i) => (
              <div key={i} className="h-5 w-5 bg-zinc-800 rounded animate-pulse" />
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-3">
            {Array.from({ length: 18 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-3">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-5 h-5 bg-zinc-800 rounded animate-pulse"
                    style={{ animationDelay: `${(weekIndex + dayIndex) * 20}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Habits list skeleton */}
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-zinc-800 rounded animate-pulse" />
                <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
