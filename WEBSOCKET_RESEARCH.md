# WebSocket Support in Cloudflare Workers - Research Findings

## Summary
**Good News:** Cloudflare Workers **DO** support outgoing WebSocket connections to external servers!

## Key Findings

### 1. **WebSocket Client Connections ARE Supported**
Cloudflare Workers can establish WebSocket connections to external servers using:

1. **`new WebSocket(url)` Constructor**
   ```javascript
   const ws = new WebSocket('wss://example.com/socket');
   ws.addEventListener('open', () => {
     console.log('WebSocket connection established');
     ws.send('Hello, server!');
   });
   ws.addEventListener('message', (event) => {
     console.log('Message from server:', event.data);
   });
   ```

2. **Fetch API with `Upgrade: websocket` Header**
   ```javascript
   const response = await fetch(url, {
     headers: { 'Upgrade': 'websocket' }
   });
   const ws = response.webSocket;
   ws.accept();
   ```

### 2. **CPU Time Limits**
- **Standard Request**: 50ms CPU time limit (free), up to 30 seconds (paid)
- **WebSocket Connections**: The key question is whether WebSocket I/O operations count against CPU time

### 3. **Important Considerations**

#### Limitations:
- **Hibernation**: Outgoing WebSocket connections (`new WebSocket()`) do **NOT** support hibernation (only incoming connections via `ctx.acceptWebSocket()` do)
- **Port Restrictions**: Use standard ports (80 for `ws`, 443 for `wss`) to avoid connectivity issues
- **No Persistent State**: Workers themselves are stateless; use Durable Objects for state management

#### Advantages:
- **WebSocket Compression**: Supported out of the box
- **Durable Objects**: Can coordinate multiple WebSocket connections
- **Global Distribution**: Workers run on Cloudflare's edge network

## Implications for CourseScraperService

### Previous Assumption (INCORRECT):
We assumed the scraper couldn't work in Workers because:
- ❌ We thought WebSocket client connections weren't supported
- ❌ We assumed 30-second timeout would kill all operations

### New Understanding (CORRECT):
The scraper **COULD** potentially work in Workers if:
- ✅ WebSocket I/O operations don't count heavily against CPU time
- ✅ Each scraping operation completes within the request timeout
- ✅ We properly handle async WebSocket operations

### Critical Questions Remaining:
1. **Do WebSocket I/O operations count against CPU time?**
   - Network I/O typically doesn't count as heavily as CPU operations
   - WebSocket message handling might be treated as I/O-wait time

2. **How long can a single scraping operation take?**
   - Our scraper does: authenticate → get material → get book → copy course
   - Each step involves sending a message and waiting for response
   - Total time could be 5-15 seconds depending on ProgressMe server response

3. **Request Duration vs CPU Time**
   - Workers can run for longer durations if they're waiting on I/O
   - The 30-second limit is for CPU time, not total request duration
   - WebSocket operations might allow longer total durations

## Recommended Next Steps

### Option 1: Test in Cloudflare Workers (RECOMMENDED)
**Pros:**
- Keep everything in one platform
- No external service needed
- Leverage Cloudflare's global edge network
- Potentially simpler architecture

**Cons:**
- May hit CPU time limits for complex operations
- Need to refactor code for Workers environment
- Testing/debugging might be harder

**Action Items:**
1. Create a test Worker that:
   - Establishes WebSocket connection to ProgressMe
   - Performs authentication
   - Times the operation to see if it fits within limits
2. Monitor CPU time usage in production
3. If successful, migrate full scraper to Worker

### Option 2: External Scraper Service (FALLBACK)
Keep this as a backup plan if Workers prove unsuitable.

## Code Changes Needed

### 1. Update `courseScraper.ts` for Workers
```typescript
// Instead of importing 'ws' package:
// import WebSocket from 'ws';

// Use global WebSocket (available in Workers):
const ws = new WebSocket(url);

// Remove Node.js-specific code:
// - dns resolution (use Workers' built-in DNS)
// - process.on('SIGINT') cleanup
// - Puppeteer (already commented out)
```

### 2. Create Worker Endpoint
```typescript
// In src/routes/scraper.ts or new file
app.post('/api/scraper/copy-course', auth, async (c) => {
  const { email, password, courseUrl } = await c.req.json();
  
  // Use the scraper directly in Workers
  const result = await courseScraper.copyCourse(...);
  
  return c.json(result);
});
```

### 3. Add Timeout Handling
```typescript
// Wrap operations with timeout
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Operation timeout')), 25000)
);

const result = await Promise.race([
  courseScraper.copyCourse(...),
  timeoutPromise
]);
```

## Conclusion

Our previous analysis was based on an **incorrect assumption** that Cloudflare Workers don't support outgoing WebSocket connections. 

**They do!**

This means:
1. ✅ The `courseScraper.ts` can potentially run in Cloudflare Workers
2. ✅ We don't necessarily need an external service
3. ⚠️ We need to test actual CPU time usage to confirm viability
4. ⚠️ We need to refactor the code to use Workers' WebSocket API

**Recommendation:** Before building an external scraper service, we should **test the scraper in Cloudflare Workers** first. It might just work!

## References
- [Cloudflare Workers WebSockets Documentation](https://developers.cloudflare.com/workers/examples/websockets/)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Durable Objects WebSocket Best Practices](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)

