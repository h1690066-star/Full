import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import CategoriesSection from "@/components/CategoriesSection";
import Footer from "@/components/Footer";
import { getT } from "@/lib/i18n";
import { fetchProducts } from "@/lib/products";

export const revalidate = 60;

const SITE =
  (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://xonbozor.vercel.app";

export const metadata = {
  title: "Xon Bozor — Original telefonlar, B/U smartfonlar va maishiy texnika",
  description:
    "Xon Bozor: Toshkentda original iPhone, Samsung, Xiaomi telefonlari, tekshirilgan B/U smartfonlar, aksessuarlar va maishiy texnika. 0% muddatli to'lov, kafolat va tezkor yetkazish.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Xon Bozor",
    url: "/",
    locale: "uz_UZ",
    title: "Xon Bozor — Original telefonlar va maishiy texnika",
    description:
      "Toshkentda original smartfonlar va maishiy texnika rasmiy kafolat hamda 0% muddatli to'lov bilan.",
    images: [
      {
        url: "/images/hero/hero-1.png",
        width: 1200,
        height: 630,
        alt: "Xon Bozor",
      },
    ],
  },
};

export default async function Home() {
  const { t, lang } = await getT();
  const s = t.sections;

  const allProducts = (await fetchProducts({ limit: 60 })) || [];

  const phonesToShow = allProducts
    .filter((p) => !p.used && (p.category === "Phones" || !p.category))
    .slice(0, 10);

  const usedToShow = allProducts
    .filter((p) => p.used)
    .slice(0, 10);

  const appliancesToShow = allProducts
    .filter(
      (p) =>
        p.category === "Home appliances" ||
        p.category === "Elektronika" ||
        p.category === "Maishiy texnika"
    )
    .slice(0, 10);

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
