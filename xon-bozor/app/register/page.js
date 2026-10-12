import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { getT } from "@/lib/i18n";
import { MdOutlineVerified, MdPercent, MdShield } from "react-icons/md";

export const metadata = { title: "Ro'yxatdan o'tish - Xon Bozor", robots: { index: false, follow: false } };

export default async function Page() {
  const { t, lang } = await getT();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1015]">
      <Header t={t} lang={lang} />
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          <div className="hidden md:flex flex-col space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand font-bold text-xs w-max">
              <MdOutlineVerified className="text-base" />
              <span>Yangi mijozlar uchun maxsus imkoniyatlar</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
              Bugunoq Ro'yxatdan o'ting!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Profil rasmingizni yuklang, 0% muddatli to'lov va maxsus chegirmalarga ega bo'ling. Hammasi bir necha soniyada!
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#1a1b22]/80 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold">
                  <MdPercent className="text-xl" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">0% Muddatli to'lov</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Ortiqcha to'lovsiz</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#1a1b22]/80 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold">
                  <MdShield className="text-xl" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Kafolatlangan sifat</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Xavfsiz xarid</p>
                </div>
              </div>
            </div>
          </div>

          <AuthForm mode="register" t={t} />
        </div>
      </main>
      <Footer t={t} />
    </div>
  );
}

