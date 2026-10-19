import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
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

const sign = (user) =>
  jwt.sign({ id: user._id, role: "user" }, JWT_SECRET, {
    expiresIn: "365d",
  });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  phone: u.phone || null,
  email: u.email || null,
  avatar: u.avatar || null,
  createdAt: u.createdAt,
});

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const password = String(body.password || "");
    const login = String(body.login || body.email || "");

    if (!login || !password) {
      return NextResponse.json({ message: "Email va parolni kiriting" }, { status: 400 });
    }

    const query = login.includes("@")
      ? { email: login.toLowerCase().trim() }
      : { phone: normPhone(login) };

    if (!query.email && !query.phone) {
      return NextResponse.json({ message: "Email yoki parol xato" }, { status: 400 });
    }

    const user = await User.findOne(query).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ message: "Email yoki parol xato" }, { status: 400 });
    }

    return NextResponse.json({
      token: sign(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("API /api/users/login error:", err);
    return NextResponse.json({ message: err.message || "Server xatosi" }, { status: 500 });
  }
}

