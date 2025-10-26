const express = require('express');
const router = express.Router();
const TelegramRegistrationRequest = require('../models/TelegramRegistrationRequest');
const bot = require('../config/telegramBot');
const crypto = require('crypto'); // Import crypto for token generation
const jwt = require('jsonwebtoken'); // Import jwt for token generation

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

    await bot.telegram.sendMessage(
      registrationChatId,
      `Your registration request has been approved! Please share your progressme email and password to get your access token. \n IMPORTANT: We Do NOT store your progressme email and password, and we do not have access to your progressme account. \n2. Do NOT share your access token with anyone else.`
    );
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

    // --- Placeholder for actual ProgressMe authentication ---
    // In a real scenario, you would make an API call to ProgressMe's authentication endpoint here.
    // Example: 
    // const progressMeAuthResponse = await axios.post('https://progressme.com/api/v1/auth/login', {
    //   email: email,
    //   password: progressMePassword
    // });
    // if (progressMeAuthResponse.status !== 200) {
    //   return res.status(400).json({ msg: 'Invalid ProgressMe credentials.' });
    // }
    // For now, we'll just simulate success.
    const isProgressMeAuthSuccessful = true; // Replace with actual API call result

    if (!isProgressMeAuthSuccessful) {
      return res.status(400).json({ msg: 'Invalid ProgressMe credentials.' });
    }

    // Generate a new JWT for our service (this is the "encoded token")
    const payload = {
      user: {
        id: registrationRequest.id, // Using registration request ID as user ID for this token
        email: email,
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
