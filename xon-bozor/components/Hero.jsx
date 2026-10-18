import Link from "next/link";
import { MdSmartphone, MdRecycling, MdKitchen, MdHeadphones } from "react-icons/md";
import HeroCarousel from "./HeroCarousel";

const DEFAULT_IMAGES = [
  { image: "/images/hero/hero-1.png", href: "/catalog/phones", align: "center" },
  { image: "/images/hero/hero-2.png", href: "/catalog/iphone", align: "center" },
];

const ICONS = [MdSmartphone, MdRecycling, MdHeadphones, MdKitchen];
const TONES = [
  "bg-purple-100 dark:bg-brand/20 text-brand",
  "bg-purple-100 dark:bg-brand/20 text-brand",
  "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
  "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
];

export default function Hero({ t, siteContent }) {
  // Dinamik admin slaydlari yoki default dictionaries
  const slides = siteContent?.heroSlides && siteContent.heroSlides.length > 0
    ? siteContent.heroSlides.map((s) => ({
        ...s,
        image: s.image || "/images/hero/hero-1.png",
        href: s.href || "/catalog",
        align: s.align || "center"
      }))
    : DEFAULT_IMAGES.map((im, n) => ({ ...im, ...(t.hero?.[n] || {}) }));

  // Dinamik tezkor kartochkalar
  const quickItems = siteContent?.quickCards && siteContent.quickCards.length > 0
    ? siteContent.quickCards.slice(0, 4).map((q, idx) => ({
        title: q.title,
        sub: q.sub,
        href: q.href || "/catalog",
        Icon: ICONS[idx % ICONS.length],
        tone: TONES[idx % TONES.length]
      }))
    : [
        { title: t.quick?.[0]?.title || "Yangi telefonlar", sub: t.quick?.[0]?.sub || "Kafolatli va yangi", href: "/catalog/phones", Icon: MdSmartphone, tone: TONES[0] },
        { title: t.quick?.[1]?.title || "B/U telefonlar", sub: t.quick?.[1]?.sub || "Tekshirilgan a'lo holat", href: "/catalog/used", Icon: MdRecycling, tone: TONES[1] },
        { title: t.quick?.[3]?.title || "Maishiy texnika", sub: t.quick?.[3]?.sub || "Uy qulayligi uchun", href: "/catalog/appliances", Icon: MdKitchen, tone: TONES[3] },
      ];

  const gridColsClass = quickItems.length === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3";

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6">
      <HeroCarousel slides={slides} />
      <div className={`mt-6 grid ${gridColsClass} gap-3 lg:gap-4`}>
        {quickItems.map((item, idx) => {
          const Icon = item.Icon;
          return (
            <Link key={idx} href={item.href} className="flex items-center gap-3 rounded-xl border border-indigo-100 dark:border-slate-800 bg-[#f1f2ff] dark:bg-[#1a1b22] p-3 transition hover:shadow-md sm:p-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.tone}`}>
                <Icon className="text-xl" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{item.title}</span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{item.sub}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
