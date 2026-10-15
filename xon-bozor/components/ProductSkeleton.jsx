export default function ProductSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#181920] p-2.5 sm:p-3 shadow-xs animate-pulse"
        >
          {/* Katta kvadrat rasm maydoni (YouTube skelet uslubida) */}
          <div className="relative aspect-square w-full rounded-xl bg-slate-200 dark:bg-slate-800" />

          {/* Ma'lumotlar skelet chiziqlari */}
          <div className="flex flex-1 flex-col justify-between pt-3 px-0.5 space-y-3">
            <div className="space-y-2">
              {/* Muddatli to'lov nishoni */}
              <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
              {/* Sarlavha chiziqlari */}
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              {/* Reyting chizig'i */}
              <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Narx va tugma skelet maydoni */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 flex items-center justify-between min-h-[38px]">
              <div className="space-y-1">
                <div className="h-3 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
