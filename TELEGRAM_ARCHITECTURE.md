# Telegram Bot Architecture & Initialization Guide

## Overview

The Paper Dash Telegram bot uses **Cloudflare Durable Objects** for stateful chat session management. This document clarifies how the bot is initialized, started, and how it processes user interactions.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Telegram Servers                             │
│                                                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    (Webhook POST /telegram-webhook)
                               │
                    ┌──────────▼──────────┐
                    │  Cloudflare Worker  │
                    │   (Main Entry)      │
                    │                     │
                    │ - Extract chat ID   │
                    │ - Route to DO       │
                    └──────────┬──────────┘
                               │
               (stub.fetch() with Telegram update)
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                              │
        ▼                                              ▼
   ┌─────────────────────┐              ┌─────────────────────┐
   │  Durable Object 1   │              │  Durable Object N   │
   │  (Chat ID: 12345)   │              │  (Chat ID: 67890)   │
   │                     │              │                     │
   │ ✓ Telegraf instance │              │ ✓ Telegraf instance │
   │ ✓ Bot handlers      │              │ ✓ Bot handlers      │
   │ ✓ Chat state        │              │ ✓ Chat state        │
   │ ✓ Persistent store  │              │ ✓ Persistent store  │
   └─────────────────────┘              └─────────────────────┘
```

---

## Initialization Flow

### 1. **Worker Startup** (src/index.ts)

```typescript
// Worker initializes ONCE when deployed
const app = new Hono<{ Bindings: Env }>();

// Register routes
app.route("/api/telegram", telegramRoutes);

// Export app
export default app;

// Export Durable Object class for Wrangler
export { TelegramBotDurableObject };
```

**Key Point:** The bot is NOT instantiated in the Worker. The Worker is stateless and only routes requests.

### 2. **Webhook Endpoint** (src/index.ts, lines 134-167)

```typescript
app.post('/telegram-webhook', async (c) => {
  // 1. Parse Telegram update
  const update = await c.req.json();
  
  // 2. Extract chat ID (unique identifier for each user)
  const chatId = update.message?.chat.id 
    || update.callback_query?.message?.chat.id
    || update.my_chat_member?.chat.id;
  
  // 3. Get Durable Object stub for this chat
  //    Creates or retrieves existing DO instance
  const id = c.env.TELEGRAM_BOT_DO.idFromName(chatId.toString());
  const stub = c.env.TELEGRAM_BOT_DO.get(id);
  
  // 4. Forward request to DO
  const doResponse = await stub.fetch(doRequest);
  
  // 5. Return response to Telegram
  return doResponse;
});
```

**Key Point:** This is where the magic happens - each chat gets its own Durable Object instance.

### 3. **Durable Object Initialization** (TelegramBotDurableObject.ts, lines 23-46)

```typescript
constructor(state: DurableObjectState, env: Env) {
  this.state = state;           // Persistent storage for this DO
  this.env = env;               // Environment variables
  
  // Initialize collections for this chat
  this.userState = new Map();               // Current conversation step
  this.editableMessagesState = new Map();   // Message IDs for editing
  
  // Initialize Drizzle DB (connects to D1)
  this.drizzleDb = getDrizzleDb(this.env.paper_dash_db);
  
  // ⭐ CREATE TELEGRAF INSTANCE (unique per DO)
  this.bot = new Telegraf(this.env.TELEGRAM_BOT_TOKEN);
  
  // ⭐ REGISTER ALL BOT HANDLERS
  this.initialiseBot();
  
  // Restore previous state from persistent storage
  this.state.blockConcurrencyWhile(async () => {
    const storedState = await this.state.storage.get("userState");
    if (storedState) {
      this.userState = new Map(storedState);
    }
  });
}
```

**Critical Points:**
- **One instance per chat**: Each chat gets its own Telegraf instance
- **Handlers registered once**: `initialiseBot()` sets up all command/action handlers
- **State persistence**: Previous conversation state is restored from Durable Object storage
- **NOT connected to webhook**: The instance doesn't have its own webhook; it only handles routed requests

### 4. **Bot Initialization** (TelegramBotDurableObject.ts, lines 48-365)

```typescript
initialiseBot() {
  // Register all command handlers
  this.bot.start((ctx) => { /* handle /start */ });
  this.bot.command('help', (ctx) => { /* handle /help */ });
  this.bot.command('register', (ctx) => { /* handle /register */ });
  
  // Register action handlers (button callbacks)
  this.bot.action('dashboard', (ctx) => { /* handle button */ });
  this.bot.action(/approve_reg_(.+)/, (ctx) => { /* approve registration */ });
  
  // Register text handlers
  this.bot.on('text', async (ctx) => { /* handle messages */ });
  
  // Set bot commands menu
  this.bot.telegram.setMyCommands([...]);
}
```

**Key Point:** Handlers are registered ONCE when DO is created, not on every message.

### 5. **Request Handling** (TelegramBotDurableObject.ts, lines 368-459)

```typescript
fetch = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Route 1: Handle Telegram webhook updates
  if (path === "/telegram-webhook") {
    const update = await request.json();
    
    // Create mock response object for Telegraf
    const telegrafRes = { /* ... */ };
    
    // ⭐ PROCESS UPDATE WITH BOT
    await this.bot.handleUpdate(update, telegrafRes);
    
    // Persist state changes
    await this.state.storage.put("userState", Array.from(this.userState.entries()));
    
    return new Response(/*...*/);
  }
  
  // Route 2: Handle admin signals (approval, rejection, etc.)
  else if (path === "/signal-approval") {
    const { chatId, email } = await request.json();
    
    // Send message directly to user's chat
    await this.bot.telegram.sendMessage(chatId, "Your request approved!");
    
    return new Response("OK", { status: 200 });
  }
  
  // Similar routes for /signal-rejection, /signal-botmaster-notification, etc.
};
```

**Key Points:**
- `/telegram-webhook`: Processes incoming user messages/button clicks
- `/signal-*`: Admin-triggered actions (approval, rejection, notifications)
- Both use the same Telegraf instance to send messages

---

## User Interaction Flow

### Scenario: User sends /start command

```
1. User sends /start in Telegram chat
   └─> Telegram servers receive message

2. Telegram sends POST to /telegram-webhook with:
   {
     "update_id": 12345,
     "message": {
       "message_id": 1,
       "chat": { "id": 999, "type": "private" },
       "text": "/start",
       "date": 1234567890,
       ...
     }
   }

3. Worker extracts chat ID (999)
   └─> c.env.TELEGRAM_BOT_DO.idFromName("999")
   └─> Retrieves or creates Durable Object for chat 999

4. Worker forwards request to DO
   └─> DO.fetch(request_with_update)

5. DO receives request
   └─> Parses update
   └─> Calls this.bot.handleUpdate(update, response)
   └─> Telegraf finds matching handler (this.bot.start)
   └─> Handler executes: ctx.reply("Welcome! Please choose...")

6. Telegraf uses this.bot.telegram.sendMessage() internally
   └─> Message sent back to Telegram
   └─> User sees reply in chat

7. DO persists state for next message
   └─> Saves conversation progress to storage

8. Response returned to Worker → Telegram
```

---

## Key Architecture Decisions

### ✅ **Why Wrap the Class (Not Just Instance) in Durable Object?**

**Question:** Why is `TelegramBotDurableObject` a class that Cloudflare instantiates, rather than just exporting a bot instance?

**Answer:**

1. **Per-Chat Isolation**
   ```typescript
   // ✅ CORRECT: Each chat gets its own DO instance
   const id = c.env.TELEGRAM_BOT_DO.idFromName(chatId.toString());
   const stub = c.env.TELEGRAM_BOT_DO.get(id);
   
   // Each stub has its own:
   // - Telegraf instance
   // - Handler functions
   // - State storage
   // - Database connections
   ```

2. **Persistent State Storage**
   ```typescript
   // Each DO has its own storage
   await this.state.storage.put("userState", data);
   
   // This state persists across requests for the same chat
   // Only this DO can access chat_id=999's data
   ```

3. **Concurrency & Safety**
   ```typescript
   // Cloudflare ensures only ONE request processes at a time per DO
   await this.state.blockConcurrencyWhile(async () => {
     // Only one request for chat 999 runs concurrently
   });
   ```

4. **Resource Efficiency**
   - Inactive chats don't consume memory (DOs are "cold")
   - Active chats get dedicated execution
   - No need to store millions of Telegraf instances in memory

### ✅ **Why Are Actions in the fetch() Function?**

**Question:** Why do `/signal-approval`, `/signal-rejection`, etc. live in `fetch()` instead of using command handlers?

**Answer:**

1. **Different Source**
   ```typescript
   // Command handlers (in initialiseBot):
   // - Triggered by USER sending messages
   // - Use Telegram chat context
   
   // Signal handlers (in fetch):
   // - Triggered by ADMIN API calls
   // - Come from Paper Dash Worker, not Telegram
   ```

2. **Two-Way Communication**
   ```
   USER                    ADMIN
      │                      │
      └──> Telegram ──> Worker
                          │
                    DO.fetch("/telegram-webhook")
                          │
                       Bot handles user message
                       
   
   USER                    ADMIN
      │                      │
      │                 /api/telegram/approve-request
      │                      │
      │             Worker receives admin action
      │                      │
      │             DO.fetch("/signal-approval")
      │                      │
      │           Bot sends message to user
      └────────────────────────────────
   ```

3. **Example Flow:**
   ```typescript
   // User sends registration request
   this.bot.action('register', async (ctx) => {
     // Save request to database
     // Send "pending approval" message to user
   });
   
   // Admin sees pending request in Paper Dash UI
   // Admin clicks "Approve" button
   POST /api/telegram/approve-request (calls the main Worker)
   
   // Worker routes to the right DO
   c.env.TELEGRAM_BOT_DO.get(id).fetch("/signal-approval")
   
   // DO receives signal, sends approval message to user
   await this.bot.telegram.sendMessage(
     chatId,
     "Your request was approved!"
   );
   ```

---

## Bot Lifecycle

### When is the Bot Created?

**Answer:** When the Durable Object is first instantiated by Cloudflare

```typescript
// FIRST request for chat_id=999 arrives
// ↓
// Cloudflare checks: "Do I have a DO with id=name('999')?"
// ↓
// NOT found → Create new instance
// ↓
// constructor() runs
// ↓
// this.bot = new Telegraf(...) ← BOT IS BORN HERE
// ↓
// initialiseBot() runs ← HANDLERS REGISTERED
// ↓
// fetch() handles first request
```

**Answer:** The bot is created **once per DO** (once per unique chat ID), then reused for all subsequent messages from that chat.

### When is the Bot Destroyed?

**Answer:** Cloudflare destroys it based on inactivity

```typescript
// Last request for chat_id=999 completed
// ↓
// Time passes (DO idle timeout ~15 minutes)
// ↓
// Cloudflare thinks: "This DO hasn't had requests, dispose of it"
// ↓
// DO is unloaded from memory
// ↓
// Next request for chat_id=999 arrives
// ↓
// Cloudflare: "I don't have this DO anymore, create new"
// ↓
// constructor() runs again
// ↓
// State is restored from this.state.storage
// ↓
// Ready to handle request
```

### Does the Bot Stay Running?

**Answer:** NO - The bot doesn't "run" continuously

```
OLD UNDERSTANDING (❌ WRONG):
  Bot is deployed
  └─> Bot continuously listens for webhooks
  └─> Bot processes messages in background
  
ACTUAL BEHAVIOR (✅ CORRECT):
  Message arrives from Telegram
  └─> Worker receives webhook POST
  └─> Worker routes to appropriate DO
  └─> DO's fetch() method executes
  └─> Bot processes message synchronously
  └─> Response sent back
  └─> Execution ends (DO idle)
```

**Key Insight:** Durable Objects are **not** always-on servers. They only execute when receiving requests.

---

## How Multiple Chats Work

### Scenario: Two users, both sending messages

```
User A (Chat ID: 111)         User B (Chat ID: 222)
    │                             │
    │ Sends /help                │ Sends /start
    │                             │
    └────────> Telegram ◄─────────┘
               (incoming webhooks)
               
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
    Worker extracts chatId
       │               │
       111             222
       │               │
       ▼               ▼
   TELEGRAM_BOT_DO     TELEGRAM_BOT_DO
   .idFromName("111")  .idFromName("222")
       │               │
       ▼               ▼
   DO Instance 1   DO Instance 2
   (separate)      (separate)
   
   - bot instance 1    - bot instance 2
   - state: userA      - state: userB
   - handlers          - handlers
   
       │               │
       ▼               ▼
   Process /help   Process /start
   handler runs    handler runs
       │               │
       └───────┬───────┘
               │
          Telegram
     (User A & B each get their reply)
```

**Key Point:** Each chat is completely independent. DO A's `userState` doesn't affect DO B's `userState`.

---

## Persistent State Management

### How State Persists

```typescript
// When a message arrives
fetch = async (request: Request) => {
  const update = await request.json();
  
  // Process message
  await this.bot.handleUpdate(update, telegrafRes);
  
  // ⭐ PERSIST STATE
  await this.state.storage.put(
    "userState",
    Array.from(this.userState.entries()) // Convert Map to Array
  );
};

// When DO is recreated
constructor(state: DurableObjectState, env: Env) {
  // ⭐ RESTORE STATE
  const storedUserState = await this.state.storage.get("userState");
  if (storedUserState) {
    this.userState = new Map(storedUserState);
  }
};
```

### What is Persisted?

✅ **Persisted:**
- User conversation state (awaiting_email, awaiting_password, etc.)
- Editable message IDs (for updating bot messages)
- Custom user data stored during conversation

❌ **NOT Persisted:**
- Telegraf instance itself (recreated on boot)
- Handler functions (re-registered on boot)
- Temporary cache/variables

### Storage Limits

- 128 MB per Durable Object
- Suitable for chat state, not large files
- D1 Database used for permanent records

---

## Troubleshooting

### Bot Doesn't Respond

**Checklist:**
1. Is webhook URL configured in Telegram?
   ```bash
   POST https://api.telegram.org/bot{TOKEN}/setWebhook
   url: https://your-worker.workers.dev/telegram-webhook
   ```

2. Is DO binding configured in wrangler.toml?
   ```toml
   [[durable_objects.bindings]]
   name = "TELEGRAM_BOT_DO"
   class_name = "TelegramBotDurableObject"
   ```

3. Is `TelegramBotDurableObject` exported in src/index.ts?
   ```typescript
   export { TelegramBotDurableObject };
   ```

4. Check logs in Cloudflare dashboard for errors

### State Not Persisting

**Check:**
```typescript
// Make sure state is being saved
await this.state.storage.put("userState", data);

// Make sure state is being restored
const stored = await this.state.storage.get("userState");
if (!stored) console.warn("No state found!");
```

### Bot Slow to Respond

**Reason:** DO is cold (first request)
- First request to a chat takes 100-200ms extra (cold start)
- Subsequent requests are fast (warm)
- This is expected behavior

---

## Summary

| Aspect | Details |
|--------|---------|
| **Bot Type** | Class implementing Durable Object interface |
| **Instantiation** | One per unique chat ID, on-demand |
| **Lifespan** | Idle ~15 min, then recreated on next request |
| **State Storage** | Per-DO persistent key-value store |
| **Handlers** | Registered once in constructor, reused for all messages |
| **Webhook** | Single endpoint in Worker routes to appropriate DO |
| **Scalability** | Scales to millions of chats (separate DOs) |
| **Concurrency** | One request per DO at a time |

---

## Further Reading

- [Cloudflare Durable Objects Documentation](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)
- [Telegraf Bot Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)


