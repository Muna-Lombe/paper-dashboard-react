import { Context, Telegraf, Markup, Format } from "telegraf";
import { Env } from "..";
import axios from "axios";
import { telegramRegistrationRequests } from "../../drizzle/schema";
import { eq, and } from 'drizzle-orm';
import { getDrizzleDb } from "../database/drizzle/db"; // Import getDrizzleDb
import { DrizzleD1Database } from 'drizzle-orm/d1'; // Import DrizzleD1Database type
import { DurableObject, DurableObjectState } from '@cloudflare/workers-types/experimental'; // Keep DurableObject, DurableObjectState
import { Update } from 'telegraf/types'; // Import Telegram Update type


type UserState = Map<string, string>; // Define type for userState
type EditableMessagesState = Map<string, number>; // Define type for editableMessagesState

export class TelegramBotDO implements DurableObject {
  state: DurableObjectState;
  env: Env; // We'll pass the environment to the DO
  bot: Telegraf; // Telegraf instance will live here
  userState: UserState;
  editableMessagesState: EditableMessagesState;
  drizzleDb: DrizzleD1Database; // Drizzle DB instance for this DO

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.userState = new Map();
    this.editableMessagesState = new Map();
    this.drizzleDb = getDrizzleDb(this.env.paper_dash_db) as any; // Initialize Drizzle DB, casting to any to bypass type conflict

    this.bot = new Telegraf(this.env.TELEGRAM_BOT_TOKEN);
    this.initialiseBot(); // Initialize bot handlers

    // Restore any persisted state for the bot here if needed
    this.state.blockConcurrencyWhile(async () => {
      const storedUserState = await this.state.storage.get<Map<string, string>>("userState");
      if (storedUserState) {
        this.userState = new Map(storedUserState);
        console.log("Restored user state:", this.userState);
      }
      const storedEditableMessagesState = await this.state.storage.get<Map<string, number>>("editableMessagesState");
      if (storedEditableMessagesState) {
        this.editableMessagesState = new Map(storedEditableMessagesState);
        console.log("Restored editable messages state:", this.editableMessagesState);
      }
    });
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
      this.userState.set(chatId, 'awaiting_email');
    });

    // Dashboard Command
    this.bot.command('dashboard', async (ctx: Context) => {
      const chatId = ctx.chat?.id?.toString();
      if (!chatId) { // Handle undefined chatId
        return ctx.reply('Could not determine your chat ID. Please try again.');
      }
      const db = this.drizzleDb as any; // Use the DO's drizzleDb instance
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
      const db = this.drizzleDb as any; // Use the DO's drizzleDb instance
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
          this.editableMessagesState.set(chatId, message.message_id)

        } else {
          this.userState.set(chatId, 'awaiting_progressme_password')
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
        const response = await axios.post(`${this.env.SERVER_URL}/api/telegram/approve-request`, { registrationChatId });
        if (response.status === 200) {
          ctx.reply(`Registration for ${response.data.email}(Chat ID: ${registrationChatId}) has been approved. The user will be notified with their API token.`);
          await ctx.telegram.sendMessage(
            registrationChatId,
            `Your registration request has been approved! Proceed to get your access token.\n\n*IMPORTANT*:\n1. We **DO NOT** store your ProgressMe email and password, and we do not have access to your ProgressMe account.\n2. Do **NOT** share your access token with anyone else.`,
            Markup.inlineKeyboard([
              [Markup.button.callback('Proceed', 'get_token')],
            ])
          );

          
          this.userState.set(chatId, "awaiting_progressme_password")


        }

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
        const response = await axios.post(`${this.env.SERVER_URL}/api/telegram/reject-request`, { registrationChatId });
        if (response.status === 200) {
          ctx.reply(`Registration for ${response.data.email}(Chat ID: ${registrationChatId}) has been rejected. The user will be notified.`);
          await ctx.telegram.sendMessage(
            registrationChatId,
            `Your registration request has been rejected. Please contact support if you have any questions.`
          );
        }

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
      const state = this.userState.get(chatId);
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
              // Notify bot master with inline buttons
              const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID; // Access env from c.env
              if (botMasterChatId) {
                // The bot.telegram.sendMessage uses the Telegraf instance.
                // In a Worker, you'd likely use the Telegram Bot API directly or ensure `bot` is properly initialized with fetch capabilities.
                // For now, assume `bot` can send messages via its webhook handler.
                const message = await ctx.telegram.sendMessage(
                  botMasterChatId,
                  `New registration request from ${email} (Chat ID: ${chatId}).\nReasons: ${response.data.reasons}. Use Case: ${response.data.useCase}.`,
                  Markup.inlineKeyboard([
                    [Markup.button.callback('Approve', `approve_reg_${chatId}`)],
                    [Markup.button.callback('Reject', `reject_reg_${chatId}`)],
                  ])
                );
                // requestMessages.set(`${botMasterChatId}-${chatId}`, message.message_id);
              }
              this.userState.delete(chatId);
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
            this.userState.delete(chatId);
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
          this.userState.delete(chatId);
            break;
          // case "yes_regenerate":
          //   await ctx.answerCbQuery();

          //   ctx.editMessageText('Please provide your ProgressMe password to regenerate your access token.');
          //   this.userState.set(chatId, 'awaiting_progressme_password');
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
        this.userState.set(chatId?.toString() || '', 'awaiting_regenerate_confirmation');
      } catch (error: any) {
        console.error('Error initiating token regeneration:', error);
        ctx.reply('An error occurred while trying to regenerate your token. Please try again later.');
      }
    });

    this.bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot and see the main menu' },
  { command: 'help', description: 'Get help with using the bot' },
  { command: 'register', description: 'Start the registration process to get service access' },
  { command: 'dashboard', description: 'Access your personalized dashboard' },
  { command: 'get_token', description: 'Get your access token if registered and approved' },
  ]);
  }

  // @ts-ignore - Type conflict between global Request and Cloudflare's CfRequest, but runtime behavior is correct
  fetch = async (request: Request): Promise<Response> => {
    // This is where incoming requests for this DO instance will be handled.
    // For Telegram webhooks, we'll forward the update to our Telegraf bot.
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === "/telegram-webhook") {
        const update = await request.json() as Update; // Cast to Update type

        const honoRes = { headers: new Headers(), body: null, status: 200 };
        let writableEnded = false;
        const telegrafRes = Object.assign(honoRes, {
          headersSent: false,
          setHeader: (name: string, value: string) => honoRes.headers.set(name, value),
          end: (data: any) => {
            if (writableEnded) return;
            honoRes.body = data;
            writableEnded = true;
          },
        });
        Object.defineProperty(telegrafRes, 'writableEnded', {
          get: () => writableEnded,
        });

        await this.bot.handleUpdate(update, telegrafRes as any);

        // Persist any relevant state after handling the update
        // For example, if your bot tracks conversation steps or user preferences
        await this.state.storage.put("userState", Array.from(this.userState.entries()));
        await this.state.storage.put("editableMessagesState", Array.from(this.editableMessagesState.entries()));

        const responseHeaders = new Headers();
        honoRes.headers.forEach((value, key) => {
          responseHeaders.set(key, value);
        });
        return new Response(honoRes.body, { status: honoRes.status, headers: responseHeaders as any }); // Use global Response and cast headers to any

      } else if (path === "/signal-registration-request") {
        const { chatId, email, reasons, useCase } = await request.json();
        await this.bot.telegram.sendMessage(
          this.env.TELEGRAM_BOT_MASTER_CHAT_ID,
          `New registration request from ${email} (Chat ID: ${chatId}).\nReasons: ${reasons}. Use Case: ${useCase}.`,
          Markup.inlineKeyboard([
            [Markup.button.callback('Approve', `approve_reg_${chatId}`)],
            [Markup.button.callback('Reject', `reject_reg_${chatId}`)],
          ])
        );
        return new Response("OK", { status: 200 }); // Use global Response

      } else if (path === "/signal-approval") {
        const { chatId, email } = await request.json();
        await this.bot.telegram.sendMessage(
          chatId,
          `Your registration request has been approved! Proceed to get your access token.\n\n*IMPORTANT*:\n1. We **DO NOT** store your ProgressMe email and password, and we do not have access to your ProgressMe account.\n2. Do **NOT** share your access token with anyone else.`,
          Markup.inlineKeyboard([
            [Markup.button.callback('Proceed', 'get_token')],
          ])
        );
        return new Response("OK", { status: 200 }); // Use global Response

      } else if (path === "/signal-rejection") {
        const { chatId, email } = await request.json();
        await this.bot.telegram.sendMessage(
          chatId,
          'Your registration request has been rejected. Please contact support if you have any questions.'
        );
        return new Response("OK", { status: 200 }); // Use global Response

      } else if (path === "/signal-botmaster-notification") {
        const { type, email, chatId } = await request.json();
        if (type === 'approval') {
          await this.bot.telegram.sendMessage(
            this.env.TELEGRAM_BOT_MASTER_CHAT_ID,
            `Registration request from ${email} (Chat ID: ${chatId}) approved!`,
          );
        } else if (type === 'rejection') {
          await this.bot.telegram.sendMessage(
            this.env.TELEGRAM_BOT_MASTER_CHAT_ID,
            `Registration request from ${email} (Chat ID: ${chatId}) rejected!`,
          );
        }
        return new Response("OK", { status: 200 }); // Use global Response

      } else {
        return new Response("Not found", { status: 404 }); // Use global Response
      }
    } catch (error: any) {
      console.error("Durable Object fetch error:", error.message);
      return new Response("Internal Server Error", { status: 500 }); // Use global Response
    }
  }
}
