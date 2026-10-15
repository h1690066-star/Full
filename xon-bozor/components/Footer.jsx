import Image from "next/image";
import Link from "next/link";
import { MdPhone, MdSmartDisplay, MdPhotoCamera, MdSend } from "react-icons/md";
import { SiInstagram, SiYoutube } from "react-icons/si";
import { PHONE } from "./Header";

export default function Footer({ t }) {
  const f = t.footer;
  return (
    <footer className="border-t border-indigo-100 dark:border-slate-800 bg-[#eef0ff] dark:bg-[#15161c] pt-12 pb-8 transition-colors">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Ustun 1: Logo va ma'lumot */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Xon Bozor" width={36} height={34} className="rounded-full" />
            <div>
              <span className="block text-lg font-black text-brand">Xon Bozor</span>
              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">
                Mobil telefon va aksessuarlar
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            O'zbekistonda original smartfonlar, noutbuklar va eng so'nggi maishiy texnikaning ishonchli do'koni. Rasmiy kafolat va tezkor yetkazib berish.
          </p>
          <div className="pt-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Savollar bo'yicha yagona aloqa markazi:</p>
            <a
              href={`tel:${PHONE.replace(/\s/g, "")}`}
              className="mt-0.5 inline-block text-base font-black text-brand hover:underline"
            >
              {PHONE}
            </a>
          </div>
          <div className="flex gap-2 pt-1 text-brand">
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 dark:text-white shadow-sm hover:bg-brand hover:text-white dark:hover:bg-brand transition"
              aria-label="Telegram"
            >
              <MdSend className="text-base" />
            </a>
            <a
              href="https://www.instagram.com/xon.bazzar?igsh=aHRhbXNpa3R6OTg4&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm hover:bg-brand hover:text-white dark:hover:bg-brand transition"
              aria-label="Instagram"
            >
              <SiInstagram className="text-sm" />
            </a>
            <a
              href="https://www.youtube.com/@Xonbazar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm hover:bg-brand hover:text-white dark:hover:bg-brand transition"
              aria-label="YouTube"
            >
              <SiYoutube className="text-sm" />
            </a>
          </div>
        </div>

        {/* Ustun 2: Biz haqimizda */}
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">{f.about}</h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {f.aboutLinks.map((l, idx) => (
              <li key={l}>
                <Link href={idx === 0 ? "/catalog" : idx === 1 ? "/catalog/phones" : "/catalog/appliances"} className="hover:text-brand dark:hover:text-brand transition">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ustun 3: Mijozlarga yordam */}
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Mijozlarga yordam</h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li>
              <Link href="/faq" className="hover:text-brand dark:hover:text-brand transition">
                Qaytarish va almashtirish
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-brand dark:hover:text-brand transition">
                {f.privacy}
              </Link>
            </li>
            <li>
              <Link href="/offer" className="hover:text-brand dark:hover:text-brand transition">
                {f.offer}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-brand dark:hover:text-brand transition">
                Bog'lanish
              </Link>
            </li>
          </ul>
        </div>

        {/* Ustun 4: Ijtimoiy tarmoqlar */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white">Ijtimoiy tarmoqlar</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Bizning rasmiy sahifalarimizga obuna bo'ling</p>
          <div className="space-y-2">
            <a
              href="https://www.instagram.com/xon.bazzar?igsh=aHRhbXNpa3R6OTg4&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram sahifamiz"
              className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b22] px-4 py-2.5 shadow-sm hover:border-pink-500/50 hover:bg-pink-500/5 transition group"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm shrink-0">
                <SiInstagram className="text-lg" />
              </span>
              <div className="text-left text-xs">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">Bizni kuzating</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition">Instagram</span>
              </div>
            </a>
            <a
              href="https://www.youtube.com/@Xonbazar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube kanalimiz"
              className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b22] px-4 py-2.5 shadow-sm hover:border-red-500/50 hover:bg-red-500/5 transition group"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff0000] text-white shadow-sm shrink-0">
                <SiYoutube className="text-lg" />
              </span>
              <div className="text-left text-xs">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">Obuna bo'ling</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition">YouTube</span>
              </div>
            </a>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-indigo-100/80 dark:border-slate-800 px-4 pt-6 text-[11px] text-slate-500 dark:text-slate-400 sm:flex-row">
        <p>© {new Date().getFullYear()} Xon Bozor. Barcha huquqlar himoyalangan.</p>
        <p className="flex items-center gap-2">
          <span>Toshkent, O'zbekiston</span>
          <span>•</span>
          <span>Barcha tovarlar sertifikatlangan</span>
        </p>
      </div>
    </footer>
  );
}
