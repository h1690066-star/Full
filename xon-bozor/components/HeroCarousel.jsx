"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdArrowForward } from "react-icons/md";

export default function HeroCarousel({ slides }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(null);
  const go = (n) => setI((n + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.navigator.webdriver) return;

    let intervalId;
    const initialDelay = setTimeout(() => {
      intervalId = setInterval(() => {
        setI((p) => (p + 1) % slides.length);
      }, 4000);
    }, 4500);

    return () => {
      clearTimeout(initialDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, [paused, slides.length]);

  const onTouchEnd = (e) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    startX.current = null;
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-black shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {slides.map((s, idx) => (
          <div
            key={idx}
            className="relative h-[210px] min-[420px]:h-[250px] sm:h-[320px] md:h-[360px] lg:h-[380px] min-w-full overflow-hidden"
          >
            {(idx === 0 || idx === i || Math.abs(idx - i) <= 1) && (
              <Image
                src={s.image}
                alt={s.title || "Banner"}
                fill
                priority={idx === 0}
                fetchPriority={idx === 0 ? "high" : "auto"}
                sizes="(min-width:1280px) 1216px, 100vw"
                className={`object-cover ${s.align === "right" ? "object-right" : "object-center"}`}
              />
            )}
            {s.text ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent sm:via-black/35" />
                <div className="absolute inset-0 flex flex-col justify-center gap-1.5 sm:gap-2.5 p-4 sm:p-8 lg:p-12 lg:max-w-[55%]">
                  {s.badge && (
                    <span className="w-fit rounded-full bg-brand px-2.5 py-0.5 text-[9px] min-[400px]:text-[10px] sm:text-xs font-bold uppercase tracking-wide text-white shadow-xs">
                      {s.badge}
                    </span>
                  )}
                  <h2 className="text-base min-[380px]:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight text-white line-clamp-2">
                    {s.title}
                  </h2>
                  <p className="hidden max-w-md text-xs sm:text-sm text-white/80 line-clamp-2 sm:block">
                    {s.text}
                  </p>
                  <Link
                    href={s.href}
                    tabIndex={idx === i ? 0 : -1}
                    className="mt-1 flex w-fit items-center gap-1.5 rounded-lg sm:rounded-xl bg-brand px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-brand-dark shadow-md shadow-brand/25 active:scale-95 transition"
                  >
                    <span>{s.cta || "Batafsil"}</span>
                    <MdArrowForward className="text-sm sm:text-base" />
                  </Link>
                </div>
              </>
            ) : (
              <Link
                href={s.href}
                tabIndex={idx === i ? 0 : -1}
                aria-label={s.title || "Katalog"}
                className="absolute inset-0 z-10 block"
              />
            )}
          </div>
        ))}
      </div>

      {/* Chap strelka (modern glassmorphism) */}
      <button
        type="button"
        onClick={() => go(i - 1)}
        aria-label="Oldingi slayd"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md shadow-lg border border-white/20 transition-all opacity-80 hover:opacity-100 active:scale-90 cursor-pointer"
      >
        <MdChevronLeft className="text-xl sm:text-2xl" />
      </button>

      {/* O'ng strelka (modern glassmorphism) */}
      <button
        type="button"
        onClick={() => go(i + 1)}
        aria-label="Keyingi slayd"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md shadow-lg border border-white/20 transition-all opacity-80 hover:opacity-100 active:scale-90 cursor-pointer"
      >
        <MdChevronRight className="text-xl sm:text-2xl" />
      </button>

      {/* Slayd indikatorlari (dots) */}
      <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {slides.map((_, n) => (
          <button
            key={n}
            onClick={() => setI(n)}
            aria-label={`Slide ${n + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              n === i ? "w-6 bg-brand shadow-sm shadow-brand sm:w-8" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
