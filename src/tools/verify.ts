import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeRequest } from "../lib/api.js";
import { API_BASES } from "../config.js";

export function registerVerifyTools(server: McpServer) {
  // Send OTP
  server.registerTool(
    "verifyapi_send_otp",
    {
      description:
        "Send a one-time passcode (OTP) to a phone number. Returns reference_id needed for verifyapi_check_code. Supports multiple fallback channels with fallback_time. See docs://telesign/verify-api.",
      inputSchema: {
        recipient: z
          .object({
            phone_number: z.string().describe("E.164 format phone number"),
            email: z.string().optional().describe("Email address (required if using email as a channel)"),
          })
          .describe("Recipient contact info"),
        verification_policy: z
          .array(
            z.object({
              method: z.enum(["sms", "voice", "whatsapp", "viber", "rcs", "email"]),
              fallback_time: z.number().optional().describe("Seconds to wait before trying next channel"),
            })
          )
          .describe("Array of verification methods in order. Each can have fallback_time (seconds) except the last one. Example: [{method:'sms',fallback_time:30},{method:'voice'}]"),
      },
    },
    async ({ recipient, verification_policy }) => {
      const data = await makeRequest(
        API_BASES.verify,
        "/verification",
        "POST",
        {
          recipient,
          verification_policy,
        },
        true // useJson
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
              text: `Failed to send OTP: ${errorMsg}`,
            },
          ],
        };
      }

      const channels = verification_policy.map((p: { method: string }) => p.method).join(" → ");
      const result = `
📤 OTP Verification Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Channels: ${channels}
Reference ID: ${data.reference_id}
Status: ${data.status?.description || "Sent"}

⚠️ Save the reference_id to verify the code later.
`.trim();

      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );

  // Verify OTP
  server.registerTool(
    "verifyapi_check_code",
    {
      description:
        "Verify an OTP code that was sent to a user. Requires the reference_id from verifyapi_send_otp.",
      inputSchema: {
        reference_id: z
          .string()
          .describe("Reference ID from verifyapi_send_otp"),
        code: z
          .string()
          .describe("OTP code entered by user"),
      },
    },
    async ({ reference_id, code }) => {
      const data = await makeRequest(
        API_BASES.verify,
        `/verification/${reference_id}/state`,
        "PATCH",
        {
          action: "finalize",
          security_factor: code
        },
        true // useJson
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
              text: `Verification failed: ${errorMsg}`,
            },
          ],
        };
      }

      // Check for verified status - code 3900 means verified
      const status = data.status;
      const statusCode = status?.code;

      const isVerified = statusCode === 3900;

      const displayStatus = typeof status === "string"
        ? status
        : status?.description || JSON.stringify(data);

      return {
        content: [
          {
            type: "text" as const,
            text: `${isVerified ? "✅ VERIFIED" : "❌ NOT VERIFIED"}\nStatus: ${displayStatus}`,
          },
        ],
      };
    }
  );

  // Get Verification Status
  server.registerTool(
    "verifyapi_get_status",
    {
      description:
        "Retrieve details about a verification process in progress. Use this to check the current status of a verification including channel-by-channel delivery status.",
      inputSchema: {
        reference_id: z
          .string()
          .describe("Reference ID from verifyapi_send_otp"),
      },
    },
    async ({ reference_id }) => {
      const data = await makeRequest(
        API_BASES.verify,
        `/verification/${reference_id}`,
        "GET",
        undefined,
        true // useJson for Accept header
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
              text: `Failed to get verification status: ${errorMsg}`,
            },
          ],
        };
      }

      // Format channel statuses
      let channelStatus = "";
      if (data.inner_methods && Array.isArray(data.inner_methods)) {
        channelStatus = "\n\nChannel Status:\n";
        for (const method of data.inner_methods) {
          const stateEmoji =
            method.state === "VERIFIED" ? "✅" :
            method.state === "ONGOING" ? "🔄" :
            method.state === "FAILED" ? "❌" :
            method.state === "CREATED" ? "⏳" : "•";

          channelStatus += `  ${stateEmoji} ${method.method.toUpperCase()}: ${method.state}`;
          if (method.err_msg) {
            channelStatus += ` - ${method.err_msg}`;
          }
          channelStatus += "\n";
        }
      }

      const stateEmoji =
        data.state === "VERIFIED" ? "✅" :
        data.state === "ONGOING" ? "🔄" :
        data.state === "FAILED" ? "❌" :
        data.state === "CREATED" ? "⏳" : "📋";

      const result = `
${stateEmoji} Verification Status: ${data.state || "Unknown"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reference ID: ${data.reference_id || reference_id}
Created: ${data.created_on || "N/A"}
Updated: ${data.updated_on || "N/A"}${channelStatus}
`.trim();

      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );
}