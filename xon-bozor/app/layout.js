import { Inter } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xonbozor.uz";

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Xon Bozor — Original telefonlar, B/U smartfonlar va maishiy texnika", template: "%s | Xon Bozor" },
  description: "Xon Bozor: Toshkentda original iPhone, Samsung, Xiaomi telefonlari, tekshirilgan B/U smartfonlar, aksessuarlar va maishiy texnika. 0% muddatli to'lov, kafolat va tezkor yetkazish.",
  applicationName: "Xon Bozor",
  keywords: ["iphone 18 pro", "telefon sotib olish", "muddatli to'lov", "b/u telefonlar", "samsung", "xiaomi", "maishiy texnika", "Toshkent", "Xon Bozor"],
  authors: [{ name: "Xon Bozor" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website", siteName: "Xon Bozor", url: "/", locale: "uz_UZ",
    title: "Xon Bozor — Mobil & Texnika",
    description: "Original telefonlar, B/U smartfonlar va maishiy texnika. 0% muddatli to'lov.",
    images: [{ url: "/images/hero/hero-1.png", width: 1024, height: 576, alt: "iPhone 18 Pro — Xon Bozor" }],
  },
  twitter: { card: "summary_large_image", title: "Xon Bozor — Mobil & Texnika", description: "Original telefonlar va maishiy texnika Toshkentda.", images: ["/images/hero/hero-1.png"] },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

import Providers from "@/components/Providers";

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#6b00ff" };

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="http://localhost:5000" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="http://localhost:5000" />
        <meta name="format-detection" content="telephone=no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-50 dark:bg-[#0f1015] text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

