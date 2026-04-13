export async function sendTelegramNotification(telegramId, req, msgId) {
  if (!telegramId || !process.env.TELEGRAM_BOT_TOKEN) return;

  try {
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const ip = req.headers.get('x-forwarded-for') || 'Unknown IP';
    const userAgent = req.headers.get('user-agent') || 'Unknown Device';
    
    // Formatting date neatly
    const dateStr = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

    const text = `🚨 <b>[GHOST PROTOCOL] PAYLOAD DESTROYED</b> 🚨\n\nPesan rahasia Anda baru saja dibaca dan telah dihancurkan total dari server.\n\n📇 <b>ID Pesan</b> ㅤ : <code>${msgId}</code>\n🔴 <b>Status</b> ㅤ ㅤ : <i>Permanently Burned</i>\n🕒 <b>Waktu</b> ㅤ ㅤ: <code>${dateStr}</code>\n🎯 <b>Target IP</b> ㅤ : <code>${ip}</code>\n📱 <b>Perangkat</b> ㅤ: <code>${userAgent}</code>\n\n<i>No further traces exist. This channel is now closed.</i>`;

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
