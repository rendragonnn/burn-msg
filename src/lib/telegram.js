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
    
    // Formatting date neatly to WIB (Asia/Jakarta)
    const dateStr = new Date().toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    // Detect location using Vercel IP headers (Available in Vercel Deployments)
    const city = req.headers.get('x-vercel-ip-city');
    const country = req.headers.get('x-vercel-ip-country');
    const location = city && country ? `${city}, ${country}` : '';

    let text = `<b>Message Burned</b>\n\n<b>ID:</b> <code>${msgId}</code>\n<b>Time:</b> ${dateStr}\n<b>IP:</b> <code>${ip}</code>`;
    if (location) {
      text += `\n<b>Location:</b> <code>${location}</code>`;
    }
    text += `\n<b>Device:</b> <code>${deviceName}</code>`;

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
