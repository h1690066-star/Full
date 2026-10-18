import fallbackData from "./siteContent.json";

export async function fetchSiteContent() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3211";
  try {
    const res = await fetch(`${apiBase}/api/site-content`, {
      next: { revalidate: 15 },
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchSiteContent API fetch error, using local fallback:", err.message);
    return fallbackData;
  }
}
