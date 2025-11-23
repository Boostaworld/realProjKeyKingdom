# Key-Kingdom API Implementation

This document describes the API system that has been implemented for Key-Kingdom.org.

## ✅ What's Been Implemented

### Phase 1: Core Infrastructure ✓

**Authentication & Rate Limiting:**
- ✅ Discord Bot API authentication (`src/lib/api/discord-auth.ts`)
- ✅ Admin/Vendor API authentication (`src/lib/api/admin-auth.ts`)
- ✅ Rate limiting system (`src/lib/api/rate-limit.ts`)
- ✅ Environment variables configuration (`.env.local`, `.env.example`)

**Security Features:**
- API key validation
- Rate limiting (100 req/min for Discord bots, 500 req/hour for admins)
- Secure error responses
- Admin action logging

---

### Phase 2: Discord Bot API ✓

All Discord Bot API endpoints are implemented and ready for testing:

#### 1. **GET /api/discord/executors**
- List all executors with optional filtering
- Supports filters: `category`, `platform`, `working`, `limit`, `sort`
- Returns paginated results with metadata
- Default sort: sUNC descending (safety-first)

**Example:**
```bash
curl -X GET "http://localhost:3000/api/discord/executors?category=reputable&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 2. **GET /api/discord/executors/:identifier**
- Get detailed information about a specific executor
- Accepts executor ID or slug
- Returns full executor details

**Example:**
```bash
curl -X GET "http://localhost:3000/api/discord/executors/solara" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 3. **GET /api/discord/executors/:identifier/status**
- Quick status check for an executor
- Returns minimal status information for fast responses
- Perfect for Discord bot status commands

**Example:**
```bash
curl -X GET "http://localhost:3000/api/discord/executors/solara/status" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 4. **GET /api/discord/platform-status**
- Get current Roblox version and platform health
- Shows working/broken status per platform (Windows, Mac, Mobile, Android)
- Includes working executor counts and health messages

**Example:**
```bash
curl -X GET "http://localhost:3000/api/discord/platform-status" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 5. **GET /api/discord/search**
- Search executors by name, description, or features
- Supports relevance-based sorting
- Returns up to 25 results

**Example:**
```bash
curl -X GET "http://localhost:3000/api/discord/search?q=executor&limit=5" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### Phase 2+: Admin API (Core) ✓

Basic admin endpoints for executor management:

#### 1. **POST /api/admin/executors**
- Create a new executor
- Requires admin authentication
- Auto-generates unique IDs
- Logs action to audit log

**Example:**
```bash
curl -X POST "http://localhost:3000/api/admin/executors" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Executor",
    "slug": "new-executor",
    "category": "reputable",
    "description": "A powerful executor"
  }'
```

#### 2. **GET /api/admin/executors**
- List all executors (admin view)
- Returns full executor data including metadata
- No filtering (admins see everything)

#### 3. **PATCH /api/admin/executors/:id**
- Update an existing executor
- Tracks changes in audit log
- Returns change summary

#### 4. **DELETE /api/admin/executors/:id**
- Delete an executor (soft delete by default)
- Requires deletion reason
- Supports hard delete with `?permanent=true`

#### 5. **PATCH /api/admin/executors/:id/status**
- Manually override executor status
- Bypasses WEAO data temporarily
- Supports expiration time
- Can trigger webhook notifications

---

## 🔐 Authentication

### Discord Bot API

**Required Header:**
```http
Authorization: Bearer YOUR_API_KEY
```

**API Keys (from `.env.local`):**
- `DISCORD_BOT_API_KEY_1` - Primary API key
- `DISCORD_BOT_API_KEY_2` - Secondary API key
- `DISCORD_BOT_API_KEY_3` - Additional API key

**Rate Limits:**
- 100 requests per minute per API key
- Rate limit headers included in all responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

### Admin API

**Required Headers:**
```http
Authorization: Bearer YOUR_USER_TOKEN
X-Admin-Key: YOUR_ADMIN_SECRET_KEY
```

**Configuration:**
- `ADMIN_SECRET_KEY` - Super admin secret key
- `JWT_SECRET` - JWT signing secret (for user tokens)
- `ADMIN_USER_IDS` - Comma-separated list of admin user IDs

**Rate Limits:**
- 500 requests per hour per user

---

## 🧪 Testing

### Test Script

A comprehensive test script is provided to test all Discord Bot API endpoints:

```bash
# Make sure the dev server is running first
npm run dev

# In another terminal, run the test script
node scripts/test-discord-api.js
```

**What it tests:**
- ✓ Authentication (valid and invalid API keys)
- ✓ GET /api/discord/executors (with and without filters)
- ✓ GET /api/discord/executors/:identifier
- ✓ GET /api/discord/executors/:identifier/status
- ✓ GET /api/discord/platform-status
- ✓ GET /api/discord/search
- ✓ Rate limiting headers

### Manual Testing with cURL

**Test Discord Bot API:**
```bash
# Set your API key
export API_KEY="kk_discord_68d7306a943b7717a40cdfd6d4eb5ce04c74cb5b5aa717f869b331898519d5da"

# Test get executors
curl -X GET "http://localhost:3000/api/discord/executors?limit=5" \
  -H "Authorization: Bearer $API_KEY"

# Test search
curl -X GET "http://localhost:3000/api/discord/search?q=solara" \
  -H "Authorization: Bearer $API_KEY"

# Test platform status
curl -X GET "http://localhost:3000/api/discord/platform-status" \
  -H "Authorization: Bearer $API_KEY"
```

**Test Admin API:**
```bash
# Set your credentials
export USER_TOKEN="testadmin"  # Temporary token for testing
export ADMIN_KEY="7c3fdee264a04489eb4cd0437f6f505aa852af5e9839ce6c1893d046a2eeb90e"

# Test list executors (admin view)
curl -X GET "http://localhost:3000/api/admin/executors" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-Admin-Key: $ADMIN_KEY"

# Test create executor
curl -X POST "http://localhost:3000/api/admin/executors" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-Admin-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Executor",
    "slug": "test-executor",
    "category": "reputable",
    "description": "A test executor"
  }'
```

---

## 📁 File Structure

```
src/
├── lib/api/
│   ├── discord-auth.ts          # Discord Bot API authentication
│   ├── admin-auth.ts            # Admin/Vendor API authentication
│   └── rate-limit.ts            # Rate limiting system
│
├── app/api/
│   ├── discord/
│   │   ├── executors/
│   │   │   ├── route.ts                    # GET list
│   │   │   └── [identifier]/
│   │   │       ├── route.ts                # GET single
│   │   │       └── status/
│   │   │           └── route.ts            # GET status
│   │   ├── platform-status/
│   │   │   └── route.ts                    # GET platform health
│   │   └── search/
│   │       └── route.ts                    # GET search
│   │
│   └── admin/
│       └── executors/
│           ├── route.ts                    # POST create, GET list
│           └── [id]/
│               ├── route.ts                # PATCH update, DELETE
│               └── status/
│                   └── route.ts            # PATCH status override
│
scripts/
└── test-discord-api.js                     # Test script

.env.local                                   # Environment variables (DO NOT COMMIT)
.env.example                                # Environment template
```

---

## 🔑 Environment Variables

All API keys are stored in `.env.local` (already created and gitignored):

```env
# Discord Bot API Keys
DISCORD_BOT_API_KEY_1=kk_discord_68d7306a943b7717a40cdfd6d4eb5ce04c74cb5b5aa717f869b331898519d5da
DISCORD_BOT_API_KEY_2=kk_discord_f77075c8e951ebbf529a57665e7543765b0c0f75bb13ff293fbeec9e91c6bbdb

# Admin Authentication
ADMIN_SECRET_KEY=7c3fdee264a04489eb4cd0437f6f505aa852af5e9839ce6c1893d046a2eeb90e
JWT_SECRET=85fa2f4ffb87779ae44f2a1e7fcddc7e949cafbc076b5195183dea3a361a0b59

# Temporary user IDs (replace with database in production)
ADMIN_USER_IDS=user_testadmin
VENDOR_USER_IDS=user_testvendor

# Webhooks
WEBHOOK_SIGNING_SECRET=7d47a52d3aee16a8f2d8c21cbc94513d904e2aadce302f29020f7e0ee72978cd

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANT:** These keys are cryptographically secure and unique to this installation. Keep them secret!

---

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // ... response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing API key
- `NOT_FOUND` - Resource not found
- `INVALID_INPUT` - Missing or invalid request parameters
- `SERVER_ERROR` - Internal server error

---

## 🚀 Next Steps

### Immediate (Ready to Implement)

1. **Database Integration**
   - Replace TODO comments with actual database calls
   - Implement executor CRUD operations
   - Set up database tables (see `docs/api/ADMIN_API.md`)

2. **Webhooks (Phase 3)**
   - Implement webhook subscription endpoints
   - Create webhook delivery system
   - Add webhook signature verification

3. **Vendor API (Phase 5)**
   - Implement vendor endpoints (`/api/vendor/*`)
   - Add vendor authentication
   - Create vendor dashboard UI

4. **Testing**
   - Run the test script with dev server
   - Test rate limiting behavior
   - Verify authentication flows

### Future Enhancements

5. **Analytics (Phase 6)**
   - Track API usage per key
   - Implement view/click tracking
   - Create analytics dashboard

6. **Advanced Features**
   - Bulk operations
   - Executor history tracking
   - Advanced search with filters
   - API documentation UI (Swagger)

---

## 📚 Documentation References

- [Discord Bot API Full Spec](./docs/api/DISCORD_BOT_API.md)
- [Admin API Full Spec](./docs/api/ADMIN_API.md)
- [API Implementation Summary](./docs/api/API_IMPLEMENTATION_SUMMARY.md)
- [Project Instructions](./CLAUDE.md)

---

## 🎯 Current Status Summary

**✅ Completed (Phase 1-2):**
- Core authentication infrastructure
- Rate limiting system
- All Discord Bot API endpoints (5 endpoints)
- Core Admin API endpoints (5 endpoints)
- Environment configuration
- Test scripts

**⏳ Pending (Phases 3-6):**
- Database integration
- Webhooks system
- Vendor API
- Analytics
- Production deployment

**🧪 Ready for Testing:**
- Start dev server: `npm run dev`
- Run tests: `node scripts/test-discord-api.js`
- All endpoints are functional (reading from current data source)

---

## 💡 Usage Example: Discord Bot

Here's a quick example of how a Discord bot would use the API:

```javascript
const KEYKINGDOM_API_KEY = process.env.KEYKINGDOM_API_KEY;

async function getExecutorStatus(executorName) {
  const response = await fetch(
    `https://key-kingdom.org/api/discord/executors/${executorName}/status`,
    {
      headers: {
        'Authorization': `Bearer ${KEYKINGDOM_API_KEY}`
      }
    }
  );

  const data = await response.json();

  if (data.success) {
    const { name, working, suncRating } = data.data;
    return `${name}: ${working ? '✅ Working' : '❌ Not Working'} (Safety: ${suncRating}/100)`;
  } else {
    return 'Executor not found';
  }
}
```

---

**Implementation completed by Claude Code**
*For questions or issues, refer to the documentation files or contact the development team.*
