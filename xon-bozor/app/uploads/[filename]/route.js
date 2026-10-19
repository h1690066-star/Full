import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { filename } = await params;
  if (!filename) {
    return new Response("Filename not specified", { status: 400 });
  }

  try {
    const conn = await connectToDatabase();
    const db = conn.connection?.db || conn.db;

    // 1. Check in uploaded_images collection
    if (db) {
      const uploadedImg = await db.collection("uploaded_images").findOne({ filename });
      if (uploadedImg && uploadedImg.data) {
        const buf = Buffer.from(uploadedImg.data, "base64");
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": uploadedImg.mime || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // 2. Check in Product.imagesData
    const product = await Product.findOne({
      $or: [
        { "imagesData.filename": filename },
        { images: new RegExp(filename, "i") },
      ],
    }).lean();

    if (product?.imagesData) {
      const imgObj = product.imagesData.find((img) => img.filename === filename);
      if (imgObj && imgObj.data) {
        const buf = Buffer.from(imgObj.data, "base64");
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": imgObj.mime || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // 3. Check in User.avatarData
    const user = await User.findOne({
      $or: [
        { "avatarData.filename": filename },
        { avatar: new RegExp(filename, "i") },
      ],
    }).lean();

    if (user?.avatarData?.data) {
      const buf = Buffer.from(user.avatarData.data, "base64");
      return new Response(buf, {
        status: 200,
        headers: {
          "Content-Type": user.avatarData.mime || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new Response("Image not found", { status: 404 });
  } catch (err) {
    console.error("Upload retrieval error:", err);
    return new Response("Server error", { status: 500 });
  }
}

