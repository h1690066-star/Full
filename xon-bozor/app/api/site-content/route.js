import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import fallbackData from "@/lib/siteContent.json";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const db = conn.connection?.db || conn.db;
    if (db) {
      const doc = await db.collection("sitecontents").findOne();
      if (doc) {
        return NextResponse.json({ ...doc, content: doc }, { headers: corsHeaders });
      }
    }
    return NextResponse.json({ ...fallbackData, content: fallbackData }, { headers: corsHeaders });
  } catch (err) {
    console.error("Site content fetch error:", err);
    return NextResponse.json({ ...fallbackData, content: fallbackData }, { headers: corsHeaders });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const payload = body.content || body;
    const clean = { ...payload };
    delete clean._id;
    delete clean.__v;
    delete clean.doGitPush;
    clean.lastPushedAt = Date.now();

    const conn = await connectToDatabase();
    const db = conn.connection?.db || conn.db;
    if (db) {
      const existing = await db.collection("sitecontents").findOne();
      if (existing) {
        await db.collection("sitecontents").updateOne({ _id: existing._id }, { $set: clean });
      } else {
        await db.collection("sitecontents").insertOne(clean);
      }
    }

    // Also update local lib/siteContent.json if writable
    try {
      const jsonPath = path.join(process.cwd(), "lib", "siteContent.json");
      fs.writeFileSync(jsonPath, JSON.stringify(clean, null, 2), "utf-8");
    } catch {}

    return NextResponse.json(
      { success: true, content: clean, ...clean },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Site content update error:", err);
    return NextResponse.json(
      { message: err.message || "Saqlashda xatolik" },
      { status: 500, headers: corsHeaders }
    );
  }
}
