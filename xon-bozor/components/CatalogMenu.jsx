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
  MdWatch,
  MdVerified,
  MdSwapHoriz,
  MdBolt,
  MdArrowForward,
  MdFilterAlt,
} from "react-icons/md";

const CATS = [
  { key: "phones", icon: MdSmartphone },
  { key: "appliances", icon: MdKitchen },
  { key: "tv", icon: MdTv },
  { key: "computers", icon: MdLaptopMac },
  { key: "watches", icon: MdWatch },
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
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
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
