import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPhoneIdTools } from "./phone-id.js";
import { registerIntelligenceTools } from "./intelligence.js";
import { registerVerifyTools } from "./verify.js";
import { registerMessagingTools } from "./messaging.js";
import { registerDocTools } from "./docs.js";

export function registerTools(server: McpServer) {
  registerPhoneIdTools(server);
  registerIntelligenceTools(server);
  registerVerifyTools(server);
  registerMessagingTools(server);
  registerDocTools(server);
}