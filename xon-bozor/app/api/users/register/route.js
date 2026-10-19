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

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    let body = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body.name = formData.get("name");
      body.email = formData.get("email");
      body.phone = formData.get("phone");
      body.password = formData.get("password");

      const file = formData.get("avatar");
      if (file && typeof file === "object" && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buf = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name || "avatar.jpg"}`;
        body.avatar = `/uploads/${filename}`;
        body.avatarData = {
          filename,
          data: buf.toString("base64"),
          mime: file.type || "image/jpeg",
        };
      }
    } else {
      body = await request.json();
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (name.length < 2) {
      return NextResponse.json({ message: "Ism kamida 2 ta belgi bo'lsin" }, { status: 400 });
    }
    if (!email || !emailRx.test(email)) {
      return NextResponse.json({ message: "Email noto'g'ri" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Parol kamida 6 ta belgi bo'lsin" }, { status: 400 });
    }

    const data = { name, email, password };
    if (body.avatar) data.avatar = body.avatar;
    if (body.avatarData) data.avatarData = body.avatarData;

    if (body.phone) {
      const p = normPhone(body.phone);
      if (!p) {
        return NextResponse.json({ message: "Telefon raqam noto'g'ri" }, { status: 400 });
      }
      data.phone = p;
    }

    const or = [{ email: data.email }];
    if (data.phone) or.push({ phone: data.phone });
    const existing = await User.findOne({ $or: or });
    if (existing) {
      return NextResponse.json(
        { message: "Bu email yoki telefon bilan ro'yxatdan o'tilgan. Kirish bo'limidan foydalaning" },
        { status: 400 }
      );
    }

    const user = await User.create(data);
    return NextResponse.json(
      { token: sign(user), user: publicUser(user) },
      { status: 201 }
    );
  } catch (err) {
    console.error("API /api/users/register error:", err);
    if (err.code === 11000) {
      return NextResponse.json({ message: "Bu telefon yoki email band" }, { status: 400 });
    }
    return NextResponse.json({ message: err.message || "Server xatosi" }, { status: 500 });
  }
}

