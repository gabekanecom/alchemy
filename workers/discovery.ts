#!/usr/bin/env tsx
/**
 * Discovery Worker Process
 * Run this as a separate process to handle discovery jobs
 *
 * Usage:
 *   pnpm tsx workers/discovery.ts
 *   or
 *   DATABASE_URL="..." pnpm tsx workers/discovery.ts
 */

import "@/lib/queues/discovery-queue";

console.log("Discovery worker process started");
console.log("Listening for discovery jobs...");

// Keep process alive
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  process.exit(0);
});
