import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function user(text: string) {
  return { messages: [{ role: "user" as const, content: { type: "text" as const, text } }] };
}

/** Reusable workflows that chain several Telesign tools. */
export function registerPrompts(server: McpServer) {
  server.registerPrompt(
    "verify_phone_number",
    {
      title: "Verify a phone number with a one-time passcode",
      description: "Send a one-time passcode with the Verify API (with channel fallback), then check the code the user provides.",
      argsSchema: {
        phone_number: z.string().describe("Phone number with country code, e.g. 15551234567"),
        channels: z.string().optional().describe("Channels in order, e.g. 'sms,voice' or 'whatsapp,sms'. Default: sms,voice"),
      },
    },
    ({ phone_number, channels }) =>
      user(
        `Verify that I control the phone number ${phone_number} using Telesign.\n\n` +
          `1. Call verifyapi_send_otp with recipient.phone_number set to that number and a verification_policy for these channels in order: ${channels || "sms,voice"}. ` +
          `Give every channel except the last a fallback_time of 30 seconds.\n` +
          `2. Tell me the reference_id and ask me for the code I received.\n` +
          `3. When I give you the code, call verifyapi_check_code and tell me whether the number is verified.\n` +
          `4. If no code arrives, call verifyapi_get_status and explain the delivery state of each channel.`
      )
  );

  server.registerPrompt(
    "assess_signup_risk",
    {
      title: "Assess the fraud risk of a sign-up",
      description: "Combine Intelligence risk scoring with Phone ID attributes to recommend allow, flag (step-up) or block for a new account.",
      argsSchema: {
        phone_number: z.string().describe("Phone number with country code"),
        email_address: z.string().optional().describe("Email address given at sign-up"),
        originating_ip: z.string().optional().describe("End user's IP address"),
      },
    },
    ({ phone_number, email_address, originating_ip }) =>
      user(
        `Assess the fraud risk of a new account sign-up with phone number ${phone_number}` +
          `${email_address ? `, email ${email_address}` : ""}${originating_ip ? `, IP ${originating_ip}` : ""}.\n\n` +
          `1. Call intelligence_assess_risk with account_lifecycle_event "create"${email_address || originating_ip ? " and the email / IP above" : ""}.\n` +
          `2. Call phoneid_get_info for the number to get phone type, carrier and location.\n` +
          `${email_address ? "3. Call intelligence_assess_email for the email address.\n" : ""}` +
          `Then summarise: the risk score, level and recommendation; what the reason codes mean (look them up with docs_search); ` +
          `whether the phone type is risky (VoIP, prepaid, invalid); and a final recommendation of allow, step-up verification, or block, with your reasoning.`
      )
  );

  server.registerPrompt(
    "check_number_before_messaging",
    {
      title: "Check a number before sending to it",
      description: "Use Phone ID (and Live Status where enabled) to decide whether a number is worth messaging and over which channel.",
      argsSchema: {
        phone_number: z.string().describe("Phone number with country code"),
      },
    },
    ({ phone_number }) =>
      user(
        `Before I message ${phone_number}, check it with Telesign.\n\n` +
          `1. Call phoneid_get_info and report phone type, carrier, country and the cleansed number for SMS and voice.\n` +
          `2. If the phoneid_live_status tool is available, call it and report whether the subscriber is active and the device reachable.\n` +
          `3. Tell me whether SMS, voice or neither is appropriate for this number (for example, landlines cannot receive SMS), and flag anything risky.`
      )
  );

  server.registerPrompt(
    "send_message_with_fallback",
    {
      title: "Send a message with channel fallback",
      description: "Send a message with the omnichannel Messaging API, falling back from a rich channel to SMS.",
      argsSchema: {
        phone_number: z.string().describe("Recipient phone number with country code"),
        message: z.string().describe("Message text"),
        channels: z.string().optional().describe("Channels in order, e.g. 'whatsapp,sms' or 'rcs,sms'. Default: sms"),
        message_type: z.string().optional().describe("ARN (alerts, default), OTP (one-time passcodes) or MKT (marketing)"),
      },
    },
    ({ phone_number, message, channels, message_type }) =>
      user(
        `Send this message to ${phone_number} with Telesign: "${message}"\n\n` +
          `1. Read docs_get_tool_reference("messaging_send_message") for the exact message object each channel needs.\n` +
          `2. Confirm the recipient and text with me before sending.\n` +
          `3. Call messaging_send_message with channels in this order: ${channels || "sms"} (fallback_time 60 seconds between channels), ` +
          `message_type ${message_type || "ARN"}, and a message entry for every channel used.\n` +
          `4. Report the reference_id, then call messaging_get_message_status and tell me the delivery status.`
      )
  );
}
