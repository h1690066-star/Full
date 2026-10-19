import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { mapApiProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID talab qilinadi" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const productRaw = await Product.findById(id).lean();
    if (!productRaw) {
      return NextResponse.json({ message: "Mahsulot topilmadi" }, { status: 404 });
    }

    const relatedRaw = await Product.find({
      category: productRaw.category,
      _id: { $ne: productRaw._id },
      isActive: { $ne: false },
    })
      .limit(6)
      .lean();

    return NextResponse.json({
      product: mapApiProduct(productRaw),
      related: relatedRaw.map(mapApiProduct).filter(Boolean),
    });
  } catch (err) {
    console.error("API /api/products/[id] error:", err);
    return NextResponse.json({ message: "Server xatosi" }, { status: 500 });
  }
}

