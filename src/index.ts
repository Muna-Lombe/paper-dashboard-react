import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { secureHeaders } from 'hono/secure-headers';
import { handle } from 'hono/cloudflare-pages';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import auth from "../middleware/auth"; // Import auth middleware
import telegramBotFactory from "../config/telegramBot"; // Renamed for clarity
import { sequelize } from "../config/database";
import { D1Database } from '@cloudflare/workers-types/experimental';
import { Telegraf } from 'telegraf';


interface Env {
  DB: D1Database;
  PORT: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  CLIENT_URL: string;
  UPLOAD_DIR: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_BOT_MASTER_CHAT_ID: string;
  SERVER_URL: string;
  EXTERNAL_SCRAPER_SERVICE_URL: string; // Add this type
  telegramBot: Telegraf;
}

const app = new Hono<{ Bindings: Env }>();

// Hono Middleware
app.use(logger());
app.use(poweredBy());
app.use(secureHeaders());
app.use(cors({
  origin: ["https://paperdash.katundu.org", "http://localhost:3000"],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Custom middleware to attach D1 binding to context and initialize Sequelize
app.use(async (c, next) => {
  if (c.env && c.env.DB) {
    sequelize.options.dialectOptions = {
      bindings: c.env.DB,
    };
    // You might need to sync models here or ensure they are already synced via migrations
    await sequelize.sync({ alter: true });
  }
  c.env.telegramBot = telegramBotFactory(c.env);
  await next();
});

// health check
app.get("/health", (c) => {
    return c.text("OK");
});

// Routes
import authRoutes from "../routes/auth";
app.route("/api/auth", authRoutes);

import courseRoutes from "../routes/courses";
app.route("/api/courses", courseRoutes); // Mount course routes

import scraperRoutes from "../routes/scraper";
app.route("/api/scraper", scraperRoutes); // Mount scraper routes

import telegramRoutes from "../routes/telegram";
app.route("/api/telegram", telegramRoutes); // Mount telegram routes

import dashboardRoutes from "../routes/dashboard";
app.route("/api/dashboard", dashboardRoutes); // Mount dashboard routes

import userRoutes from "../routes/user";
app.route("/api/user", userRoutes); // Mount user routes

import scheduleRoutes from "../routes/schedule";
app.route("/api/schedule", scheduleRoutes); // Mount schedule routes

import integrationsRoutes from "../routes/integrations";
app.route("/api/integrations", integrationsRoutes); // Mount integrations routes

import assistantRoutes from "../routes/assistant";
app.route("/api/assistant", assistantRoutes); // Mount assistant routes

// Initialize the Telegram bot with the env object
// const telegramBot = telegramBotFactory(process.env); // Pass process.env here for local testing, Cloudflare will provide c.env

// Telegram Webhook
app.post('/telegram-webhook', async (c) => {
  try {
    const update = await c.req.json();
    // For local development, process.env might be used. In Cloudflare Worker, c.env is available.
    // Ensure telegramBotFactory can handle either.
    await c.env.telegramBot.handleUpdate(update);
    return c.text('OK');
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return c.text('Error', 500);
  }
});

export default {
    fetch: handle(app),
};
