import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import ProductSkeleton from "@/components/ProductSkeleton";
import CategoriesSection from "@/components/CategoriesSection";
import Footer from "@/components/Footer";
import { getT } from "@/lib/i18n";
import { fetchProducts } from "@/lib/products";
import { fetchSiteContent } from "@/lib/siteContent";

export const revalidate = 30;

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

// YouTube-uslubidagi darhol scroll bo'ladigan bo'lim skeleti
function SectionSkeleton({ id = "products", title = "Mahsulotlar", href = "/catalog", allLabel = "Barchasini ko'rish" }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-3 sm:px-4 pt-8 sm:pt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold sm:text-2xl text-slate-900 dark:text-white">
          {title}
        </h2>
        <span className="text-xs font-semibold text-brand">
          {allLabel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        <ProductSkeleton count={10} />
      </div>
    </section>
  );
}

// Orqa fonda ma'lumotlarni olib keluvchi asinxron komponent (Barcha mahsulotlar aralash holda)
async function AsyncProductSection({ id = "products", title, href, allLabel, t, priority = false, productsPromise }) {
  const allProducts = (await productsPromise) || [];
  return (
    <ProductSection
      id={id}
      title={title || "Mahsulotlar"}
      href={href || "/catalog"}
      allLabel={allLabel || "Barchasini ko'rish"}
      products={allProducts}
      t={t}
      priority={priority}
    />
  );
}

export default async function Home() {
  const [siteContent, { t, lang }] = await Promise.all([
    fetchSiteContent(),
    getT()
  ]);
  const s = t.sections;
  const productsPromise = fetchProducts({ limit: 10000 });

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
      <Header t={t} lang={lang} siteContent={siteContent} />
      <main>
        <h1 className="sr-only">Xon Bozor — Mobil &amp; Texnika</h1>
        <Hero t={t} siteContent={siteContent} />

        {/* Yagona Mahsulotlar bo'limi (Barcha toifalar aralash holda, bo'limlarga ajratilmagan) */}
        <Suspense
          fallback={
            <SectionSkeleton
              id="products"
              title={siteContent?.sections?.productsTitle || t.nav?.products || "Mahsulotlar"}
              href="/catalog"
              allLabel={siteContent?.sections?.allLabel || s?.all || "Barchasini ko'rish"}
            />
          }
        >
          <AsyncProductSection
            id="products"
            title={siteContent?.sections?.productsTitle || t.nav?.products || "Mahsulotlar"}
            href="/catalog"
            allLabel={siteContent?.sections?.allLabel || s?.all || "Barchasini ko'rish"}
            productsPromise={productsPromise}
            priority={true}
            t={t}
          />
        </Suspense>

        <CategoriesSection t={t} siteContent={siteContent} />
      </main>
      <Footer t={t} siteContent={siteContent} />
    </>
  );
}
