export async function fetchSiteContent() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com";
  try {
    const res = await fetch(`${apiBase}/api/site-content`, {
      next: { revalidate: 15 },
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchSiteContent error, using fallback defaults:", err.message);
    return null;
  }
}

