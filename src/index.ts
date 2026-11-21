#!/usr/bin/env node
import { createServer } from "./server.js";

async function main() {
  const server = await createServer();
  console.error("Telesign MCP server running on stdio");

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
