import { Context, Telegraf, Markup, Format } from "telegraf";
import { Env } from "..";
import axios from "axios";
import { telegramRegistrationRequests } from "../../drizzle/schema";
import { eq, and } from 'drizzle-orm';

const userState = new Map();
const editableMessagesState = new Map();

class TelegramBot {
  public bot: Telegraf;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    this.bot = bot;
  }
  initialiseBot() {
    // Start Command
    this.bot.start((ctx: Context) => {
      ctx.reply('Welcome! Please choose an option:', Markup.inlineKeyboard([
          [Markup.button.callback('Access User Dashboard', 'dashboard')],
          [Markup.button.callback('Register for Access', 'register')],
        ])
      );
    });

    // Help Command
    this.bot.command('help', (ctx: Context) => {
      ctx.reply(
        'Here are the commands you can use:\\n' +
        '/start - Start the bot and see the main menu\\n' +
        '/help - Get help with using the bot\\n' +
        '/register - Start the registration process to get service access\\n' +
        '/dashboard - Access your personalized dashboard (requires registration)'
      );
    });

    // Register Command
    this.bot.command('register', async (ctx: Context) => {
      const chatId = ctx.chat?.id?.toString();
      if (!chatId) { // Handle undefined chatId
        return ctx.reply('Could not determine your chat ID. Please try again.');
      }
      ctx.reply('Please share your email address to start the registration process.');
      userState.set(chatId, 'awaiting_email');
    });

    // Dashboard Command
    this.bot.command('dashboard', async (ctx: Context) => {
      const chatId = ctx.chat?.id?.toString();
      if (!chatId) { // Handle undefined chatId
        return ctx.reply('Could not determine your chat ID. Please try again.');
      }
      const db = this.env.drizzleDb as any;
      const registrationRequest = await db.select()
      .from(telegramRegistrationRequests)
      .where(eq(telegramRegistrationRequests.chatId as any, chatId))
      .limit(1);

      if (registrationRequest.length > 0 && registrationRequest[0].status === 'approved' && registrationRequest[0].apiToken) {
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

    // Get Token Command
    this.bot.command('get_token', async (ctx: Context) => {
      const chatId = ctx.chat?.id?.toString();
      if (!chatId) { // Handle undefined chatId
        return ctx.reply('Could not determine your chat ID. Please try again.');
      }
      const db = this.env.drizzleDb as any;
      const registrationRequest = await db.select()
      .from(telegramRegistrationRequests)
      .where(eq(telegramRegistrationRequests.chatId as any, chatId))
      .limit(1);
      
      if (registrationRequest.length > 0 && registrationRequest[0].status === 'approved') {
        if (registrationRequest[0].apiToken && registrationRequest[0].apiToken !== 'null') {
          const message = await ctx.reply(
          Format.fmt( 
              Format.bold(`Here is your access token:\\n`),
              Format.spoiler(Format.fmt(Format.code(registrationRequest[0].apiToken))),
              Format.quote(`\\n*IMPORTANT*: Do **NOT** share this token with anyone else.`)
          ),
            Markup.inlineKeyboard([
              [Markup.button.callback('Regenerate api token', 'regenerate_api_token')],
            ])

          );
          editableMessagesState.set(chatId, message.message_id)

        } else {
          userState.set(chatId, 'awaiting_progressme_password')
          ctx.reply(
            `You have not completed the progressme login step.\\nPlease provide your progressme password to complete.`
          );
        }
        
      } else {
        ctx.reply('You need to be registered and approved to get an access token. Please use the /register command to start the process.');
      }
    });

    // Approve Command (Bot Master Only)
    this.bot.command('approve', async (ctx: Context) => {
      const chatId = ctx.from?.id.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.reply('You are not authorized to use this command.');
      }

      const args = ctx.text?.split(' ') || [];
      if (args.length !== 2) {
        return ctx.reply('Usage: /approve <registration_chat_id>');
      }

      const registrationChatId = args[1];
      try {
        console.log(`Approving registration for chat ID: ${registrationChatId}`);
        await axios.post(`${this.env.SERVER_URL}/api/telegram/approve-request`, { registrationChatId });
        ctx.reply(`Registration for ${registrationChatId} has been approved. The user will be notified with their API token.`);
        userState.set(chatId, "awaiting_progressme_password")

      } catch (error: any) {
        console.error('Error approving registration:', error);
        ctx.reply('Failed to approve registration.');
      }
    });

    // Reject Command (Bot Master Only)
    this.bot.command('reject', async (ctx: Context) => {
      const chatId = ctx.from?.id.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.reply('You are not authorized to use this command.');
      }

      const args = ctx?.text?.split(' ') || [];
      if (args.length !== 2) {
        return ctx.reply('Usage: /reject <registration_chat_id>');
      }

      const registrationChatId = args[1];
      try {
        console.log(`Rejecting registration for chat ID: ${registrationChatId}`);
        await axios.post(`${this.env.SERVER_URL}/api/telegram/reject-request`, { registrationChatId });
        ctx.reply(`Registration for ${registrationChatId} has been rejected. The user will be notified.`);

      } catch (error: any) {
        console.error('Error rejecting registration:', error);
        ctx.reply('Failed to reject registration.');
      }
    });

    // Middleware for handling states (email, password, etc.)
    this.bot.use(async (ctx, next) => {
      
      if (!ctx.message && !ctx.callbackQuery) return next();
      
      const chatId = ctx.chat?.id?.toString();
      if (!chatId) { // Handle undefined chatId
        return next(); // Or ctx.reply('Could not determine your chat ID. Please try again.');
      }
      const state = userState.get(chatId);
      const text = ctx.message && ctx.text ? ctx.text?.trim() : "";
      const actionData = (ctx.callbackQuery ? "no_regenerate"  : "none");//ctx.callbackQuery ? ctx.callbackQuery.data : null;
      
      if (state === 'awaiting_email') {
        if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(text)) {
          const email = text;
          try {
            const response = await axios.post(`${this.env.SERVER_URL}/api/telegram/register-request`, {
              chatId: chatId?.toString(),
              email: email,
              reasons: 'Registered via Telegram bot',
              useCase: 'Scraper access',
            });
            if (response.status === 201) {
              ctx.reply('Your registration request has been submitted. The bot master will review it.');
              userState.delete(chatId);
            } else {
              ctx.reply('Failed to submit registration request. Please try again.');
            }
          } catch (error: any) {
            console.error('Error submitting registration request:', error);
            ctx.reply('An error occurred while processing your request. Please try again later.');
          }
        } else {
          ctx.reply('That doesn\\\'t look like a valid email. Please try again.');
        }
      } else if (state === 'awaiting_progressme_password') {
        const progressMePassword = text;
        
        try {
          const response = await axios.post(`${this.env.SERVER_URL}/api/telegram/generate-progressme-token`, {
            chatId: chatId?.toString(),
                progressMePassword: progressMePassword
            });

            if (response.status === 200 && response.data.encodedToken) {
            ctx.reply(Format.fmt(
                  Format.bold(`Here is your new access token:\n`),
              Format.spoiler(Format.fmt(Format.code(response.data.encodedToken))),
                  '\nClick the token to copy',
              Format.quote(`\n\nIMPORTANT: Do NOT share this token with anyone else.`)
                ),);
            userState.delete(chatId);
            } else {
                ctx.reply('Failed to generate ProgressMe token. Please check your password and try again.');
            }
        } catch (error: any) {
            console.error('Error generating ProgressMe token:', error);
            ctx.reply('An error occurred while generating your ProgressMe token. Please try again later.');
        }

      } else if (state === 'awaiting_regenerate_confirmation') {
        switch(actionData){
          case "no_regenerate":
            await ctx.answerCbQuery();
          ctx.editMessageText('Token regeneration cancelled.');
          userState.delete(chatId);
            break;
          // case "yes_regenerate":
          //   await ctx.answerCbQuery();

          //   ctx.editMessageText('Please provide your ProgressMe password to regenerate your access token.');
          //   userState.set(chatId, 'awaiting_progressme_password');
          //   break;
          default:
            console.log("no action")
            await ctx.answerCbQuery('Invalid option.');
            ctx.reply('Invalid option. Please use the provided buttons.');
            break;
        }
       
      }

      return next();
    });

    // Action handlers for dashboard menu (placeholders)
    this.bot.action('dashboard_user_info', async (ctx: Context) => {
      await ctx.answerCbQuery();
      ctx.reply('User Basic Info: (Placeholder for backend data)');
    });

    this.bot.action('dashboard_num_classes', async (ctx: Context) => {
      await ctx.answerCbQuery();
      ctx.reply('Number of Classes: (Placeholder for backend data)');
    });

    this.bot.action('dashboard_num_students', async (ctx: Context) => {
      await ctx.answerCbQuery();
      ctx.reply('Number of Students: (Placeholder for backend data)');
    });

    this.bot.action('copy_to_clipboard', async (ctx: Context) => {
      await ctx.answerCbQuery('Token copied to clipboard (manually select and copy from the message above).');
    });

    this.bot.action('regenerate_api_token', async (ctx: Context) => {
      const chatId = ctx.chat?.id;
      
      await ctx.answerCbQuery('Initiating token regeneration...');

      try {

        ctx.editMessageText(
          'Please confirm you want to delete the old token and generate a new token.',
          Markup.inlineKeyboard([
            [Markup.button.callback('Yes', 'yes_regenerate')],
            [Markup.button.callback('No', 'no_regenerate')],
          ])
        )
        userState.set(chatId, 'awaiting_regenerate_confirmation');
      } catch (error: any) {
        console.error('Error initiating token regeneration:', error);
        ctx.reply('An error occurred while trying to regenerate your token. Please try again later.');
      }
    });

    // this.bot.action(/^approve_reg_(\d+)$/, async (ctx: Context) => {
    //   // const botMasterChatId = ctx.from.id.toString();
    //   // if (botMasterChatId !== this.env.TELEGRAM_BOT_MASTER_CHAT_ID) {
    //   //   return ctx.answerCbQuery('You are not authorized to perform this action.');
    //   // }
      
    //   // await ctx.answerCbQuery('Approving request...');
    //   // const registrationChatId = ctx.match[1];

    //   // try {
    //   //   await axios.post(`${this.env.SERVER_URL}/api/telegram/approve-request`, { registrationChatId });
    //   //   await ctx.editMessageText(`Registration request for chat ID ${registrationChatId} has been **APPROVED**.`);
    //   // } catch (error: any) {
    //   //   console.error('Error approving registration via inline button:', error);
    //   //   await ctx.editMessageText(`Failed to approve registration for chat ID ${registrationChatId}.`);
    //   // }
    // });

    // this.bot.action(/^reject_reg_(\d+)$/, async (ctx: Context) => {
    //   // const botMasterChatId = ctx.from.id.toString();
    //   // if (botMasterChatId !== this.env.TELEGRAM_BOT_MASTER_CHAT_ID) {
    //   //   return ctx.answerCbQuery('You are not authorized to perform this action.');
    //   // }

    //   // await ctx.answerCbQuery('Rejecting request...');
    //   // const registrationChatId = ctx.match[1];

    //   // try {
    //   //   await axios.post(`${this.env.SERVER_URL}/api/telegram/reject-request`, { registrationChatId });
    //   //   await ctx.editMessageText(`Registration request for chat ID ${registrationChatId} has been **REJECTED**.`);
    //   // } catch (error: any) {
    //   //   console.error('Error rejecting registration via inline button:', error);
    //   //   await ctx.editMessageText(`Failed to reject registration for chat ID ${registrationChatId}.`);
    //   // }
    // });

    this.bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot and see the main menu' },
  { command: 'help', description: 'Get help with using the bot' },
  { command: 'register', description: 'Start the registration process to get service access' },
  { command: 'dashboard', description: 'Access your personalized dashboard' },
  { command: 'get_token', description: 'Get your access token if registered and approved' },
  ]);

    return this.bot;
  }

};

const telegramBotFactory = (env: Env) => {
  const telegramBotInstance = new TelegramBot(env);
  telegramBotInstance.initialiseBot();
  const bot = telegramBotInstance.bot
  

  // Start Telegram Bot
  console.log("starting bot...")
  // bot.launch(() => (console.info(`Bot:${bot.botInfo?.id} started!`)));

  // bot.telegram.setMyCommands([
  //   { command: 'start', description: 'Start the bot and see the main menu' },
  //   { command: 'help', description: 'Get help with using the bot' },
  //   { command: 'register', description: 'Start the registration process to get service access' },
  //   { command: 'dashboard', description: 'Access your personalized dashboard' },
  //   { command: 'get_token', description: 'Get your access token if registered and approved' },
  // ]);

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));


  return bot;
};

export default telegramBotFactory;