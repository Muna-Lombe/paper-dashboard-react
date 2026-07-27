# Scraper Architecture Analysis

## Current Situation

The application currently has a **Course Scraper Service** that:

1. **Uses WebSocket connections** to communicate directly with ProgressMe's WebSocket endpoints
2. **Also has Puppeteer code** (commented out) for browser automation as fallback
3. **Imports courses** from ProgressMe into Paper Dash via shared material URLs
4. **Communicates via WebSocket protocol** with ProgressMe's WebSocket servers at:
   - `wss://proxy.progressme.ru/websocket`
   - `wss://progressme.ru/ws/WebSockets/SocketHandler.ashx`

## The Core Question: Why External Scraper?


### Problem with Current Implementation

**Cloudflare Workers CAN run WebSocket code, BUT:**

1. **Worker Execution Time Limit**: Workers timeout after 30 seconds (CPU time)
   - WebSocket connections need to stay open for authentication and multiple requests
   - Course scraping involves multiple sequential WebSocket calls (authenticate → get book → copy book)
   - This can easily exceed the 30-second timeout

2. **Long-lived Connections**: WebSocket implementation in Workers is experimental
   - Workers are designed for request-response, not persistent connections
   - Maintaining WebSocket state across multiple operations is problematic

3. **Memory Constraints**: Workers have ~128MB memory limit
   - Need to keep WebSocket connections alive
   - Store authentication tokens and state
   - Handle multiple concurrent scraping operations

4. **CAPCHA Handling**: The old Puppeteer code is meant to handle CAPTCHAs
   - Currently commented out, showing it was abandoned
   - CAPTCHAs would require human intervention or advanced solving
   - Not feasible in Workers environment

The current `courseScraper.js` has Puppeteer imports commented out:

```javascript
// const puppeteer = require("puppeteer-extra");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// const randomUseragent = require("random-useragent");
```

This shows the scraper was originally designed for browser automation but switched to WebSocket approach.

---

## Architecture Options

### Option 1: ❌ **Keep Scraper in Worker (Current - Problematic)**

**Current Status:**
- WebSocket connections are technically possible in Workers
- BUT the implementation is problematic for long-running scraping

**Pros:**
- All logic in one place
- Technically possible with WebSocket API

**Cons:**
- ❌ 30-second timeout limit for Workers
- ❌ WebSocket scraping needs > 30 seconds (multiple calls to ProgressMe)
- ❌ Persistent connection state management is complex
- ❌ CAPCHA handling still commented out and unfeasible
- ❌ Worker will timeout during scraping operations
- ❌ Not reliable for production

**Verdict:** **Not viable for production**

---

### Option 2: ✅ **External Scraper Service** (Recommended)

**Architecture:**
```
Paper Dash Worker
        ↓
    [API Route]
        ↓ (HTTP Request)
    External Service
      (Node.js/Python)
        ↓
    WebSocket + Scraping
    (with long-lived connections)
        ↓
    ProgressMe Platform
        ↓
    Course Data
        ↓
    Response to Worker
        ↓
    Save to Database
```

**Pros:**
- ✅ No 30-second timeout limit
- ✅ Can maintain long-lived WebSocket connections
- ✅ Can handle CAPTCHAs (if needed)
- ✅ No Worker time/memory constraints
- ✅ Scalable (multiple scrapers)
- ✅ Better separation of concerns
- ✅ Can be deployed independently
- ✅ Reliable for production use
- ✅ Can implement retry logic for failed scrapes

**Cons:**
- Requires separate service infrastructure
- Network latency between services
- Additional deployment complexity
- Separate monitoring/logging

**Verdict:** **Best for production**

---

### Option 3: ⚠️ **Async Queue-based Scraper in Worker** (Compromise)

**Instead of synchronous scraping, use a queue system:**

```typescript
// Queue-based approach - works around timeout
app.post('/api/scraper/queue-course', auth, async (c) => {
  const { url } = await c.req.json();
  
  // Don't scrape directly
  // Just queue the request and return immediately
  await db.insert(scrapeJobs).values({
    url,
    status: 'pending',
    userId: user.id,
  });
  
  return c.json({ 
    msg: 'Scrape job queued',
    jobId: job.id
  });
});

// Separate background worker processes the queue
// (external service or cron job)
```

**Pros:**
- ✅ Works in Workers
- ✅ Returns immediately (no timeout)
- ✅ Decouples scraping from request

**Cons:**
- ❌ Still needs external service to process queue
- ❌ Adds complexity (queue management, background jobs)
- ❌ Delayed results (user waits for import)
- ❌ Essentially becomes Option 2 anyway

**Verdict:** **Still requires external service, adds unnecessary complexity**

---

### Option 4: 🎯 **Hybrid Approach** (Best Balance)

**For Paper Dash specifically:**

**Phase 1: Simple Course Management**
```typescript
// Users manually add courses via API
POST /api/courses
{
  "title": "Course Name",
  "description": "...",
  "pdfUrl": "https://...",  // Direct PDF link
  "courseBlocks": [...]
}
```
- No scraping needed
- Users/teachers provide content directly
- Works perfectly in Workers

**Phase 2: Optional External Scraper**
```
If ProgressMe integration is needed:
- Deploy separate scraper service (Node.js)
- Paper Dash calls it via webhook
- Scraper returns course data
- Paper Dash saves to DB
```

**Verdict:** **Most practical for MVP**

---

## Recommendation: Architecture Decision

### Current Problem
The scraper tries to solve this:
> "Teachers want to import courses from ProgressMe into Paper Dash"

### Technical Reality

**Why Cloudflare Workers aren't suitable for scraping:**

1. **30-second timeout** is a hard limit
   - ProgressMe WebSocket scraping needs multiple sequential calls
   - Each call takes several seconds
   - Total time easily exceeds timeout
   - Worker gets terminated mid-operation

2. **Designed for request-response**
   - Workers are stateless by design
   - Long-lived connections (WebSocket, keep-alive) go against architecture
   - Each request starts fresh

3. **Current scraper won't work in production**
   - Already abandoned Puppeteer approach (code commented out)
   - WebSocket approach will timeout on real courses
   - No error handling for incomplete scrapes

### Proposed Direction

**Two valid paths forward:**

#### Path A: MVP without ProgressMe Integration (Recommended for now)
- ✅ Keep native course management working
- ✅ Users create/upload courses directly in Paper Dash
- ✅ Upload PDFs/content via `/api/courses` POST
- ✅ Full course management in app
- ✅ Ship faster, get to users sooner
- ✅ Simpler codebase
- 📝 Document ProgressMe integration for Phase 2

#### Path B: Add External Scraper Service (for future)
If ProgressMe import is critical feature:
1. Create separate Node.js service (can be Docker, Heroku, EC2)
2. Service handles WebSocket scraping without time limits
3. Paper Dash calls scraper via HTTP API
4. Scraper returns course data
5. Paper Dash saves to database
6. Completely decoupled, independently deployable

**Decision:** Path A for MVP, Path B for Phase 2 (if needed)

---

## Decision Matrix

| Feature | MVP (No Scraper) | With External Service | With Puppeteer |
|---------|------------------|----------------------|-----------------|
| **Deployment Complexity** | ⭐ | ⭐⭐⭐ | ❌ Can't Deploy |
| **Cost** | $ | $$$ | N/A |
| **Time to MVP** | 1 day | 3 weeks | N/A |
| **ProgressMe Import** | ❌ | ✅ | ❌ Won't Work |
| **Direct Course Upload** | ✅ | ✅ | ✅ |
| **Worker Compatibility** | ✅ | ✅ | ❌ Breaks Worker |
| **Scalability** | ✅ | ✅ | N/A |
| **Maintenance** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Recommended Action

### For Now: **Option 3 - Remove Puppeteer-based Scraper**

1. **Delete broken scraper code:**
   - `services/courseScraper.js`
   - Scraper routes from `src/routes/scraper.ts` that use Puppeteer

2. **Keep working functionality:**
   - Manual course creation via `POST /api/courses`
   - Course import via direct URLs (without automation)
   - Course management endpoints

3. **Mark as future work:**
   ```
   TODO: ProgressMe Integration
   - Implement external sync service (separate Node.js app)
   - When user adds ProgressMe course URL:
     1. Validate URL format
     2. Queue sync job on external service
     3. Poll for completion
     4. Import course data into Paper Dash
   ```

---

## Implementation Path

### Step 1: Clean Up (1 hour)
```bash
# Remove broken scraper
rm services/courseScraper.js

# Update scraper routes to remove Puppeteer dependencies
# Keep only: validate-url, import-course (manual)
```

### Step 2: Keep Working Features (Already Done)
- ✅ Course CRUD operations
- ✅ Course search & filtering
- ✅ Course blocks & structure
- ✅ User progress tracking

### Step 3: Document Future Integration (1 hour)
- Create `PROGRESSME_INTEGRATION.md`
- Document how to implement external scraper if needed
- Provide API contract

---

## Files to Remove/Modify

```
❌ DELETE:
services/courseScraper.js - Entire file

🔨 MODIFY:
src/routes/scraper.ts - Remove Puppeteer-based endpoints
  - Remove: authenticateWithProgressMe()
  - Remove: copySharedCourse()
  - Keep: validateUrl() (simple regex)
  - Keep: importCourse() (manual)

✅ KEEP:
src/routes/courses.ts - All functionality
src/services/courseSearchService.ts - All functionality
drizzle/schema.ts - Course tables
```

---

## Alternative: If ProgressMe Import is Critical

**Then:** Implement external service properly:

1. **Create separate Node.js service** (Standalone deployment)
   ```
   paper-dash-scraper/
     ├── src/
     │   ├── scraper.ts (Puppeteer logic)
     │   ├── queue.ts (Job queue)
     │   └── api.ts (REST API)
     ├── docker-compose.yml
     ├── Dockerfile
     └── package.json
   ```

2. **Paper Dash calls scraper service:**
   ```typescript
   POST /api/scraper/import
   {
     "progressMeUrl": "https://progressme.ru/...",
     "userEmail": "teacher@example.com"
   }
   ```

3. **Scraper service:**
   - Receives request
   - Scrapes ProgressMe using Puppeteer
   - Returns course data
   - Paper Dash saves to DB

---

## Conclusion

**The Question:** "Why do we want to implement an external scraper?"

**The Answer:** We don't (for MVP)

**Better Approach:**
1. Users create/upload courses directly in Paper Dash
2. Focus on native features and UX
3. Add ProgressMe integration as optional Phase 2

**This unblocks:**
- ✅ Deployment to Cloudflare Workers
- ✅ Completes the MVP
- ✅ Removes technical debt
- ✅ Simplifies architecture

---

**Recommendation: Skip the scraper for now. Focus on making Paper Dash's native course management excellent.**

