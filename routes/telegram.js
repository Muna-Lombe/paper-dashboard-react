const express = require('express');
const router = express.Router();
const TelegramRegistrationRequest = require('../models/TelegramRegistrationRequest');
const bot = require('../config/telegramBot');
const crypto = require('crypto'); // Import crypto for token generation
const jwt = require('jsonwebtoken'); // Import jwt for token generation
const { Markup } = require('telegraf'); // Import Markup for inline keyboards
const courseScraper = require('../services/courseScraper');


const requestMessages = new Map()
// Endpoint for Telegram bot to send registration request data
router.post('/register-request', async (req, res) => {
  try {
    const { chatId, email, reasons, useCase } = req.body;

    // Check if a request from this chat ID already exists
    let existingRequest = await TelegramRegistrationRequest.findOne({ where: { chatId, status: "pending" } });
    let registrationRequest;
    if (existingRequest) {
      // return res.status(400).json({ msg: 'Registration request already exists for this chat ID.' });
      //update existingRequest and continue 
      
     
      existingRequest.email = email;
      existingRequest.reasons = reasons;
      existingRequest.useCase = useCase;

      await existingRequest.save()
      registrationRequest = existingRequest;

    }else{
      
      registrationRequest = await TelegramRegistrationRequest.create({
        chatId,
        email,
        reasons,
        useCase,
        status: 'pending',
      });
    }


    // Notify bot master with inline buttons
    const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID;
    if (botMasterChatId) {
      const message = await bot.telegram.sendMessage(
        botMasterChatId,
        `New registration request from ${email} (Chat ID: ${chatId}).\nReasons: ${reasons}. Use Case: ${useCase}.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Approve', `approve_reg_${chatId}`)],
          [Markup.button.callback('Reject', `reject_reg_${chatId}`)],
        ])
      );
      requestMessages.set(`${botMasterChatId}-${chatId}`, message.message_id);
      // return message.message_id;
    }

    return res.status(201).json({ msg: 'Registration request submitted successfully.', requestId: registrationRequest.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint for bot master to approve registration requests
router.post('/approve-request', async (req, res) => {
  try {
    const { registrationChatId } = req.body;

    const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId: registrationChatId } });

    if (!registrationRequest) {
      return res.status(404).json({ msg: 'Registration request not found.' });
    }

    if (registrationRequest.status === 'approved') {
      return res.status(400).json({ msg: 'Registration request already approved.' });
    }
    
    registrationRequest.status = 'approved';
    await registrationRequest.save()

    await bot.telegram.sendMessage(
      registrationChatId,
      `Your registration request has been approved! Proceed to get your access token.

*IMPORTANT*:
1. We **DO NOT** store your ProgressMe email and password, and we do not have access to your ProgressMe account.
2. Do **NOT** share your access token with anyone else.`,
    Markup.inlineKeyboard([
          [Markup.button.callback('Proceed', 'get_token')],
    ])
    );

    // Notify bot master with inline buttons
    const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID;
    if (botMasterChatId) {
      // bot.telegram.deleteMessage(botMasterChatId, requestMessages.get(`${botMasterChatId}-${registrationChatId}`))
      const message = await bot.telegram.sendMessage(
        botMasterChatId,
        `registration request from ${registrationRequest.email} (Chat ID: ${registrationChatId}) approved!`,
      );
      requestMessages.set(`${botMasterChatId}-${registrationChatId}`, message.message_id);
      // return message.message_id;
    }

    return res.status(200).json({ msg: 'Registration request approved successfully.', requestId: registrationRequest.id })
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint for bot master to reject registration requests
router.post('/reject-request', async (req, res) => {
  try {
    const { registrationChatId } = req.body;

    const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId: registrationChatId } });

    if (!registrationRequest) {
      return res.status(404).json({ msg: 'Registration request not found.' });
    }

    if (registrationRequest.status === 'rejected') {
      return res.status(400).json({ msg: 'Registration request already rejected.' });
    }

    registrationRequest.status = 'rejected';
    await registrationRequest.save();

    // Notify the user via Telegram bot
    await bot.telegram.sendMessage(
      registrationChatId,
      'Your registration request has been rejected. Please contact support if you have any questions.'
    );
     // Notify bot master with inline buttons
    const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID;
    if (botMasterChatId) {
      bot.telegram.deleteMessage(botMasterChatId, requestMessages.get(`${botMasterChatId}-${registrationChatId}`))
      const message = await bot.telegram.sendMessage(
        botMasterChatId,
        `registration request from ${email} (Chat ID: ${registrationChatId}) rejected!`,
      );
      requestMessages.set(`${botMasterChatId}-${registrationChatId}`, message.message_id);
      // return message.message_id;
    }
    res.status(200).json({ msg: 'Registration request rejected.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint for generating ProgressMe token after registration approval
router.post('/generate-progressme-token', async (req, res) => {
  try {
    const { chatId, progressMePassword } = req.body;

    const registrationRequest = await TelegramRegistrationRequest.findOne({ where: { chatId } });

    if (!registrationRequest) {
      return res.status(404).json({ msg: 'Registration request not found.' });
    }

    if (registrationRequest.status !== 'approved') {
      return res.status(400).json({ msg: 'Registration request not yet approved or already rejected.' });
    }

    const email = registrationRequest.email;

    // console.log("credentials", email, progressMePassword);
    
    const authResult = await courseScraper.authenticateWithWebSocket(
      email,
      progressMePassword
    )
    // console.log("authResult", authResult);
    

    const {token, data} = authResult;
    const isProgressMeAuthSuccessful = token || null; // Replace with actual API call result

    if (!isProgressMeAuthSuccessful) {
      return res.status(400).json({ msg: 'Invalid ProgressMe credentials.' });
    }

    // Generate a new JWT for our service (this is the "encoded token")
    const payload = {
      user: {
        id: registrationRequest.id, // Using registration request ID as user ID for this token
        email: email,
        password: progressMePassword
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "5d" },
      async (err, token) => {
        if (err) throw err;

        // Store this new token as the apiToken in the registration request
        registrationRequest.apiToken = token;
        await registrationRequest.save();

        res.status(200).json({ encodedToken: token });
      },
    );
  } catch (err) {
    console.error("generating token error:", err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
