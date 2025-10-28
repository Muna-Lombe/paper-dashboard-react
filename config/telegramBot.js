const { Telegraf, Markup, Format } = require('telegraf');
const axios = require('axios'); // Import axios
const TelegramRegistrationRequest = require('../models/TelegramRegistrationRequest'); // Import the model
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const userState = new Map(); // To store conversation state for each user
const editableMessagesState = new Map();

bot.start((ctx) => {
  ctx.reply('Welcome! Please choose an option:', Markup.inlineKeyboard([
      [Markup.button.callback('Access User Dashboard', 'dashboard')],
      [Markup.button.callback('Register for Access', 'register')],
    ])
  );
});

bot.command('help', (ctx) => {
  ctx.reply(
    'Here are the commands you can use:\n' +
    '/start - Start the bot and see the main menu\n' +
    '/help - Get help with using the bot\n' +
    '/register - Start the registration process to get service access\n' +
    '/dashboard - Access your personalized dashboard (requires registration)'
  );
});

bot.command('register', async (ctx) => {
  const chatId = ctx.chat.id;
  ctx.reply('Please share your email address to start the registration process.');
  userState.set(chatId, 'awaiting_email');
});

bot.command('dashboard', async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId } });

  if (registrationRequest && registrationRequest.status === 'approved' && registrationRequest.apiToken) {
    ctx.reply('Here is your dashboard menu:', Markup.inlineKeyboard([
      [Markup.button.callback('User Basic Info', 'dashboard_user_info')],
      [Markup.button.callback('Number of Classes', 'dashboard_num_classes')],
      [Markup.button.callback('Number of Students', 'dashboard_num_students')],
      

    ]));
  } else {
    ctx.reply('You need an access token access the dashboard. Please use the /get_token command to start the process.', Markup.inlineKeyboard([
      [Markup.button.callback('Get Access Token', 'get_token')],
    ]));
  }
});

bot.command('get_token', async (ctx) => {
  const chatId = ctx.chat.id;
  const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId } });
  
  if (registrationRequest && registrationRequest.status === 'approved' ) {
    if(registrationRequest.apiToken && registrationRequest.apiToken !=='null'){
      // Format.code
      const message = await ctx.reply(
       Format.fmt( 
        Format.bold(`Here is your access token:\n`),
        Format.spoiler(Format.code(registrationRequest.apiToken)),
        Format.quote(`\n*IMPORTANT*: Do **NOT** share this token with anyone else.`)
      ),
        Markup.inlineKeyboard([

          // [Markup.button.callback('Copy token', 'copy_to_clipboard')],
          [Markup.button.callback('Regenerate api token', 'regenerate_api_token')],
        ])

      );
      editableMessagesState.set(chatId, message.message_id)

    }else{
      
      userState.set(chatId, 'awaiting_progressme_password')
      ctx.reply(
        `You have not completed the progressme login step.\nPlease provide your progressme password to complete.`
      );
    }
    
  } else {
    ctx.reply('You need to be registered and approved to get an access token. Please use the /register command to start the process.');
  }
});

// bot.action('access_dashboard', async (ctx) => {
//   const chatId = ctx.chat.id.toString();
//   await ctx.answerCbQuery(); // Acknowledge the callback query

//   const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId } });

//   if (registrationRequest && registrationRequest.status === 'approved' && registrationRequest.apiToken) {
//     ctx.reply('Here is your dashboard menu:', Markup.inlineKeyboard([
//       [Markup.button.callback('User Basic Info', 'dashboard_user_info')],
//       [Markup.button.callback('Number of Classes', 'dashboard_num_classes')],
//       [Markup.button.callback('Number of Students', 'dashboard_num_students')],
//     ]));
//   } else {
//     ctx.reply('You need an access token access the dashboard. Please use the /get_token command to start the process.', Markup.inlineKeyboard([
//       [Markup.button.callback('Get Access Token', 'get_access_token')],
//     ]));
//   }
// });

// bot.action('register_access', async (ctx) => {
//   const chatId = ctx.chat.id;
//   await ctx.answerCbQuery(); // Acknowledge the callback query
//   ctx.reply('Please share your email address to start the registration process.');
//   userState.set(chatId, 'awaiting_email');
// });

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
    userState.set(chatId, "awaiting_progressme_password")

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

bot.use(async (ctx, next) => {
   
   // Correctly handle both messages and callback queries
   if (!ctx.message && !ctx.callbackQuery) return next();
  
   const chatId = ctx.chat.id;
   const state = userState.get(chatId);
   const text = ctx.message ? ctx.message.text?.trim() : null;
   const actionData = ctx.callbackQuery ? ctx.callbackQuery.data : null;
  
   // console.log(chatId, "->",userState);
   console.log(`state: ${state}`);
   // console.log(`text: ${text}`);
   // console.log(`actionData: ${actionData}`);
  
  if (state === 'awaiting_email') {
    // console.log(`Received text for email validation: "${text}" (length: ${text.length})`); 
    
    // Basic email validation (more robust validation should be on the backend)
    if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(text)) {
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
  } else if (state === 'awaiting_progressme_password'  ) {
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
            ctx.reply( Format.fmt( 
              Format.bold(`Here is your new access token:\n`),
              Format.spoiler(Format.code(response.data.encodedToken)),
              'Click the token to copy',
              Format.quote(`\nIMPORTANT: Do NOT share this token with anyone else.`)
            ),);
            userState.delete(chatId); // Clear state
        } else {
            ctx.reply('Failed to generate ProgressMe token. Please check your password and try again.');
        }
    } catch (error) {
        console.error('Error generating ProgressMe token:', error);
        ctx.reply('An error occurred while generating your ProgressMe token. Please try again later.');
    }

  } else if (state === 'awaiting_regenerate_confirmation') {
     if (actionData === "no_regenerate") {
       await ctx.answerCbQuery(); // Acknowledge the callback query
       ctx.editMessageText('Token regeneration cancelled.');
       userState.delete(chatId);
     } else if (actionData === "yes_regenerate") {
       await ctx.answerCbQuery(); // Acknowledge the callback query

       ctx.editMessageText('Please provide your ProgressMe password to regenerate your access token.');
       userState.set(chatId, 'awaiting_progressme_password');
     } else {
       await ctx.answerCbQuery('Invalid option.'); // Acknowledge invalid callback query
       ctx.reply('Invalid option. Please use the provided buttons.');
     }
    //  userState.set(chatId, "")
   }
  //  else {
  //   ctx.reply('Please use the menu options or follow the prompts.', Markup.inlineKeyboard([
  //       [Markup.button.callback('Access User Dashboard', 'dashboard')],
  //       [Markup.button.callback('Register for Access', 'register')],
  //     ])
  //   );
  // }
  
  // Always call next to allow other middleware/handlers to process the update
  return next();
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

bot.action('copy_to_clipboard', async (ctx) => {
  await ctx.answerCbQuery('Token copied to clipboard (manually select and copy from the message above).');
});

bot.action('regenerate_api_token', async (ctx) => {
  const chatId = ctx.chat.id;
  const message = ctx.message || ctx.msg;
  // console.log('msg->', message);
  
  await ctx.answerCbQuery('Initiating token regeneration...');

  try {

    ctx.editMessageText(
      'Please confirm you want to delete the old token and generate a new token.',
      Markup.inlineKeyboard([
        [Markup.button.callback('Yes', 'yes_regenerate')],
        [Markup.button.callback('No', 'no_regenerate')],
      ])
    )
    // Prompt for ProgressMe password again to regenerate token
    // ctx.reply('Please confirm you want to delete the old token and generate a new token.',
    //   Markup.inlineKeyboard([
    //     [Markup.button.callback('Yes', 'yes_regenerate')],
    //     [Markup.button.callback('No', 'no_regenerate')],
    //   ])
    // );
    userState.set(chatId, 'awaiting_regenerate_confirmation');
  } catch (error) {
    console.error('Error initiating token regeneration:', error);
    ctx.reply('An error occurred while trying to regenerate your token. Please try again later.');
  }
});

bot.action(/^approve_reg_(\d+)$/, async (ctx) => {
  const botMasterChatId = ctx.from.id.toString();
  if (botMasterChatId !== process.env.TELEGRAM_BOT_MASTER_CHAT_ID) {
    return ctx.answerCbQuery('You are not authorized to perform this action.');
  }
  
  await ctx.answerCbQuery('Approving request...');
  const registrationChatId = ctx.match[1];

  try {
    await axios.post(`${process.env.SERVER_URL}/api/telegram/approve-request`, { registrationChatId });
    await ctx.editMessageText(`Registration request for chat ID ${registrationChatId} has been **APPROVED**.`);
  } catch (error) {
    console.error('Error approving registration via inline button:', error);
    await ctx.editMessageText(`Failed to approve registration for chat ID ${registrationChatId}.`);
  }
});

bot.action(/^reject_reg_(\d+)$/, async (ctx) => {
  const botMasterChatId = ctx.from.id.toString();
  if (botMasterChatId !== process.env.TELEGRAM_BOT_MASTER_CHAT_ID) {
    return ctx.answerCbQuery('You are not authorized to perform this action.');
  }

  await ctx.answerCbQuery('Rejecting request...');
  const registrationChatId = ctx.match[1];

  try {
    await axios.post(`${process.env.SERVER_URL}/api/telegram/reject-request`, { registrationChatId });
    await ctx.editMessageText(`Registration request for chat ID ${registrationChatId} has been **REJECTED**.`);
  } catch (error) {
    console.error('Error rejecting registration via inline button:', error);
    await ctx.editMessageText(`Failed to reject registration for chat ID ${registrationChatId}.`);
  }
});

module.exports = bot;
