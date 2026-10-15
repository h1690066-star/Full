import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import ProductSkeleton from "@/components/ProductSkeleton";
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

// YouTube-uslubidagi darhol scroll bo'ladigan bo'lim skeleti
function SectionSkeleton({ id, title, href, allLabel }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold sm:text-2xl text-slate-900 dark:text-white">
          {title}
        </h2>
        <span className="text-xs font-semibold text-brand">
          {allLabel}
        </span>
      </div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4">
        <ProductSkeleton count={5} />
      </div>
    </section>
  );
}

// Orqa fonda ma'lumotlarni olib keluvchi asinxron komponent
async function AsyncProductSection({ id, title, href, allLabel, filterFn, t, priority = false, productsPromise }) {
  const allProducts = (await productsPromise) || [];
  const productsToShow = allProducts.filter(filterFn).slice(0, 10);
  return (
    <ProductSection id={id} title={title} href={href} allLabel={allLabel} products={productsToShow} t={t} priority={priority} />
  );
}

export default async function Home() {
  const { t, lang } = await getT();
  const s = t.sections;
  const productsPromise = fetchProducts({ limit: 60 });

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

        {/* 1. Yangi telefonlar (Skelet bilan darhol yuklanadi, LCP priority) */}
        <Suspense fallback={<SectionSkeleton id="new" title={s.newPhones} href="/catalog/phones" allLabel={s.all} />}>
          <AsyncProductSection
            id="new"
            title={s.newPhones}
            href="/catalog/phones"
            allLabel={s.all}
            productsPromise={productsPromise}
            priority={true}
            filterFn={(p) => !p.used && (p.category === "Phones" || !p.category)}
            t={t}
          />
        </Suspense>

        {/* 2. B/U smartfonlar (Skelet bilan darhol yuklanadi) */}
        <Suspense fallback={<SectionSkeleton id="used" title={s.usedPhones} href="/catalog/used" allLabel={s.allUsed} />}>
          <AsyncProductSection
            id="used"
            title={s.usedPhones}
            href="/catalog/used"
            allLabel={s.allUsed}
            productsPromise={productsPromise}
            filterFn={(p) => p.used}
            t={t}
          />
        </Suspense>

        {/* 3. Maishiy texnika (Skelet bilan darhol yuklanadi) */}
        <Suspense fallback={<SectionSkeleton id="appliances" title={s.appliances} href="/catalog/appliances" allLabel={s.allAppliances} />}>
          <AsyncProductSection
            id="appliances"
            title={s.appliances}
            href="/catalog/appliances"
            allLabel={s.allAppliances}
            productsPromise={productsPromise}
            filterFn={(p) =>
              p.category === "Home appliances" ||
              p.category === "Elektronika" ||
              p.category === "Maishiy texnika"
            }
            t={t}
          />
        </Suspense>

        <CategoriesSection t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
