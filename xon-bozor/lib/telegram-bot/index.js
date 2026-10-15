// Telegram Bot orqali buyurtmalarni Frontenddan to'g'ridan-to'g'ri yuborish
export const TELEGRAM_BOT_TOKEN = "8832265019:AAGdOMzPWlcVOPZ-_5Upa7zELuKm0aNkDU8";
export const TELEGRAM_BOT_USERNAME = "xonbozorbuyurtma_bot";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Botga yozgan admin/guruh chat_id sini avtomatik topish
export async function getTargetChatId() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tg_admin_chat_id");
    if (saved) return saved;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      for (let i = data.result.length - 1; i >= 0; i--) {
        const u = data.result[i];
        const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat;
        if (chat?.id) {
          const chatIdStr = String(chat.id);
          if (typeof window !== "undefined") {
            localStorage.setItem("tg_admin_chat_id", chatIdStr);
          }
          return chatIdStr;
        }
      }
    }
  } catch (err) {
    console.warn("[Telegram Bot] getUpdates xatosi:", err);
  }

  return null;
}

export function formatOrderMessage({ items = [], customerInfo = {}, paymentMethod = "cash", total = 0 }) {
  const name = customerInfo.name || "Noma'lum mijoz";
  const phone = customerInfo.phone || "Kiritilmagan";
  const region = customerInfo.region || "Toshkent shahri";
  const district = customerInfo.district || "";
  const street = customerInfo.street || "";
  const addressFull = [region, district, street].filter(Boolean).join(", ");
  const tgUser = customerInfo.telegram ? `@${customerInfo.telegram.replace("@", "")}` : "Mavjud emas";
  const notes = customerInfo.notes || "Yo'q";

  const itemsList = items.map((it, idx) => {
    const pName = it.name || "Mahsulot";
    const pQty = it.qty || it.quantity || 1;
    const pPrice = Number(it.price || 0).toLocaleString("ru-RU");
    return `${idx + 1}. <b>${esc(pName)}</b> — ${pQty} dona × ${pPrice} so'm`;
  }).join("\n");

  const formattedTotal = Number(total).toLocaleString("ru-RU");
  const payLabel = paymentMethod === "card" ? "💳 Karta orqali to'lov" : "💵 Naqd to'lov (Yetkazilganda)";
  const dateStr = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

  return (
    `🛒 <b>YANGI BUYURTMA! (Xon Bozor)</b>\n\n` +
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

// Frontenddan to'g'ridan-to'g'ri Telegram bot API ga yuborish
export async function sendOrderToTelegram({ items, customerInfo, paymentMethod, total, receiptFile }) {
  const messageHtml = formatOrderMessage({ items, customerInfo, paymentMethod, total });
  const chatId = await getTargetChatId();

  if (!chatId) {
    console.warn(`[Telegram Bot] Chat ID topilmadi. Iltimos, Telegram orqali @${TELEGRAM_BOT_USERNAME} botiga /start bosing.`);
    // Shunda ham server route orqali sinab ko'ramiz
    const tgForm = new FormData();
    tgForm.append("items", JSON.stringify(items));
    tgForm.append("customerInfo", JSON.stringify(customerInfo));
    tgForm.append("paymentMethod", paymentMethod);
    tgForm.append("total", String(total));
    if (receiptFile) tgForm.append("receipt", receiptFile);
    await fetch("/api/telegram-order", { method: "POST", body: tgForm }).catch(() => {});
    return { success: false, reason: "no_chat_id" };
  }

  try {
    // 1. Agar to'lov cheki bo'lsa, rasmni sendPhoto orqali yuboramiz
    if (receiptFile && typeof receiptFile === "object" && receiptFile.size > 0) {
      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("photo", receiptFile);
      form.append("caption", messageHtml.slice(0, 1024));
      form.append("parse_mode", "HTML");

      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.ok) return { success: true };
    }

    // 2. Aks holda oddiy xabar sifatida sendMessage yuboramiz
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageHtml,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    return { success: Boolean(data.ok) };
  } catch (err) {
    console.error("[Telegram Direct Send Error]:", err);
    // Server fallback
    try {
      const tgForm = new FormData();
      tgForm.append("items", JSON.stringify(items));
      tgForm.append("customerInfo", JSON.stringify(customerInfo));
      tgForm.append("paymentMethod", paymentMethod);
      tgForm.append("total", String(total));
      if (receiptFile) tgForm.append("receipt", receiptFile);
      await fetch("/api/telegram-order", { method: "POST", body: tgForm });
    } catch {}
    return { success: false, error: err.message };
  }
}

