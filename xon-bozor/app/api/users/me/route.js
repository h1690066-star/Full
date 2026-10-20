import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "8b4eda5eed61d6b71d7984c9c13ad1d9018b7bf94be2bb1c991286cb6ae097acd828aa107868c4f0549ae0e62ad16827";

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  phone: u.phone || null,
  email: u.email || null,
  avatar: u.avatar || null,
  createdAt: u.createdAt,
});

const normPhone = (raw) => {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return `+${digits}`;
  return null;
};

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function verifyToken(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function GET(request) {
  const decoded = verifyToken(request);
  if (!decoded || !decoded.id) {
    return NextResponse.json({ message: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: "Foydalanuvchi topilmadi" }, { status: 404 });
    }
    return NextResponse.json(publicUser(user));
  } catch (err) {
    console.error("API /api/users/me GET error:", err);
    return NextResponse.json({ message: "Server xatosi" }, { status: 500 });
  }
}

export async function PUT(request) {
  const decoded = verifyToken(request);
  if (!decoded || !decoded.id) {
    return NextResponse.json({ message: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    let body = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body.name = formData.get("name") || undefined;
      body.phone = formData.get("phone") || undefined;
      body.email = formData.get("email") || undefined;
      body.removeAvatar = formData.get("removeAvatar") || undefined;

      const file = formData.get("avatar");
      if (file && typeof file === "object" && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buf = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name || "avatar.jpg"}`;
        user.avatar = `/uploads/${filename}`;
        user.avatarData = {
          filename,
          data: buf.toString("base64"),
          mime: file.type || "image/jpeg",
        };
      }
    } else {
      body = await request.json();
    }

    if (
      body.name !== undefined &&
      body.name !== null &&
      String(body.name).trim() !== "" &&
      String(body.name).trim().toLowerCase() !== "null"
    ) {
      const name = String(body.name).trim();
      if (name.length < 2) {
        return NextResponse.json({ message: "Ism kamida 2 ta belgi bo'lsin" }, { status: 400 });
      }
      user.name = name;
    }

    if (
      body.phone &&
      String(body.phone).trim() !== "" &&
      String(body.phone).trim().toLowerCase() !== "null"
    ) {
      const p = normPhone(body.phone);
      if (!p) {
        return NextResponse.json({ message: "Telefon raqam noto'g'ri" }, { status: 400 });
      }
      user.phone = p;
    }

    if (
      body.email &&
      String(body.email).trim() !== "" &&
      String(body.email).trim().toLowerCase() !== "null"
    ) {
      const em = String(body.email).toLowerCase().trim();
      if (!emailRx.test(em)) {
        return NextResponse.json({ message: "Email noto'g'ri" }, { status: 400 });
      }
      user.email = em;
    }

    if (body.removeAvatar === "true") {
      user.avatar = "";
      user.avatarData = null;
    }

    await user.save();
    return NextResponse.json(publicUser(user));
  } catch (err) {
    console.error("API /api/users/me PUT error:", err);
    if (err.code === 11000) {
      return NextResponse.json({ message: "Bu telefon yoki email band" }, { status: 400 });
    }
    return NextResponse.json({ message: err.message || "Server xatosi" }, { status: 500 });
  }
}

