"use client";
import { useEffect, useRef, useState } from "react";
import { MdLocationOn, MdExpandMore, MdCheck } from "react-icons/md";

export const UZBEKISTAN_REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand",
  "Farg'ona",
  "Andijon",
  "Namangan",
  "Buxoro",
  "Qashqadaryo",
  "Surxondaryo",
  "Xorazm",
  "Navoiy",
  "Jizzax",
  "Sirdaryo",
  "Qoraqalpog'iston",
];

export default function RegionSelector({ label = "Shahar" }) {
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("Toshkent shahri");
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_region");
      if (saved) setSelectedRegion(saved);
    }

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectRegion = (region) => {
    setSelectedRegion(region);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_region", region);
      window.dispatchEvent(new CustomEvent("region-change", { detail: region }));
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand font-medium transition cursor-pointer"
      >
        <MdLocationOn className="text-sm text-brand" />
        <span>{label}:</span>
        <b className="text-brand font-bold">{selectedRegion}</b>
        <MdExpandMore className={`text-base transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-7 z-50 w-56 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b22] py-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
          <div className="px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Viloyatni tanlang
          </div>
          {UZBEKISTAN_REGIONS.map((region) => {
            const isSelected = region === selectedRegion;
            return (
              <button
                key={region}
                type="button"
                onClick={() => selectRegion(region)}
                className={`flex w-full items-center justify-between px-3.5 py-2 text-xs font-semibold transition hover:bg-brand-soft dark:hover:bg-slate-800 ${
                  isSelected ? "text-brand bg-brand-soft/60 dark:bg-brand/20 font-bold" : "text-slate-700 dark:text-slate-200"
                }`}
              >
                <span>{region}</span>
                {isSelected && <MdCheck className="text-sm font-black text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

