import { NextResponse } from "next/server";

const DEFAULT_BOT_TOKEN = "8215957478:AAH1lyyrQSAcFKVBWbXel7ep4k_WJqpd8Ds";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

async function resolveChatId(botToken, configuredChatId) {
  // Agar env da to'g'ri chat_id bo'lsa (va bot ID siga teng bo'lmasa)
  if (configuredChatId && configuredChatId !== "8215957478") {
    return configuredChatId;
  }

  // Avtomatik ravishda getUpdates orqali oxirgi yozgan admin yoki guruhni topish
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      // Oxirgi xabarni olamiz
      for (let i = data.result.length - 1; i >= 0; i--) {
        const u = data.result[i];
        const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat;
        if (chat?.id) {
          console.log(`[Telegram Auto-Detect] Topilgan Chat ID: ${chat.id} (${chat.title || chat.username || chat.first_name})`);
          return String(chat.id);
        }
      }
    }
  } catch (err) {
    console.error("[Telegram Auto-Detect xatosi]:", err.message);
  }

  return null;
}

export async function POST(req) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const configuredChatId = process.env.TELEGRAM_CHAT_ID;

    let items = [];
    let customerInfo = {};
    let paymentMethod = "cash";
    let total = 0;
    let receiptFile = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
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
      items = body.items || [];
      customerInfo = body.customerInfo || body.address || {};
      paymentMethod = body.paymentMethod || "cash";
      total = Number(body.total || 0);
    }

    const chatId = await resolveChatId(botToken, configuredChatId);

    // Xabar matnini tayyorlash
    const name = customerInfo.name || "Noma'lum mijoz";
    const phone = customerInfo.phone || "Kiritilmagan";
    const region = customerInfo.region || customerInfo.title || "Toshkent shahri";
    const district = customerInfo.district || "";
    const street = customerInfo.street || customerInfo.text || "";
    const addressFull = [region, district, street].filter(Boolean).join(", ");
    const telegramUsername = customerInfo.telegram ? `@${customerInfo.telegram.replace("@", "")}` : "Mavjud emas";
    const notes = customerInfo.notes || "Yo'q";

    const itemsText = items.map((it, idx) => {
      const pName = it.name || "Mahsulot";
      const pQty = it.qty || it.quantity || 1;
      const pPrice = Number(it.price || 0).toLocaleString("ru-RU");
      return `${idx + 1}. <b>${esc(pName)}</b> — ${pQty} dona × ${pPrice} so'm`;
    }).join("\n");

    const formattedTotal = Number(total).toLocaleString("ru-RU");
    const payLabel = paymentMethod === "card" ? "💳 Karta orqali to'lov" : "💵 Naqd to'lov (Yetkazilganda)";
    const dateStr = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

    const messageHtml =
      `🛒 <b>YANGI BUYURTMA! (Xon Bozor)</b>\n\n` +
      `👤 <b>Mijoz ismi:</b> ${esc(name)}\n` +
      `📞 <b>Telefon raqami:</b> <code>${esc(phone)}</code>\n` +
      `📍 <b>Manzil:</b> ${esc(addressFull)}\n` +
      `💬 <b>Telegram:</b> ${esc(telegramUsername)}\n` +
      `📝 <b>Izoh:</b> ${esc(notes)}\n` +
      `💰 <b>To'lov turi:</b> ${esc(payLabel)}\n\n` +
      `📦 <b>Mahsulotlar ro'yxati:</b>\n${itemsText || "Savat bo'sh"}\n\n` +
      `💵 <b>Jami summa:</b> <b>${formattedTotal} so'm</b>\n` +
      `🕒 <b>Vaqti:</b> ${esc(dateStr)}`;

    if (!chatId) {
      console.warn("⚠️ [Telegram]: Chat ID topilmadi. Botga @xonbozorzakaz_bot Telegram orqali /start bosilmagan.");
      return NextResponse.json({
        success: false,
        warning: "Telegram botga /start bosilmagan yoki Chat ID sozlanmagan",
        botUsername: "xonbozorzakaz_bot",
      });
    }

    // Agar chek rasmi mavjud bo'lsa
    if (receiptFile && typeof receiptFile === "object" && receiptFile.size > 0) {
      const tgForm = new FormData();
      tgForm.append("chat_id", chatId);
      tgForm.append("photo", receiptFile);
      tgForm.append("caption", messageHtml.slice(0, 1024));
      tgForm.append("parse_mode", "HTML");

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: tgForm,
      });
      const data = await res.json();

      if (!data.ok) {
        // Agar rasm yuborishda xatolik bo'lsa, oddiy text qilib yuboramiz
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageHtml,
            parse_mode: "HTML",
          }),
        });
      }
    } else {
      // Chek yo'q bo'lsa: mahsulotlardan birining rasmi bormi?
      const firstImage = items.find((i) => i.image)?.image;
      if (firstImage && firstImage.startsWith("http")) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              photo: firstImage,
              caption: messageHtml.slice(0, 1024),
              parse_mode: "HTML",
            }),
          });
          const data = await res.json();
          if (!data.ok) throw new Error(data.description);
        } catch {
          // Fallback text
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: messageHtml,
              parse_mode: "HTML",
            }),
          });
        }
      } else {
        // Oddiy matn yuborish
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageHtml,
            parse_mode: "HTML",
          }),
        });
      }
    }

    return NextResponse.json({ success: true, message: "Telegramga yuborildi" });
  } catch (error) {
    console.error("Order Telegram API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

