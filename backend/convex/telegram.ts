import { action } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_BOT_TOKEN = "8215957478:AAH1lyyrQSAcFKVBWbXel7ep4k_WJqpd8Ds";

export const notifyNewOrder = action({
  args: {
    orderNumber: v.string(),
    customerName: v.string(),
    phone: v.string(),
    total: v.number(),
    itemsCount: v.number(),
    address: v.optional(v.string()),
    itemsSummary: v.string(),
    botToken: v.optional(v.string()),
    chatId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const token = args.botToken || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    let chatId = args.chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token) return { success: false, error: "Bot token yo'q" };

    // Agar chatId berilmagan bo'lsa, getUpdates dan aniqlaymiz
    if (!chatId) {
      try {
        const upRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
        const upJson = (await upRes.json()) as any;
        if (upJson.ok && Array.isArray(upJson.result) && upJson.result.length > 0) {
          for (let i = upJson.result.length - 1; i >= 0; i--) {
            const u = upJson.result[i];
            const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat;
            if (chat?.id) {
              chatId = String(chat.id);
              break;
            }
          }
        }
      } catch (e) {
        console.warn("Telegram chat detect error:", e);
      }
    }

    if (!chatId) {
      return { success: false, error: "Chat ID topilmadi. Botga /start yuboring." };
    }

    const text =
      `🛒 <b>Yangi buyurtma!</b>\n\n` +
      `🔢 <b>Raqam:</b> ${args.orderNumber}\n` +
      `👤 <b>Mijoz:</b> ${args.customerName}\n` +
      `📞 <b>Tel:</b> ${args.phone}\n` +
      `📍 <b>Manzil:</b> ${args.address || "Ko'rsatilmagan"}\n` +
      `📦 <b>Mahsulotlar:</b>\n${args.itemsSummary}\n` +
      `💰 <b>Jami:</b> $${args.total.toLocaleString()}`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      });
      const json = await res.json();
      return { success: true, result: json };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
});
