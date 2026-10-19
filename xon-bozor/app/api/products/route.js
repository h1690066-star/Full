import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { mapApiProduct, isComputerEquipment } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10000", 10);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let filter = { isActive: { $ne: false } };

    if (category) {
      const catLower = category.toLowerCase().trim();
      if (catLower.includes("used") || catLower.includes("b/u")) {
        filter = {
          $and: [
            { isActive: { $ne: false } },
            {
              $or: [
                { used: true },
                { category: { $in: ["Used Phones", "B/U Telefonlar"] } },
                { name: { $regex: /\(used|\(b\/u\)/i } },
              ],
            },
          ],
        };
      } else if (catLower.includes("computer") || catLower.includes("kompyuter")) {
        filter.category = { $in: ["Elektronika", "Computers"] };
      } else if (catLower.includes("appliance") || catLower.includes("maishiy")) {
        filter.category = { $in: ["Home appliances", "Maishiy texnika"] };
      } else if (catLower.includes("accessor") || catLower.includes("aksessuar")) {
        filter.category = { $in: ["Aksessuarlar", "Accessories"] };
      } else if (catLower === "phones") {
        filter.category = "Phones";
        filter.used = { $ne: true };
      } else {
        filter.category = new RegExp(category.trim(), "i");
      }
    }

    if (search) {
      const s = search.trim();
      filter.name = new RegExp(s, "i");
    }

    const items = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    let mapped = items.map(mapApiProduct).filter(Boolean);

    if (category) {
      const catLower = category.toLowerCase().trim();
      if (catLower.includes("appliance") || catLower.includes("maishiy")) {
        mapped = mapped.filter((p) => !isComputerEquipment(p));
      } else if (catLower.includes("computer") || catLower.includes("kompyuter")) {
        mapped = mapped.filter((p) => isComputerEquipment(p));
      }
    }

    return NextResponse.json({
      items: mapped,
      total: mapped.length,
    });
  } catch (error) {
    console.error("API /api/products error:", error);
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}
