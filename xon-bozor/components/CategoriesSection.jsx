import Link from "next/link";
import { MdSmartphone, MdKitchen, MdTv, MdLaptopMac, MdArrowForward } from "react-icons/md";

const CATS = [
  { key: "phones", icon: MdSmartphone },
  { key: "appliances", icon: MdKitchen },
  { key: "tv", icon: MdTv },
  { key: "computers", icon: MdLaptopMac },
];

export default function CategoriesSection({ t, siteContent }) {
  const catTitle = siteContent?.sections?.categoriesTitle || t.sections.categories;
  const catSub = siteContent?.sections?.categoriesSub || t.sections.categoriesSub;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 pt-10" aria-labelledby="cats-h">
      <h2 id="cats-h" className="text-xl font-extrabold sm:text-2xl text-slate-900 dark:text-white">
        {catTitle}
      </h2>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
        {catSub}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {CATS.map(({ key, icon: Icon }) => (
          <Link
            key={key}
            href={`/catalog/${key}`}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-4 shadow-xs transition hover:border-brand/30 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft dark:bg-brand/20 text-brand transition group-hover:bg-brand group-hover:text-white">
              <Icon className="text-2xl" />
            </span>
            <span className="flex-1 text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
              {t.cats[key]}
            </span>
            <MdArrowForward className="hidden text-slate-300 dark:text-slate-600 group-hover:text-brand sm:block" />
          </Link>
        ))}
      </div>
    </section>
  );
}
