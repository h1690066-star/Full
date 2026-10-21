import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function normDigits(p) {
  return String(p || "").replace(/\D/g, "").slice(-9);
}

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const [usersRaw, ordersRaw] = await Promise.all([
      User.find({}).select("-avatarData -password").sort({ createdAt: -1 }).lean(),
      Order.find({}).select("-receiptData").sort({ createdAt: -1 }).lean(),
    ]);

    const users = Array.isArray(usersRaw) ? usersRaw : [];
    const orders = Array.isArray(ordersRaw) ? ordersRaw : [];

    // Enrich each user with their real orders from Order collection
    const enriched = users.map((u) => {
      const uid = String(u._id);
      const uPhone = normDigits(u.phone);
      const uName = String(u.name || "").trim().toLowerCase();

      const matchedOrders = orders.filter((o) => {
        if (o.user && String(o.user) === uid) return true;
        const oPhone = normDigits(o.customer?.phone || o.address?.phone);
        if (uPhone && oPhone && uPhone === oPhone) return true;
        const oName = String(o.customer?.name || "").trim().toLowerCase();
        if (uName && oName && uName.length > 2 && uName === oName) return true;
        return false;
      });

      const validOrders = matchedOrders.filter(
        (o) => o.status !== "cancelled" && o.status !== "Bekor qilingan"
      );

      const totalSpent = validOrders.reduce((s, o) => {
        let t = Number(o.total) || 0;
        if (!t && Array.isArray(o.items)) {
          t = o.items.reduce(
            (is, it) => is + (Number(it.price) || 0) * (Number(it.qty || it.quantity) || 1),
            0
          );
        }
        return s + t;
      }, 0);

      const lastOrder = matchedOrders[0] || null;
      const lastAddress = lastOrder?.address?.text
        ? `${lastOrder.address.title ? lastOrder.address.title + " — " : ""}${lastOrder.address.text}`
        : "Toshkent sh., Yetkazib berish manzili";

      return {
        id: uid,
        _id: uid,
        name: u.name || "Mijoz",
        email: u.email || null,
        phone: u.phone || lastOrder?.customer?.phone || lastOrder?.address?.phone || null,
        avatar: u.avatar || null,
        createdAt: u.createdAt,
        ordersCount: matchedOrders.length,
        activeOrdersCount: validOrders.length,
        totalSpent: Math.round(totalSpent),
        avgCheck:
          validOrders.length > 0 ? Math.round(totalSpent / validOrders.length) : 0,
        lastActive: lastOrder?.createdAt || u.createdAt,
        lastAddress,
        isVip: matchedOrders.length >= 2 || totalSpent >= 10000000,
        orderHistory: matchedOrders.slice(0, 10).map((o) => ({
          id: String(o._id),
          _id: String(o._id),
          orderNumber: o.orderNumber || `XB-${String(o._id).slice(-6)}`,
          status: o.status || "new",
          total: Number(o.total) || 0,
          itemsCount: Array.isArray(o.items)
            ? o.items.reduce((s, i) => s + (Number(i.qty || i.quantity) || 1), 0)
            : 1,
          items: o.items || [],
          createdAt: o.createdAt,
        })),
      };
    });

    const filtered = search
      ? enriched.filter(
          (u) =>
            String(u.name || "").toLowerCase().includes(search) ||
            String(u.email || "").toLowerCase().includes(search) ||
            String(u.phone || "").toLowerCase().includes(search)
        )
      : enriched;

    return NextResponse.json(
      {
        items: filtered,
        users: filtered,
        total: filtered.length,
        page: 1,
        pages: 1,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("API /api/users GET error:", err);
    return NextResponse.json(
      { items: [], users: [], total: 0 },
      { status: 500, headers: corsHeaders }
    );
  }
}
