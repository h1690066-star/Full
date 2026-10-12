import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogClient from "@/components/CatalogClient";
import { getT } from "@/lib/i18n";
import { fetchProducts } from "@/lib/products";

export const metadata = {
  title: "Mahsulotlar Katalogi — Original telefonlar va maishiy texnika | Xon Bozor",
  description: "Xon Bozor: barcha mobil telefonlar, maishiy texnika va aksessuarlar eng arzon narxda, kafolat va muddatli to'lov bilan Toshkent bo'yicha tezkor yetkazib beriladi.",
  alternates: { canonical: "/catalog" },
  openGraph: {
    title: "Mahsulotlar Katalogi — Xon Bozor",
    description: "Original smartfonlar, maishiy texnika va aksessuarlar rasmiy kafolat bilan.",
    url: "/catalog",
    siteName: "Xon Bozor",
    locale: "uz_UZ",
    type: "website",
  },
};


export default async function Page() {
  const { t, lang } = await getT();
  const products = await fetchProducts({ limit: 100 });
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#0f1015]">
      <Header t={t} lang={lang} />
      <main className="flex-1 pb-16">
        <CatalogClient products={products} categoryName={t.cats?.all || "Mahsulotlar"} t={t} />
      </main>
      <Footer t={t} />
    </div>
  );
}

