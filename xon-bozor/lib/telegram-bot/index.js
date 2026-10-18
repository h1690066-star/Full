
export const TELEGRAM_BOT_USERNAME = "xonbozorbuyurtma_bot";
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";


const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export async function getTargetChatId() {
  return process.env.TELEGRAM_CHAT_ID || null;
}

export function formatOrderMessage({ orderNumber = "", items = [], customerInfo = {}, paymentMethod = "cash", total = 0 }) {
  const name = customerInfo.name || "Noma'lum mijoz";
  const phone = customerInfo.phone || "Kiritilmagan";
  const region = customerInfo.region || "Toshkent shahri";
  const district = customerInfo.district || "";
  const street = customerInfo.street || "";
  const addressFull = [region, district, street].filter(Boolean).join(", ");
  const tgUser = customerInfo.telegram ? `@${customerInfo.telegram.replace("@", "")}` : "Mavjud emas";
  const notes = customerInfo.notes || "Yo'q";

  const itemsList = items
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

  return (
    `🛒 <b>YANGI BUYURTMA! ${orderNumber ? `#${esc(orderNumber)} ` : ""}(Xon Bozor)</b>\n\n` +
    `👤 <b>Mijoz:</b> ${esc(name)}\n` +
    `📞 <b>Telefon:</b> <code>${esc(phone)}</code>\n` +
    `📍 <b>Manzil:</b> ${esc(addressFull)}\n` +
    `💬 <b>Telegram:</b> ${esc(tgUser)}\n` +
    `📝 <b>Izoh:</b> ${esc(notes)}\n` +
    `💰 <b>To'lov:</b> ${esc(payLabel)}\n\n` +
    `📦 <b>Mahsulotlar:</b>\n${itemsList || "Savat bo'sh"}\n\n` +
    `💵 <b>Jami summa:</b> <b>${formattedTotal} so'm</b>\n` +
    `🕒 <b>Vaqti:</b> ${esc(dateStr)}`
  );
}

// ===== SERVER TOMONI (app/api/telegram-order/route.js ichida ishlating) =====
export async function sendTelegramServer({ items, customerInfo, paymentMethod, total, receiptFile }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Telegram]: .env.local da TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID yo'q.");
    return { success: false, reason: "missing_env" };
  }

  const messageHtml = formatOrderMessage({ items, customerInfo, paymentMethod, total });

  try {
    // 1. Chek rasmi bo'lsa sendPhoto
    if (receiptFile && typeof receiptFile === "object" && receiptFile.size > 0) {
      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("photo", receiptFile);
      form.append("caption", messageHtml.slice(0, 1024));
      form.append("parse_mode", "HTML");

      const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.ok) return { success: true };
      console.warn("[Telegram] sendPhoto xatosi:", data.description);
    }

    // 2. Oddiy xabar
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: messageHtml, parse_mode: "HTML" }),
    });
    const data = await res.json();
    if (!data.ok) console.warn("[Telegram] sendMessage xatosi:", data.description);
    return { success: Boolean(data.ok), error: data.description };
  } catch (err) {
    console.error("[Telegram Send Error]:", err);
    return { success: false, error: err.message };
  }
}

// ===== BRAUZER TOMONI: faqat server route'ga yuboradi, token ishlatilmaydi =====
export async function sendOrderToTelegram({ orderNumber, items, customerInfo, paymentMethod, total, receiptFile }) {
  try {
    const form = new FormData();
    if (orderNumber) form.append("orderNumber", orderNumber);
    form.append("items", JSON.stringify(items));
    form.append("customerInfo", JSON.stringify(customerInfo));
    form.append("paymentMethod", paymentMethod);
    form.append("total", String(total));
    if (receiptFile) form.append("receipt", receiptFile);

    const res = await fetch("/api/telegram-order", { method: "POST", body: form });
    return { success: res.ok };
  } catch (err) {
    console.error("[Telegram Order Error]:", err);
    return { success: false, error: err.message };
  }
}