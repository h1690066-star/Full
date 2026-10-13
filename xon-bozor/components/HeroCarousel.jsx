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
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const onTouchEnd = (e) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    startX.current = null;
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-black"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)} onTouchEnd={onTouchEnd}
      role="region" aria-roledescription="carousel"
    >
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, idx) => (
          <div key={idx} className="relative aspect-[16/10] min-w-full sm:aspect-[16/7] lg:aspect-auto lg:h-[350px]">
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={idx === 0}
              loading={idx === 0 ? "eager" : "lazy"}
              sizes="(min-width:1280px) 1216px, 100vw"
              className={`object-cover ${s.align === "right" ? "object-right" : "object-center"}`}
            />
            {s.text && <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent sm:via-black/30" />}
            <div className="absolute inset-0 flex flex-col justify-end gap-2 p-5 sm:justify-center sm:gap-3 sm:p-10 lg:max-w-[55%] lg:pl-14">
              {s.badge && <span className="w-fit rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs">{s.badge}</span>}
              {s.text && (
                <>
                  <h2 className="text-xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">{s.title}</h2>
                  <p className="hidden max-w-md text-sm text-white/80 sm:block">{s.text}</p>
                </>
              )}
              <Link href={s.href} tabIndex={idx === i ? 0 : -1} className={`mt-1 flex w-fit items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark sm:mt-3 ${s.text ? "" : "sm:absolute sm:bottom-6 sm:left-14"}`}>
                {s.cta}<MdArrowForward />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => go(i - 1)} aria-label="Previous" className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-1.5 opacity-0 transition group-hover:opacity-100 sm:block"><MdChevronLeft className="text-2xl" /></button>
      <button onClick={() => go(i + 1)} aria-label="Next" className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-1.5 opacity-0 transition group-hover:opacity-100 sm:block"><MdChevronRight className="text-2xl" /></button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, n) => (
          <button key={n} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} className={`h-1.5 rounded-full transition-all ${n === i ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}
