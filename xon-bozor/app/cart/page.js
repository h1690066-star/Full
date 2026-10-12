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
      <main className="min-h-[60vh] bg-slate-50/50 dark:bg-[#0f1015] transition-colors">
        <CartClient t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}


