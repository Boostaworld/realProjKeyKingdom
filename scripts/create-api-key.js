#!/usr/bin/env node

/**
 * CLI Script: Create API Key
 *
 * Usage:
 *   npm run api:create-key -- --type discord_bot --name "My Bot"
 *   npm run api:create-key -- --type admin --name "Admin Key"
 *
 * Options:
 *   --type        Type of API key (discord_bot or admin) [default: discord_bot]
 *   --name        Name/description of the API key
 *   --rateLimit   Rate limit (requests per window) [default: 100 for discord_bot, 500 for admin]
 *   --window      Rate limit window in milliseconds [default: 60000 for discord_bot, 3600000 for admin]
 *   --help        Show this help message
 */

const crypto = require("crypto");
const path = require("path");

// Load environment variables
require("dotenv/config");

// For standalone scripts, we need to set up the database path
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./prisma/dev.db";

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: "discord_bot",
    name: null,
    rateLimit: null,
    window: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--type") {
      options.type = args[++i];
    } else if (arg === "--name") {
      options.name = args[++i];
    } else if (arg === "--rateLimit") {
      options.rateLimit = parseInt(args[++i], 10);
    } else if (arg === "--window") {
      options.window = parseInt(args[++i], 10);
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🔑 API Key Generator - Key Kingdom              ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  npm run api:create-key -- --type discord_bot --name "My Bot"
  npm run api:create-key -- --type admin --name "Admin Key"

Options:
  --type        Type of API key (discord_bot or admin)
                Default: discord_bot

  --name        Name/description of the API key
                Default: Generated based on type

  --rateLimit   Rate limit (requests per window)
                Default: 100 for discord_bot, 500 for admin

  --window      Rate limit window in milliseconds
                Default: 60000 (1 min) for discord_bot
                         3600000 (1 hour) for admin

  --help, -h    Show this help message

Examples:
  npm run api:create-key -- --type discord_bot --name "Production Bot"
  npm run api:create-key -- --type admin --name "Admin Dashboard"
  npm run api:create-key -- --type discord_bot --rateLimit 200 --window 60000
`);
}

// Generate API key
function generateApiKey(prefix = "kk_discord") {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return `${prefix}_${randomBytes}`;
}

// Hash API key
function hashApiKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Validate type
  const validTypes = ["discord_bot", "admin"];
  if (!validTypes.includes(options.type)) {
    console.error(`❌ Invalid type: ${options.type}`);
    console.error(`   Valid types: ${validTypes.join(", ")}`);
    process.exit(1);
  }

  // Set defaults based on type
  const prefix = options.type === "discord_bot" ? "kk_discord" : "kk_admin";
  const rateLimit = options.rateLimit || (options.type === "discord_bot" ? 100 : 500);
  const rateLimitWindow = options.window || (options.type === "discord_bot" ? 60000 : 3600000);
  const name = options.name || `${options.type} key - ${new Date().toISOString()}`;

  console.log(`\n🔑 Creating new API key...`);
  console.log(`   Type: ${options.type}`);
  console.log(`   Name: ${name}`);
  console.log(`   Rate Limit: ${rateLimit} requests per ${rateLimitWindow}ms`);

  try {
    // Initialize Prisma Client
    // For Prisma 7, we need to import it dynamically to avoid initialization issues
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    // Generate API key
    const key = generateApiKey(prefix);
    const keyHash = hashApiKey(key);

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        keyHash,
        name,
        type: options.type,
        rateLimit,
        rateLimitWindow,
      },
    });

    console.log(`\n✅ API Key created successfully!`);
    console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
    console.log(`║  ⚠️  SAVE THIS KEY SECURELY - IT WON'T BE SHOWN AGAIN! ⚠️   ║`);
    console.log(`╚══════════════════════════════════════════════════════════════╝\n`);
    console.log(`   ID:       ${apiKey.id}`);
    console.log(`   Key:      ${apiKey.key}`);
    console.log(`   Type:     ${apiKey.type}`);
    console.log(`   Name:     ${apiKey.name}`);
    console.log(`   Created:  ${apiKey.createdAt.toISOString()}\n`);
    console.log(`   Rate Limit: ${apiKey.rateLimit} requests / ${apiKey.rateLimitWindow}ms`);
    console.log(`\n📋 Add to your .env file:`);

    if (options.type === "discord_bot") {
      console.log(`   DISCORD_BOT_API_KEY="${apiKey.key}"\n`);
    } else {
      console.log(`   ADMIN_API_KEY="${apiKey.key}"\n`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error(`\n❌ Error creating API key:`, error.message);

    if (error.message.includes("adapter") || error.message.includes("accelerateUrl")) {
      console.error(`\n💡 Tip: Make sure your database is set up correctly.`);
      console.error(`   Run: npm run db:migrate`);
    }

    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
