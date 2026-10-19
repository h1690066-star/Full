import fallbackData from "./siteContent.json";
import { connectToDatabase } from "./mongodb";

export async function fetchSiteContent() {
  try {
    if (typeof window === "undefined") {
      const conn = await connectToDatabase();
      const db = conn.connection?.db || conn.db;
      if (db) {
        const doc = await db.collection("sitecontents").findOne();
        if (doc) return JSON.parse(JSON.stringify(doc));
      }
    } else {
      const res = await fetch("/api/site-content", {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (err) {
    console.warn("fetchSiteContent error, using fallback:", err.message);
  }
  return fallbackData;
}
