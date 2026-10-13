const fs = require('fs');
const path = require('path');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
exports.esc = esc;

const configured = () => Boolean(process.env.TELEGRAM_BOT_TOKEN);

async function getChatId() {
  if (process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID !== '8215957478') {
    return process.env.TELEGRAM_CHAT_ID;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`);
    const json = await res.json().catch(() => ({}));
    if (json.ok && Array.isArray(json.result) && json.result.length > 0) {
      for (let i = json.result.length - 1; i >= 0; i--) {
        const u = json.result[i];
        const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat;
        if (chat?.id) {
          process.env.TELEGRAM_CHAT_ID = String(chat.id);
          return process.env.TELEGRAM_CHAT_ID;
        }
      }
    }
  } catch (e) {
    console.warn('[Telegram auto chat detect error]:', e.message);
  }
  return null;
}

async function call(method, body, isJson = true) {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: isJson ? { 'Content-Type': 'application/json' } : undefined,
    body: isJson ? JSON.stringify(body) : body,
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`Telegram: ${json.description || res.status}`);
  return json.result;
}

exports.sendMessage = async (html) => {
  if (!configured()) throw new Error('TELEGRAM_BOT_TOKEN .env da yoq');
  const chatId = await getChatId();
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID topilmadi. Botga Telegram orqali /start bosing!');
  try {
    const result = await call('sendMessage', {
      chat_id: chatId,
      text: html.slice(0, 4000),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
    console.log('✅ Telegram xabar yuborildi:', result.message_id);
    return result;
  } catch (err) {
    console.error('❌ Telegram xatosi:', err.message);
    throw err;
  }
};

exports.sendPhoto = async (filePath, caption = '', replyTo) => {
  if (!configured()) throw new Error('TELEGRAM_BOT_TOKEN .env da yoq');
  const chatId = await getChatId();
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID topilmadi. Botga Telegram orqali /start bosing!');
  try {
    const form = new FormData();
    form.append('chat_id', chatId);
    if (caption) { form.append('caption', caption.slice(0, 1000)); form.append('parse_mode', 'HTML'); }
    if (replyTo) form.append('reply_to_message_id', String(replyTo));
    const buf = await fs.promises.readFile(filePath);
    form.append('photo', new Blob([buf]), path.basename(filePath));
    const result = await call('sendPhoto', form, false);
    console.log('✅ Telegram rasm yuborildi:', result.message_id);
    return result;
  } catch (err) {
    console.error('❌ Telegram rasm xatosi:', err.message);
    throw err;
  }
};
