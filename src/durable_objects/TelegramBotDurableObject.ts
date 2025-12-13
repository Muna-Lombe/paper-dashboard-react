import { Context, Telegraf, Markup, Format } from "telegraf";
import { Env } from "..";
import axios from "axios";
import { telegramRegistrationRequests, users, courses } from "../../drizzle/schema";
import { eq, and, sql } from 'drizzle-orm';
import { getDrizzleDb } from "../database/drizzle/db"; // Import getDrizzleDb
import { DrizzleD1Database } from 'drizzle-orm/d1'; // Import DrizzleD1Database type
import { DurableObject, DurableObjectState } from '@cloudflare/workers-types/experimental'; // Keep DurableObject, DurableObjectState
import { Update } from 'telegraf/types'; // Import Telegram Update type
import LogHogClient from "../services/loggerService";


type UserState = Map<string, string>; // Define type for userState
type EditableMessagesState = Map<string, number>; // Define type for editableMessagesState

export class TelegramBotDurableObject implements DurableObject {
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
      console.log("get token requested:", chatId)
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

    // Action handler for "Get Access Token" / "Proceed" button
    this.bot.action('get_token', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      console.log("get_token button clicked:", chatId);
      
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      // Answer callback query first to remove loading state
      await ctx.answerCbQuery();

      const db = this.drizzleDb as any;
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
          this.editableMessagesState.set(chatId, message.message_id);
        } else {
          this.userState.set(chatId, 'awaiting_progressme_password');
          ctx.reply(
            `You have not completed the progressme login step.\\nPlease provide your progressme password to complete.`
          );
        }
      } else {
        ctx.reply('You need to be registered and approved to get an access token. Please use the /register command to start the process.');
      }
    });

    // Approve Command (Bot Master Only)
    // this.bot.command('approve', async (ctx: Context) => {
    //   const chatId = ctx.from?.id.toString();
    //   const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

    //   if (chatId !== botMasterChatId) {
    //     return ctx.reply('You are not authorized to use this command.');
    //   }

    //   const args = ctx.text?.split(' ') || [];
    //   if (args.length !== 2) {
    //     return ctx.reply('Usage: /approve <registration_chat_id>');
    //   }

    //   const registrationChatId = args[1];
    //   try {
    //     console.log(`Approving registration for chat ID: ${registrationChatId}`);
    //     const response = await axios.post(`${this.env.SERVER_URL}/api/telegram/approve-request`, { registrationChatId });
    //     if (response.status === 200) {
    //       ctx.reply(`Registration for ${response.data.email}(Chat ID: ${registrationChatId}) has been approved. The user will be notified with their API token.`);
    //       await ctx.telegram.sendMessage(
    //         registrationChatId,
    //         `Your registration request has been approved! Proceed to get your access token.\n\n*IMPORTANT*:\n1. We **DO NOT** store your ProgressMe email and password, and we do not have access to your ProgressMe account.\n2. Do **NOT** share your access token with anyone else.`,
    //         Markup.inlineKeyboard([
    //           [Markup.button.callback('Proceed', 'get_token')],
    //         ])
    //       );

          
    //       this.userState.set(chatId, "awaiting_progressme_password")


    //     }

    //   } catch (error: any) {
    //     console.error('Error approving registration:', error);
    //     ctx.reply('Failed to approve registration.');
    //   }
    // });

    // // Reject Command (Bot Master Only)
    // this.bot.command('reject', async (ctx: Context) => {
    //   const chatId = ctx.from?.id.toString();
    //   const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

    //   if (chatId !== botMasterChatId) {
    //     return ctx.reply('You are not authorized to use this command.');
    //   }

    //   const args = ctx?.text?.split(' ') || [];
    //   if (args.length !== 2) {
    //     return ctx.reply('Usage: /reject <registration_chat_id>');
    //   }

    //   const registrationChatId = args[1];
    //   try {
    //     console.log(`Rejecting registration for chat ID: ${registrationChatId}`);
    //     const response = await axios.post(`${this.env.SERVER_URL}/api/telegram/reject-request`, { registrationChatId });
    //     if (response.status === 200) {
    //       ctx.reply(`Registration for ${response.data.email}(Chat ID: ${registrationChatId}) has been rejected. The user will be notified.`);
    //       await ctx.telegram.sendMessage(
    //         registrationChatId,
    //         `Your registration request has been rejected. Please contact support if you have any questions.`
    //       );
    //     }

    //   } catch (error: any) {
    //     console.error('Error rejecting registration:', error);
    //     ctx.reply('Failed to reject registration.');
    //   }
    // });

    // Action handler for inline "Approve" button
    this.bot.action(/approve_reg_(.+)/, async (ctx: Context) => {
      const chatId = ctx.from?.id.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.answerCbQuery('You are not authorized to use this action.');
      }

      const match = (ctx as any).match;
      if (!match || !match[1]) {
        return ctx.answerCbQuery('Invalid callback data');
      }

      const registrationChatId = match[1];
      try {
        console.log(`Approving registration for chat ID: ${registrationChatId}`);
        const response = await axios.post(`${this.env.SERVER_URL}/api/telegram/approve-request`, { registrationChatId });
        
        if (response.status === 200) {
          // Answer the callback query to remove loading state
          await ctx.answerCbQuery('Registration approved!');
          
          // Edit the message to show it's been handled
          await ctx.editMessageText(
            `✅ Registration for ${response.data.email} (Chat ID: ${registrationChatId}) has been approved.`,
          );

          // Notify the user
          await ctx.telegram.sendMessage(
            registrationChatId,
            `Your registration request has been approved! Proceed to get your access token.\n\n*IMPORTANT*:\n1. We **DO NOT** store your ProgressMe email and password, and we do not have access to your ProgressMe account.\n2. Do **NOT** share your access token with anyone else.`,
            Markup.inlineKeyboard([
              [Markup.button.callback('Proceed', 'get_token')],
            ])
          );
        }
      } catch (error: any) {
        console.error('Error approving registration:', error);
        await ctx.answerCbQuery('Failed to approve registration');
      }
    });

    // Action handler for inline "Reject" button
    this.bot.action(/reject_reg_(.+)/, async (ctx: Context) => {
      const chatId = ctx.from?.id.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.answerCbQuery('You are not authorized to use this action.');
      }

      const match = (ctx as any).match;
      if (!match || !match[1]) {
        return ctx.answerCbQuery('Invalid callback data');
      }

      const registrationChatId = match[1];
      try {
        console.log(`Rejecting registration for chat ID: ${registrationChatId}`);
        const response = await axios.post(`${this.env.SERVER_URL}/api/telegram/reject-request`, { registrationChatId });
        
        if (response.status === 200) {
          // Answer the callback query to remove loading state
          await ctx.answerCbQuery('Registration rejected');
          
          // Edit the message to show it's been handled
          await ctx.editMessageText(
            `❌ Registration for ${response.data.email} (Chat ID: ${registrationChatId}) has been rejected.`,
          );

          // Notify the user
          await ctx.telegram.sendMessage(
            registrationChatId,
            'Your registration request has been rejected. Please contact support if you have any questions.'
          );
        }
      } catch (error: any) {
        console.error('Error rejecting registration:', error);
        await ctx.answerCbQuery('Failed to reject registration');
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
            
            if (response.status === 200 && response.data.status === 'approved') {
              // User is already approved
              if (response.data.hasToken) {
                ctx.reply(Format.fmt(
                  Format.bold('You are already registered and approved! 🎉\n\n'),
                  'Your access token is already available. Use /get_token to retrieve it, or /regenerate_token to create a new one.'
                ));
              } else {
                ctx.reply(Format.fmt(
                  Format.bold('You are already registered and approved! 🎉\n\n'),
                  'However, you don\'t have an access token yet. Use /get_token to generate one.'
                ));
              }
              this.userState.delete(chatId);
            } else if (response.status === 201 || response.status === 200) {
              // New request submitted or existing request updated
              ctx.reply('Your registration request has been submitted. The bot master will review it.');
              // Notify bot master with inline buttons
              const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;
              if (botMasterChatId) {
                const message = await ctx.telegram.sendMessage(
                  botMasterChatId,
                  `New registration request from ${email} (Chat ID: ${chatId}).\nReasons: ${response.data.reasons || 'Registered via Telegram bot'}. Use Case: ${response.data.useCase || 'Scraper access'}.`,
                  Markup.inlineKeyboard([
                    [Markup.button.callback('Approve', `approve_reg_${chatId}`)],
                    [Markup.button.callback('Reject', `reject_reg_${chatId}`)],
                  ])
                );
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

    // Action handlers for dashboard menu
    this.bot.action('dashboard_user_info', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      await ctx.answerCbQuery('Loading user info...');

      try {
        const db = this.drizzleDb as any;
        const registrationRequest = await db.select()
          .from(telegramRegistrationRequests)
          .where(eq(telegramRegistrationRequests.chatId as any, chatId))
          .limit(1);

        if (registrationRequest.length === 0 || !registrationRequest[0].apiToken) {
          return ctx.reply('You need an access token to view your profile. Use /get_token to get one.');
        }

        // Fetch user profile using the API token
        const response = await axios.get(`${this.env.SERVER_URL}/api/user/profile`, {
          headers: {
            'Cookie': `access-token=${registrationRequest[0].apiToken}`
          }
        });

        if (response.status === 200 && response.data) {
          const user = response.data;
          ctx.reply(Format.fmt(
            Format.bold('👤 User Profile:\n\n'),
            `📧 Email: ${user.email || 'N/A'}\n`,
            `🆔 ID: ${user.id || 'N/A'}\n`,
            `👤 Role: ${user.role || 'student'}\n`,
            `📅 Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}\n`,
            `✉️ Email Verified: ${user.isEmailVerified ? '✅ Yes' : '❌ No'}`
          ));
        } else {
          ctx.reply('Failed to fetch user profile. Please try again.');
        }
      } catch (error: any) {
        console.error('Error fetching user info:', error);
        ctx.reply('An error occurred while fetching your profile. Please try again later.');
      }
    });

    this.bot.action('dashboard_num_classes', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      await ctx.answerCbQuery('Loading dashboard stats...');

      try {
        const db = this.drizzleDb as any;
        const registrationRequest = await db.select()
          .from(telegramRegistrationRequests)
          .where(eq(telegramRegistrationRequests.chatId as any, chatId))
          .limit(1);

        if (registrationRequest.length === 0 || !registrationRequest[0].apiToken) {
          return ctx.reply('You need an access token to view dashboard stats. Use /get_token to get one.');
        }

        // Fetch dashboard summary using the API token
        const response = await axios.get(`${this.env.SERVER_URL}/api/dashboard/summary`, {
          headers: {
            'Cookie': `access-token=${registrationRequest[0].apiToken}`
          }
        });

        if (response.status === 200 && response.data) {
          const stats = response.data;
          ctx.reply(Format.fmt(
            Format.bold('📊 Dashboard Statistics:\n\n'),
            `📚 Total Courses: ${stats.totalCourses || 0}\n`,
            `👥 Total Users: ${stats.totalUsers || 0}\n`,
            `✅ Active Users: ${stats.activeUsers || 0}\n`,
            `📈 Total Students: ${stats.totalStudents || 0}`
          ));
        } else {
          ctx.reply('Failed to fetch dashboard statistics. Please try again.');
        }
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        if (error.response?.status === 401) {
          ctx.reply('Your token has expired. Please use /get_token to get a new one.');
        } else {
          ctx.reply('An error occurred while fetching dashboard statistics. Please try again later.');
        }
      }
    });

    this.bot.action('dashboard_num_students', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      await ctx.answerCbQuery('Loading student information...');

      try {
        const db = this.drizzleDb as any;
        const registrationRequest = await db.select()
          .from(telegramRegistrationRequests)
          .where(eq(telegramRegistrationRequests.chatId as any, chatId))
          .limit(1);

        if (registrationRequest.length === 0 || !registrationRequest[0].apiToken) {
          return ctx.reply('You need an access token to view student information. Use /get_token to get one.');
        }

        // Fetch dashboard summary for student count
        const response = await axios.get(`${this.env.SERVER_URL}/api/dashboard/summary`, {
          headers: {
            'Cookie': `access-token=${registrationRequest[0].apiToken}`
          }
        });

        if (response.status === 200 && response.data) {
          const stats = response.data;
          ctx.reply(Format.fmt(
            Format.bold('👥 Student Information:\n\n'),
            `📊 Total Students: ${stats.totalStudents || 0}\n`,
            `✅ Active Students: ${stats.activeStudents || 0}\n`,
            `📚 Students with Courses: ${stats.studentsWithCourses || 0}`
          ));
        } else {
          ctx.reply('Failed to fetch student information. Please try again.');
        }
      } catch (error: any) {
        console.error('Error fetching student info:', error);
        if (error.response?.status === 401) {
          ctx.reply('Your token has expired. Please use /get_token to get a new one.');
        } else {
          ctx.reply('An error occurred while fetching student information. Please try again later.');
        }
      }
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

    // Action handler for "Yes" regenerate confirmation
    this.bot.action('yes_regenerate', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      await ctx.answerCbQuery('Regenerating token...');

      try {
        const db = this.drizzleDb as any;
        const registrationRequest = await db.select()
          .from(telegramRegistrationRequests)
          .where(eq(telegramRegistrationRequests.chatId as any, chatId))
          .limit(1);

        if (registrationRequest.length > 0 && registrationRequest[0].status === 'approved') {
          // Delete old token and set state to await password
          await db.update(telegramRegistrationRequests)
            .set({ apiToken: null })
            .where(eq(telegramRegistrationRequests.chatId as any, chatId));

          this.userState.set(chatId, 'awaiting_progressme_password');
          
          await ctx.editMessageText('Token deleted. Please provide your ProgressMe password to generate a new token.');
        } else {
          await ctx.editMessageText('You are not approved for token regeneration.');
        }
      } catch (error: any) {
        console.error('Error regenerating token:', error);
        await ctx.editMessageText('An error occurred while regenerating your token. Please try again later.');
      }
    });

    // Action handler for "No" regenerate confirmation
    this.bot.action('no_regenerate', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      await ctx.answerCbQuery('Token regeneration cancelled');
      this.userState.delete(chatId);
      
      await ctx.editMessageText('Token regeneration cancelled. Your existing token remains active.');
    });

    // Action handler for "Access User Dashboard" button
    this.bot.action('dashboard', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      await ctx.answerCbQuery();

      const db = this.drizzleDb as any;
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
        ctx.reply('You need an access token to access the dashboard. Please use the /get_token command to start the process.', Markup.inlineKeyboard([
          [Markup.button.callback('Get Access Token', 'get_token')],
        ]));
      }
    });

    // Action handler for "Register for Access" button
    this.bot.action('register', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      await ctx.answerCbQuery();
      
      ctx.reply('Please share your email address to start the registration process.');
      this.userState.set(chatId, 'awaiting_email');
    });

    // Admin Commands
    this.bot.command('admin', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.reply('You are not authorized to use admin commands.');
      }

      ctx.reply('Admin Menu:', Markup.inlineKeyboard([
        [Markup.button.callback('📋 View All Registrations', 'admin_view_registrations')],
        [Markup.button.callback('📊 System Statistics', 'admin_stats')],
        [Markup.button.callback('👥 View All Users', 'admin_view_users')],
        [Markup.button.callback('🔄 Refresh', 'admin_refresh')],
      ]));
    });

    // Admin: View all registrations
    this.bot.action('admin_view_registrations', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.answerCbQuery('You are not authorized');
      }

      await ctx.answerCbQuery('Loading registrations...');

      try {
        const db = this.drizzleDb as any;
        const allRegistrations = await db.select()
          .from(telegramRegistrationRequests)
          .orderBy(sql`created_at DESC`)
          .limit(20); // Limit to last 20

        if (allRegistrations.length === 0) {
          return ctx.reply('No registration requests found.');
        }

        let message = Format.fmt(Format.bold('📋 Registration Requests:\n\n'));
        allRegistrations.forEach((reg: any, index: number) => {
          const statusEmoji = reg.status === 'approved' ? '✅' : reg.status === 'rejected' ? '❌' : '⏳';
          const messageInsert = Format.fmt(
              message,
              `${index + 1}. ${statusEmoji} ${reg.status.toUpperCase()}\n`,
              `   📧 ${reg.email}\n`,
              `   💬 Chat ID: ${reg.chatId}\n`,
              `   📝 Use Case: ${reg.useCase || 'N/A'}\n`,
              `   ${reg.apiToken ? '🔑 Has Token' : '🔒 No Token'}\n\n`
            
          )
          message = messageInsert
          
        });

        ctx.reply(message, Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Refresh', 'admin_view_registrations')],
          [Markup.button.callback('⬅️ Back to Admin Menu', 'admin_menu')],
        ]));
      } catch (error: any) {
        console.error('Error fetching registrations:', error);
        ctx.reply('Failed to fetch registrations. Please try again.');
      }
    });

    // Admin: System statistics
    this.bot.action('admin_stats', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.answerCbQuery('You are not authorized');
      }

      await ctx.answerCbQuery('Loading statistics...');

      try {
        const db = this.drizzleDb as any;
        
        // Get registration stats
        const allRegistrations = await db.select().from(telegramRegistrationRequests);
        const pendingCount = allRegistrations.filter((r: any) => r.status === 'pending').length;
        const approvedCount = allRegistrations.filter((r: any) => r.status === 'approved').length;
        const rejectedCount = allRegistrations.filter((r: any) => r.status === 'rejected').length;
        const withTokenCount = allRegistrations.filter((r: any) => r.apiToken).length;

        // Get user stats
        const allUsers = await db.select().from(users);
        const totalUsers = allUsers.length;
        const verifiedUsers = allUsers.filter((u: any) => u.isEmailVerified).length;

        // Get course stats
        const allCourses = await db.select().from(courses);
        const totalCourses = allCourses.length;

        const statsMessage = Format.fmt(
          Format.bold('📊 System Statistics:\n\n'),
          Format.bold('📋 Registrations:\n'),
          `   ⏳ Pending: ${pendingCount}\n`,
          `   ✅ Approved: ${approvedCount}\n`,
          `   ❌ Rejected: ${rejectedCount}\n`,
          `   🔑 With Tokens: ${withTokenCount}\n\n`,
          Format.bold('👥 Users:\n'),
          `   📊 Total: ${totalUsers}\n`,
          `   ✉️ Verified: ${verifiedUsers}\n\n`,
          Format.bold('📚 Courses:\n'),
          `   📊 Total: ${totalCourses}\n`
        );

        ctx.reply(statsMessage, Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Refresh', 'admin_stats')],
          [Markup.button.callback('⬅️ Back to Admin Menu', 'admin_menu')],
        ]));
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        ctx.reply('Failed to fetch statistics. Please try again.');
      }
    });

    // Admin: View all users
    this.bot.action('admin_view_users', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.answerCbQuery('You are not authorized');
      }

      await ctx.answerCbQuery('Loading users...');

      try {
        const db = this.drizzleDb as any;
        const allUsers = await db.select()
          .from(users)
          .orderBy(sql`created_at DESC`)
          .limit(20); // Limit to last 20

        if (allUsers.length === 0) {
          return ctx.reply('No users found.');
        }

        let message = Format.fmt(Format.bold('👥 Users:\n\n'));
        allUsers.forEach((user: any, index: number) => {
          const roleEmoji = user.role === 'admin' ? '👑' : user.role === 'teacher' ? '👨‍🏫' : '👤';
          const messageInsert = Format.fmt(
            message,
            `${index + 1}. ${roleEmoji} ${user.role.toUpperCase()}\n`,
            `   📧 ${user.email}\n`,
            `   ${user.isEmailVerified ? '✅ Verified' : '❌ Not Verified'}\n\n`
          )
          message = messageInsert;
        });

        ctx.reply(message, Markup.inlineKeyboard([
          [Markup.button.callback('🔄 Refresh', 'admin_view_users')],
          [Markup.button.callback('⬅️ Back to Admin Menu', 'admin_menu')],
        ]));
      } catch (error: any) {
        console.error('Error fetching users:', error);
        ctx.reply('Failed to fetch users. Please try again.');
      }
    });

    // Admin: Back to menu
    this.bot.action('admin_menu', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.answerCbQuery('You are not authorized');
      }

      await ctx.answerCbQuery();
      ctx.editMessageText('Admin Menu:', Markup.inlineKeyboard([
        [Markup.button.callback('📋 View All Registrations', 'admin_view_registrations')],
        [Markup.button.callback('📊 System Statistics', 'admin_stats')],
        [Markup.button.callback('👥 View All Users', 'admin_view_users')],
        [Markup.button.callback('🔄 Refresh', 'admin_refresh')],
      ]));
    });

    // Admin: Refresh
    this.bot.action('admin_refresh', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      const botMasterChatId = this.env.TELEGRAM_BOT_MASTER_CHAT_ID;

      if (chatId !== botMasterChatId) {
        return ctx.answerCbQuery('You are not authorized');
      }

      await ctx.answerCbQuery('Refreshing...');
      ctx.editMessageText('Admin Menu:', Markup.inlineKeyboard([
        [Markup.button.callback('📋 View All Registrations', 'admin_view_registrations')],
        [Markup.button.callback('📊 System Statistics', 'admin_stats')],
        [Markup.button.callback('👥 View All Users', 'admin_view_users')],
        [Markup.button.callback('🔄 Refresh', 'admin_refresh')],
      ]));
    });

    // Teacher Commands
    this.bot.command('teacher', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      if (!chatId) {
        return ctx.reply('Could not determine your chat ID. Please try again.');
      }

      try {
        const db = this.drizzleDb as any;
        const registrationRequest = await db.select()
          .from(telegramRegistrationRequests)
          .where(eq(telegramRegistrationRequests.chatId as any, chatId))
          .limit(1);

        if (registrationRequest.length === 0 || !registrationRequest[0].apiToken) {
          return ctx.reply('You need an access token to access teacher features. Use /get_token to get one.');
        }

        // Check if user is a teacher (would need to fetch from API)
        ctx.reply('Teacher Menu:', Markup.inlineKeyboard([
          [Markup.button.callback('📚 My Courses', 'teacher_my_courses')],
          [Markup.button.callback('👥 My Students', 'teacher_my_students')],
          [Markup.button.callback('📊 Course Analytics', 'teacher_course_analytics')],
          [Markup.button.callback('📅 Schedule Management', 'teacher_schedule')],
        ]));
      } catch (error: any) {
        console.error('Error in teacher command:', error);
        ctx.reply('An error occurred. Please try again.');
      }
    });

    // Teacher: My Courses
    this.bot.action('teacher_my_courses', async (ctx: Context) => {
      const chatId = ctx.from?.id?.toString();
      if (!chatId) {
        return ctx.answerCbQuery('Could not determine your chat ID');
      }

      await ctx.answerCbQuery('Loading courses...');

      try {
        const db = this.drizzleDb as any;
        const registrationRequest = await db.select()
          .from(telegramRegistrationRequests)
          .where(eq(telegramRegistrationRequests.chatId as any, chatId))
          .limit(1);

        if (registrationRequest.length === 0 || !registrationRequest[0].apiToken) {
          return ctx.reply('You need an access token to view courses. Use /get_token to get one.');
        }

        // Fetch courses using API
        const response = await axios.get(`${this.env.SERVER_URL}/api/courses`, {
          headers: {
            'Cookie': `access-token=${registrationRequest[0].apiToken}`
          }
        });

        if (response.status === 200 && response.data) {
          const courses = Array.isArray(response.data) ? response.data : response.data.courses || [];
          
          if (courses.length === 0) {
            return ctx.reply('You don\'t have any courses yet.');
          }

          let message = Format.fmt(Format.bold('📚 Your Courses:\n\n'));
          courses.slice(0, 10).forEach((course: any, index: number) => {
            const messageInsert = Format.fmt(
              message,
              `${index + 1}. ${course.title || 'Untitled'}\n`,
              `   📊 Progress: ${course.progress || 0}%\n`,
              `   📅 Last Accessed: ${course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString() : 'Never'}\n\n`
            )
            message = messageInsert;
          });

          if (courses.length > 10) {
            message.text += `\n... and ${courses.length - 10} more courses`;
          }

          ctx.reply(message, Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Refresh', 'teacher_my_courses')],
            [Markup.button.callback('⬅️ Back to Teacher Menu', 'teacher_menu')],
          ]));
        } else {
          ctx.reply('Failed to fetch courses. Please try again.');
        }
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        if (error.response?.status === 401) {
          ctx.reply('Your token has expired. Please use /get_token to get a new one.');
        } else {
          ctx.reply('An error occurred while fetching courses. Please try again later.');
        }
      }
    });

    // Teacher: My Students (placeholder - would need student management API)
    this.bot.action('teacher_my_students', async (ctx: Context) => {
      await ctx.answerCbQuery('Loading students...');
      ctx.reply('Student management features coming soon! 📚👥');
    });

    // Teacher: Course Analytics
    this.bot.action('teacher_course_analytics', async (ctx: Context) => {
      await ctx.answerCbQuery('Loading analytics...');
      ctx.reply('Course analytics features coming soon! 📊');
    });

    // Teacher: Schedule Management
    this.bot.action('teacher_schedule', async (ctx: Context) => {
      await ctx.answerCbQuery('Loading schedule...');
      ctx.reply('Schedule management features coming soon! 📅');
    });

    // Teacher: Back to menu
    this.bot.action('teacher_menu', async (ctx: Context) => {
      await ctx.answerCbQuery();
      ctx.editMessageText('Teacher Menu:', Markup.inlineKeyboard([
        [Markup.button.callback('📚 My Courses', 'teacher_my_courses')],
        [Markup.button.callback('👥 My Students', 'teacher_my_students')],
        [Markup.button.callback('📊 Course Analytics', 'teacher_course_analytics')],
        [Markup.button.callback('📅 Schedule Management', 'teacher_schedule')],
      ]));
    });

    this.bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot and see the main menu' },
  { command: 'help', description: 'Get help with using the bot' },
  { command: 'register', description: 'Start the registration process to get service access' },
  { command: 'dashboard', description: 'Access your personalized dashboard' },
  { command: 'get_token', description: 'Get your access token if registered and approved' },
  ]);
  }

  logger(message:string, errorCode: number){
    const traceId = "trace-"+this.bot.botInfo?.id+"-tm_stmp:"+Date.now();
    const spanId = "span-"+Date.now();
    


    // Initialize LogHog if service binding exists
    if (this.env.LOG_API && this.env.LOGHOG_APP_TOKEN) {
      const loghog = new LogHogClient(
        this.env.LOG_API,
        this.env.LOGHOG_APP_TOKEN,
        (promise) => Promise.all([promise]) // Use Cloudflare's waitUntil if available
      );

      // Log error to LogHog with structured data
      loghog.logHttpError(
        "POST",
        "/telegram-webhook",
        errorCode,
        message,
        String(this.bot.botInfo?.id),
        traceId,
        spanId,
        undefined
      );
    }
  }

  // @ts-ignore - Type conflict between global Request and Cloudflare's CfRequest, but runtime behavior is correct
  fetch = async (request: Request): Promise<Response> => {
    // This is where incoming requests for this DO instance will be handled.
    // For Telegram webhooks, we'll forward the update to our Telegraf bot.
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // console.log("path:", path)
      

      if (path === "/telegram-webhook") {
        const update = await request.json() as Update; // Cast to Update type

        console.log("update:", update)
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
