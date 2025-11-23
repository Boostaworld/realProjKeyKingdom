# API Key Management System

Complete guide to managing API keys for Key-Kingdom's Discord Bot API and Admin API.

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [CLI Tools (In Progress)](#cli-tools-in-progress)
4. [Using Prisma Studio](#using-prisma-studio)
5. [Key Types](#key-types)
6. [Security Best Practices](#security-best-practices)
7. [Examples](#examples)

---

## Overview

Key-Kingdom uses API keys for two primary purposes:

1. **Discord Bot API Keys** - For Discord bot developers to integrate with the marketplace
2. **Admin API Keys** - For administrators and vendors to manage executors

API keys are stored in the database with the following features:
- Cryptographically secure 64-character hex keys
- Configurable rate limits per key
- Usage tracking (total requests, last used timestamp)
- Revocation support
- Expiration dates (optional)

---

## API Endpoints

### 1. Create API Key

**Endpoint:** `POST /api/admin/api-keys`

**Authentication:** Admin access required

**Request Body:**
```json
{
  "type": "discord_bot",  // or "admin"
  "name": "My Discord Bot",
  "rateLimit": 100,       // optional, defaults based on type
  "rateLimitWindow": 60000  // optional, in milliseconds
}
```

**Default Rate Limits:**
- Discord Bot: 100 requests per 60 seconds (1 minute)
- Admin: 500 requests per 3600 seconds (1 hour)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "key": "kk_discord_1234567890abcdef...",  // ⚠️  ONLY SHOWN ONCE!
    "name": "My Discord Bot",
    "type": "discord_bot",
    "rateLimit": 100,
    "rateLimitWindow": 60000,
    "createdAt": "2025-11-23T05:00:00.000Z",
    "message": "API key created successfully. Save this key securely - it won't be shown again!"
  },
  "rateLimit": {
    "remaining": 499,
    "resetAt": 1732345678900
  }
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/admin/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \
  -d '{
    "type": "discord_bot",
    "name": "Production Bot"
  }'
```

---

### 2. List API Keys

**Endpoint:** `GET /api/admin/api-keys`

**Authentication:** Admin access required

**Query Parameters:**
- `type` (optional) - Filter by type (`discord_bot` or `admin`)
- `revoked` (optional) - Filter by revocation status (`true` or `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "uuid-1",
        "name": "My Discord Bot",
        "type": "discord_bot",
        "keyPreview": "kk_discord...d5da",  // First 10 + last 4 chars
        "rateLimit": 100,
        "rateLimitWindow": 60000,
        "totalRequests": 1523,
        "lastUsedAt": "2025-11-23T04:30:00.000Z",
        "createdAt": "2025-11-20T10:00:00.000Z",
        "revoked": false
      }
    ],
    "total": 1,
    "filters": {
      "type": null,
      "revoked": null
    }
  }
}
```

**Example (curl):**
```bash
# List all API keys
curl http://localhost:3000/api/admin/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET"

# List only Discord bot keys
curl "http://localhost:3000/api/admin/api-keys?type=discord_bot" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET"

# List only non-revoked keys
curl "http://localhost:3000/api/admin/api-keys?revoked=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET"
```

---

### 3. Get Single API Key

**Endpoint:** `GET /api/admin/api-keys/:id`

**Authentication:** Admin access required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "My Discord Bot",
    "type": "discord_bot",
    "keyPreview": "kk_discord...d5da",
    "rateLimit": 100,
    "rateLimitWindow": 60000,
    "totalRequests": 1523,
    "lastUsedAt": "2025-11-23T04:30:00.000Z",
    "createdAt": "2025-11-20T10:00:00.000Z",
    "revoked": false
  }
}
```

**Example (curl):**
```bash
curl http://localhost:3000/api/admin/api-keys/uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET"
```

---

### 4. Revoke API Key

**Endpoint:** `DELETE /api/admin/api-keys/:id`

**Authentication:** Admin access required

**Query Parameters:**
- `reason` (optional) - Reason for revocation

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "My Discord Bot",
    "type": "discord_bot",
    "revokedAt": "2025-11-23T05:00:00.000Z",
    "revokedBy": "user_admin",
    "reason": "Security breach",
    "message": "API key has been revoked successfully. It can no longer be used."
  }
}
```

**Example (curl):**
```bash
curl -X DELETE "http://localhost:3000/api/admin/api-keys/uuid-here?reason=No%20longer%20needed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET"
```

---

## CLI Tools (In Progress)

### Create API Key Script

**Note:** Due to Prisma 7 compatibility issues with standalone scripts, the CLI tool is currently non-functional. Use the API endpoints or Prisma Studio instead.

**Intended Usage:**
```bash
npm run api:create-key -- --type discord_bot --name "My Bot"
```

**Options:**
- `--type` - Type of API key (`discord_bot` or `admin`)
- `--name` - Descriptive name for the key
- `--rateLimit` - Custom rate limit
- `--window` - Custom rate limit window (milliseconds)
- `--help` - Show help message

**Status:** Blocked by Prisma 7 driver adapter initialization issues. Recommended alternatives:
1. Use the POST `/api/admin/api-keys` endpoint (preferred)
2. Use Prisma Studio (see below)
3. Wait for Prisma 7 driver adapter improvements

---

## Using Prisma Studio

Prisma Studio provides a GUI for managing database records, including API keys.

### 1. Start Prisma Studio

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555`

### 2. Create an API Key

1. Navigate to the **ApiKey** table
2. Click **"Add record"**
3. Fill in the fields:
   - **id** - Leave blank (auto-generated UUID)
   - **key** - Generate using:
     ```bash
     node -e "console.log('kk_discord_' + require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **keyHash** - Leave blank (optional)
   - **name** - Descriptive name (e.g., "Production Discord Bot")
   - **type** - `discord_bot` or `admin`
   - **rateLimit** - `100` for Discord bots, `500` for admin
   - **rateLimitWindow** - `60000` (1 min) for bots, `3600000` (1 hour) for admin
   - **totalRequests** - `0`
   - **revoked** - `false`
   - Leave other fields blank
4. Click **"Save 1 change"**
5. **Important:** Copy the `key` field value immediately and store it securely!

---

## Key Types

### Discord Bot API Keys

**Prefix:** `kk_discord_`

**Purpose:** For Discord bot developers to integrate with Key-Kingdom

**Rate Limits:** 100 requests per minute (default)

**Permissions:** Read-only access to executor data, status, and reviews

**Example Use Case:**
```javascript
// Discord bot command: !executor synapse
fetch('http://localhost:3000/api/discord/executors/synapse', {
  headers: {
    'X-API-Key': 'kk_discord_your_key_here'
  }
})
```

### Admin API Keys

**Prefix:** `kk_admin_`

**Purpose:** For admin dashboard and vendor management

**Rate Limits:** 500 requests per hour (default)

**Permissions:** Full CRUD access to executors, reviews, and API keys

**Example Use Case:**
```javascript
// Admin dashboard creating a new executor
fetch('http://localhost:3000/api/admin/executors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer jwt_token',
    'X-Admin-Secret': 'admin_secret_key'
  },
  body: JSON.stringify({
    name: 'New Executor',
    // ... other fields
  })
})
```

---

## Security Best Practices

### 1. Key Generation

✅ **DO:**
- Use cryptographically secure random generation (64-character hex)
- Generate keys server-side only
- Use the provided API endpoints or scripts

❌ **DON'T:**
- Generate keys client-side
- Use predictable patterns or sequential IDs
- Reuse keys across environments

### 2. Key Storage

✅ **DO:**
- Store keys in environment variables (`.env.local`)
- Use secret management services in production (e.g., AWS Secrets Manager, Vault)
- Display keys only once at creation
- Mask keys in logs and UI (`kk_discord...d5da`)

❌ **DON'T:**
- Commit keys to version control
- Log full keys in application logs
- Display full keys in UI after creation
- Store keys in cookies or local storage

### 3. Key Rotation

✅ **DO:**
- Rotate keys regularly (e.g., every 90 days)
- Revoke old keys after rotation
- Track key usage with `lastUsedAt` timestamps
- Set expiration dates for temporary keys

❌ **DON'T:**
- Keep unused keys active indefinitely
- Delay revoking compromised keys
- Reuse revoked keys

### 4. Rate Limiting

✅ **DO:**
- Configure appropriate rate limits based on use case
- Monitor rate limit hits and adjust as needed
- Implement exponential backoff in client applications

❌ **DON'T:**
- Set unlimited rate limits
- Ignore rate limit violations
- Remove rate limiting entirely

---

## Examples

### Complete Workflow: Creating and Using an API Key

#### Step 1: Create API Key via API

```bash
# Create a Discord bot API key
curl -X POST http://localhost:3000/api/admin/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \
  -d '{
    "type": "discord_bot",
    "name": "My Discord Bot - Production"
  }' | jq

# Response:
# {
#   "success": true,
#   "data": {
#     "key": "kk_discord_a1b2c3d4e5f6...",  # Save this!
#     ...
#   }
# }
```

#### Step 2: Store Key Securely

```bash
# Add to .env.local
echo "DISCORD_BOT_API_KEY=kk_discord_a1b2c3d4e5f6..." >> .env.local
```

#### Step 3: Use Key in Application

```javascript
// Discord bot code
const API_KEY = process.env.DISCORD_BOT_API_KEY;

async function getExecutor(slug) {
  const response = await fetch(`https://key-kingdom.org/api/discord/executors/${slug}`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

#### Step 4: Monitor Usage

```bash
# Check API key usage
curl http://localhost:3000/api/admin/api-keys/uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" | jq '.data | {totalRequests, lastUsedAt}'

# Response:
# {
#   "totalRequests": 1523,
#   "lastUsedAt": "2025-11-23T04:30:00.000Z"
# }
```

#### Step 5: Revoke When Needed

```bash
# Revoke compromised or unused key
curl -X DELETE "http://localhost:3000/api/admin/api-keys/uuid-here?reason=Rotating%20keys" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET"
```

---

## Troubleshooting

### Issue: "UNAUTHORIZED" error when creating API key

**Cause:** Missing or invalid admin authentication

**Solution:**
1. Ensure you're sending both headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
   - `X-Admin-Secret: YOUR_ADMIN_SECRET`
2. Verify your JWT token is valid and not expired
3. Confirm your `ADMIN_SECRET_KEY` in `.env.local` matches the header value

### Issue: CLI script fails with "URL 'undefined'" error

**Cause:** Prisma 7 driver adapter initialization issues

**Solution:** Use the API endpoints or Prisma Studio instead (see sections above)

### Issue: Rate limit exceeded

**Cause:** Too many requests within the rate limit window

**Solution:**
1. Check current rate limit settings:
   ```bash
   curl http://localhost:3000/api/admin/api-keys/uuid-here \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "X-Admin-Secret: YOUR_ADMIN_SECRET"
   ```
2. Implement exponential backoff in your client
3. Request a rate limit increase by creating a new key with higher limits
4. Split requests across multiple API keys if appropriate

---

## Future Enhancements

- [ ] Fix Prisma 7 CLI script compatibility
- [ ] Web UI for API key management in admin dashboard
- [ ] API key permissions/scopes (read-only, write, etc.)
- [ ] API key usage analytics dashboard
- [ ] Automatic key rotation reminders
- [ ] IP allow listing for enhanced security
- [ ] Webhook signing with API keys
- [ ] Multi-factor authentication for admin operations

---

## Related Documentation

- [Discord Bot API Documentation](../api/DISCORD_BOT_API.md)
- [Admin API Documentation](../api/ADMIN_API.md)
- [Database Schema](../database/DATABASE_COMPARISON.md)
- [Review System](./REVIEW_SYSTEM.md)
