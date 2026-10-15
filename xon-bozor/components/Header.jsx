import Image from "next/image";
import Link from "next/link";
import { MdStorefront, MdLocalShipping, MdVerified, MdPercent } from "react-icons/md";
import LanguageSwitcher from "./LanguageSwitcher";
import CatalogMenu from "./CatalogMenu";
import HeaderActions from "./HeaderActions";
import RegionSelector from "./RegionSelector";

export const PHONE = "+998 95 081 38 09";

function Logo({ compact = false }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Xon Bozor">
      <span className="relative flex shrink-0">
        <span className="absolute inset-0 rounded-full bg-brand-gradient opacity-0 blur-md transition duration-500 group-hover:opacity-60" />
        <Image
          src="/logo.png"
          alt="Xon Bozor"
          width={compact ? 34 : 42}
          height={compact ? 32 : 40}
          className="relative rounded-full ring-2 ring-white shadow-soft dark:ring-white/10"
          priority
        />
      </span>
      <span className="leading-none">
        <span className={`block font-display font-extrabold tracking-tight text-slate-900 dark:text-white ${compact ? "text-lg" : "text-[22px]"}`}>
          Xon <span className="text-gradient">Bozor</span>
        </span>
        {!compact && (
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
            Mobil &amp; Texnika
          </span>
        )}
      </span>
    </Link>
  );
}

export default function Header({ t, lang }) {
  const nav = [
    [t.nav.newPhones, "/catalog/phones"],
    [t.nav.usedPhones, "/catalog/used"],
    [t.nav.iphone, "/catalog/iphone"],
    [t.nav.samsung, "/catalog/samsung"],
    [t.nav.xiaomi, "/catalog/xiaomi"],
    [t.nav.honor, "/catalog/honor"],
    [t.nav.redmi, "/catalog/redmi"],
    [t.nav.appliances, "/catalog/appliances"],
  ];

  const perks = [
    { icon: MdPercent, text: "0% muddatli to'lov" },
    { icon: MdVerified, text: "Rasmiy kafolat" },
    { icon: MdLocalShipping, text: "Toshkent bo'ylab 2 soatda" },
  ];

  return (
    <>
      {/* ===== Header (>600px screens) — On mobile <=600px top header is off, bottom floating nav is active ===== */}
      <header className="max-[600px]:hidden sticky top-0 z-30">
        {/* Top utility bar */}
        <div className="relative overflow-hidden bg-slate-100/90 text-[12px] text-slate-600 dark:bg-ink dark:text-white/70 border-b border-slate-200/80 dark:border-white/5">
          <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.05] dark:opacity-[0.18]" />
          <div className="relative mx-auto flex h-9 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-5">
              <RegionSelector label={t.city || "Shahar"} />
              <Link href="/pickup" className="hidden items-center gap-1.5 transition hover:text-brand dark:hover:text-white lg:flex">
                <MdStorefront className="text-sm text-brand" />
                {t.pickup}
              </Link>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              {perks.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Icon className="text-sm text-brand dark:text-brand-300" />
                  {text}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-5">
              <Link href="/faq" className="hidden transition hover:text-brand dark:hover:text-white sm:inline">
                {t.faq}
              </Link>
              <Link href="/orders" className="hidden transition hover:text-brand dark:hover:text-white sm:inline">
                {t.orders}
              </Link>
              <LanguageSwitcher current={lang} />
            </div>
          </div>
        </div>

        {/* Main glass bar */}
        <div className="glass relative border-x-0 border-t-0">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:gap-6">
            <div className="flex shrink-0 items-center gap-3 lg:gap-5">
              <Logo />
              <CatalogMenu t={t} phone={PHONE} />
            </div>

            <div className="ml-auto">
              <HeaderActions t={t} />
            </div>
          </div>

          {/* Navigation */}
          <nav className="mx-auto max-w-7xl overflow-x-auto px-4 no-scrollbar" aria-label="Main">
            <ul className="flex items-center gap-1 whitespace-nowrap pb-2.5 text-[13px]">
              {nav.map(([label, href], i) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative block rounded-full px-3.5 py-1.5 font-medium transition ${
                      i === 0
                        ? "bg-brand/[0.08] text-brand dark:bg-brand-400/15 dark:text-brand-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="ml-auto hidden pl-4 lg:block">
                <a
                  href={`tel:${PHONE.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 transition hover:text-brand dark:text-slate-300"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  {PHONE}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
