const { Telegraf } = require('telegraf');
const axios = require('axios'); // Import axios
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome! I am a bot that can help you register for the service. Please send your email to start the registration process.'));

// Handle /approve command from bot master
bot.command('approve', async (ctx) => {
  const chatId = ctx.from.id.toString();
  const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID;

  if (chatId !== botMasterChatId) {
    return ctx.reply('You are not authorized to use this command.');
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    return ctx.reply('Usage: /approve <registration_chat_id>');
  }

  const registrationChatId = args[1];
  try {
    // Send request to your server to approve the registration
    // This will be an API call to your backend, e.g., using axios
    // For now, let's mock the response
    // You'll replace this with an actual API call later
    console.log(`Approving registration for chat ID: ${registrationChatId}`);
    // ctx.reply(`Registration for ${registrationChatId} has been approved.`);
    await axios.post(`${process.env.SERVER_URL}/api/telegram/approve-request`, { registrationChatId });
    ctx.reply(`Registration for ${registrationChatId} has been approved. The user will be notified with their API token.`);

  } catch (error) {
    console.error('Error approving registration:', error);
    ctx.reply('Failed to approve registration.');
  }
});

// Handle /reject command from bot master
bot.command('reject', async (ctx) => {
  const chatId = ctx.from.id.toString();
  const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID;

  if (chatId !== botMasterChatId) {
    return ctx.reply('You are not authorized to use this command.');
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    return ctx.reply('Usage: /reject <registration_chat_id>');
  }

  const registrationChatId = args[1];
  try {
    // Send request to your server to reject the registration
    console.log(`Rejecting registration for chat ID: ${registrationChatId}`);
    // ctx.reply(`Registration for ${registrationChatId} has been rejected.`);
    await axios.post(`${process.env.SERVER_URL}/api/telegram/reject-request`, { registrationChatId });
    ctx.reply(`Registration for ${registrationChatId} has been rejected. The user will be notified.`);

  } catch (error) {
    console.error('Error rejecting registration:', error);
    ctx.reply('Failed to reject registration.');
  }
});

// You can add more bot handlers here

module.exports = bot;
