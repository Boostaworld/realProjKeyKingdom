/**
 * Database Seed Script
 *
 * Seeds the database with initial data for development/testing.
 */

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================
  // Seed API Keys
  // ============================================

  console.log("Creating API keys...");

  const apiKeys = [
    {
      key: process.env.DISCORD_BOT_API_KEY_1 || "",
      name: "Discord Bot API Key 1",
      type: "discord_bot",
    },
    {
      key: process.env.DISCORD_BOT_API_KEY_2 || "",
      name: "Discord Bot API Key 2",
      type: "discord_bot",
    },
  ].filter((k) => k.key); // Only include keys that exist

  for (const apiKey of apiKeys) {
    // Check if key already exists
    const existing = await prisma.apiKey.findUnique({
      where: { key: apiKey.key },
    });

    if (existing) {
      console.log(`  ✓ API key "${apiKey.name}" already exists`);
      continue;
    }

    await prisma.apiKey.create({
      data: apiKey,
    });

    console.log(`  ✓ Created API key: ${apiKey.name}`);
  }

  // ============================================
  // Log seed completion
  // ============================================

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
