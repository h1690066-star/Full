const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xonbozor.uz";
export default function robots() {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/profile", "/admin", "/login", "/register"] }, sitemap: `${SITE}/sitemap.xml` };
}
