import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { mapApiProduct, isComputerEquipment } from "@/lib/products";

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

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const all = searchParams.get("all") === "true";

    let filter = all ? {} : { isActive: { $ne: false } };

    if (category && category !== "Barchasi") {
      const catLower = category.toLowerCase().trim();
      if (catLower.includes("used") || catLower.includes("b/u")) {
        filter = {
          $and: [
            all ? {} : { isActive: { $ne: false } },
            {
              $or: [
                { used: true },
                { category: { $in: ["Used Phones", "B/U Telefonlar"] } },
                { name: { $regex: /\(used|\(b\/u\)/i } },
              ],
            },
          ],
        };
      } else if (
        catLower.includes("computer") ||
        catLower.includes("kompyuter") ||
        catLower.includes("elektron")
      ) {
        filter.category = { $in: ["Elektronika", "Computers"] };
      } else if (catLower.includes("appliance") || catLower.includes("maishiy")) {
        filter.category = { $in: ["Home appliances", "Maishiy texnika"] };
      } else if (catLower.includes("accessor") || catLower.includes("aksessuar")) {
        filter.category = { $in: ["Aksessuarlar", "Accessories"] };
      } else if (catLower === "phones") {
        filter.category = "Phones";
        if (!all) filter.used = { $ne: true };
      } else {
        filter.category = new RegExp(category.trim(), "i");
      }
    }

    if (brand && brand !== "Barchasi") {
      filter.brand = new RegExp(`^${brand.trim()}$`, "i");
    }

    if (search) {
      const s = search.trim();
      filter.$or = [
        { name: new RegExp(s, "i") },
        { brand: new RegExp(s, "i") },
        { description: new RegExp(s, "i") },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === "Arzonroq" || sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "Qimmatroq" || sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "Omborda kam" || sort === "stock_asc") sortObj = { stock: 1 };

    const allMatched = await Product.find(filter)
      .select("-imagesData")
      .sort(sortObj)
      .lean();

    let mapped = allMatched.map((p) => {
      const m = mapApiProduct(p) || p;
      return {
        ...p,
        ...m,
        _id: String(p._id),
        id: String(p._id),
      };
    });

    if (category && !all) {
      const catLower = category.toLowerCase().trim();
      if (catLower.includes("appliance") || catLower.includes("maishiy")) {
        mapped = mapped.filter((p) => !isComputerEquipment(p));
      } else if (catLower.includes("computer") || catLower.includes("kompyuter")) {
        mapped = mapped.filter((p) => isComputerEquipment(p));
      }
    }

    const total = mapped.length;
    const pageNum = Math.max(1, parseInt(pageParam || "1", 10));
    const limitNum =
      !limitParam || limitParam === "all" || limitParam === "0"
        ? 10000
        : Math.max(1, parseInt(limitParam, 10));

    const paginated =
      limitNum < 10000
        ? mapped.slice((pageNum - 1) * limitNum, pageNum * limitNum)
        : mapped;

    return NextResponse.json(
      {
        items: paginated,
        products: paginated,
        total,
        page: pageNum,
        pages: Math.max(1, Math.ceil(total / limitNum)),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("API /api/products GET error:", error);
    return NextResponse.json(
      { items: [], products: [], total: 0, page: 1, pages: 1 },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request) {
  try {
    const conn = await connectToDatabase();
    const db = conn.connection?.db || conn.db;
    const contentType = request.headers.get("content-type") || "";

    let b = {};
    const uploadedUrls = [];

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
            uploadedUrls.push(`/uploads/${filename}`);
          }
        } else if (typeof val === "string") {
          if (key === "images") {
            uploadedUrls.push(val);
          } else {
            b[key] = val;
          }
        }
      }
    } else {
      b = await request.json();
      if (Array.isArray(b.images)) uploadedUrls.push(...b.images);
      else if (typeof b.images === "string" && b.images) uploadedUrls.push(b.images);
    }

    const price = Number(b.price) || 0;
    if (!b.name || !String(b.name).trim()) {
      return NextResponse.json(
        { message: "Mahsulot nomi majburiy" },
        { status: 400, headers: corsHeaders }
      );
    }

    const usedFlag =
      b.used === true ||
      b.used === "true" ||
      /^(used(\s*phones?)?|b\/u(\s*telefonlar)?)$/i.test(String(b.category || ""));

    const docData = {
      name: String(b.name).trim(),
      description: String(b.description || ""),
      longDescription: String(b.longDescription || ""),
      brand: String(b.brand || "Apple"),
      category: String(b.category || "Phones"),
      used: usedFlag,
      grade: String(b.grade || "excellent"),
      battery: Number(b.battery) || 95,
      price,
      oldPrice: b.oldPrice ? Number(b.oldPrice) : undefined,
      discount: b.discount ? Number(b.discount) : 0,
      stock: b.stock !== undefined ? Number(b.stock) : 0,
      isActive: b.isActive === undefined ? true : b.isActive === "true" || b.isActive === true,
      images: uploadedUrls,
      colors: toArray(b.colors),
      storage: toArray(b.storage),
      specs: parseSpecs(b.specs),
    };

    const product = await Product.create(docData);
    return NextResponse.json(
      {
        ...product.toObject(),
        _id: String(product._id),
        id: String(product._id),
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("API /api/products POST error:", err);
    return NextResponse.json(
      { message: err.message || "Mahsulot yaratishda xatolik" },
      { status: 500, headers: corsHeaders }
    );
  }
}
