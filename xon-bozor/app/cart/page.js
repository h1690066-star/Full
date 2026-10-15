import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartClient from "@/components/CartClient";
import { getT } from "@/lib/i18n";

export const metadata = {
  title: "Savat — Xon Bozor Internet Do'koni",
  description: "Savatdagi tanlangan smartfonlar, maishiy texnika va aksessuarlarni ko'rish hamda tezkor buyurtma berish.",
  alternates: { canonical: "/cart" },
};

export default async function CartPage() {
  const { t, lang } = await getT();
  return (
    <>
      <Header t={t} lang={lang} />
      <main className="relative min-h-[60vh] overflow-hidden bg-slate-50/60 pb-28 transition-colors dark:bg-night min-[601px]:pb-0">
        {/* Decorative ambient background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px]">
          <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent)] dark:opacity-[0.15]" />
          <div className="absolute -top-32 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl dark:bg-brand/20" />
          <div className="absolute -top-20 right-[8%] h-[220px] w-[320px] rounded-full bg-accent/10 blur-3xl dark:bg-accent/10" />
        </div>
        <div className="relative z-10">
          <CartClient t={t} />
        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
