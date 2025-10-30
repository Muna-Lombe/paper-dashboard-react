import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { secureHeaders } from 'hono/secure-headers';
// import { handle } from 'hono/cloudflare-pages'; // No longer needed
// import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
// import auth from "./middleware/auth"; // Import auth middleware
import telegramBotFactory from "./config/telegramBot"; // Renamed for clarity
// import { sequelize } from "./database/db";
import { getDrizzleDb } from './database/drizzle/db';
import { telegrafResponseBuilder } from './middleware/telegrafResponseBuilder';
const app = new Hono();
// Initialize Drizzle and Telegram Bot once at the top level
let drizzleDbInstance;
let telegramBotInstance;
// Hono Middleware
app.use(logger());
app.use(poweredBy({ serverName: "Paper Api" }));
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
        telegramBotInstance = telegramBotFactory(c.env);
    }
    c.env.drizzleDb = drizzleDbInstance;
    c.env.telegramBot = telegramBotInstance;
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
// Initialize the Telegram bot with the env object
// const telegramBot = telegramBotFactory(process.env); // Pass process.env here for local testing, Cloudflare will provide c.env
// Telegram Webhook
app.post('/telegram-webhook', async (c) => {
    try {
        const update = await c.req.json();
        const dummyRes = { headers: new Headers(), body: null, status: 200 };
        const telegrafRes = telegrafResponseBuilder(dummyRes);
        await c.env.telegramBot.handleUpdate(update, telegrafRes);
        return c.text('OK', dummyRes.status, dummyRes.headers);
    }
    catch (error) {
        console.error('Telegram webhook error:', error);
        return c.text('Error', 500);
    }
});
export default app;
