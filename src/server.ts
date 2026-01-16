import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";

export async function createServer() {
  const server = new McpServer({
    name: "telesign",
    version: "1.0.0",
  });

  // Register all tools and resources
  registerTools(server);
  registerResources(server);

  // Connect transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  return server;
}