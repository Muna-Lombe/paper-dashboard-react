const express = require('express');
const router = express.Router();
const TelegramRegistrationRequest = require('../models/TelegramRegistrationRequest');
const bot = require('../config/telegramBot');
const crypto = require('crypto'); // Import crypto for token generation

// Endpoint for Telegram bot to send registration request data
router.post('/register-request', async (req, res) => {
  try {
    const { chatId, email, reasons, useCase } = req.body;

    // Check if a request from this chat ID already exists
    let existingRequest = await TelegramRegistrationRequest.findOne({ where: { chatId } });
    if (existingRequest) {
      return res.status(400).json({ msg: 'Registration request already exists for this chat ID.' });
    }

    const registrationRequest = await TelegramRegistrationRequest.create({
      chatId,
      email,
      reasons,
      useCase,
      status: 'pending',
    });

    // Notify bot master (you can implement a more sophisticated notification here)
    const botMasterChatId = process.env.TELEGRAM_BOT_MASTER_CHAT_ID;
    if (botMasterChatId) {
      await bot.telegram.sendMessage(
        botMasterChatId,
        `New registration request from ${email} (Chat ID: ${chatId}). Reasons: ${reasons}. Use Case: ${useCase}. Please review and approve/reject with /approve ${chatId} or /reject ${chatId}.`
      );
    }

    res.status(201).json({ msg: 'Registration request submitted successfully.', requestId: registrationRequest.id });
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

    // Generate API token
    const apiToken = crypto.randomBytes(32).toString('hex');

    registrationRequest.status = 'approved';
    registrationRequest.apiToken = apiToken;
    await registrationRequest.save();

    // Notify the user via Telegram bot
    await bot.telegram.sendMessage(
      registrationChatId,
      `Your registration request has been approved! Your API token is: ${apiToken}. You can now use this token for scraper access.`
    );

    res.status(200).json({ msg: 'Registration request approved and API token generated.', apiToken });
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

    res.status(200).json({ msg: 'Registration request rejected.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
