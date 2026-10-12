const fs = require('fs');
const path = require('path');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
exports.esc = esc;

const configured = () => process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID;

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
  if (!configured()) throw new Error('TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID .env da yoq');
  try {
    const result = await call('sendMessage', {
      chat_id: process.env.TELEGRAM_CHAT_ID,
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
  if (!configured()) throw new Error('TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID .env da yoq');
  try {
    const form = new FormData();
    form.append('chat_id', process.env.TELEGRAM_CHAT_ID);
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
