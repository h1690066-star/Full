import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json().catch(() => ({}));
    const status = String(body.status || "").trim();

    if (!["new", "confirmed", "delivered", "cancelled"].includes(status)) {
      return NextResponse.json(
        { message: "Status noto'g'ri" },
        { status: 400, headers: corsHeaders }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { message: "Buyurtma topilmadi" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (status === "cancelled" && order.status !== "cancelled" && Array.isArray(order.items)) {
      await Promise.all(
        order.items
          .filter((i) => i.product)
          .map((i) =>
            Product.updateOne({ _id: i.product }, { $inc: { stock: Number(i.qty) || 1 } }).catch(
              () => {}
            )
          )
      );
    }

    order.status = status;
    await order.save();

    const plain = order.toObject();
    delete plain.receiptData;

    return NextResponse.json(
      { success: true, order: { ...plain, _id: String(plain._id), id: String(plain._id) } },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("API /api/orders/[id]/status PUT error:", err);
    return NextResponse.json(
      { message: err.message || "Server xatosi" },
      { status: 500, headers: corsHeaders }
    );
  }
}
