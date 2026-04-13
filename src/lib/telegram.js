import { userAgent } from 'next/server';

export async function sendTelegramNotification(telegramId, req, msgId) {
  if (!telegramId || !process.env.TELEGRAM_BOT_TOKEN) return;

  try {
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const ip = req.headers.get('x-forwarded-for') || 'Unknown IP';
    
    const { device, browser, os } = userAgent(req);
    let deviceName = 'Unknown';
    if (device.model) {
      deviceName = `${device.vendor || ''} ${device.model} (${os.name})`.trim();
    } else if (os.name) {
      deviceName = `${os.name} (${browser.name})`;
    } else {
      deviceName = req.headers.get('user-agent') || 'Unknown Device';
    }
    
    // Formatting date neatly
    const dateStr = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

    const text = `<b>Message Burned</b>\n\n<b>ID:</b> <code>${msgId}</code>\n<b>Time:</b> ${dateStr}\n<b>IP:</b> <code>${ip}</code>\n<b>Device:</b> <code>${deviceName}</code>`;

    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text,
        parse_mode: 'HTML'
      })
    }).catch(e => console.error("Telegram fetch error:", e));
  } catch (error) {
    console.error("Failed to trigger telegram notif:", error);
  }
}
