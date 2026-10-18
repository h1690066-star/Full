import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WishlistClient from "@/components/WishlistClient";
import { getT } from "@/lib/i18n";

export const metadata = {
  title: "Saralanganlar — Xon Bozor Internet Do'koni",
  description: "Sevimli va saqlab qo'yilgan smartfonlar hamda maishiy texnika ro'yxati.",
  alternates: { canonical: "/wishlist" },
};

export default async function WishlistPage() {
  const { t, lang } = await getT();
  return (
    <>
      <Header t={t} lang={lang} />
      <main className="min-h-[60vh] bg-slate-50/50 dark:bg-[#0f1015] transition-colors pb-28 min-[1121px]:pb-12">
        <WishlistClient t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}


