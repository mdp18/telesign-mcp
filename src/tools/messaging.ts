import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeRequest } from "../lib/api.js";
import { API_BASES } from "../config.js";

export function registerMessagingTools(server: McpServer) {
  server.registerTool(
    "messaging_send_sms",
    {
      description:
        "Send an SMS message to a phone number. See docs://telesign/messaging-sms for message types and delivery codes.",
      inputSchema: {
        phone_number: z
          .string()
          .describe("E.164 format phone number"),
        message: z
          .string()
          .describe("Message content (max 1600 characters)"),
        message_type: z
          .enum(["OTP", "ARN", "MKT"])
          .default("ARN")
          .describe("OTP=verification codes, ARN=alerts/notifications, MKT=marketing"),
      },
    },
    async ({ phone_number, message, message_type }) => {
      const data = await makeRequest(
        API_BASES.rest,
        "/v1/messaging",
        "POST",
        {
          phone_number,
          message,
          message_type,
        }
      );

      if (!data) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to send SMS. Check phone number and message content.",
            },
          ],
        };
      }

      const result = `
📱 SMS Sent (${message_type})
━━━━━━━━━━━━━━━━━━━━━━━━
Reference ID: ${data.reference_id}
Status: ${data.status?.description || "Queued"}
`.trim();

      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );
}