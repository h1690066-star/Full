import Image from "next/image";
import Link from "next/link";
import { MdStorefront } from "react-icons/md";
import LanguageSwitcher from "./LanguageSwitcher";
import CatalogMenu from "./CatalogMenu";
import HeaderActions from "./HeaderActions";
import RegionSelector from "./RegionSelector";

export const PHONE = "+998 95 081 38 09";

export default function Header({ t, lang }) {
  const nav = [
    [t.nav.newPhones, "/catalog/phones"],
    [t.nav.usedPhones, "/catalog/used"],
    [t.nav.iphone, "/catalog/iphone"],
    [t.nav.samsung, "/catalog/samsung"],
    [t.nav.xiaomi, "/catalog/xiaomi"],
    [t.nav.honor, "/catalog/honor"],
    [t.nav.redmi, "/catalog/redmi"],
    [t.nav.accessories, "/catalog/accessories"],
    [t.nav.appliances, "/catalog/appliances"],
  ];

  return (
    <header className="max-[600px]:hidden relative z-30 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161c] transition-colors duration-200">
      {/* Yuqori qator */}
      <div className="bg-[#eef0ff] dark:bg-[#1d1e26] text-xs text-slate-600 dark:text-slate-300 transition-colors duration-200">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <RegionSelector label={t.city || "Shahar"} />
            <Link href="/pickup" className="hidden items-center gap-1 hover:text-brand sm:flex">
              <MdStorefront className="text-sm" />
              {t.pickup}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="hidden hover:text-brand sm:inline">
              {t.faq}
            </Link>
            <Link href="/orders" className="hidden hover:text-brand sm:inline">
              {t.orders}
            </Link>
            <LanguageSwitcher current={lang} />
          </div>
        </div>
      </div>

      {/* Asosiy qator */}
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Chap: Logo + Katalog */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Xon Bozor" width={38} height={36} className="rounded-full shrink-0" priority />
              <span className="leading-tight">
                <span className="block text-lg sm:text-xl font-extrabold text-brand">Xon Bozor</span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:block">
                  Mobil &amp; Texnika
                </span>
              </span>
            </Link>
            <CatalogMenu t={t} phone={PHONE} />
          </div>

          {/* O'ng: User, Wishlist, Cart */}
          <HeaderActions t={t} />
        </div>
      </div>

      {/* Navigatsiya */}
      <nav className="mx-auto max-w-7xl overflow-x-auto px-4 no-scrollbar" aria-label="Main">
        <ul className="flex gap-6 whitespace-nowrap text-sm">
          {nav.map(([label, href], i) => (
            <li key={href}>
              <Link
                href={href}
                className={`block border-b-2 py-2.5 ${
                  i === 0
                    ? "border-brand font-semibold text-brand"
                    : "border-transparent text-slate-700 dark:text-slate-300 hover:text-brand"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
