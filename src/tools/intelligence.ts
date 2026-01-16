import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeRequest } from "../lib/api.js";
import { API_BASES } from "../config.js";

export function registerIntelligenceTools(server: McpServer) {
  server.registerTool(
    "intelligence_assess_risk",
    {
      description:
        "Get fraud risk score (0-1000) for a phone number. Returns recommendation: allow/flag/block. See docs://telesign/intelligence for score interpretation.",
      inputSchema: {
        phone_number: z
          .string()
          .describe("E.164 format phone number (e.g., 15551234567)"),
        account_lifecycle_event: z
          .enum(["create", "sign-in", "transact", "update", "delete"])
          .default("create")
          .describe("Type of event being evaluated"),
        originating_ip: z
          .string()
          .optional()
          .describe("User's IP address for additional context"),
      },
    },
    async ({ phone_number, account_lifecycle_event, originating_ip }) => {
      const payload: Record<string, string> = {
        phone_number,
        account_lifecycle_event,
      };

      if (originating_ip) {
        payload.originating_ip = originating_ip;
      }

      const data = await makeRequest(
        API_BASES.intelligence,
        "/intelligence/phone",
        "POST",
        payload
      );

      if (!data || data._error) {
        const errorMsg = data?.errors?.[0]?.description
          || data?.status?.description
          || data?.message
          || "Unknown error";
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to assess risk (${data?.status || "error"}): ${errorMsg}`,
            },
          ],
        };
      }

      const risk = data.risk;
      const score = risk?.score ?? "N/A";
      const level = risk?.level || "Unknown";
      const recommendation = risk?.recommendation || "Unknown";

      // Emoji based on recommendation
      let emoji = "⚠️";
      if (recommendation.toLowerCase() === "allow") emoji = "✅";
      if (recommendation.toLowerCase() === "block") emoji = "🚫";

      const result = `
${emoji} Risk Assessment: ${phone_number}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score: ${score} / 1000
Level: ${level}
Recommendation: ${recommendation.toUpperCase()}

Reason Codes: ${risk?.reason_codes?.join(", ") || "None"}
Reference ID: ${data.reference_id || "N/A"}
`.trim();

      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );
}