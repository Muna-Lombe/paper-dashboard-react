// const express = require("express"); // Replaced with Hono
// const cors = require("cors"); // Replaced with Hono's cors middleware
// const http = require("http"); // Not needed for Workers
// const socketIo = require("socket.io"); // Not supported in Workers
// // const path = require("path"); // Not available in Cloudflare Workers
// const swaggerUi = require("swagger-ui-express"); // Not supported in Workers
// const swaggerSpecs = require("./config/swagger"); // Not supported in Workers
// const cookieParser = require("cookie-parser"); // Replaced with Hono's cookie middleware
const auth = require("./middleware/auth"); // Import auth middleware
const telegramBotFactory = require("./config/telegramBot"); // Renamed for clarity
const { sequelize } = require("./config/database");
require("dotenv").config();

const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { json } = require('hono/json');
const { logger } = require('hono/logger');
const { poweredBy } = require('hono/powered-by');
const { secureHeaders } = require('hono/secure-headers');
const { handle } = require('hono/cloudflare-pages');
const { getCookie, setCookie, deleteCookie } = require('hono/cookie');

const app = new Hono();

// Hono Middleware
app.use(logger());
app.use(poweredBy());
app.use(secureHeaders());
app.use(json());
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
  c.set('env', c.env); // Make env accessible in the Hono context
  await next();
});

// health check
app.get("/health", (c) => {
    return c.text("OK");
});

// Routes
const authRoutes = require("./routes/auth");
app.route("/api/auth", authRoutes);

const courseRoutes = require("./routes/courses");
app.route("/api/courses", courseRoutes); // Mount course routes

const scraperRoutes = require("./routes/scraper");
app.route("/api/scraper", scraperRoutes); // Mount scraper routes

const telegramRoutes = require("./routes/telegram");
app.route("/api/telegram", telegramRoutes); // Mount telegram routes

const dashboardRoutes = require("./routes/dashboard");
app.route("/api/dashboard", dashboardRoutes); // Mount dashboard routes

const userRoutes = require("./routes/user");
app.route("/api/user", userRoutes); // Mount user routes

const scheduleRoutes = require("./routes/schedule");
app.route("/api/schedule", scheduleRoutes); // Mount schedule routes

const integrationsRoutes = require("./routes/integrations");
app.route("/api/integrations", integrationsRoutes); // Mount integrations routes

const assistantRoutes = require("./routes/assistant");
app.route("/api/assistant", assistantRoutes); // Mount assistant routes

// Initialize the Telegram bot with the env object
const telegramBot = telegramBotFactory(process.env); // Pass process.env here for local testing, Cloudflare will provide c.env

// app.use("/api/courses", auth, require("./routes/courses")); // Protect with auth middleware
// app.use("/api/scraper", auth, require("./routes/scraper")); // Protect with auth middleware
// app.use("/api/telegram", require("./routes/telegram")); // Add Telegram bot routes
// app.use("/api/dashboard", auth, require("./routes/dashboard")); // Add Dashboard routes, protected by auth middleware
// app.use("/api/user", auth, require("./routes/user")); // Add User routes, protected by auth middleware
// app.use("/api/schedule", auth, require("./routes/schedule")); // Add Schedule routes, protected by auth middleware
// app.use("/api/integrations", auth, require("./routes/integrations")); // Add Integrations routes, protected by auth middleware
// app.use("/api/assistant", auth, require("./routes/assistant")); // Add Assistant routes, protected by auth middleware

// Telegram Webhook
app.post('/telegram-webhook', async (c) => {
  try {
    const update = await c.req.json();
    // For local development, process.env might be used. In Cloudflare Worker, c.env is available.
    // Ensure telegramBotFactory can handle either.
    await telegramBot(update, c.env); // Pass c.env to the bot's webhook handler
    return c.text('OK');
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return c.text('Error', 500);
  }
});

// Export the Hono app as a Cloudflare Worker handler
module.exports = {
    fetch: handle(app),
};
