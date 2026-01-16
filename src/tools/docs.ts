import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAllDocs, getDoc, DOC_TOPICS } from "../docs/index.js";

export function registerDocTools(server: McpServer) {
  // Search documentation
  server.registerTool(
    "docs_search",
    {
      description:
        "Search TeleSign documentation. Use for error codes, API details, best practices, etc.",
      inputSchema: {
        query: z
          .string()
          .describe("Search query (e.g., 'error 503', 'risk score', 'phone types')"),
        topic: z
          .enum(["all", ...DOC_TOPICS])
          .default("all")
          .describe("Specific topic to search, or 'all'"),
      },
    },
    async ({ query, topic }) => {
      const queryLower = query.toLowerCase();
      const results: string[] = [];

      const docsToSearch =
        topic === "all"
          ? Object.entries(getAllDocs())
          : [[topic, getDoc(topic)] as [string, string]];

      for (const [docName, docContent] of docsToSearch) {
        if (!docContent) continue;

        const lines = docContent.split("\n");
        const matchingLines: string[] = [];
        let currentSection = "";

        for (const line of lines) {
          if (line.startsWith("## ") || line.startsWith("# ")) {
            currentSection = line;
          }

          if (line.toLowerCase().includes(queryLower)) {
            if (currentSection && !matchingLines.includes(currentSection)) {
              matchingLines.push(currentSection);
            }
            if (line.trim() && !line.startsWith("#")) {
              matchingLines.push(line);
            }
          }
        }

        if (matchingLines.length > 0) {
          results.push(`### From: ${docName}\n${matchingLines.slice(0, 15).join("\n")}`);
        }
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No results for "${query}". Available topics: ${DOC_TOPICS.join(", ")}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `# Search Results: "${query}"\n\n${results.join("\n\n---\n\n")}`,
          },
        ],
      };
    }
  );

  // Get full documentation
  server.registerTool(
    "docs_get",
    {
      description:
        "Get complete documentation for a TeleSign topic.",
      inputSchema: {
        topic: z
          .enum(DOC_TOPICS)
          .describe("Documentation topic to retrieve"),
      },
    },
    async ({ topic }) => {
      const doc = getDoc(topic);

      if (!doc) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Documentation not found: ${topic}`,
            },
          ],
        };
      }

      return {
        content: [{ type: "text" as const, text: doc }],
      };
    }
  );
}