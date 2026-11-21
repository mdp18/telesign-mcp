import type { Operation } from "../catalog/types.js";
import type { ApiResult } from "./http.js";

const MAX_JSON_CHARS = 60_000;

export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function text(message: string, isError = false): ToolResult {
  return isError ? { content: [{ type: "text", text: message }], isError: true } : { content: [{ type: "text", text: message }] };
}

function pretty(value: unknown): string {
  const json = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  if (json.length <= MAX_JSON_CHARS) return json;
  return `${json.slice(0, MAX_JSON_CHARS)}\n… [truncated ${json.length - MAX_JSON_CHARS} characters]`;
}

function fence(value: unknown): string {
  if (typeof value === "string") return "```\n" + pretty(value) + "\n```";
  return "```json\n" + pretty(value) + "\n```";
}

type Json = Record<string, any>;

function isObject(value: unknown): value is Json {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Collects the human-readable error descriptions Telesign puts in different places of a response. */
export function errorMessages(data: unknown): string[] {
  if (!isObject(data)) return typeof data === "string" && data ? [data.slice(0, 400)] : [];
  const out: string[] = [];
  if (Array.isArray(data.errors)) {
    for (const e of data.errors) {
      if (isObject(e)) out.push([e.code, e.description ?? e.message].filter((v) => v !== undefined && v !== "").join(": "));
      else if (e) out.push(String(e));
    }
  }
  if (isObject(data.error)) out.push([data.error.code, data.error.message ?? data.error.description].filter(Boolean).join(": "));
  else if (typeof data.error === "string") out.push([data.error, data.error_description].filter(Boolean).join(": "));
  if (!out.length && isObject(data.status) && data.status.description) out.push(`${data.status.code}: ${data.status.description}`);
  if (!out.length && typeof data.detail === "string") out.push(data.detail);
  if (!out.length && typeof data.message === "string") out.push(data.message);
  return out.filter(Boolean);
}

const HTTP_HINTS: Record<number, string> = {
  400: "The request was malformed. Check required parameters and their formats against the tool's reference docs (docs_get_tool_reference).",
  401: "Authentication failed. Check the credentials in the server's environment, and that this product is enabled for the account.",
  403: "The account is not authorized for this product or feature. Telesign may need to enable it.",
  404: "The resource was not found. Check IDs such as reference_id, or whether this product is enabled for the account.",
  429: "Rate limit exceeded. Wait before retrying.",
  500: "Telesign reported a server error. Retry later.",
  503: "Telesign service unavailable. Retry later.",
};

const PHONE_ID_ADDONS = new Set([
  "active_call_status",
  "age_verify",
  "breached_number_check",
  "call_forward_detection",
  "contact",
  "contact_match",
  "number_deactivation",
  "porting_history",
  "porting_status",
  "sim_swap",
  "subscriber_status",
]);

/** One-line highlights for well-known response shapes. */
function highlights(op: Operation, data: unknown): string[] {
  if (!isObject(data)) return [];
  const lines: string[] = [];
  const status = data.status;
  if (isObject(status) && (status.code !== undefined || status.description)) {
    lines.push(`Status: ${[status.code, status.description].filter((v) => v !== undefined && v !== "").join(" - ")}`);
  } else if (typeof data.state === "string") {
    lines.push(`State: ${data.state}`);
  }
  if (data.reference_id) lines.push(`Reference ID: ${data.reference_id}`);

  // Verify API
  if (op.toolset === "verify") {
    if (typeof data.state === "string" && isObject(status)) lines.push(`State: ${data.state}`);
    if (Array.isArray(data.verification_policy)) {
      lines.push(`Channels: ${data.verification_policy.map((p: Json) => p?.method).filter(Boolean).join(" → ")}`);
    }
    if (isObject(status) && status.code === 3900) lines.push("Result: VERIFIED");
  }
  // SMS / Voice / App Verify
  if (isObject(data.verify) && data.verify.code_state) lines.push(`Code state: ${data.verify.code_state}`);
  // Intelligence
  if (isObject(data.risk)) {
    const risk = data.risk;
    lines.push(`Risk: score ${risk.score ?? "n/a"}, level ${risk.level ?? "n/a"}, recommendation ${risk.recommendation ?? "n/a"}`);
  }
  if (isObject(data.risk_insights)) {
    const codes = ["category", "a2p", "p2p", "number_type", "ip", "email"]
      .flatMap((key) => (Array.isArray(data.risk_insights[key]) ? data.risk_insights[key] : []))
      .slice(0, 20);
    if (codes.length) lines.push(`Reason codes: ${codes.join(", ")}`);
  }
  // Phone ID
  if (isObject(data.phone_type) || isObject(data.carrier)) {
    lines.push(`Phone type: ${data.phone_type?.description ?? "n/a"}; carrier: ${data.carrier?.name ?? "n/a"}`);
  }
  if (isObject(data.location) && (data.location.city || data.location.country)) {
    const loc = data.location;
    lines.push(`Location: ${[loc.city, loc.state, loc.country?.name ?? loc.country?.iso2].filter(Boolean).join(", ")}`);
  }
  // Phone ID add-ons each carry their own status; a 301 "partially completed" means some of them failed.
  for (const [key, value] of Object.entries(data)) {
    if (!PHONE_ID_ADDONS.has(key) || !isObject(value)) continue;
    const addonStatus = isObject(value.status) ? `${value.status.code} - ${value.status.description}` : "returned";
    lines.push(`Add-on ${key}: ${addonStatus}`);
  }
  if (isObject(data.live)) {
    lines.push(`Live status: subscriber ${data.live.subscriber_status ?? "n/a"}, device ${data.live.device_status ?? "n/a"}, roaming ${data.live.roaming ?? "n/a"}`);
  }
  return [...new Set(lines)];
}

/** Formats an API result as an MCP tool result. */
export function formatResult(op: Operation, result: ApiResult): ToolResult {
  if (result.dryRun) {
    const lines = [
      `DRY RUN - ${op.title} (${op.tool}). Nothing was sent to Telesign.`,
      "",
      `${result.request.method} ${result.request.url}`,
      ...Object.entries(result.request.headers).map(([name, value]) => `${name}: ${value}`),
    ];
    if (result.request.body !== undefined) lines.push("", result.request.body);
    return text(lines.join("\n"));
  }

  if (result.error) {
    return text(`${op.title} failed: ${result.error}`, true);
  }

  const head = `${op.title} - HTTP ${result.status}${result.statusText ? " " + result.statusText : ""}`;
  if (!result.ok) {
    const messages = errorMessages(result.data);
    const lines = [head];
    if (messages.length) lines.push(`Telesign error: ${messages.join("; ")}`);
    if (HTTP_HINTS[result.status]) lines.push(`Hint: ${HTTP_HINTS[result.status]}`);
    lines.push(`Request: ${result.request.method} ${result.request.url}`);
    if (result.data !== null && result.data !== "") lines.push("", fence(result.data));
    lines.push("", `Reference: ${op.docsUrl}`);
    return text(lines.join("\n"), true);
  }

  const lines = [head, ...highlights(op, result.data)];
  if (result.savedTo) lines.push(`Saved to: ${result.savedTo}`);
  if (result.data !== null && result.data !== "") lines.push("", fence(result.data));
  return text(lines.join("\n"));
}
