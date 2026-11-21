import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OPERATIONS } from "../catalog/operations.js";
import { findSection, getDoc, getToolReference, listTopics, outline, searchDocs, topicIds } from "../docs/index.js";
import { text } from "../lib/format.js";

/** Documents larger than this are returned as an outline unless a section is requested. */
const FULL_DOC_LIMIT = 40_000;
const SECTION_LIMIT = 60_000;

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

function clip(content: string, limit: number): string {
  return content.length <= limit ? content : `${content.slice(0, limit)}\n\n… [truncated ${content.length - limit} characters; request a narrower section]`;
}

function unknownTopic(topic: string): string {
  return `Unknown topic "${topic}". Available topics:\n${listTopics().map((t) => `- ${t.id} - ${t.title}`).join("\n")}`;
}

export function registerDocTools(server: McpServer) {
  server.registerTool(
    "docs_list",
    {
      title: "List Telesign documentation topics",
      description:
        "List the Telesign documentation bundled with this server: product guides (what each product does, workflows, status codes, best practices) " +
        "and per-API reference pages generated from Telesign's OpenAPI definitions.",
      inputSchema: {},
      annotations: { title: "List Telesign documentation topics", ...READ_ONLY },
    },
    async () => {
      const topics = listTopics();
      const row = (t: (typeof topics)[number]) => `- ${t.id} - ${t.title} (${Math.round(t.chars / 1000)}k chars)`;
      return text(
        [
          "# Telesign documentation",
          "",
          "## Guides",
          ...topics.filter((t) => t.kind === "guide").map(row),
          "",
          "## API reference",
          ...topics.filter((t) => t.kind === "reference").map(row),
          "",
          'Use docs_get(topic, section?) to read a topic, docs_search(query) to search, and docs_get_tool_reference(tool) for one tool\'s parameters and responses.',
        ].join("\n")
      );
    }
  );

  server.registerTool(
    "docs_search",
    {
      title: "Search Telesign documentation",
      description:
        "Full-text search across the bundled Telesign guides and API reference. Returns the best-matching sections with snippets. " +
        "Use for status and error codes, parameters, response fields, product capabilities and best practices.",
      inputSchema: {
        query: z.string().describe("Search terms, e.g. 'status code 3900', 'sim swap risk indicator', 'whatsapp template parameters'."),
        topic: z.string().default("all").describe("Limit the search to one topic id from docs_list (e.g. 'verify-api', 'reference/messaging'), or 'all'."),
        max_results: z.number().int().min(1).max(25).default(8).describe("Maximum number of sections to return."),
      },
      annotations: { title: "Search Telesign documentation", ...READ_ONLY },
    },
    async ({ query, topic, max_results }) => {
      if (topic !== "all" && !topicIds().includes(topic)) return text(unknownTopic(topic), true);
      const hits = searchDocs(query, topic === "all" ? undefined : topic, max_results);
      if (hits.length === 0) {
        return text(`No results for "${query}". Try fewer or different words, or browse topics with docs_list.`);
      }
      const blocks = hits.map((hit) => {
        const where = [hit.topic, ...hit.trail.slice(1), hit.heading].join(" › ");
        // Qualify the heading with its parents (minus the page title): reference pages repeat headings
        // such as "Body parameters" under every operation.
        const section = [...hit.trail.slice(1), hit.heading].join(" > ").replace(/"/g, "'");
        return `### ${where}\n${hit.snippet}\n→ docs_get(topic: "${hit.topic}", section: "${section}")`;
      });
      return text(`# Search results for "${query}"\n\n${blocks.join("\n\n")}`);
    }
  );

  server.registerTool(
    "docs_get",
    {
      title: "Read Telesign documentation",
      description:
        "Read a Telesign documentation topic, or one section of it. Large topics return their outline unless a section heading is given.",
      inputSchema: {
        topic: z.string().describe("Topic id from docs_list, e.g. 'overview', 'verify-api', 'error-codes', 'reference/phone-id'."),
        section: z.string().optional().describe("Heading of the section to return (case-insensitive, partial match allowed). Qualify a repeated heading with its parent, e.g. 'Send SMS verification code > Body parameters'. Omit for the whole topic."),
      },
      annotations: { title: "Read Telesign documentation", ...READ_ONLY },
    },
    async ({ topic, section }) => {
      const doc = getDoc(topic);
      if (doc === null) return text(unknownTopic(topic), true);

      if (section) {
        const found = findSection(topic, section);
        if (!found) return text(`No section matching "${section}" in ${topic}. Outline:\n\n${outline(topic)}`, true);
        return text(clip(found.text, SECTION_LIMIT));
      }
      if (doc.length <= FULL_DOC_LIMIT) return text(doc);
      return text(
        `"${topic}" is ${Math.round(doc.length / 1000)}k characters, so only its outline is shown. ` +
          `Call docs_get again with a section heading, or use docs_get_tool_reference for a single tool.\n\n${outline(topic)}`
      );
    }
  );

  server.registerTool(
    "docs_get_tool_reference",
    {
      title: "Get the API reference for a tool",
      description:
        "Return the full API reference for one Telesign tool of this server: endpoint, authentication, every parameter (untruncated), " +
        "response fields, status codes and example payloads.",
      inputSchema: {
        tool: z.string().describe("Tool name, e.g. 'messaging_send_message' or 'phoneid_get_info'."),
      },
      annotations: { title: "Get the API reference for a tool", ...READ_ONLY },
    },
    async ({ tool }) => {
      const name = tool === "verifyapi_check_code" ? "verifyapi_update_process" : tool;
      const reference = getToolReference(name);
      if (!reference) {
        const known = OPERATIONS.map((op) => op.tool);
        const close = known.filter((k) => k.includes(tool) || tool.includes(k.split("_")[0])).slice(0, 12);
        return text(`No reference found for "${tool}".${close.length ? ` Did you mean: ${close.join(", ")}?` : ""}`, true);
      }
      return text(clip(reference.text, SECTION_LIMIT));
    }
  );
}
