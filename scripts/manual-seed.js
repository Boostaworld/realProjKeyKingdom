/**
 * Manual Database Seed Script
 *
 * Simple script to add initial API keys to the database.
 * Run with: node scripts/manual-seed.js
 */

const { PrismaClient } = require("@prisma/client");
require("dotenv/config");

// Create Prisma client (reads DATABASE_URL from .env.local)
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting manual seed...");

  const apiKey1 = "kk_discord_68d7306a943b7717a40cdfd6d4eb5ce04c74cb5b5aa717f869b331898519d5da";
  const apiKey2 = "kk_discord_f77075c8e951ebbf529a57665e7543765b0c0f75bb13ff293fbeec9e91c6bbdb";

  // Check if keys already exist
  const existing1 = await prisma.apiKey.findUnique({ where: { key: apiKey1 } });
  const existing2 = await prisma.apiKey.findUnique({ where: { key: apiKey2 } });

  if (existing1) {
    console.log("✓ API Key 1 already exists");
  } else {
    await prisma.apiKey.create({
      data: {
        key: apiKey1,
        name: "Discord Bot API Key 1",
        type: "discord_bot",
        rateLimit: 100,
        rateLimitWindow: 60000,
      }
    });
    console.log("✓ Created API Key 1");
  }

  if (existing2) {
    console.log("✓ API Key 2 already exists");
  } else {
    await prisma.apiKey.create({
      data: {
        key: apiKey2,
        name: "Discord Bot API Key 2",
        type: "discord_bot",
        rateLimit: 100,
        rateLimitWindow: 60000,
      }
    });
    console.log("✓ Created API Key 2");
  }

  // Display all API keys
  const allKeys = await prisma.apiKey.findMany();
  console.log("\n📋 Current API Keys:");
  allKeys.forEach(key => {
    console.log(`  - ${key.name} (${key.type})`);
    console.log(`    Created: ${key.createdAt}`);
    console.log(`    Rate Limit: ${key.rateLimit} requests per ${key.rateLimitWindow}ms`);
  });

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
