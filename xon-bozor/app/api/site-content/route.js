import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import fallbackData from "@/lib/siteContent.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const db = conn.connection?.db || conn.db;
    if (db) {
      const doc = await db.collection("sitecontents").findOne();
      if (doc) {
        return NextResponse.json(doc);
      }
    }
    return NextResponse.json(fallbackData);
  } catch (err) {
    console.error("Site content fetch error:", err);
    return NextResponse.json(fallbackData);
  }
}

