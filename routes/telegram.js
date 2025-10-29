const TelegramRegistrationRequest = require('../models/TelegramRegistrationRequest');
const bot = require('../config/telegramBot');
// const crypto = require('crypto'); // Import crypto for token generation
const jwt = require('jsonwebtoken'); // Import jwt for token generation
const { Markup } = require('telegraf'); // Import Markup for inline keyboards
// const courseScraper = require('../services/courseScraper'); // This service uses puppeteer and is not compatible with Workers
const axios = require('axios'); // Import axios for external scraper service calls


const { Hono } = require('hono');
const { validator } = require('hono/validator');
const { z } = require('zod');

const telegramRoutes = new Hono();

// The requestMessages Map is specific to a Node.js server context and bot.telegram.deleteMessage.
// In a serverless Worker, this state management would need to be rethought (e.g., using durable objects or external storage).
const requestMessages = new Map();

const registerRequestSchema = z.object({
  chatId: z.string().nonempty("Chat ID is required"),
  email: z.string().email("Please include a valid email"),
  reasons: z.string().optional(),
  useCase: z.string().optional(),
});

// Endpoint for Telegram bot to send registration request data
telegramRoutes.post('/register-request',
  validator("json", (value, c) => {
    const parsed = registerRequestSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { chatId, email, reasons, useCase } = c.req.valid("json");

    try {
      let existingRequest = await TelegramRegistrationRequest.findOne({ where: { chatId, status: "pending" } });
      let registrationRequest;
      if (existingRequest) {
        existingRequest.email = email;
        existingRequest.reasons = reasons;
        existingRequest.useCase = useCase;
        await existingRequest.save();
        registrationRequest = existingRequest;
      } else {
        registrationRequest = await TelegramRegistrationRequest.create({
          chatId,
          email,
          reasons,
          useCase,
          status: 'pending',
        });
      }

      // Notify bot master with inline buttons
      const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID; // Access env from process.env
      if (botMasterChatId) {
        // The bot.telegram.sendMessage uses the Telegraf instance.
        // In a Worker, you'd likely use the Telegram Bot API directly or ensure `bot` is properly initialized with fetch capabilities.
        // For now, assume `bot` can send messages via its webhook handler.
        const message = await bot.telegram.sendMessage(
          botMasterChatId,
          `New registration request from ${email} (Chat ID: ${chatId}).\nReasons: ${reasons}. Use Case: ${useCase}.`,
          Markup.inlineKeyboard([
            [Markup.button.callback('Approve', `approve_reg_${chatId}`)],
            [Markup.button.callback('Reject', `reject_reg_${chatId}`)],
          ])
        );
        requestMessages.set(`${botMasterChatId}-${chatId}`, message.message_id);
      }

      return c.json({ msg: 'Registration request submitted successfully.', requestId: registrationRequest.id }, 201);
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

const approveRejectRequestSchema = z.object({
  registrationChatId: z.string().nonempty("Registration Chat ID is required"),
});

// Endpoint for bot master to approve registration requests
telegramRoutes.post('/approve-request',
  validator("json", (value, c) => {
    const parsed = approveRejectRequestSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { registrationChatId } = c.req.valid("json");

    try {
      const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId: registrationChatId } });

      if (!registrationRequest) {
        return c.json({ msg: 'Registration request not found.' }, 404);
      }

      if (registrationRequest.status === 'approved') {
        return c.json({ msg: 'Registration request already approved.' }, 400);
      }
      
      registrationRequest.status = 'approved';
      await registrationRequest.save();

      await bot.telegram.sendMessage(
        registrationChatId,
        `Your registration request has been approved! Proceed to get your access token.\n\n*IMPORTANT*:\n1. We **DO NOT** store your ProgressMe email and password, and we do not have access to your ProgressMe account.\n2. Do **NOT** share your access token with anyone else.`,
      Markup.inlineKeyboard([
            [Markup.button.callback('Proceed', 'get_token')],
      ])
      );

      const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID;
      if (botMasterChatId) {
        const message = await bot.telegram.sendMessage(
          botMasterChatId,
          `registration request from ${registrationRequest.email} (Chat ID: ${registrationChatId}) approved!`,
        );
        requestMessages.set(`${botMasterChatId}-${registrationChatId}`, message.message_id);
      }

      return c.json({ msg: 'Registration request approved successfully.', requestId: registrationRequest.id }, 200);
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

// Endpoint for bot master to reject registration requests
telegramRoutes.post('/reject-request',
  validator("json", (value, c) => {
    const parsed = approveRejectRequestSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { registrationChatId } = c.req.valid("json");

    try {
      const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId: registrationChatId } });

      if (!registrationRequest) {
        return c.json({ msg: 'Registration request not found.' }, 404);
      }

      if (registrationRequest.status === 'rejected') {
        return c.json({ msg: 'Registration request already rejected.' }, 400);
      }

      registrationRequest.status = 'rejected';
      await registrationRequest.save();

      await bot.telegram.sendMessage(
        registrationChatId,
        'Your registration request has been rejected. Please contact support if you have any questions.'
      );

      const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID;
      if (botMasterChatId) {
        // bot.telegram.deleteMessage is not reliable in a serverless environment for modifying previous messages directly
        // Instead, the `config/telegramBot.js` now uses `ctx.editMessageText` for bot master replies.
        // requestMessages is also not reliably persisted across Worker invocations.
        // For now, commenting out direct message manipulation here.
        // bot.telegram.deleteMessage(botMasterChatId, requestMessages.get(`${botMasterChatId}-${registrationChatId}`));
        const message = await bot.telegram.sendMessage(
          botMasterChatId,
          `registration request from ${registrationRequest.email} (Chat ID: ${registrationChatId}) rejected!`,
        );
        // requestMessages.set(`${botMasterChatId}-${registrationChatId}`, message.message_id);
      }
      return c.json({ msg: 'Registration request rejected.' }, 200);
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

const generateProgressMeTokenSchema = z.object({
  chatId: z.string().nonempty("Chat ID is required"),
  progressMePassword: z.string().nonempty("ProgressMe password is required"),
});

// Endpoint for generating ProgressMe token after registration approval
telegramRoutes.post('/generate-progressme-token',
  validator("json", (value, c) => {
    const parsed = generateProgressMeTokenSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { chatId, progressMePassword } = c.req.valid("json");

    try {
      const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId } });

      if (!registrationRequest) {
        return c.json({ msg: 'Registration request not found.' }, 404);
      }

      if (registrationRequest.status !== 'approved') {
        return c.json({ msg: 'Registration request not yet approved or already rejected.' }, 400);
      }

      const email = registrationRequest.email;
      
      // WARNING: courseScraper uses puppeteer, which is not compatible with Cloudflare Workers.
      // This part of the code will still fail upon deployment to Cloudflare Workers.
      // It needs to be externalized to a separate service.
      // const authResult = await courseScraper.authenticateWithWebSocket(
      //   email,
      //   progressMePassword
      // );
      const externalScraperUrl = c.get('env').EXTERNAL_SCRAPER_SERVICE_URL; // Access from Hono context
      if (!externalScraperUrl) {
        console.error('EXTERNAL_SCRAPER_SERVICE_URL is not defined in environment variables.');
        return c.json({ msg: 'Scraper service not configured.' }, 500);
      }
      const scraperAuthResponse = await axios.post(`${externalScraperUrl}/authenticate`, {
        email,
        password: progressMePassword,
      });

      if (scraperAuthResponse.status !== 200 || !scraperAuthResponse.data) {
        return c.json({ msg: 'Failed to authenticate with external scraper service.' }, 400);
      }
      const { token, data } = scraperAuthResponse.data;
      const isProgressMeAuthSuccessful = token || null; 

      if (!isProgressMeAuthSuccessful) {
        return c.json({ msg: 'Invalid ProgressMe credentials.' }, 400);
      }

      const payload = {
        user: {
          id: registrationRequest.id, 
          email: email,
          // Remove password from payload - SECURITY VULNERABILITY
          // password: progressMePassword
        },
      };

      const serviceToken = await new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          process.env.JWT_SECRET || "default_jwt_secret",
          { expiresIn: "5d" },
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          },
        );
      });

      registrationRequest.apiToken = serviceToken;
      await registrationRequest.save();

      return c.json({ encodedToken: serviceToken }, 200);
    } catch (err) {
      console.error("generating token error:", err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

module.exports = telegramRoutes;
