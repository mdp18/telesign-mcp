import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDoc, listTopics } from "../docs/index.js";

/** Exposes every bundled documentation topic as an MCP resource at docs://telesign/<topic>. */
export function registerResources(server: McpServer) {
  for (const topic of listTopics()) {
    const uri = `docs://telesign/${topic.id}`;
    server.registerResource(
      `telesign-${topic.id.replace(/\//g, "-")}`,
      uri,
      {
        title: topic.title,
        description: topic.kind === "guide" ? `Telesign guide: ${topic.title}` : `Telesign API reference: ${topic.title}`,
        mimeType: "text/markdown",
      },
      async () => ({
        contents: [{ uri, mimeType: "text/markdown", text: getDoc(topic.id) ?? `Documentation not found: ${topic.id}` }],
      })
    );
  }
}
