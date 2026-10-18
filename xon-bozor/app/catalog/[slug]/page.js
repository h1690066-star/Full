import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogClient from "@/components/CatalogClient";
import { getT } from "@/lib/i18n";
import { fetchProducts, isComputerEquipment, isHouseholdAppliance } from "@/lib/products";

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
  asus: "ASUS",
  msi: "MSI",
  nvidia: "Nvidia",
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

  const allProducts = await fetchProducts({ limit: 10000 });
  const slugLower = (slug || "").toLowerCase();
  let list = [];

  if (slugLower === "samsung") {
    // Barcha Samsung mahsulotlari (Yangi, B/U telefonlar va Samsung maishiy/TV)
    list = allProducts.filter((p) => {
      const b = (p.brand || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      const c = (p.category || "").toLowerCase();
      return b.includes("samsung") || n.includes("samsung") || c.includes("samsung");
    });
  } else if (slugLower === "iphone" || slugLower === "apple") {
    list = allProducts.filter((p) => {
      const b = (p.brand || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      return b.includes("apple") || n.includes("iphone") || n.includes("apple");
    });
  } else if (slugLower === "xiaomi") {
    list = allProducts.filter((p) => {
      const b = (p.brand || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      return b.includes("xiaomi") || n.includes("xiaomi") || b.includes("redmi") || n.includes("redmi");
    });
  } else if (slugLower === "redmi") {
    list = allProducts.filter((p) => {
      const b = (p.brand || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      return b.includes("redmi") || n.includes("redmi") || n.includes("note");
    });
  } else if (slugLower === "honor") {
    list = allProducts.filter((p) => {
      const b = (p.brand || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      return b.includes("honor") || n.includes("honor");
    });
  } else if (slugLower === "used" || slugLower === "b-u") {
    list = allProducts.filter((p) => p.used === true);
  } else if (slugLower === "phones") {
    list = allProducts.filter((p) => !p.used && !isComputerEquipment(p) && !isHouseholdAppliance(p));
  } else if (slugLower === "appliances" || slugLower === "maishiy-texnika") {
    // Maishiy texnikada faqat uy texnikalari chiqadi, kompyuter jihozlari CHIQARILMAYDI
    list = allProducts.filter(isHouseholdAppliance);
  } else if (slugLower === "computers" || slugLower === "kompyuter-jihozlari") {
    // Kompyuter jihozlari bo'limi: noutbuklar, videokartalar, monitorlar va qismlar
    list = allProducts.filter(isComputerEquipment);
  } else if (slugLower === "tv") {
    list = allProducts.filter((p) => {
      const txt = `${p.name || ""} ${p.category || ""} ${p.brand || ""}`.toLowerCase();
      return txt.includes("tv") || txt.includes("televizor") || txt.includes("smart") || txt.includes("audio");
    });
  } else {
    const brand = BRAND_MAP[slugLower] || slugLower;
    list = allProducts.filter((p) => {
      const b = (p.brand || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      const c = (p.category || "").toLowerCase();
      return b.includes(brand.toLowerCase()) || n.includes(brand.toLowerCase()) || c.includes(brand.toLowerCase());
    });
    if (list.length === 0) list = allProducts;
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
