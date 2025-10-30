import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SERVER_URL = process.env.SERVER_URL;

if (!TELEGRAM_BOT_TOKEN || !SERVER_URL) {
  console.error('TELEGRAM_BOT_TOKEN and SERVER_URL must be set in environment variables.');
  process.exit(1);
}

// Add a check for HTTPS requirement
if (SERVER_URL.startsWith('http://localhost') || SERVER_URL.startsWith('http://127.0.0.1')) {
  console.warn('WARNING: Telegram requires HTTPS for webhooks in production. For local development, you may need a tool like ngrok to tunnel to an HTTPS URL.');
  console.warn(`Attempting to set webhook to: ${SERVER_URL} but this will likely fail.`);
}

const WEBHOOK_URL = `${SERVER_URL}/telegram-webhook`;

async function setTelegramWebhook() {
  try {
    //curl - F "url=https://paper-dash-server.muna.workers.dev/telegram-webhook" https://api.telegram.org/bot7394927879:AAFeor_1Af4Ta07-slzFaNRjnYLfErApgl4/setWebhook
    console.log(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      { url: WEBHOOK_URL });
    
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      { url: WEBHOOK_URL }
    );
    console.log('Telegram Webhook Response:', response.data);
    if (response.data.ok) {
      console.log(`Webhook set successfully to: ${WEBHOOK_URL}`);
    } else {
      console.error('Failed to set webhook:', response.data.description);
    }
  } catch (error: any) {
    console.error('Error setting Telegram webhook:', error.message);
  }
}

setTelegramWebhook();
