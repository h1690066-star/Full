import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { getT } from "@/lib/i18n";
import { MdOutlineVerified, MdLocalShipping, MdShield } from "react-icons/md";

export const metadata = { title: "Kirish - Xon Bozor", robots: { index: false, follow: false } };

export default async function Page() {
  const { t, lang } = await getT();
  return (
    <div className="min-h-screen flex flex-col">
      <Header t={t} lang={lang} />
      <main className="relative flex-1 overflow-hidden px-4 py-8 pb-28 sm:py-12 min-[601px]:pb-12">
        <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Brand panel (desktop) */}
          <div className="relative hidden overflow-hidden rounded-4xl bg-brand-gradient p-10 text-white shadow-glow-lg lg:flex lg:flex-col lg:justify-between animate-fade-up">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
            <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.07] mix-blend-overlay" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

            <div className="relative space-y-6">
              <div className="inline-flex w-max items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold backdrop-blur">
                <MdOutlineVerified className="text-base" />
                <span>Xon Bozor - Rasmiy internet do'koni</span>
              </div>
              <h2 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl">
                Ajoyib xaridlar olamiga xush kelibsiz!
              </h2>
              <p className="max-w-md text-[15px] leading-relaxed text-white/80">
                Hisobingizga kiring, saralangan va savatdagi mahsulotlarni kuzating, qulay 0% muddatli to'lov va tezkor yetkazishdan bahramand bo'ling.
              </p>
            </div>

            <div className="relative mt-10 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-inner-hl">
                  <MdLocalShipping className="text-xl" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Tez yetkazish</h4>
                  <p className="text-xs text-white/70">Butun O'zbekiston</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-inner-hl">
                  <MdShield className="text-xl" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">100% Kafolat</h4>
                  <p className="text-xs text-white/70">Original tovarlar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex items-center justify-center lg:py-8">
            <AuthForm mode="login" t={t} />
          </div>
        </div>
      </main>
      <Footer t={t} />
    </div>
  );
}

