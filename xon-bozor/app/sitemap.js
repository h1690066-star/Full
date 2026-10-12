const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xonbozor.uz";
export default function sitemap() {
  const slugs = ["phones", "used", "accessories", "appliances", "iphone", "samsung", "xiaomi", "honor", "redmi"];
  return [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...slugs.map((s) => ({ url: `${SITE}/catalog/${s}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 })),
  ];
}
