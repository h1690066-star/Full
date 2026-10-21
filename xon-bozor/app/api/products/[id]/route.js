import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { mapApiProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

const toArray = (v) => {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v !== "string" || !v.trim()) return [];
  try {
    const j = JSON.parse(v);
    if (Array.isArray(j)) return j.map(String).filter(Boolean);
  } catch {}
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseSpecs = (v) => {
  if (Array.isArray(v)) return v.filter((s) => s && s.label && s.value);
  if (typeof v !== "string" || !v.trim()) return [];
  try {
    const j = JSON.parse(v);
    if (Array.isArray(j)) return j.filter((s) => s && s.label && s.value);
  } catch {}
  return [];
};

export async function GET(request, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID talab qilinadi" }, { status: 400, headers: corsHeaders });
  }

  try {
    await connectToDatabase();
    const productRaw = await Product.findById(id).select("-imagesData").lean();
    if (!productRaw) {
      return NextResponse.json(
        { message: "Mahsulot topilmadi" },
        { status: 404, headers: corsHeaders }
      );
    }

    const relatedRaw = await Product.find({
      category: productRaw.category,
      _id: { $ne: productRaw._id },
      isActive: { $ne: false },
    })
      .select("-imagesData")
      .limit(6)
      .lean();

    return NextResponse.json(
      {
        product: mapApiProduct(productRaw),
        related: relatedRaw.map(mapApiProduct).filter(Boolean),
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("API /api/products/[id] GET error:", err);
    return NextResponse.json({ message: "Server xatosi" }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const conn = await connectToDatabase();
    const db = conn.connection?.db || conn.db;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Mahsulot topilmadi" },
        { status: 404, headers: corsHeaders }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let b = {};
    const newImages = [];
    const keptImages = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [key, val] of formData.entries()) {
        if (val && typeof val === "object" && typeof val.arrayBuffer === "function" && key === "images") {
          if (val.size > 0) {
            const bytes = await val.arrayBuffer();
            const buf = Buffer.from(bytes);
            const ext = (val.name || "img.jpg").split(".").pop() || "jpg";
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
            const mime = val.type || "image/jpeg";
            if (db) {
              await db.collection("uploaded_images").updateOne(
                { filename },
                {
                  $set: {
                    filename,
                    data: buf.toString("base64"),
                    mime,
                    updatedAt: new Date(),
                  },
                },
                { upsert: true }
              );
            }
            newImages.push(`/uploads/${filename}`);
          }
        } else if (typeof val === "string") {
          if (key === "images") {
            keptImages.push(val);
          } else {
            b[key] = val;
          }
        }
      }
    } else {
      b = await request.json();
      if (Array.isArray(b.images)) keptImages.push(...b.images);
    }

    const scalarFields = ["name", "description", "longDescription", "brand", "category", "grade"];
    for (const f of scalarFields) {
      if (b[f] !== undefined) product[f] = String(b[f]);
    }

    const numericFields = ["price", "oldPrice", "discount", "stock", "battery"];
    for (const f of numericFields) {
      if (b[f] !== undefined && b[f] !== "") product[f] = Number(b[f]);
    }

    if (b.colors !== undefined) product.colors = toArray(b.colors);
    if (b.storage !== undefined) product.storage = toArray(b.storage);
    if (b.specs !== undefined) product.specs = parseSpecs(b.specs);
    if (b.isActive !== undefined) {
      product.isActive = b.isActive === "true" || b.isActive === true;
    }
    if (b.used !== undefined) {
      product.used = b.used === "true" || b.used === true;
    } else if (b.category && /^(used(\s*phones?)?|b\/u(\s*telefonlar)?)$/i.test(String(b.category))) {
      product.used = true;
    }

    const toRemove = toArray(b.removeImages);
    if (toRemove.length > 0) {
      product.images = (product.images || []).filter((img) => !toRemove.includes(img));
    }

    if (keptImages.length > 0 || newImages.length > 0) {
      const base = keptImages.length > 0 ? keptImages : product.images || [];
      product.images = [...base, ...newImages];
    }

    await product.save();
    const obj = product.toObject();
    delete obj.imagesData;

    return NextResponse.json(
      { ...obj, _id: String(obj._id), id: String(obj._id) },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("API /api/products/[id] PUT error:", err);
    return NextResponse.json(
      { message: err.message || "Tahrirlashda xatolik" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json(
        { message: "Mahsulot topilmadi" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { success: true, message: "Mahsulot o'chirildi" },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("API /api/products/[id] DELETE error:", err);
    return NextResponse.json(
      { message: err.message || "O'chirishda xatolik" },
      { status: 500, headers: corsHeaders }
    );
  }
}
