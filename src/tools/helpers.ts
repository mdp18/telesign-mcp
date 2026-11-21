import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OPERATIONS, TOOLSETS } from "../catalog/operations.js";
import { config, credentialStatus, packageVersion, resolveBaseUrl } from "../config.js";
import { execute } from "../lib/http.js";
import { errorMessages, formatResult, text } from "../lib/format.js";
import { callOperation, type ToolsetManager } from "./catalog.js";

const READ_ONLY_LOCAL = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

function toolsetState(manager: ToolsetManager, key: string): string {
  if (manager.isActive(key)) return "on";
  if (manager.isAvailable(key)) return "off - can be enabled";
  return TOOLSETS[key].tier === "admin" ? "locked - operator must add it to TELESIGN_TOOLSETS" : "locked - dynamic toolsets are disabled";
}

/** Hand-written tools: a Verify API shortcut, toolset discovery and switching, and server diagnostics. */
export function registerHelperTools(server: McpServer, manager: ToolsetManager): void {
  // Verify API: the common "check the code the user typed" step, as a single obvious tool.
  if (manager.isAvailable("verify") && !config.readOnly) {
    const checkCode = server.registerTool(
      "verifyapi_check_code",
      {
        title: "Check a verification code",
        description:
          "Verify API: check the one-time passcode the end user entered for a verification process started with verifyapi_send_otp. " +
          'Shortcut for verifyapi_update_process with action "finalize". Reports VERIFIED when Telesign returns status code 3900.',
        inputSchema: {
          reference_id: z.string().describe("The reference_id returned by verifyapi_send_otp."),
          code: z
            .preprocess((v) => (typeof v === "number" ? String(v) : v), z.string())
            .describe("The code the end user entered."),
        },
        annotations: { title: "Check a verification code", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
      },
      async ({ reference_id, code }) => {
        const op = manager.find("verifyapi_update_process");
        if (!op) return text("verifyapi_update_process is not available on this server.", true);
        const result = await execute(op, { reference_id, action: "finalize", security_factor: code });
        if (result.dryRun || result.error) return formatResult(op, result);

        const data = result.data as { status?: { code?: number; description?: string }; state?: string } | null;
        const verified = result.ok && (data?.status?.code === 3900 || data?.state === "VERIFIED");
        const detail = data?.status?.description || errorMessages(result.data).join("; ");
        const formatted = formatResult(op, result);
        formatted.content.unshift({ type: "text", text: `${verified ? "VERIFIED" : "NOT VERIFIED"}${detail ? ` - ${detail}` : ""}` });
        return formatted;
      }
    );
    manager.trackExtra("verify", "verifyapi_check_code", checkCode);
  }

  server.registerTool(
    "telesign_find_tools",
    {
      title: "Find Telesign tools",
      description:
        "Search every Telesign tool this server can provide, including tools in toolsets that are currently switched off " +
        "(SMS Verify, Voice Verify, omnichannel Messaging with WhatsApp / RCS / Viber, Voice, Number Masking and more). " +
        "Use it when the listed tools do not cover the task. Then switch the toolset on with telesign_enable_toolsets, " +
        "or run a single tool directly with telesign_call_tool.",
      inputSchema: {
        query: z.string().optional().describe("Words to look for in tool names and descriptions, e.g. 'whatsapp', 'sim swap', 'recording'. Omit to list toolsets."),
        toolset: z.string().optional().describe("Limit the search to one toolset key, e.g. 'voice'."),
      },
      annotations: { title: "Find Telesign tools", ...READ_ONLY_LOCAL },
    },
    async ({ query, toolset }) => {
      if (toolset && !TOOLSETS[toolset]) return text(`Unknown toolset "${toolset}". Toolsets: ${Object.keys(TOOLSETS).join(", ")}`, true);

      const terms = (query ?? "").toLowerCase().match(/[a-z0-9]+/g) ?? [];
      if (terms.length === 0 && !toolset) {
        const lines = ["# Telesign toolsets", ""];
        for (const [key, info] of Object.entries(TOOLSETS)) {
          const count = OPERATIONS.filter((op) => op.toolset === key && (!config.readOnly || op.readOnly)).length;
          lines.push(`- **${key}** [${toolsetState(manager, key)}] - ${info.title}, ${count} tools. ${info.blurb}`);
        }
        lines.push("", "Search with a query to see individual tools, or enable a toolset with telesign_enable_toolsets.");
        return text(lines.join("\n"));
      }

      const scored = manager
        .operations()
        .filter((op) => !toolset || op.toolset === toolset)
        .map((op) => {
          const haystack = `${op.tool} ${op.title} ${op.description} ${TOOLSETS[op.toolset].title} ${TOOLSETS[op.toolset].blurb}`.toLowerCase();
          const name = op.tool.toLowerCase();
          const score = terms.reduce((sum, term) => sum + (name.includes(term) ? 3 : 0) + (haystack.includes(term) ? 1 : 0), 0);
          const matched = terms.filter((term) => haystack.includes(term)).length;
          return { op, score: terms.length ? (matched === terms.length ? score * 2 : score) : 1 };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15);

      if (scored.length === 0) {
        return text(`No tools match "${query}". Call telesign_find_tools with no arguments to list toolsets, or try docs_search for product guidance.`);
      }
      const lines = scored.map(({ op }) => {
        const summary = op.description.split("\n")[0];
        return `- \`${op.tool}\` [toolset ${op.toolset}: ${toolsetState(manager, op.toolset)}] - ${op.title}. ${summary.length > 220 ? summary.slice(0, 220) + " …" : summary}`;
      });
      lines.push(
        "",
        "Tools in a toolset that is off: enable it with telesign_enable_toolsets, or call one tool with telesign_call_tool. " +
          "Parameters: docs_get_tool_reference(tool)."
      );
      return text(lines.join("\n"));
    }
  );

  server.registerTool(
    "telesign_enable_toolsets",
    {
      title: "Switch Telesign toolsets on or off",
      description:
        "Switch Telesign toolsets on (or off) for this session so their tools appear in the tool list. " +
        "Toolsets: " +
        Object.entries(TOOLSETS)
          .filter(([key]) => manager.isAvailable(key))
          .map(([key, info]) => `${key} (${info.title})`)
          .join(", ") +
        ". If the new tools do not show up afterwards, the client does not refresh its tool list: use telesign_call_tool instead.",
      inputSchema: {
        toolsets: z.array(z.string()).min(1).describe("Toolset keys, e.g. ['voice', 'messaging']."),
        enabled: z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean()).default(true).describe("true to switch on (default), false to switch off."),
      },
      annotations: { title: "Switch Telesign toolsets on or off", readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ toolsets, enabled }) => {
      const lines: string[] = [];
      let failed = false;
      for (const raw of toolsets) {
        const key = raw.trim().toLowerCase();
        if (!TOOLSETS[key]) {
          failed = true;
          lines.push(`- ${raw}: unknown toolset. Available: ${Object.keys(TOOLSETS).filter((k) => manager.isAvailable(k)).join(", ")}`);
        } else if (!manager.isAvailable(key)) {
          failed = true;
          lines.push(`- ${key}: ${toolsetState(manager, key)}. It cannot be enabled from inside a session.`);
        } else if (enabled) {
          const tools = manager.enable(key);
          lines.push(`- ${key} is on (${tools.length} tools): ${tools.join(", ") || "no tools in read-only mode"}`);
        } else {
          const tools = manager.disable(key);
          lines.push(`- ${key} is off${tools.length ? ` (${tools.length} tools hidden)` : " (it was already off)"}`);
        }
      }
      if (enabled) lines.push("", "The tool list has been updated. If these tools are not visible to you, call them through telesign_call_tool.");
      return text(lines.join("\n"), failed);
    }
  );

  server.registerTool(
    "telesign_call_tool",
    {
      title: "Call any Telesign tool by name",
      description:
        "Run a Telesign tool by name, whether or not its toolset is switched on. For clients that do not refresh their tool list after " +
        "telesign_enable_toolsets, and for one-off calls. Find tool names with telesign_find_tools and their parameters with " +
        "docs_get_tool_reference. The same rules apply as for the tool itself: sends reach real people and are billed.",
      inputSchema: {
        tool: z.string().describe("Tool name, e.g. 'voiceverify_send_code'."),
        arguments: z.record(z.string(), z.any()).default({}).describe("The tool's arguments as an object, exactly as the tool itself would take them."),
      },
      annotations: { title: "Call any Telesign tool by name", readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async ({ tool, arguments: args }) => {
      const op = manager.find(tool);
      if (!op) {
        const known = OPERATIONS.find((o) => o.tool === tool);
        if (known && config.readOnly && !known.readOnly) return text(`${tool} is not available: the server is in read-only mode.`, true);
        if (known) return text(`${tool} belongs to toolset "${known.toolset}", which is ${toolsetState(manager, known.toolset)}.`, true);
        return text(`Unknown tool "${tool}". Use telesign_find_tools to search.`, true);
      }
      return callOperation(op, args);
    }
  );

  server.registerTool(
    "telesign_server_info",
    {
      title: "Telesign MCP server info",
      description:
        "Show how this Telesign MCP server is configured: which toolsets and tools are on, which credentials are present (never their values), " +
        "API hosts, and whether dry-run or read-only mode is on. Use it to find out why a tool is missing or failing.",
      inputSchema: {},
      annotations: { title: "Telesign MCP server info", ...READ_ONLY_LOCAL },
    },
    async () => {
      const creds = credentialStatus();
      const active = manager.activeOperations();
      const keys = Object.keys(TOOLSETS);
      const lines = [
        `telesign-mcp ${packageVersion()}`,
        "",
        "Credentials",
        `- Customer ID + API key (TELESIGN_CUSTOMER_ID, TELESIGN_API_KEY): ${creds.standard ? "set" : "NOT SET"}`,
        `- OAuth client (TELESIGN_OAUTH_CLIENT_ID, TELESIGN_OAUTH_CLIENT_SECRET): ${creds.oauth ? "set" : "not set (only needed for SCIM tools)"}`,
        `- Protect Platform (TELESIGN_PROTECT_USERNAME, _PASSWORD, _API_KEY): ${creds.protect ? "set" : "not set (only needed for Protect Platform / Flow Builder tools)"}`,
        "",
        "Modes",
        `- Authentication method: ${config.authMethod}${config.authMethod === "digest" ? " (endpoints without documented Digest support use Basic)" : ""}`,
        `- Dry run (TELESIGN_DRY_RUN): ${config.dryRun ? "ON - requests are returned, not sent" : "off"}`,
        `- Read only (TELESIGN_READ_ONLY): ${config.readOnly ? "ON - only tools that do not send messages or change data are registered" : "off"}`,
        `- Dynamic toolsets (TELESIGN_DYNAMIC_TOOLSETS): ${config.dynamicToolsets ? "on - extended toolsets can be switched on with telesign_enable_toolsets" : "OFF - only the toolsets in TELESIGN_TOOLSETS can be used"}`,
        `- Request timeout: ${config.timeoutMs} ms`,
        `- Download directory (TELESIGN_DOWNLOAD_DIR): ${config.downloadDir || "not set"}`,
        "",
        "Hosts",
        `- REST: ${resolveBaseUrl("https://rest-ww.telesign.com")}`,
        `- Verify: ${resolveBaseUrl("https://verify.telesign.com")}`,
        `- Intelligence: ${resolveBaseUrl("https://detect.telesign.com")}`,
        `- Protect Platform region: ${config.protectRegion}`,
        "",
        `Toolsets (${keys.filter((k) => manager.isActive(k)).length} of ${keys.length} on, ${active.length} API tools listed). TELESIGN_TOOLSETS accepts toolset keys and the groups core, extended, all.`,
      ];
      for (const [key, info] of Object.entries(TOOLSETS)) {
        const tools = OPERATIONS.filter((op) => op.toolset === key && (!config.readOnly || op.readOnly));
        lines.push(`- ${key} (${info.tier}) - ${info.title} [${toolsetState(manager, key)}, ${tools.length} tools]`);
        if (manager.isActive(key) && tools.length) lines.push(`    ${tools.map((op) => op.tool).join(", ")}`);
      }
      return text(lines.join("\n"));
    }
  );
}
