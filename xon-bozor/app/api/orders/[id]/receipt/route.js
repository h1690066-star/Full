import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/lib/models/Order";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findById(id).lean();
    if (!order) {
      return new Response(JSON.stringify({ message: "Buyurtma topilmadi" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1. Check base64 receiptData in MongoDB
    if (order.receiptData) {
      const cleanBase64 = String(order.receiptData).replace(/^data:image\/\w+;base64,/, "");
      const buf = Buffer.from(cleanBase64, "base64");
      return new Response(buf, {
        status: 200,
        headers: {
          "Content-Type": order.receiptMime || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
          ...corsHeaders,
        },
      });
    }

    // 2. Check local backend/private/receipts directory
    if (order.receipt) {
      const filename = path.basename(order.receipt);
      const possiblePaths = [
        path.resolve(process.cwd(), "..", "backend", "private", "receipts", filename),
        path.resolve(process.cwd(), "..", "backend", "uploads", filename),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          const ext = path.extname(filename).toLowerCase();
          const mime =
            ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
          return new Response(buf, {
            status: 200,
            headers: {
              "Content-Type": mime,
              "Cache-Control": "public, max-age=86400",
              ...corsHeaders,
            },
          });
        }
      }
    }

    return new Response(JSON.stringify({ message: "Chek rasmi topilmadi" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("API /api/orders/[id]/receipt error:", err);
    return new Response(JSON.stringify({ message: err.message || "Server xatosi" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}
