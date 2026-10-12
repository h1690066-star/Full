import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UsersTable from "@/components/UsersTable";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Mijozlar", robots: { index: false, follow: false } };

export default async function Page() {
  const { t, lang } = await getT();
  return (<><Header t={t} lang={lang} /><main className="px-4 py-10"><h1 className="mx-auto mb-5 max-w-5xl text-2xl font-extrabold">{t.profile.adminUsers}</h1><UsersTable t={t} /></main><Footer t={t} /></>);
}
