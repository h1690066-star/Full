import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "8b4eda5eed61d6b71d7984c9c13ad1d9018b7bf94be2bb1c991286cb6ae097acd828aa107868c4f0549ae0e62ad16827";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function getUserId(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await connectToDatabase();
    const contentType = request.headers.get("content-type") || "";
    let data = {};
    let receiptData = "";
    let receiptMime = "image/jpeg";
    let receipt = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      data.items = JSON.parse(formData.get("items") || "[]");
      data.address = JSON.parse(formData.get("address") || "{}");
      data.customerInfo = JSON.parse(formData.get("customerInfo") || "{}");
      data.paymentMethod = formData.get("paymentMethod") || "card";
      data.total = Number(formData.get("total")) || 0;

      const file = formData.get("receipt");
      if (file && typeof file === "object" && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buf = Buffer.from(bytes);
        receipt = `${Date.now()}-${file.name || "receipt.jpg"}`;
        receiptData = buf.toString("base64");
        receiptMime = file.type || "image/jpeg";
      }
    } else {
      data = await request.json();
    }

    const orderNumber = `XB-${Date.now().toString().slice(-6)}`;
    const userId = getUserId(request);

    const order = await Order.create({
      orderNumber,
      user: userId && userId !== "admin-master" ? userId : undefined,
      customer: {
        name: data.customerInfo?.name || data.address?.name || "",
        phone: data.customerInfo?.phone || data.address?.phone || "",
        telegram: data.customerInfo?.telegram || "",
        notes: data.customerInfo?.notes || "",
      },
      items: data.items || [],
      address: data.address || {},
      total: data.total || 0,
      paymentMethod: data.paymentMethod || "card",
      receipt,
      receiptData,
      receiptMime,
      status: "new",
    });

    return NextResponse.json(order, { status: 201, headers: corsHeaders });
  } catch (err) {
    console.error("API /api/orders POST error:", err);
    return NextResponse.json(
      { message: err.message || "Server xatosi" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const filter = status && status !== "all" ? { status: String(status) } : {};

    const [rawOrders, total] = await Promise.all([
      Order.find(filter)
        .select("-receiptData")
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const items = (rawOrders || []).map((o) => {
      const doc = { ...o, _id: String(o._id), id: String(o._id) };
      if (!doc.user) {
        doc.user = {
          name: doc.customer?.name || doc.address?.title || "Mijoz",
          phone: doc.customer?.phone || doc.address?.phone || "-",
          email: "",
        };
      }
      return doc;
    });

    return NextResponse.json(
      {
        orders: items,
        items,
        total,
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("API /api/orders GET error:", err);
    return NextResponse.json(
      { orders: [], items: [], total: 0, page: 1, pages: 1 },
      { status: 500, headers: corsHeaders }
    );
  }
}
