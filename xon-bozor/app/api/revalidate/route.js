import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { clearProductsCache } from "@/lib/products";

export const dynamic = "force-dynamic";

function handleRevalidate() {
  try {
    clearProductsCache();
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/catalog/[slug]", "page");
    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: "Kesh muvaffaqiyatli tozalandi va yangilandi",
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Revalidation failed", error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handleRevalidate();
}

export async function POST() {
  return handleRevalidate();
}
