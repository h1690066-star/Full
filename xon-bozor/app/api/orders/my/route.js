import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/lib/models/Order";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "8b4eda5eed61d6b71d7984c9c13ad1d9018b7bf94be2bb1c991286cb6ae097acd828aa107868c4f0549ae0e62ad16827";

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

export async function GET(request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ orders: [] });
  }

  try {
    await connectToDatabase();
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders || []);
  } catch (err) {
    console.error("API /api/orders/my error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
