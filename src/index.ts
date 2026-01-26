#!/usr/bin/env node
import { createServer } from "./server.js";

async function main() {
  const server = await createServer();
  console.error("TeleSign MCP Server running on stdio");

  // Keep the process alive
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});