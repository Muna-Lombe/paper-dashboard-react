import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { secureHeaders } from 'hono/secure-headers';
// import { handle } from 'hono/cloudflare-pages'; // No longer needed
// import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
// import auth from "./middleware/auth"; // Import auth middleware
// import telegramBotFactory from "./config/telegramBot"; // Renamed for clarity - NO LONGER NEEDED
// import { sequelize } from "./database/db";
import { getDrizzleDb } from './database/drizzle/db';

import { D1Database, DurableObjectNamespace } from '@cloudflare/workers-types/experimental';
import { Telegraf } from 'telegraf';
// import { telegrafResponseBuilder } from './middleware/telegrafResponseBuilder'; // No longer needed
// import { createTelegrafMiddleware } from './middleware/telegrafMiddleware'; // No longer needed
import { TelegramBotDO } from './durable_objects/TelegramBotDO'; // Import Durable Object class

export interface Env {
  paper_dash_db: D1Database;
  drizzleDb: ReturnType<typeof getDrizzleDb>;
  PORT: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  CLIENT_URL: string;
  UPLOAD_DIR: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_BOT_MASTER_CHAT_ID: string;
  SERVER_URL: string;
  EXTERNAL_SCRAPER_SERVICE_URL: string; // Add this type
  TELEGRAM_BOT_DO: DurableObjectNamespace; // Durable Object binding
  // telegramBot: Telegraf; // No longer initialized at top level
}

const app = new Hono<{ Bindings: Env }>();

// Initialize Drizzle once at the top level
let drizzleDbInstance: ReturnType<typeof getDrizzleDb>; // Restore these
// let telegramBotInstance: Telegraf; // No longer initialized at top level

// Hono Middleware
app.use(logger());
app.use(poweredBy({serverName: "Paper Api"}));
app.use(secureHeaders());
app.use(cors({
  origin: ["https://paperdash.katundu.org", "http://localhost:3000"],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Custom middleware to attach D1 binding to context
app.use(async (c, next) => {
  if (!drizzleDbInstance) {
    drizzleDbInstance = getDrizzleDb(c.env.paper_dash_db);
    // telegramBotInstance = telegramBotFactory(c.env); // No longer initialized at top level
    // Ensure the bot factory's initialiseBot method is called once.
    // Since telegramBotFactory already handles this, no explicit call here.
  }
  c.env.drizzleDb = drizzleDbInstance;
  // c.env.telegramBot = telegramBotInstance; // No longer initialized at top level

  if (!c.req) {
    console.error("c.req is undefined in middleware, skipping.");
    return await next();
  }
  if (c.env && c.env.paper_dash_db) {
    
    // sequelize.options.dialectOptions = {
    //   bindings: c.env.DB,
    // };
    
    // You might need to sync models here or ensure they are already synced via migrations
    // await sequelize.sync({ alter: true });
  }
  await next();
});

// Apply the Telegraf middleware for webhook handling
// app.use(createTelegrafMiddleware(telegramBotFactory(app.env as Env))); // Pass env directly from app

// health check
app.get("/health", (c) => {
    return c.text("OK");
});

// Routes
import authRoutes from "./routes/auth";
app.route("/api/auth", authRoutes);

import courseRoutes from "./routes/courses";
app.route("/api/courses", courseRoutes); // Mount course routes

import scraperRoutes from "./routes/scraper";
app.route("/api/scraper", scraperRoutes); // Mount scraper routes

import telegramRoutes from "./routes/telegram";
app.route("/api/telegram", telegramRoutes); // Mount telegram routes

import dashboardRoutes from "./routes/dashboard";
app.route("/api/dashboard", dashboardRoutes); // Mount dashboard routes

import userRoutes from "./routes/user";
app.route("/api/user", userRoutes); // Mount user routes

import scheduleRoutes from "./routes/schedule";
app.route("/api/schedule", scheduleRoutes); // Mount schedule routes

import integrationsRoutes from "./routes/integrations";
app.route("/api/integrations", integrationsRoutes); // Mount integrations routes

import assistantRoutes from "./routes/assistant";
// import { drizzle } from 'drizzle-orm/singlestore/driver';
app.route("/api/assistant", assistantRoutes); // Mount assistant routes


// Telegram Webhook
app.post('/telegram-webhook', async (c) => {
  try {
    const update = await c.req.json();
    // Telegram updates have a chat ID in various places, we need to find it
    const chatId = update.message?.chat.id || update.callback_query?.message?.chat.id || update.my_chat_member?.chat.id;

    if (!chatId) {
      console.error("Could not determine chatId from Telegram update:", update);
      return c.text("Bad Request: Missing chat_id", 400);
    }

    // Get a Durable Object ID for this specific chat.
    // Each chat will have its own DO instance to manage state.
    const id = c.env.TELEGRAM_BOT_DO.idFromName(chatId.toString());
    const stub = c.env.TELEGRAM_BOT_DO.get(id);

    // Forward the original request to the Durable Object
    // The DO will handle the Telegraf bot logic and state.
    const doRequest = new Request(c.req.url, {
      method: c.req.method,
      headers: new Headers(c.req.raw.headers), // Explicitly create new Headers from raw request headers
      body: JSON.stringify(update),
    });
    const doResponse = await stub.fetch(doRequest as any); // Cast to any to resolve type mismatch
    
    // Construct a new Hono-compatible Response from the DO's response
    const responseBody = await doResponse.text(); // Read body as text
    return new Response(responseBody, { status: doResponse.status, headers: doResponse.headers });

  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    return c.text('Error', 500);
  }
});

export { TelegramBotDO }; // Export the Durable Object class for Wrangler
export default app;
