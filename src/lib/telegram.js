export async function sendTelegramNotification(telegramId, req, msgId) {
  if (!telegramId || !process.env.TELEGRAM_BOT_TOKEN) return;

  try {
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

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

    // Privacy-safe notification: no IP, no device, no location
    const text = `📨 <b>Message Read</b>\n\n<b>ID:</b> <code>${msgId}</code>\n<b>Time:</b> ${dateStr}`;

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
