import { fetchProducts } from "@/lib/products";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10000", 10);
    const category = searchParams.get("category");

    const params = { limit };
    if (category) params.category = category;

    const products = await fetchProducts(params);
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
