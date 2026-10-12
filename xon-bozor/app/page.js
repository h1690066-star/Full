import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import CategoriesSection from "@/components/CategoriesSection";
import Footer from "@/components/Footer";
import { getT } from "@/lib/i18n";
import { fetchProductsByCategory } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xonbozor.uz";

export default async function Home() {
  const { t, lang } = await getT();
  const s = t.sections;

  const [apiPhones, apiUsed, apiAppliances] = await Promise.all([
    fetchProductsByCategory("Phones"),
    fetchProductsByCategory("Used Phones"),
    fetchProductsByCategory("Home appliances"),
  ]);

  const phonesToShow = apiPhones || [];
  const usedToShow = apiUsed || [];
  const appliancesToShow = apiAppliances || [];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Xon Bozor",
      url: SITE,
      logo: `${SITE}/logo.png`,
      telephone: "+998950813809",
      address: { "@type": "PostalAddress", addressLocality: "Toshkent", addressCountry: "UZ" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Xon Bozor",
      url: SITE,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header t={t} lang={lang} />
      <main>
        <h1 className="sr-only">Xon Bozor — Mobil &amp; Texnika</h1>
        <Hero t={t} />
        <ProductSection id="new" title={s.newPhones} href="/catalog/phones" allLabel={s.all} products={phonesToShow} t={t} />
        <ProductSection id="used" title={s.usedPhones} href="/catalog/used" allLabel={s.allUsed} products={usedToShow} t={t} />
        <ProductSection id="appliances" title={s.appliances} href="/catalog/appliances" allLabel={s.allAppliances} products={appliancesToShow} t={t} />
        <CategoriesSection t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
