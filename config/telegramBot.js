const { Telegraf, Markup } = require('telegraf');
const axios = require('axios'); // Import axios
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const userState = new Map(); // To store conversation state for each user

bot.start((ctx) => {
  ctx.reply('Welcome! Please choose an option:', {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback('Access User Dashboard', 'access_dashboard')],
      [Markup.button.callback('Register for Access', 'register_access')],
    ]),
  });
});

bot.action('access_dashboard', async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery(); // Acknowledge the callback query
  // For now, send a placeholder dashboard menu
  ctx.reply('Here is your dashboard menu:', Markup.inlineKeyboard([
    [Markup.button.callback('User Basic Info', 'dashboard_user_info')],
    [Markup.button.callback('Number of Classes', 'dashboard_num_classes')],
    [Markup.button.callback('Number of Students', 'dashboard_num_students')],
  ]));
});

bot.action('register_access', async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery(); // Acknowledge the callback query
  ctx.reply('Please share your email address to start the registration process.');
  userState.set(chatId, 'awaiting_email');
});

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
    console.log(`Approving registration for chat ID: ${registrationChatId}`);
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
    await axios.post(`${process.env.SERVER_URL}/api/telegram/reject-request`, { registrationChatId });
    ctx.reply(`Registration for ${registrationChatId} has been rejected. The user will be notified.`);

  } catch (error) {
    console.error('Error rejecting registration:', error);
    ctx.reply('Failed to reject registration.');
  }
});

bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const state = userState.get(chatId);
  const text = ctx.message.text;

  if (state === 'awaiting_email') {
    // Basic email validation (more robust validation should be on the backend)
    if (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(text)) {
      const email = text;
      // Send email to backend for registration request
      try {
        const response = await axios.post(`${process.env.SERVER_URL}/api/telegram/register-request`, {
          chatId: chatId.toString(),
          email: email,
          // For now, reasons and useCase are not collected via bot
          reasons: 'Registered via Telegram bot',
          useCase: 'Scraper access',
        });
        if (response.status === 201) {
          ctx.reply('Your registration request has been submitted. The bot master will review it.');
          userState.delete(chatId); // Clear state after submission
        } else {
          ctx.reply('Failed to submit registration request. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting registration request:', error);
        ctx.reply('An error occurred while processing your request. Please try again later.');
      }
    } else {
      ctx.reply('That doesn\'t look like a valid email. Please try again.');
    }
  } else if (state === 'awaiting_progressme_password') {
    // This state will be set by the backend after approval.
    // Once the bot master approves, the backend will send a message to the user asking for ProgressMe password.
    const progressMePassword = text;
    try {
        // Call backend to generate encoded token using email (from TelegramRegistrationRequest) and ProgressMe password
        // The backend should retrieve the user's email based on chatId
        const response = await axios.post(`${process.env.SERVER_URL}/api/telegram/generate-progressme-token`, {
            chatId: chatId.toString(),
            progressMePassword: progressMePassword
        });

        if (response.status === 200 && response.data.encodedToken) {
            ctx.reply(`Here is your encoded ProgressMe token: ${response.data.encodedToken}\n\nClick to copy: \`${response.data.encodedToken}\``);
            userState.delete(chatId); // Clear state
        } else {
            ctx.reply('Failed to generate ProgressMe token. Please check your password and try again.');
        }
    } catch (error) {
        console.error('Error generating ProgressMe token:', error);
        ctx.reply('An error occurred while generating your ProgressMe token. Please try again later.');
    }

  } else {
    ctx.reply('Please use the menu options or follow the prompts.', {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('Access User Dashboard', 'access_dashboard')],
        [Markup.button.callback('Register for Access', 'register_access')],
      ]),
    });
  }
});

// Action handlers for dashboard menu (placeholders)
bot.action('dashboard_user_info', async (ctx) => {
  await ctx.answerCbQuery();
  // Fetch user basic info from backend
  ctx.reply('User Basic Info: (Placeholder for backend data)');
});

bot.action('dashboard_num_classes', async (ctx) => {
  await ctx.answerCbQuery();
  // Fetch number of classes from backend
  ctx.reply('Number of Classes: (Placeholder for backend data)');
});

bot.action('dashboard_num_students', async (ctx) => {
  await ctx.answerCbQuery();
  // Fetch number of students from backend
  ctx.reply('Number of Students: (Placeholder for backend data)');
});

module.exports = bot;
