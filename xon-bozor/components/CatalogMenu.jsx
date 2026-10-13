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

const APPLIANCE_SHOWCASE = [
  {
    name: "Muzlatgichlar",
    sub: "LG, Samsung NoFrost",
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&h=400&fit=crop",
    type: "Muzlatgich",
    badge: "Kafolatli",
  },
  {
    name: "Kir yuvish mashinalari",
    sub: "EcoBubble va Inverter",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop",
    type: "Kir yuvish",
    badge: "Tejamkor",
  },
  {
    name: "Konditsionerlar",
    sub: "Artel, Midea Inverter",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop",
    type: "Konditsioner",
    badge: "Yoz & Qish",
  },
  {
    name: "Mikroto'lqinli pechlar",
    sub: "Panasonic, Artel 23L",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop",
    type: "Mikrotolqinli",
    badge: "Grill & Pech",
  },
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
                    <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
                      {APPLIANCE_SHOWCASE.map((item) => (
                        <Link
                          key={item.type}
                          href={`/catalog/appliances?type=${encodeURIComponent(item.type)}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 p-2 font-medium text-slate-800 dark:text-slate-200 hover:text-brand"
                        >
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-contain bg-white shrink-0 p-0.5" />
                          <span className="truncate">{item.name}</span>
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
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <MdKitchen className="text-xl text-brand" />
                          <span>Maishiy texnika bo'limi</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Kerakli texnika turini tanlang va filtrlangan holda ko'ring
                        </p>
                      </div>
                      <Link
                        href="/catalog/appliances"
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                      >
                        Barchasini ko'rish <MdArrowForward />
                      </Link>
                    </div>

                    {/* 4 TA TEXNIKA RASMI VA NOMI BILAN */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {APPLIANCE_SHOWCASE.map((app) => (
                        <Link
                          key={app.type}
                          href={`/catalog/appliances?type=${encodeURIComponent(app.type)}`}
                          onClick={() => setOpen(false)}
                          className="group flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161c] p-3.5 shadow-xs hover:border-brand hover:shadow-lg transition cursor-pointer"
                        >
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center p-3 mb-3">
                            <span className="absolute top-2 left-2 z-10 rounded-md bg-brand px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                              {app.badge}
                            </span>
                            <img
                              src={app.image}
                              alt={app.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-brand line-clamp-1">
                            {app.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {app.sub}
                          </p>
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-brand">
                            <span className="flex items-center gap-1">
                              <MdFilterAlt className="text-sm" /> Tanlash
                            </span>
                            <MdArrowForward className="group-hover:translate-x-1 transition" />
                          </div>
                        </Link>
                      ))}
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
