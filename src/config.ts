import { createRequire } from "node:module";
import { OPERATIONS, TOOLSETS } from "./catalog/operations.js";

const require = createRequire(import.meta.url);

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

function flag(name: string): boolean {
  return /^(1|true|yes|on)$/i.test(env(name));
}

export function packageVersion(): string {
  try {
    return (require("../package.json") as { version: string }).version;
  } catch {
    return "0.0.0";
  }
}

export const config = {
  // Standard credentials (Basic / Digest)
  customerId: env("TELESIGN_CUSTOMER_ID"),
  apiKey: env("TELESIGN_API_KEY"),
  authMethod: env("TELESIGN_AUTH_METHOD").toLowerCase() === "digest" ? ("digest" as const) : ("basic" as const),

  // OAuth 2.0 client credentials (SCIM operations of the Accounts API)
  oauthClientId: env("TELESIGN_OAUTH_CLIENT_ID"),
  oauthClientSecret: env("TELESIGN_OAUTH_CLIENT_SECRET"),

  // Protect Platform / Flow Builder
  protectUsername: env("TELESIGN_PROTECT_USERNAME"),
  protectPassword: env("TELESIGN_PROTECT_PASSWORD"),
  protectApiKey: env("TELESIGN_PROTECT_API_KEY"),
  protectRegion: env("TELESIGN_PROTECT_REGION") || "us-east-1",
  protectProductId: Number(env("TELESIGN_PROTECT_PRODUCT_ID") || "3"),

  // Behaviour
  toolsets: env("TELESIGN_TOOLSETS"),
  /** Lets the assistant switch on extended toolsets at runtime. On unless TELESIGN_DYNAMIC_TOOLSETS is false. */
  dynamicToolsets: !/^(0|false|no|off)$/i.test(env("TELESIGN_DYNAMIC_TOOLSETS")),
  readOnly: flag("TELESIGN_READ_ONLY"),
  dryRun: flag("TELESIGN_DRY_RUN"),
  revealTokens: flag("TELESIGN_REVEAL_TOKENS"),
  timeoutMs: Number(env("TELESIGN_TIMEOUT_MS") || "30000"),
  downloadDir: env("TELESIGN_DOWNLOAD_DIR"),

  // Host overrides (for example a failover or regional REST host)
  restUrl: env("TELESIGN_REST_URL").replace(/\/+$/, ""),
  verifyUrl: env("TELESIGN_VERIFY_URL").replace(/\/+$/, ""),
  detectUrl: env("TELESIGN_DETECT_URL").replace(/\/+$/, ""),
} as const;

/** Applies host overrides to a catalog URL. */
export function resolveBaseUrl(url: string): string {
  let out = url;
  if (config.restUrl) out = out.replace("https://rest-ww.telesign.com", config.restUrl);
  if (config.verifyUrl) out = out.replace("https://verify.telesign.com", config.verifyUrl);
  if (config.detectUrl) out = out.replace("https://detect.telesign.com", config.detectUrl);
  if (config.protectRegion !== "us-east-1") {
    out = out.replace(/https:\/\/us-east-1\.(di-platform|di-hub)\.telesign\.com/, `https://${config.protectRegion}.$1.telesign.com`);
  }
  return out;
}

export interface ToolsetSelection {
  /** Toolsets whose tools are listed when the server starts. */
  enabled: string[];
  /**
   * Toolsets the server is allowed to use at all: the enabled ones, plus (when dynamic toolsets are on)
   * every non-admin toolset, which the assistant can switch on at runtime.
   */
  available: string[];
  unknown: string[];
}

/**
 * Resolves TELESIGN_TOOLSETS, a comma-separated list of toolset keys and group names:
 * - unset, "core" or "default": the core toolsets
 * - "extended": core + extended (every product toolset)
 * - "all": everything, including admin toolsets
 * - toolset keys, alone or combined with a group, e.g. "core,voice" or "extended,accounts"
 *
 * Admin toolsets are never available unless named here (directly or through "all").
 */
export function selectToolsets(): ToolsetSelection {
  const all = Object.keys(TOOLSETS);
  const tier = (name: string) => all.filter((key) => TOOLSETS[key].tier === name);
  const groups: Record<string, string[]> = {
    core: tier("core"),
    default: tier("core"),
    extended: [...tier("core"), ...tier("extended")],
    all,
  };
  const requested = config.toolsets
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const enabled = new Set<string>();
  const unknown: string[] = [];
  if (requested.length === 0) groups.core.forEach((key) => enabled.add(key));
  for (const name of requested) {
    if (groups[name]) groups[name].forEach((key) => enabled.add(key));
    else if (all.includes(name)) enabled.add(name);
    else unknown.push(name);
  }

  const available = new Set(enabled);
  if (config.dynamicToolsets) all.filter((key) => TOOLSETS[key].tier !== "admin").forEach((key) => available.add(key));
  return {
    enabled: all.filter((key) => enabled.has(key)),
    available: all.filter((key) => available.has(key)),
    unknown,
  };
}

export function credentialStatus() {
  return {
    standard: Boolean(config.customerId && config.apiKey),
    oauth: Boolean(config.oauthClientId && config.oauthClientSecret),
    protect: Boolean(config.protectUsername && config.protectPassword && config.protectApiKey),
  };
}

/** Logs configuration problems to stderr at startup. Never throws: docs tools work without credentials. */
export function validateConfig(): void {
  const creds = credentialStatus();
  const { enabled, unknown } = selectToolsets();
  if (unknown.length) {
    console.error(`Warning: unknown toolset(s) in TELESIGN_TOOLSETS: ${unknown.join(", ")}. Available: ${Object.keys(TOOLSETS).join(", ")}, or the groups core, extended, all`);
  }
  const needs = new Set(OPERATIONS.filter((op) => enabled.includes(op.toolset)).map((op) => op.auth));
  if ((needs.has("basic") || enabled.length === 0) && !creds.standard) {
    console.error("Warning: TELESIGN_CUSTOMER_ID and TELESIGN_API_KEY are not set. API tools will return an error until they are.");
  }
  if ((needs.has("oauth") || needs.has("oauth-client")) && !creds.oauth) {
    console.error("Warning: SCIM tools need TELESIGN_OAUTH_CLIENT_ID and TELESIGN_OAUTH_CLIENT_SECRET.");
  }
  if ((needs.has("protect-basic") || needs.has("protect-bearer")) && !creds.protect) {
    console.error("Warning: Protect Platform tools need TELESIGN_PROTECT_USERNAME, TELESIGN_PROTECT_PASSWORD and TELESIGN_PROTECT_API_KEY.");
  }
  for (const [name, value] of [["TELESIGN_REST_URL", config.restUrl], ["TELESIGN_VERIFY_URL", config.verifyUrl], ["TELESIGN_DETECT_URL", config.detectUrl]]) {
    if (value && !/^https:\/\//i.test(value) && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(value)) {
      console.error(`Warning: ${name} is not an HTTPS URL. Requests to it will be refused so that credentials are never sent unencrypted.`);
    }
  }
  if (config.dryRun) console.error("TELESIGN_DRY_RUN is on: requests are built and returned, but nothing is sent to Telesign.");
}
