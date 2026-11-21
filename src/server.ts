import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";
import { packageVersion, validateConfig } from "./config.js";

const INSTRUCTIONS = [
  "Telesign APIs for verification (one-time passcodes over SMS, voice, WhatsApp, RCS, Viber, email, silent verification),",
  "messaging, programmable voice, number masking, phone number intelligence (Phone ID) and fraud risk scoring (Intelligence).",
  "Phone numbers are digits only with the country code (15551234567); a leading + is removed automatically.",
  "Tools that send messages or place calls reach real people and are billed: confirm the recipient and content with the user first.",
  "Keep the reference_id every send returns; status and completion tools need it.",
  "Only the core toolsets (Verify API, SMS, Phone ID, Intelligence) are listed at first. For anything else - SMS Verify, Voice Verify,",
  "WhatsApp / RCS / Viber / email messaging, Voice, Number Masking - search with telesign_find_tools, then switch the toolset on with",
  "telesign_enable_toolsets or run a single tool with telesign_call_tool.",
  "Use docs_search / docs_get for product guides and status codes, docs_get_tool_reference for a tool's full parameters,",
  "and telesign_server_info to see which toolsets and credentials are configured.",
].join(" ");

/** Builds the server with all tools, resources and prompts registered, without connecting a transport. */
export function buildServer(): McpServer {
  const server = new McpServer({ name: "telesign", version: packageVersion() }, { instructions: INSTRUCTIONS });
  registerTools(server);
  registerResources(server);
  registerPrompts(server);
  return server;
}

export async function createServer() {
  validateConfig();
  const server = buildServer();
  await server.connect(new StdioServerTransport());
  return server;
}
