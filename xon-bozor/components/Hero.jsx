import Link from "next/link";
import { MdSmartphone, MdRecycling, MdKitchen } from "react-icons/md";
import HeroCarousel from "./HeroCarousel";

const IMAGES = [
  { image: "/images/hero/hero-1.png", href: "/catalog/phones", align: "center" },
  { image: "/images/hero/hero-2.png", href: "/catalog/iphone", align: "center" },
  { image: "/images/hero/hero-3.png", href: "/catalog/appliances", align: "center" },
];
const QUICK = [
  { icon: MdSmartphone, href: "/catalog/phones", tone: "bg-purple-100 dark:bg-brand/20 text-brand", keyIndex: 0 },
  { icon: MdRecycling, href: "/catalog/used", tone: "bg-purple-100 dark:bg-brand/20 text-brand", keyIndex: 1 },
  { icon: MdKitchen, href: "/catalog/appliances", tone: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400", keyIndex: 3 },
];

export default function Hero({ t }) {
  const slides = IMAGES.map((im, n) => ({ ...im, ...t.hero[n] }));
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6">
      <HeroCarousel slides={slides} />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        {QUICK.map(({ icon: Icon, href, tone, keyIndex }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-indigo-100 dark:border-slate-800 bg-[#f1f2ff] dark:bg-[#1a1b22] p-3 transition hover:shadow-md sm:p-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="text-xl" /></span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{t.quick[keyIndex]?.title}</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{t.quick[keyIndex]?.sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
