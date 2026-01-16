import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDoc, DOC_TOPICS } from "../docs/index.js";

export function registerResources(server: McpServer) {
  for (const topic of DOC_TOPICS) {
    const uri = `docs://telesign/${topic}`;

    server.registerResource(
      `telesign-${topic}`,
      uri,
      {
        description: `TeleSign ${topic} documentation`,
        mimeType: "text/markdown",
      },
      async () => {
        const content = getDoc(topic) || `Documentation not found: ${topic}`;

        return {
          contents: [
            {
              uri,
              mimeType: "text/markdown",
              text: content,
            },
          ],
        };
      }
    );
  }
}