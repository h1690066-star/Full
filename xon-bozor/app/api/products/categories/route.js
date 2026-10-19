import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Product.distinct("category", { isActive: { $ne: false } });
    return NextResponse.json(categories || []);
  } catch (err) {
    console.error("API /api/products/categories error:", err);
    return NextResponse.json([]);
  }
}
