"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MdGridView,
  MdClose,
  MdChevronRight,
  MdSmartphone,
  MdKitchen,
  MdTv,
  MdLaptopMac,
  MdVerified,
  MdSwapHoriz,
  MdBolt,
  MdArrowForward,
} from "react-icons/md";

const CATS = [
  { key: "phones", icon: MdSmartphone },
  { key: "appliances", icon: MdKitchen },
  { key: "tv", icon: MdTv },
  { key: "computers", icon: MdLaptopMac },
];

const PHONES = ["iPhone 18 Pro", "iPhone 17", "iPhone 16", "Samsung Galaxy S", "Samsung Galaxy A", "Xiaomi", "Redmi", "Honor", "Realme", "Tecno", "Infinix"];

const APPLIANCE_BRANDS = [
  "Artel",
  "Samsung",
  "LG",
  "Midea",
  "Hofmann",
  "Bosch",
  "Shivaki",
  "Haier",
  "Avalon",
  "Tefal",
  "Panasonic",
];

const APPLIANCE_TYPES = [
  "Muzlatgichlar",
  "Kir yuvish mashinalari",
  "Konditsionerlar",
  "Gaz plitalar",
  "Mikroto'lqinli pechlar",
  "Changyutgichlar",
];

const TV_PRODUCTS = [
  { name: "Samsung UE85AU7100 Smart", id: "6ad43856deeea7c011f19699", badge: "85\" 4K UHD" },
  { name: "Xiaomi TV A Pro 2025", id: "6ad4370ddeeea7c011f1966d", badge: "Smart TV" },
  { name: "SHOWPRO Audio Jihoz", id: "6ad43b4bdeeea7c011f196e2", badge: "Audio Akustika" },
];

const TV_BRANDS = ["Samsung", "Xiaomi", "LG", "Sony", "Artel", "TCL", "Shivaki"];
const TV_TYPES = ["Smart TV", "4K UHD Televizorlar", "OLED & QLED", "Soundbarlar", "Audio tizimlar", "Kronşteynlar"];

const COMP_PRODUCTS = [
  { name: "ASUS TUF Gaming F16", id: "6ad4405edeeea7c011f197ca", badge: "Gaming Laptop" },
  { name: "MSI GeForce RTX 3060", id: "6ad43d34deeea7c011f1971e", badge: "GPU 12GB" },
  { name: "NVIDIA GeForce GTX 1660 SUPER", id: "6ad43c8fdeeea7c011f1970e", badge: "6GB GDDR6" },
];

const COMP_BRANDS = ["ASUS", "MSI", "NVIDIA", "Lenovo", "HP", "Acer", "Dell", "Gigabyte"];
const COMP_TYPES = ["Gaming Noutbuklar", "Ofis noutbuklari", "Videokartalar (GPU)", "Monitorlar", "Operativ xotira (RAM)", "SSD va HDD", "Gaming aksessuarlar"];

export default function CatalogMenu({ t, phone }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("phones");
  const m = t.mega;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex h-11 items-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-dark sm:px-5">
        {open ? <MdClose className="text-xl" /> : <MdGridView className="text-xl" />}
        <span className="hidden sm:inline">{t.catalog}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40" onClick={() => setOpen(false)} />

          {/* Mobilda to'liq ekranli toza Katalog Drawer */}
          <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#15161c] md:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3.5">
              <span className="text-lg font-bold text-slate-800 dark:text-white">{t.catalog}</span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {CATS.map(({ key, icon: Icon }) => (
                <div key={key} className="rounded-xl border border-slate-100 dark:border-slate-800 p-2.5">
                  <Link
                    href={`/catalog/${key}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-1 text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="text-xl text-brand" />
                      {t.cats[key]}
                    </span>
                    <MdChevronRight className="text-slate-400 text-lg" />
                  </Link>

                  {key === "phones" && (
                    <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs text-slate-600 dark:text-slate-400">
                      {PHONES.slice(0, 6).map((item) => (
                        <Link
                          key={item}
                          href="/catalog/phones"
                          onClick={() => setOpen(false)}
                          className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2 font-medium text-slate-700 dark:text-slate-300 hover:text-brand dark:hover:text-brand"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  )}

                  {key === "appliances" && (
                    <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs text-slate-600 dark:text-slate-400">
                      {APPLIANCE_BRANDS.slice(0, 8).map((item) => (
                        <Link
                          key={item}
                          href={`/catalog/appliances?search=${encodeURIComponent(item)}`}
                          onClick={() => setOpen(false)}
                          className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2 font-medium text-slate-700 dark:text-slate-300 hover:text-brand dark:hover:text-brand"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  )}

                  {key === "tv" && (
                    <div className="mt-2 grid grid-cols-1 gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs text-slate-600 dark:text-slate-400">
                      {TV_PRODUCTS.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-2 font-medium text-slate-700 dark:text-slate-300 hover:text-brand"
                        >
                          <span className="truncate">{prod.name}</span>
                          <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">{prod.badge}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {key === "computers" && (
                    <div className="mt-2 grid grid-cols-1 gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs text-slate-600 dark:text-slate-400">
                      {COMP_PRODUCTS.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-2 font-medium text-slate-700 dark:text-slate-300 hover:text-brand"
                        >
                          <span className="truncate">{prod.name}</span>
                          <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">{prod.badge}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-brand-soft dark:bg-[#1a1b22] text-center text-xs text-slate-600 dark:text-slate-400">
              <p>{m.help}</p>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-bold text-brand text-sm">
                {phone}
              </a>
            </div>
          </div>

          {/* Desktop Mega Menu */}
          <div className="hidden md:block absolute inset-x-0 top-full z-50 mx-auto w-full max-w-7xl px-4">
            <div className="mt-2 grid max-h-[78vh] overflow-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1b22] shadow-2xl md:grid-cols-[260px_1fr]">
              <aside className="flex flex-col bg-brand-soft dark:bg-[#15161c] p-3">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{m.all}</p>
                <ul className="flex flex-col gap-1">
                  {CATS.map(({ key, icon: Icon }) => (
                    <li key={key}>
                      <button
                        onMouseEnter={() => setActive(key)}
                        onClick={() => setActive(key)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition cursor-pointer ${
                          active === key
                            ? "bg-brand/10 font-semibold text-brand"
                            : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="shrink-0 text-xl" />
                        <span className="flex-1">{t.cats[key]}</span>
                        <MdChevronRight className="text-lg" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto border-t border-slate-200 dark:border-slate-800 px-3 pt-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.help}</p>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-bold text-brand">{phone}</a>
                </div>
              </aside>

              <div className="p-5 text-slate-900 dark:text-white">
                {active === "phones" ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <MenuTitle title={m.smartphones} all={m.all2} />
                      <ul className="mt-3 space-y-2.5 text-sm">
                        {PHONES.map((n, i) => (
                          <li key={n} className="flex items-center justify-between">
                            <Link href="/catalog/phones" onClick={() => setOpen(false)} className={i === 0 ? "font-semibold text-brand" : "text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand"}>{n}</Link>
                            {i === 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">{m.newLabel}</span>}
                            {n === "Samsung Galaxy S" && <span className="rounded bg-sun/80 px-1.5 text-[10px] font-semibold text-slate-900">{m.top}</span>}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-sm font-medium">
                        <Link href="/catalog/phones" onClick={() => setOpen(false)} className="flex items-center gap-2 text-brand"><MdVerified />{m.newPhones}</Link>
                        <Link href="/catalog/used" onClick={() => setOpen(false)} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-brand"><MdSwapHoriz />{m.usedIdeal}</Link>
                      </div>
                    </div>
                    <div>
                      <MenuTitle title="Kafolatli va Tezkor Xizmat" all={m.all2} />
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-3 rounded-xl bg-brand-soft dark:bg-slate-800 p-3.5">
                          <MdBolt className="text-3xl text-brand shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.fast}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{m.fastSub}</p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-gradient-to-br from-brand to-purple-900 p-4 text-white">
                          <span className="rounded bg-sun px-1.5 py-0.5 text-[10px] font-bold text-ink">{m.promoTag}</span>
                          <p className="mt-2 font-bold">{m.promoTitle}</p>
                          <p className="text-xs text-white/80">{m.promoText}</p>
                          <Link href="/catalog/phones" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink">{m.more}<MdArrowForward /></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : active === "appliances" ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <MenuTitle title="Maishiy texnika kompaniyalari" all={m.all2} />
                      <ul className="mt-3 space-y-2.5 text-sm">
                        {APPLIANCE_BRANDS.map((n, i) => (
                          <li key={n} className="flex items-center justify-between">
                            <Link
                              href={`/catalog/appliances?search=${encodeURIComponent(n)}`}
                              onClick={() => setOpen(false)}
                              className={i === 0 ? "font-semibold text-brand" : "text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand"}
                            >
                              {n}
                            </Link>
                            {i === 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">{m.top || "Top"}</span>}
                            {n === "Artel" && <span className="rounded bg-sun/80 px-1.5 text-[10px] font-semibold text-slate-900">Mashhur</span>}
                            {n === "Samsung" && <span className="rounded bg-brand/20 px-1.5 text-[10px] font-semibold text-brand">Premium</span>}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-medium">
                        {APPLIANCE_TYPES.map((tName) => (
                          <Link
                            key={tName}
                            href={`/catalog/appliances?search=${encodeURIComponent(tName)}`}
                            onClick={() => setOpen(false)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-brand hover:bg-brand/10 transition"
                          >
                            {tName}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div>
                      <MenuTitle title="Kafolatli va Qulay Xarid" all={m.all2} />
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-3 rounded-xl bg-brand-soft dark:bg-slate-800 p-3.5">
                          <MdBolt className="text-3xl text-brand shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">0% Muddatli To'lov</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Barcha maishiy texnikalarga boshlang'ich to'lovsiz</p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-brand p-4 text-white">
                          <span className="rounded bg-sun px-1.5 py-0.5 text-[10px] font-bold text-ink">Maxsus Taklif</span>
                          <p className="mt-2 font-bold">Uy uchun texnikalar</p>
                          <p className="text-xs text-white/80">Artel, LG, Samsung, Midea mahsulotlari rasmiy kafolat bilan</p>
                          <Link href="/catalog/appliances" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink">{m.more}<MdArrowForward /></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : active === "tv" ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <MenuTitle title={t.cats.tv || "Televizorlar va audio"} all={m.all2} />
                      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Yangi qo'shilgan modellar</p>
                      <ul className="mt-2 space-y-2 text-sm">
                        {TV_PRODUCTS.map((prod) => (
                          <li key={prod.id}>
                            <Link
                              href={`/product/${prod.id}`}
                              onClick={() => setOpen(false)}
                              className="group flex items-center justify-between rounded-xl p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <span className="font-semibold text-slate-800 transition group-hover:text-brand dark:text-slate-200">
                                {prod.name}
                              </span>
                              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                                {prod.badge}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-medium">
                        {TV_TYPES.map((tName) => (
                          <Link
                            key={tName}
                            href={`/catalog/tv?search=${encodeURIComponent(tName)}`}
                            onClick={() => setOpen(false)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-brand hover:bg-brand/10 transition"
                          >
                            {tName}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div>
                      <MenuTitle title="Mashhur Televizor Brendlari" all={m.all2} />
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        {TV_BRANDS.map((b) => (
                          <Link
                            key={b}
                            href={`/catalog/tv?search=${encodeURIComponent(b)}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 font-medium text-slate-700 transition hover:border-brand/40 hover:text-brand dark:border-slate-800 dark:text-slate-300 dark:hover:border-brand"
                          >
                            <span>{b}</span>
                            <MdChevronRight className="text-slate-400" />
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 rounded-xl bg-gradient-to-br from-indigo-900 via-brand to-purple-900 p-4 text-white">
                        <span className="rounded bg-sun px-1.5 py-0.5 text-[10px] font-bold text-ink">Smart & 4K UHD</span>
                        <p className="mt-2 font-bold">Katta ekranli zamonaviy televizorlar</p>
                        <p className="text-xs text-white/80">Kafolatli va qulay muddatli to'lov asosida</p>
                        <Link href="/catalog/tv" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink">Barchasini ko'rish <MdArrowForward /></Link>
                      </div>
                    </div>
                  </div>
                ) : active === "computers" ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <MenuTitle title={t.cats.computers || "Kompyuter texnikalari"} all={m.all2} />
                      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Yangi qo'shilgan modellar</p>
                      <ul className="mt-2 space-y-2 text-sm">
                        {COMP_PRODUCTS.map((prod) => (
                          <li key={prod.id}>
                            <Link
                              href={`/product/${prod.id}`}
                              onClick={() => setOpen(false)}
                              className="group flex items-center justify-between rounded-xl p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <span className="font-semibold text-slate-800 transition group-hover:text-brand dark:text-slate-200">
                                {prod.name}
                              </span>
                              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                                {prod.badge}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-medium">
                        {COMP_TYPES.map((tName) => (
                          <Link
                            key={tName}
                            href={`/catalog/computers?search=${encodeURIComponent(tName)}`}
                            onClick={() => setOpen(false)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-brand hover:bg-brand/10 transition"
                          >
                            {tName}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div>
                      <MenuTitle title="Kompyuter va Komponent Brendlari" all={m.all2} />
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        {COMP_BRANDS.map((b) => (
                          <Link
                            key={b}
                            href={`/catalog/computers?search=${encodeURIComponent(b)}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 font-medium text-slate-700 transition hover:border-brand/40 hover:text-brand dark:border-slate-800 dark:text-slate-300 dark:hover:border-brand"
                          >
                            <span>{b}</span>
                            <MdChevronRight className="text-slate-400" />
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand p-4 text-white">
                        <span className="rounded bg-sun px-1.5 py-0.5 text-[10px] font-bold text-ink">Gaming & RTX</span>
                        <p className="mt-2 font-bold">ASUS TUF, MSI va kuchli videokartalar</p>
                        <p className="text-xs text-white/80">O'yinlar va grafika uchun rasmiy kafolat bilan</p>
                        <Link href="/catalog/computers" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink">Barchasini ko'rish <MdArrowForward /></Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Link href={`/catalog/${active}`} onClick={() => setOpen(false)} className="inline-flex items-center gap-2 text-lg font-semibold text-brand">
                      {t.cats[active] || active} <MdArrowForward />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function MenuTitle({ title, all }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
      <span className="text-xs font-semibold text-brand">{all}</span>
    </div>
  );
}
