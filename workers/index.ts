/**
 * Main worker entry point
 * Starts all background workers
 */

import "./content-worker";
import "./research-worker";
import "./media-worker";

console.log("==========================================");
console.log("Alchemy Workers Started");
console.log("==========================================");
console.log("✓ Content Generation Worker");
console.log("✓ Research Worker");
console.log("✓ Media Generation Worker");
console.log("==========================================");
console.log("Workers are now listening for jobs...");
console.log("Press Ctrl+C to stop");
console.log("==========================================");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\nSIGTERM received, shutting down workers...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\nSIGINT received, shutting down workers...");
  process.exit(0);
});
