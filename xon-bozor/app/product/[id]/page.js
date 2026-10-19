import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getT } from "@/lib/i18n";
import { mapApiProduct, fetchProducts } from "@/lib/products";
import { api } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const SITE =
    (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://xonbozor.vercel.app";
  try {
    const { connectToDatabase } = await import("@/lib/mongodb");
    const Product = (await import("@/lib/models/Product")).default;
    await connectToDatabase();
    const raw = await Product.findById(id).lean();
    if (raw?.name) {
      const p = mapApiProduct(raw);
      const title = `${p.name} — Narxi, xususiyatlari va muddatli to'lovi`;
      const description = `${p.name} eng arzon narxda (${p.price?.toLocaleString()} so'm). Rasmiy kafolat, 0% muddatli to'lov va Toshkent bo'yicha tezkor yetkazib berish.`;
      const img = p.image || `${SITE}/logo.png`;
      return {
        title,
        description,
        alternates: { canonical: `/product/${id}` },
        openGraph: {
          title: `${p.name} — Xon Bozor`,
          description,
          url: `/product/${id}`,
          siteName: "Xon Bozor",
          images: [{ url: img, alt: p.name }],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${p.name} — Xon Bozor`,
          description,
          images: [img],
        },
      };
    }
  } catch (e) {}

  try {
    const res = await api.get(`/api/products/${id}`);
    if (res.data?.product?.name) {
      const p = mapApiProduct(res.data.product);
      const title = `${p.name} — Narxi, xususiyatlari va muddatli to'lovi`;
      const description = `${p.name} eng arzon narxda (${p.price?.toLocaleString()} so'm). Rasmiy kafolat, 0% muddatli to'lov va Toshkent bo'yicha tezkor yetkazib berish.`;
      const img = p.image || `${SITE}/logo.png`;
      return {
        title,
        description,
        alternates: { canonical: `/product/${id}` },
        openGraph: {
          title: `${p.name} — Xon Bozor`,
          description,
          url: `/product/${id}`,
          siteName: "Xon Bozor",
          images: [{ url: img, alt: p.name }],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${p.name} — Xon Bozor`,
          description,
          images: [img],
        },
      };
    }
  } catch (e) {}
  return {
    title: "Mahsulot — Xon Bozor",
    description: "Xon Bozor: original mobil telefonlar va maishiy texnika kafolat bilan.",
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const { t, lang } = await getT();
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xonbozor.uz";

  let product = null;
  let related = [];

  // Direct MongoDB fetch on server
  try {
    const { connectToDatabase } = await import("@/lib/mongodb");
    const Product = (await import("@/lib/models/Product")).default;
    await connectToDatabase();
    const raw = await Product.findById(id).lean();
    if (raw) {
      product = mapApiProduct(raw);
      const relRaw = await Product.find({
        category: raw.category,
        _id: { $ne: raw._id },
        isActive: { $ne: false },
      })
        .limit(6)
        .lean();
      related = relRaw.map(mapApiProduct);
    }
  } catch (_) {}

  if (!product) {
    try {
      const res = await api.get(`/api/products/${id}`);
      if (res.data?.product) {
        product = mapApiProduct(res.data.product);
        related = (res.data.related || []).map(mapApiProduct);
      }
    } catch (e) {}
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1015]">
        <Header t={t} lang={lang} />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Mahsulot mavjud emas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Ushbu mahsulot topilmadi yoki bazadan o'chirilgan</p>
          <a
            href="/catalog"
            className="mt-6 inline-block rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-dark transition"
          >
            Katalogga o'tish
          </a>
        </main>
        <Footer t={t} />
      </div>
    );
  }

  if (related.length === 0) {
    related = await fetchProducts({ limit: 5 });
  }

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images?.length > 0 ? product.images : [product.image],
    description: product.description || `${product.name} Xon Bozorda rasmiy kafolat bilan.`,
    sku: `ART-${product.id}`,
    brand: { "@type": "Brand", name: product.brand || "Apple" },
    offers: {
      "@type": "Offer",
      url: `${SITE}/product/${product.id}`,
      priceCurrency: "UZS",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: product.used ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Xon Bozor Store" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || 4.9,
      reviewCount: product.reviews || 128,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Header t={t} lang={lang} />
      <main className="min-h-screen bg-slate-50/50 dark:bg-[#0f1015] text-slate-900 dark:text-slate-100 pb-24 min-[1121px]:pb-14 transition-colors">
        <ProductDetailClient product={product} related={related} t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
