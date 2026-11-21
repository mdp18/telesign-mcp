import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCatalogTools, ToolsetManager } from "./catalog.js";
import { registerHelperTools } from "./helpers.js";
import { registerDocTools } from "./docs.js";

export function registerTools(server: McpServer): ToolsetManager {
  const manager = new ToolsetManager();
  registerCatalogTools(server, manager);
  registerHelperTools(server, manager);
  registerDocTools(server);
  return manager;
}
