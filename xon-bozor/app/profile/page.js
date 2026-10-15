import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileClient from "@/components/ProfileClient";
import { getT } from "@/lib/i18n";

export const metadata = {
  title: "Shaxsiy Kabinet — Xon Bozor",
  description: "Foydalanuvchi shaxsiy ma'lumotlari, manzillar va buyurtmalar tarixi.",
  alternates: { canonical: "/profile" },
  robots: { index: false, follow: false },
};

export default async function Page() {
  const { t, lang } = await getT();
  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <Header t={t} lang={lang} />
      <main className="flex-1 px-4 py-8 pb-28 sm:py-12 min-[601px]:pb-12">
        <ProfileClient t={t} />
      </main>
      <Footer t={t} />
    </div>
  );
}

