import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "8b4eda5eed61d6b71d7984c9c13ad1d9018b7bf94be2bb1c991286cb6ae097acd828aa107868c4f0549ae0e62ad16827";

const normPhone = (raw) => {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return `+${digits}`;
  return null;
};

const sign = (user, role = "user") =>
  jwt.sign({ id: user._id, role }, JWT_SECRET, {
    expiresIn: "365d",
  });

const publicUser = (u, role = "user") => ({
  id: u._id,
  name: u.name || u.username,
  phone: u.phone || null,
  email: u.email || null,
  avatar: u.avatar || null,
  role: role || u.role || "user",
  createdAt: u.createdAt,
});

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const conn = await connectToDatabase();
    const body = await request.json();
    const password = String(body.password || "");
    const login = String(body.login || body.email || body.phone || "").trim();

    if (!login || !password) {
      return NextResponse.json({ message: "Login va parolni kiriting" }, { status: 400 });
    }

    // 1. Foydalanuvchini email yoki telefon bo'yicha qidirish
    const query = login.includes("@")
      ? { email: login.toLowerCase().trim() }
      : { phone: normPhone(login) || login };

    let user = await User.findOne(query).select("+password");

    // Agar topilmasa, boshqa formatdagi telefon yoki ism bo'yicha ham sinab ko'rish
    if (!user && !login.includes("@")) {
      user = await User.findOne({
        $or: [
          { phone: login },
          { phone: normPhone(login) },
          { name: login },
        ],
      }).select("+password");
    }

    if (user && (await user.comparePassword(password))) {
      return NextResponse.json({
        token: sign(user, "user"),
        user: publicUser(user, "user"),
      });
    }

    // 2. Agar foydalanuvchi topilmasa, adminlar jadvalidan tekshirish
    const db = conn.connection?.db || conn.db;
    if (db) {
      const admin = await db.collection("admins").findOne({
        $or: [{ username: login }, { email: login }],
      });
      if (admin && admin.password && (await bcrypt.compare(password, admin.password))) {
        return NextResponse.json({
          token: sign(admin, "admin"),
          user: { id: admin._id, name: admin.username, role: "admin" },
        });
      }
    }

    return NextResponse.json({ message: "Email, telefon yoki parol noto'g'ri" }, { status: 400 });
  } catch (err) {
    console.error("API /api/users/login error:", err);
    return NextResponse.json({ message: err.message || "Server xatosi" }, { status: 500 });
  }
}
