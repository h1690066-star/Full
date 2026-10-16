export default function ProductSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#181920] overflow-hidden shadow-xs animate-pulse"
        >
          {/* 1:1 Kvadrat rasm maydoni */}
          <div className="relative aspect-square w-full bg-slate-100 dark:bg-[#12131a]" />

          {/* Ma'lumotlar skeleti */}
          <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5 space-y-3">
            <div className="space-y-1.5">
              {/* Narx */}
              <div className="h-5 w-28 rounded-md bg-slate-200 dark:bg-white/[0.08]" />
              {/* Muddatli to'lov */}
              <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-white/[0.08]" />
              {/* Nomi (2 qator) */}
              <div className="space-y-1 pt-0.5">
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-white/[0.08]" />
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/[0.08]" />
              </div>
              {/* Reyting */}
              <div className="h-3 w-16 rounded bg-slate-200 dark:bg-white/[0.08] pt-1" />
            </div>

            {/* To'liq enli Savat tugmasi skeleti */}
            <div className="pt-2">
              <div className="h-10 sm:h-11 w-full rounded-xl bg-slate-200 dark:bg-white/[0.08]" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
