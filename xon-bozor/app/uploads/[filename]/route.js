import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
};

export async function GET(request, { params }) {
  const { filename } = await params;
  if (!filename) {
    return new Response("Filename not specified", { status: 400, headers: corsHeaders });
  }

  try {
    // 0. Check local backend uploads / receipts folders first (fast local disk)
    const safeName = path.basename(filename);
    const localPaths = [
      path.resolve(process.cwd(), "..", "backend", "uploads", safeName),
      path.resolve(process.cwd(), "..", "backend", "private", "receipts", safeName),
    ];
    for (const p of localPaths) {
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        const ext = path.extname(safeName).toLowerCase();
        const mime =
          ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=31536000, immutable",
            ...corsHeaders,
          },
        });
      }
    }

    const conn = await connectToDatabase();
    const db = conn.connection?.db || conn.db;

    // 1. Check in uploaded_images collection
    if (db) {
      const uploadedImg = await db.collection("uploaded_images").findOne({ filename: safeName });
      if (uploadedImg && uploadedImg.data) {
        const buf = Buffer.from(uploadedImg.data, "base64");
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": uploadedImg.mime || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            ...corsHeaders,
          },
        });
      }
    }

    // 2. Check in Product.imagesData
    const product = await Product.findOne({
      $or: [
        { "imagesData.filename": safeName },
        { images: new RegExp(safeName, "i") },
      ],
    }).lean();

    if (product?.imagesData) {
      const imgObj =
        product.imagesData.find((img) => img.filename === safeName) || product.imagesData[0];
      if (imgObj && imgObj.data) {
        const buf = Buffer.from(imgObj.data, "base64");
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": imgObj.mime || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            ...corsHeaders,
          },
        });
      }
    }

    // 3. Check in User.avatarData
    const user = await User.findOne({
      $or: [
        { "avatarData.filename": safeName },
        { avatar: new RegExp(safeName, "i") },
      ],
    }).lean();

    if (user?.avatarData?.data) {
      const buf = Buffer.from(user.avatarData.data, "base64");
      return new Response(buf, {
        status: 200,
        headers: {
          "Content-Type": user.avatarData.mime || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          ...corsHeaders,
        },
      });
    }

    return new Response("Image not found", { status: 404, headers: corsHeaders });
  } catch (err) {
    console.error("Upload retrieval error:", err);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
}
