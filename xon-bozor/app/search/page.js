import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getT } from "@/lib/i18n";
import {
  newPhones,
  usedPhones,
  appliances,
  accessories,
  fetchProducts,
} from "@/lib/products";

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  const queryStr = q ? `"${q}"` : "";
  return {
    title: queryStr ? `${queryStr} bo'yicha qidiruv natijalari — Xon Bozor` : "Qidiruv — Xon Bozor Internet Do'koni",
    description: queryStr
      ? `Xon Bozorda ${queryStr} bo'yicha qidiruv natijalari, original mahsulotlar va arzon narxlar.`
      : "Xon Bozor internet do'konida original telefonlar, maishiy texnika va aksessuarlarni qidirish.",
    alternates: { canonical: `/search${q ? `?q=${encodeURIComponent(q)}` : ""}` },
  };
}

export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams;
  const { t, lang } = await getT();
  const query = (q || "").toLowerCase().trim();

  const allStatic = [...newPhones, ...usedPhones, ...appliances, ...accessories];
  let results = [];

  if (query) {
    const apiResults = await fetchProducts({ search: query });
    if (apiResults.length > 0) {
      results = apiResults;
    } else {
      results = allStatic.filter((p) => (p.name || "").toLowerCase().includes(query));
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#0f1015] transition-colors">
      <Header t={t} lang={lang} />
      <main className="flex-1 mx-auto min-h-[60vh] max-w-7xl px-4 py-8 w-full">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          {query ? `"${q}" bo'yicha qidiruv natijalari` : "Mahsulotlarni qidirish"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {results.length} ta mahsulot topildi
        </p>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
            Hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {results.map((p) => (
              <ProductCard key={p.id || p._id} product={p} t={t} />
            ))}
          </div>
        )}
      </main>
      <Footer t={t} />
    </div>
  );
}


