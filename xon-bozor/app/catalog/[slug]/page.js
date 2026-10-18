import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogClient from "@/components/CatalogClient";
import { getT } from "@/lib/i18n";
import { fetchProducts, fetchProductsByCategory } from "@/lib/products";

export const revalidate = 30;

const BRAND_MAP = {
  iphone: "Apple",
  apple: "Apple",
  samsung: "Samsung",
  xiaomi: "Xiaomi",
  honor: "Honor",
  redmi: "Xiaomi",
  artel: "Artel",
  lg: "LG",
  midea: "Midea",
  hofmann: "Hofmann",
  bosch: "Bosch",
  shivaki: "Shivaki",
  haier: "Haier",
  avalon: "Avalon",
  tefal: "Tefal",
  panasonic: "Panasonic",
};

const CATEGORY_MAP = {
  phones: "Phones",
  iphone: "Phones",
  samsung: "Phones",
  xiaomi: "Phones",
  honor: "Phones",
  redmi: "Phones",
  used: "Used Phones",
  appliances: "Home appliances",
  accessories: "Aksessuarlar",
  electronics: "Elektronika",
  elektronika: "Elektronika",
  tv: "Elektronika",
  computers: "Elektronika",
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  const title = `${name} — Original mahsulotlar va muddatli to'lov | Xon Bozor`;
  const description = `Xon Bozor katalogida ${name}: Toshkentda original va kafolatlangan smartfonlar, maishiy texnika hamda aksessuarlar eng arzon narxda.`;
  return {
    title,
    description,
    alternates: { canonical: `/catalog/${slug}` },
    openGraph: {
      title,
      description,
      url: `/catalog/${slug}`,
      siteName: "Xon Bozor",
      locale: "uz_UZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Catalog({ params }) {
  const { slug } = await params;
  const { t, lang } = await getT();

  let list = [];
  const slugLower = (slug || "").toLowerCase();
  const cat = CATEGORY_MAP[slugLower];
  const brand = BRAND_MAP[slugLower];

  if (cat) {
    list = await fetchProductsByCategory(cat, [], 10000);
  } else {
    list = await fetchProducts({ limit: 10000 });
  }

  if (brand && list.length > 0) {
    const brandLower = brand.toLowerCase();
    const brandFiltered = list.filter((p) => {
      const pBrand = (p.brand || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      return pBrand === brandLower || pBrand.includes(brandLower) || pName.includes(brandLower);
    });
    if (brandFiltered.length > 0) list = brandFiltered;
  } else if (!cat && list.length > 0) {
    // Agar slug toifada ham, brend xaritasida ham bo'lmasa, erkin qidiramiz
    const matched = list.filter((p) => {
      const pBrand = (p.brand || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase();
      return pBrand.includes(slugLower) || pName.includes(slugLower) || pCat.includes(slugLower);
    });
    if (matched.length > 0) list = matched;
  }

  if (slugLower === "used" && list.length > 0) {
    const usedFiltered = list.filter((p) => p.used);
    if (usedFiltered.length > 0) list = usedFiltered;
  }

  if (slugLower === "tv" && list.length > 0) {
    const tvFiltered = list.filter((p) => {
      const txt = `${p.name || ""} ${p.category || ""} ${p.brand || ""}`.toLowerCase();
      return (
        txt.includes("tv") ||
        txt.includes("televizor") ||
        txt.includes("audio") ||
        txt.includes("smart") ||
        txt.includes("showpro") ||
        txt.includes("sound")
      );
    });
    if (tvFiltered.length > 0) list = tvFiltered;
  }

  if (slugLower === "computers" && list.length > 0) {
    const compFiltered = list.filter((p) => {
      const txt = `${p.name || ""} ${p.category || ""} ${p.brand || ""}`.toLowerCase();
      return (
        txt.includes("asus") ||
        txt.includes("tuf") ||
        txt.includes("msi") ||
        txt.includes("rtx") ||
        txt.includes("gtx") ||
        txt.includes("geforce") ||
        txt.includes("nvidia") ||
        txt.includes("laptop") ||
        txt.includes("pc") ||
        txt.includes("kompyuter")
      );
    });
    if (compFiltered.length > 0) list = compFiltered;
  }

  const catName = t.cats?.[slug] || t.nav?.[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#0f1015]">
      <Header t={t} lang={lang} />
      <main className="flex-1 pb-16">
        <CatalogClient products={list} categoryName={catName} categorySlug={slug} t={t} />
      </main>
      <Footer t={t} />
    </div>
  );
}
