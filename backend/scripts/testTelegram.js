require('dotenv').config();
const tg = require('../services/telegram');
const fetch = globalThis.fetch;

async function check() {
  console.log('🤖 Bot Token:', process.env.TELEGRAM_BOT_TOKEN);
  console.log('💬 Chat ID:', process.env.TELEGRAM_CHAT_ID);

  try {
    const me = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`).then(r => r.json());
    console.log('✅ Bot ma-lumotlari:', me);

    console.log('\n📥 Oxirgi xabarlar (getUpdates):');
    const updates = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`).then(r => r.json());
    console.log(JSON.stringify(updates, null, 2));

    if (updates.result && updates.result.length > 0) {
      const lastMsg = updates.result[updates.result.length - 1];
      const chat = lastMsg.message?.chat || lastMsg.channel_post?.chat;
      if (chat) {
        console.log(`\n💡 Sizning Telegram Chat ID: ${chat.id} (${chat.title || chat.username || chat.first_name})`);
      }
    } else {
      console.log('\n⚠️ Hozircha telegram botga hech kim xabar yubormagan.');
      console.log('👉 Botga (@' + me.result.username + ') Telegram-dan /start bosing yoki guruhga qo\'shing!');
    }

    if (process.env.TELEGRAM_CHAT_ID) {
      console.log('\n🚀 Chat ID ga sinov xabari yuborilmoqda...');
      const text =
        `🧪 <b>Sinov xabari</b>\n\n` +
        `👤 <b>Ism:</b> Sinovchi\n` +
        `📧 <b>Email:</b> test@example.com\n` +
        `📞 <b>Nomer:</b> +998901234567\n` +
        `🖼 <b>Rasm:</b> Biriktirilgan`;
      await tg.sendMessage(text);
      console.log('✅ Sinov xabari muvaffaqiyatli yuborildi!');
    }
  } catch (err) {
    console.error('❌ Xatolik:', err.message);
  }
}

check();

