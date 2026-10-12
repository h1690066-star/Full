import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center bg-slate-50/50 dark:bg-[#0f1015] transition-colors">
      <h1 className="text-6xl font-black text-brand">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">Sahifa topilmadi</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-dark transition"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
