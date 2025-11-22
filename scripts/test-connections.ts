/**
 * Test all service connections
 * Run with: tsx scripts/test-connections.ts
 */

import prisma from "../lib/db/client";
import redis from "../lib/redis/client";

async function testConnections() {
  console.log("🧪 Testing Alchemy Platform Connections...\n");

  // Test PostgreSQL
  console.log("1️⃣  Testing PostgreSQL connection...");
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log("✅ PostgreSQL connected successfully");
    console.log("   Database:", result);
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error);
    process.exit(1);
  }

  // Test Redis
  console.log("\n2️⃣  Testing Redis connection...");
  try {
    const pong = await redis.ping();
    if (pong === "PONG") {
      console.log("✅ Redis connected successfully");

      // Test write/read
      await redis.set("test:connection", "success", "EX", 10);
      const value = await redis.get("test:connection");
      console.log("   Test write/read:", value);
    }
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    process.exit(1);
  }

  // Test Prisma models
  console.log("\n3️⃣  Testing Prisma schema...");
  try {
    const userCount = await prisma.user.count();
    const brandCount = await prisma.brand.count();
    const ideaCount = await prisma.idea.count();

    console.log("✅ Prisma schema accessible");
    console.log(`   Users: ${userCount}`);
    console.log(`   Brands: ${brandCount}`);
    console.log(`   Ideas: ${ideaCount}`);
  } catch (error) {
    console.error("❌ Prisma schema access failed:", error);
    process.exit(1);
  }

  console.log("\n✅ All connections successful!\n");

  // Cleanup
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
}

testConnections().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
