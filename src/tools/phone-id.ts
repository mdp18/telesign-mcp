import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeRequest } from "../lib/api.js";
import { API_BASES } from "../config.js";

export function registerPhoneIdTools(server: McpServer) {
  server.registerTool(
    "phoneid_get_info",
    {
      description:
        "Get detailed information about a phone number including type (mobile/landline/VoIP), carrier, and location. See docs://telesign/phone-id for details.",
      inputSchema: {
        phone_number: z
          .string()
          .describe("Complete phone number with country code, no spaces or special characters (e.g., 15551234567)"),
        account_lifecycle_event: z
          .enum(["create", "sign-in", "transact", "update", "delete"])
          .optional()
          .describe("Type of account event: create, sign-in, transact, update, or delete"),
        external_id: z
          .string()
          .optional()
          .describe("Customer-generated ID for this transaction (echoed in response)"),
        originating_ip: z
          .string()
          .optional()
          .describe("End user's IP address (IPv4 or IPv6) for additional context"),
        addons: z
          .object({
            sim_swap: z.object({}).optional().describe("Enable SIM swap detection"),
            number_deactivation: z.object({
              last_verified: z.string().describe("ISO 8601 timestamp of when you last verified this number (e.g., 2018-04-05T00:00:00Z)"),
            }).optional().describe("Enable number deactivation check"),
            contact: z.object({}).optional().describe("Enable contact information lookup"),
            contact_match: z.object({
              first_name: z.string().optional(),
              last_name: z.string().optional(),
              address: z.string().optional(),
            }).optional().describe("Enable contact match scoring"),
            contact_plus: z.object({}).optional().describe("Enable enhanced contact information"),
            subscriber_status: z.object({}).optional().describe("Enable subscriber status check"),
            porting_history: z.object({
              past_x_days: z.number().optional().describe("Number of days to check for porting history"),
            }).optional().describe("Enable porting history lookup"),
            porting_status: z.object({}).optional().describe("Enable current porting status"),
            call_forward_detection: z.object({}).optional().describe("Enable call forwarding detection"),
            breached_number_check: z.object({}).optional().describe("Enable breached data check"),
            age_verify: z.object({
              age_threshold: z.number().optional().describe("Minimum age to verify against"),
            }).optional().describe("Enable age verification"),
            active_call_status: z.object({}).optional().describe("Enable active call status check"),
          })
          .optional()
          .describe("Identity attributes to include. Each enabled addon returns additional data about the phone number."),
      },
    },
    async ({ phone_number, account_lifecycle_event, external_id, originating_ip, addons }) => {
      const resource = `/v1/phoneid/${phone_number}`;

      const payload: Record<string, unknown> = {};
      if (account_lifecycle_event) payload.account_lifecycle_event = account_lifecycle_event;
      if (external_id) payload.external_id = external_id;
      if (originating_ip) payload.originating_ip = originating_ip;
      if (addons) payload.addons = addons;

      const data = await makeRequest(
        API_BASES.rest,
        resource,
        "POST",
        Object.keys(payload).length > 0 ? payload : undefined,
        true // useJson
      );

      if (!data) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to retrieve phone info. Check the phone number format (E.164: country code + number).",
            },
          ],
        };
      }

      let result = `
📱 Phone Number: ${phone_number}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${data.status?.description || "Unknown"} (${data.status?.code})

Type: ${data.phone_type?.description || "Unknown"}
Carrier: ${data.carrier?.name || "Unknown"}

📍 Location:
   City: ${data.location?.city || "Unknown"}
   State: ${data.location?.state || "Unknown"}
   Country: ${data.location?.country?.name || "Unknown"}
   Time Zone: ${data.location?.time_zone?.name || "Unknown"}`;

      // Add SIM Swap info if present
      if (data.sim_swap) {
        result += `\n\n🔄 SIM Swap:
   Swap Date: ${data.sim_swap.swap_date || "N/A"}
   Risk Indicator: ${data.sim_swap.risk_indicator || "N/A"}`;
      }

      // Add Number Deactivation info if present
      if (data.number_deactivation) {
        result += `\n\n📴 Number Deactivation:
   Last Deactivated: ${data.number_deactivation.last_deactivated || "Never"}
   Carrier: ${data.number_deactivation.carrier_name || "N/A"}`;
      }

      // Add Subscriber Status info if present
      if (data.subscriber_status) {
        result += `\n\n👤 Subscriber Status:
   Account Status: ${data.subscriber_status.account_status || "N/A"}
   Contract Type: ${data.subscriber_status.contract_type || "N/A"}
   Account Activation: ${data.subscriber_status.account_activation_date || "N/A"}`;
      }

      // Add Porting Status info if present
      if (data.porting_status) {
        result += `\n\n🔀 Porting Status:
   Ported: ${data.porting_status.ported ? "Yes" : "No"}`;
      }

      // Add Porting History info if present
      if (data.porting_history) {
        result += `\n\n📜 Porting History:
   Current Carrier: ${data.porting_history.carrier_current || "N/A"}
   Previous Carrier: ${data.porting_history.carrier_previous || "N/A"}
   Port Date: ${data.porting_history.port_date || "N/A"}
   Number of Portings: ${data.porting_history.number_of_portings || "0"}`;
      }

      // Add Call Forward Detection info if present
      if (data.call_forward_detection) {
        result += `\n\n📞 Call Forwarding:
   Enabled: ${data.call_forward_detection.call_forward_enabled || "N/A"}
   Type: ${data.call_forward_detection.call_forward_type || "N/A"}`;
      }

      // Add Contact info if present
      if (data.contact) {
        result += `\n\n📇 Contact:
   Name: ${data.contact.first_name || ""} ${data.contact.last_name || ""}
   Email: ${data.contact.email_address || "N/A"}`;
      }

      // Add Breached Number Check if present
      if (data.breached_number_check) {
        result += `\n\n⚠️ Breach Check:
   Breached: ${data.breached_number_check.phone_number_breached ? "Yes" : "No"}
   Breach Date: ${data.breached_number_check.breach_date || "N/A"}`;
      }

      // Add Active Call Status if present
      if (data.active_call_status) {
        result += `\n\n📱 Active Call:
   Call Active: ${data.active_call_status.is_call_active ? "Yes" : "No"}
   Duration: ${data.active_call_status.call_duration || "N/A"}s
   Direction: ${data.active_call_status.call_direction || "N/A"}`;
      }

      result += `\n\nReference ID: ${data.reference_id || "N/A"}`;

      return {
        content: [{ type: "text" as const, text: result.trim() }],
      };
    }
  );
}