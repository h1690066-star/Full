export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#f8f7fc] dark:bg-[#0f1015] text-slate-900 dark:text-slate-100 pb-14">
      {/* Top Breadcrumb Skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-3 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-3 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-44 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800/80 shadow-xs animate-pulse flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-slate-300 dark:bg-slate-700/60" />
            </div>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-20 w-20 rounded-2xl bg-slate-200 dark:bg-slate-800/80 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-brand/20 animate-pulse" />
              <div className="h-8 w-4/5 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>

            {/* Price Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-9 w-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-12 w-full rounded-xl bg-amber-100/70 dark:bg-amber-950/20 animate-pulse" />
            </div>

            {/* Color Swatches Skeleton */}
            <div className="space-y-2.5">
              <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Memory Skeleton */}
            <div className="space-y-2.5">
              <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-10 w-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Buttons Skeleton */}
            <div className="flex gap-3 pt-3">
              <div className="h-12 w-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-12 flex-1 rounded-xl bg-brand/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
