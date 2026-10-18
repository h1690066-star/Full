// app/api/telegram-order/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BOT_USERNAME = "xonbozorbuyurtma_bot";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const tgUrl = (token, method) => `https://api.telegram.org/bot${token}/${method}`;

async function sendText(token, chatId, text) {
  const res = await fetch(tgUrl(token, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const data = await res.json();
  if (!data.ok) console.warn("[Telegram] sendMessage xatosi:", data.description);
  return data;
}

export async function POST(req) {
  try {
    // Token va chat ID faqat .env.local dan olinadi
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    let items = [];
    let customerInfo = {};
    let paymentMethod = "cash";
    let total = 0;
    let receiptFile = null;
    let orderNumber = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      orderNumber = formData.get("orderNumber") || "";
      const rawItems = formData.get("items");
      const rawAddress = formData.get("address");
      const rawCustomer = formData.get("customerInfo");
      paymentMethod = formData.get("paymentMethod") || "cash";
      total = Number(formData.get("total") || 0);
      receiptFile = formData.get("receipt");

      if (rawItems) {
        try { items = JSON.parse(rawItems); } catch { items = []; }
      }
      if (rawCustomer) {
        try { customerInfo = JSON.parse(rawCustomer); } catch {}
      } else if (rawAddress) {
        try { customerInfo = JSON.parse(rawAddress); } catch {}
      }
    } else {
      const body = await req.json();
      orderNumber = body.orderNumber || "";
      items = body.items || [];
      customerInfo = body.customerInfo || body.address || {};
      paymentMethod = body.paymentMethod || "cash";
      total = Number(body.total || 0);
    }

    if (!botToken || !chatId) {
      console.warn("⚠️ [Telegram]: .env.local da TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID yo'q. Serverni qayta ishga tushirganmisiz?");
      return NextResponse.json({
        success: false,
        warning: "TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan",
        botUsername: BOT_USERNAME,
      });
    }

    // Xabar matnini tayyorlash
    const name = customerInfo.name || "Noma'lum mijoz";
    const phone = customerInfo.phone || "Kiritilmagan";
    const region = customerInfo.region || customerInfo.title || "Toshkent shahri";
    const district = customerInfo.district || "";
    const street = customerInfo.street || customerInfo.text || "";
    const addressFull = [region, district, street].filter(Boolean).join(", ");
    const telegramUsername = customerInfo.telegram ? `@${customerInfo.telegram.replace("@", "")}` : "Mavjud emas";
    const notes = customerInfo.notes || "Yo'q";

    const itemsText = items
      .map((it, idx) => {
        const pName = it.name || "Mahsulot";
        const pQty = it.qty || it.quantity || 1;
        const pPrice = Number(it.price || 0).toLocaleString("ru-RU");
        return `${idx + 1}. <b>${esc(pName)}</b> — ${pQty} dona × ${pPrice} so'm`;
      })
      .join("\n");

    const formattedTotal = Number(total).toLocaleString("ru-RU");
    const payLabel = paymentMethod === "card" ? "💳 Karta orqali to'lov" : "💵 Naqd to'lov (Yetkazilganda)";
    const dateStr = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

    const messageHtml =
      `🛒 <b>YANGI BUYURTMA! ${orderNumber ? `#${esc(orderNumber)} ` : ""}(Xon Bozor)</b>\n\n` +
      `👤 <b>Mijoz ismi:</b> ${esc(name)}\n` +
      `📞 <b>Telefon raqami:</b> <code>${esc(phone)}</code>\n` +
      `📍 <b>Manzil:</b> ${esc(addressFull)}\n` +
      `💬 <b>Telegram:</b> ${esc(telegramUsername)}\n` +
      `📝 <b>Izoh:</b> ${esc(notes)}\n` +
      `💰 <b>To'lov turi:</b> ${esc(payLabel)}\n\n` +
      `📦 <b>Mahsulotlar ro'yxati:</b>\n${itemsText || "Savat bo'sh"}\n\n` +
      `💵 <b>Jami summa:</b> <b>${formattedTotal} so'm</b>\n` +
      `🕒 <b>Vaqti:</b> ${esc(dateStr)}`;

    let lastResult = null;

    // 1. Chek rasmi bo'lsa
    if (receiptFile && typeof receiptFile === "object" && receiptFile.size > 0) {
      const tgForm = new FormData();
      tgForm.append("chat_id", chatId);
      tgForm.append("photo", receiptFile);
      tgForm.append("caption", messageHtml.slice(0, 1024));
      tgForm.append("parse_mode", "HTML");

      const res = await fetch(tgUrl(botToken, "sendPhoto"), { method: "POST", body: tgForm });
      lastResult = await res.json();
      if (!lastResult.ok) {
        console.warn("[Telegram] sendPhoto (chek) xatosi:", lastResult.description);
        lastResult = await sendText(botToken, chatId, messageHtml);
      }
    } else {
      // 2. Chek yo'q: mahsulot rasmi bormi?
      const firstImage = items.find((i) => i.image)?.image;
      if (firstImage && String(firstImage).startsWith("http")) {
        try {
          const res = await fetch(tgUrl(botToken, "sendPhoto"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              photo: firstImage,
              caption: messageHtml.slice(0, 1024),
              parse_mode: "HTML",
            }),
          });
          lastResult = await res.json();
          if (!lastResult.ok) throw new Error(lastResult.description);
        } catch (e) {
          console.warn("[Telegram] sendPhoto (mahsulot) xatosi:", e.message);
          lastResult = await sendText(botToken, chatId, messageHtml);
        }
      } else {
        // 3. Oddiy matn
        lastResult = await sendText(botToken, chatId, messageHtml);
      }
    }

    if (!lastResult?.ok) {
      return NextResponse.json(
        { success: false, error: lastResult?.description || "Telegramga yuborilmadi" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Telegramga yuborildi" });
  } catch (error) {
    console.error("Order Telegram API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}