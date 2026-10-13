import { Inter } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE =
  (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"))
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://xonbozor.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Xon Bozor — Original telefonlar, B/U smartfonlar va maishiy texnika", template: "%s | Xon Bozor" },
  description: "Xon Bozor: Toshkentda original iPhone, Samsung, Xiaomi telefonlari, tekshirilgan B/U smartfonlar, aksessuarlar va maishiy texnika. 0% muddatli to'lov, kafolat va tezkor yetkazish.",
  applicationName: "Xon Bozor",
  keywords: ["xon bozor", "iphone 18 pro", "telefon sotib olish", "muddatli to'lov", "b/u telefonlar", "samsung", "xiaomi", "maishiy texnika", "Toshkent"],
  authors: [{ name: "Xon Bozor" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    siteName: "Xon Bozor",
    url: "/",
    locale: "uz_UZ",
    title: "Xon Bozor — Original telefonlar va maishiy texnika",
    description: "Original telefonlar, B/U smartfonlar va maishiy texnika Toshkentda. 0% muddatli to'lov va rasmiy kafolat.",
    images: [
      {
        url: "/images/hero/hero-1.png",
        width: 1200,
        height: 630,
        alt: "Xon Bozor — Mobil & Texnika",
      },
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Xon Bozor Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xon Bozor — Original telefonlar va maishiy texnika",
    description: "Original telefonlar, B/U smartfonlar va maishiy texnika Toshkentda.",
    images: ["/images/hero/hero-1.png"],
  },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

import Providers from "@/components/Providers";

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#6b00ff" };

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta property="og:title" content="Xon Bozor — Original telefonlar va maishiy texnika" />
        <meta property="og:description" content="Original telefonlar, B/U smartfonlar va maishiy texnika Toshkentda. 0% muddatli to'lov va rasmiy kafolat." />
        <meta property="og:image" content={`${SITE}/images/hero/hero-1.png`} />
        <meta property="og:url" content={SITE} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Xon Bozor" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Xon Bozor — Original telefonlar va maishiy texnika" />
        <meta name="twitter:description" content="Original telefonlar, B/U smartfonlar va maishiy texnika Toshkentda." />
        <meta name="twitter:image" content={`${SITE}/images/hero/hero-1.png`} />
        <link rel="preload" href="/images/hero/hero-1.png" as="image" type="image/png" />
        <link rel="preconnect" href="https://full-nbal.onrender.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://full-nbal.onrender.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
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
      <body className={`${inter.className} bg-slate-50 dark:bg-[#0f1015] text-slate-900 dark:text-slate-100 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

