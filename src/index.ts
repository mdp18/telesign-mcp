import { createServer } from "./server.js";

async function main() {
  const server = await createServer();
  console.error("TeleSign MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});