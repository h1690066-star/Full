export default function ProductSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-2.5 shadow-sm animate-pulse"
        >
          {/* Aspect square image placeholder */}
          <div className="relative aspect-square w-full rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />

          {/* Content placeholder */}
          <div className="flex flex-1 flex-col justify-between pt-2.5 px-1 space-y-3">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-amber-200/60 dark:bg-amber-500/20" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between min-h-[36px]">
              <div className="space-y-1">
                <div className="h-3 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-9 w-9 rounded-xl bg-purple-200/60 dark:bg-brand/30" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

