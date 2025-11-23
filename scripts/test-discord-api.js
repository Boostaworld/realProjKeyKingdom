#!/usr/bin/env node

/**
 * Test script for Discord Bot API
 *
 * Tests all Discord Bot API endpoints with authentication.
 *
 * Usage:
 *   node scripts/test-discord-api.js
 */

// Load environment variables from .env.local
const fs = require("fs");
const path = require("path");

// Simple .env parser
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env.local file not found!");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const lines = envContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim();
      }
    }
  }
}

loadEnv();

const API_KEY = process.env.DISCORD_BOT_API_KEY_1;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!API_KEY) {
  console.error("Error: DISCORD_BOT_API_KEY_1 not found in .env.local");
  process.exit(1);
}

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function testEndpoint(name, url, options = {}) {
  log(colors.cyan, `\n=== Testing: ${name} ===`);
  log(colors.blue, `URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    log(colors.yellow, `Status: ${response.status}`);
    log(colors.yellow, `Rate Limit Remaining: ${response.headers.get("x-ratelimit-remaining")}`);

    if (response.ok) {
      log(colors.green, "✓ Success!");
      console.log(JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      log(colors.red, "✗ Failed!");
      console.log(JSON.stringify(data, null, 2));
      return { success: false, data };
    }
  } catch (error) {
    log(colors.red, "✗ Error:", error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log(colors.green, "\n========================================");
  log(colors.green, "Discord Bot API Test Suite");
  log(colors.green, "========================================");

  const results = [];

  // Test 1: Get all executors
  results.push(
    await testEndpoint(
      "GET /api/discord/executors",
      `${BASE_URL}/api/discord/executors?limit=5`
    )
  );

  // Test 2: Get all executors with filters
  results.push(
    await testEndpoint(
      "GET /api/discord/executors (with category filter)",
      `${BASE_URL}/api/discord/executors?category=reputable&limit=3`
    )
  );

  // Test 3: Get single executor by slug (assuming "solara" exists)
  results.push(
    await testEndpoint(
      "GET /api/discord/executors/:identifier",
      `${BASE_URL}/api/discord/executors/solara`
    )
  );

  // Test 4: Get executor status
  results.push(
    await testEndpoint(
      "GET /api/discord/executors/:identifier/status",
      `${BASE_URL}/api/discord/executors/solara/status`
    )
  );

  // Test 5: Get platform status
  results.push(
    await testEndpoint(
      "GET /api/discord/platform-status",
      `${BASE_URL}/api/discord/platform-status`
    )
  );

  // Test 6: Search executors
  results.push(
    await testEndpoint(
      "GET /api/discord/search",
      `${BASE_URL}/api/discord/search?q=executor&limit=5`
    )
  );

  // Test 7: Test authentication failure
  log(colors.cyan, "\n=== Testing: Invalid API Key ===");
  try {
    const response = await fetch(`${BASE_URL}/api/discord/executors`, {
      headers: {
        Authorization: "Bearer invalid_key",
      },
    });
    const data = await response.json();

    if (response.status === 401 && !data.success) {
      log(colors.green, "✓ Authentication check working!");
      results.push({ success: true });
    } else {
      log(colors.red, "✗ Authentication check failed!");
      results.push({ success: false });
    }
  } catch (error) {
    log(colors.red, "✗ Error:", error.message);
    results.push({ success: false });
  }

  // Summary
  log(colors.green, "\n========================================");
  log(colors.green, "Test Summary");
  log(colors.green, "========================================");

  const passed = results.filter((r) => r.success).length;
  const total = results.length;

  if (passed === total) {
    log(colors.green, `✓ All ${total} tests passed!`);
  } else {
    log(colors.yellow, `${passed}/${total} tests passed`);
    log(colors.red, `${total - passed} tests failed`);
  }

  process.exit(passed === total ? 0 : 1);
}

runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
