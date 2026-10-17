export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6 space-y-8 animate-pulse">
      {/* Top Hero Skeleton */}
      <div className="aspect-[16/10] sm:aspect-[16/7] lg:h-[350px] w-full rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />

      {/* Quick links skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-slate-200/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
          />
        ))}
      </div>

      {/* Section 1 Title */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-44 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-24 rounded bg-slate-200/60 dark:bg-slate-800/60" />
        </div>

        {/* 5 Cards Skeleton */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-2.5 shadow-xs space-y-3"
            >
              <div className="aspect-square w-full rounded-xl bg-slate-200/70 dark:bg-slate-800/60" />
              <div className="space-y-2 p-1">
                <div className="h-3.5 w-20 rounded bg-amber-200/50 dark:bg-amber-500/20" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-14 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800 pt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

