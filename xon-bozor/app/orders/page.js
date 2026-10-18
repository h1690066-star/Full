import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrdersClient from "@/components/OrdersClient";
import { getT } from "@/lib/i18n";

export const metadata = {
  title: "Mening buyurtmalarim — Xon Bozor Internet Do'koni",
  description: "Xon Bozor: buyurtmalaringiz holatini kuzating va buyurtmalar tarixini ko'ring.",
  alternates: { canonical: "/orders" },
};

export default async function OrdersPage() {
  const { t, lang } = await getT();
  return (
    <>
      <Header t={t} lang={lang} />
      <main className="min-h-[60vh] bg-slate-50/50 dark:bg-[#0f1015] transition-colors pb-28 min-[1121px]:pb-12">
        <OrdersClient t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}

