import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config, resolveBaseUrl } from "../config.js";
import type { Operation } from "../catalog/types.js";
import { EXTRA_FIELDS } from "./schema.js";

export interface PreparedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  /** Exact body string that is sent (undefined when there is no body). */
  body?: string;
}

export interface ApiResult {
  ok: boolean;
  /** HTTP status, or 0 when the request never reached Telesign. */
  status: number;
  statusText: string;
  /** Parsed JSON, or text for non-JSON responses. */
  data: unknown;
  contentType: string;
  request: PreparedRequest;
  dryRun?: boolean;
  /** Set when a binary response was written to TELESIGN_DOWNLOAD_DIR. */
  savedTo?: string;
  /** Set when the request could not be sent (missing credentials, network failure, invalid arguments). */
  error?: string;
}

export class RequestError extends Error {}

type Args = Record<string, unknown>;

const PHONE_KEY = /^(complete_)?phone_number(_\d+)?$/;

/** Telesign expects digits only, starting with the country code. Strips "+", spaces and punctuation. */
export function normalizePhone(value: unknown): unknown {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return value;
  return /^\s*\+?[\d\s().-]+$/.test(value) ? value.replace(/\D/g, "") : value;
}

function normalizeArgs(args: Args): Args {
  const out: Args = {};
  for (const [key, value] of Object.entries(args)) {
    if (value === undefined) continue;
    if (PHONE_KEY.test(key)) {
      out[key] = normalizePhone(value);
    } else if (key === "recipient" && value && typeof value === "object" && !Array.isArray(value)) {
      const recipient = { ...(value as Args) };
      if ("phone_number" in recipient) recipient.phone_number = normalizePhone(recipient.phone_number);
      out[key] = recipient;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function formValue(value: unknown): string {
  if (value !== null && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Telesign only accepts HTTPS, and credentials must never travel unencrypted. A host override that is not
 * HTTPS is refused before any authentication header is built. Loopback hosts are allowed for local mocks.
 */
export function assertSecureUrl(url: string): void {
  const parsed = new URL(url);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && loopback)) {
    throw new RequestError(`Refusing to send a request to ${parsed.protocol}//${parsed.host}: Telesign requires HTTPS. Check the TELESIGN_*_URL host overrides.`);
  }
}

/** Builds the HTTP request for an operation, without authentication headers. */
export function buildRequest(op: Operation, rawArgs: Args): PreparedRequest {
  const args = normalizeArgs(rawArgs);
  if (config.readOnly) {
    for (const name of op.stateChangingParams ?? []) {
      if (args[name] !== undefined && args[name] !== null && args[name] !== "") {
        throw new RequestError(`"${name}" is not allowed in read-only mode because it changes state at Telesign. Call ${op.tool} without it to read the status.`);
      }
    }
  }
  const used = new Set<string>();

  let url = resolveBaseUrl(op.url);
  for (const param of op.pathParams) {
    const value = args[param.name];
    if (value === undefined || value === null || value === "") throw new RequestError(`Missing required path parameter "${param.name}".`);
    url = url.replace(`{${param.name}}`, encodeURIComponent(String(value)));
    used.add(param.name);
  }

  const query = new URLSearchParams();
  for (const param of op.queryParams) {
    used.add(param.name);
    const value = args[param.name];
    if (value === undefined || value === null) continue;
    query.append(param.name, formValue(value));
  }
  const queryString = query.toString();
  if (queryString) url += (url.includes("?") ? "&" : "?") + queryString;

  const headers: Record<string, string> = { Accept: "application/json" };
  for (const param of op.headerParams) {
    used.add(param.name);
    const value = args[param.name];
    if (value !== undefined && value !== null) headers[param.name] = String(value);
  }

  let body: string | undefined;
  if (op.bodyMode !== "none" && op.bodyType) {
    let payload: unknown;
    if (op.bodyMode === "single") {
      payload = args.body;
    } else {
      const fields: Args = { ...(op.defaults ?? {}) };
      for (const [key, value] of Object.entries(args)) if (!used.has(key) && key !== EXTRA_FIELDS) fields[key] = value;
      const extra = args[EXTRA_FIELDS];
      if (extra && typeof extra === "object" && !Array.isArray(extra)) Object.assign(fields, extra);
      payload = fields;
    }
    const isEmpty = payload === undefined || payload === null || (typeof payload === "object" && Object.keys(payload as object).length === 0);
    if (op.bodyType === "form") {
      const form = new URLSearchParams();
      for (const [key, value] of Object.entries((payload ?? {}) as Args)) {
        if (value !== undefined && value !== null) form.append(key, formValue(value));
      }
      body = form.toString();
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else if (!isEmpty || op.method !== "GET") {
      body = JSON.stringify(isEmpty ? {} : payload);
      headers["Content-Type"] = "application/json";
    }
  }

  return { method: op.method, url, headers, body };
}

// ------------------------------------------------------------------ authentication

function basic(user: string, secret: string): string {
  return `Basic ${Buffer.from(`${user}:${secret}`, "utf8").toString("base64")}`;
}

function requireStandard(): void {
  if (!config.customerId || !config.apiKey) {
    throw new RequestError("Telesign credentials are not configured. Set TELESIGN_CUSTOMER_ID and TELESIGN_API_KEY in the MCP server's environment.");
  }
}

function requireOAuth(): void {
  if (!config.oauthClientId || !config.oauthClientSecret) {
    throw new RequestError("OAuth client credentials are not configured. Set TELESIGN_OAUTH_CLIENT_ID and TELESIGN_OAUTH_CLIENT_SECRET (Telesign portal: Settings > Integrations > OAuth Apps).");
  }
}

function requireProtect(): void {
  if (!config.protectUsername || !config.protectPassword || !config.protectApiKey) {
    throw new RequestError("Protect Platform credentials are not configured. Set TELESIGN_PROTECT_USERNAME, TELESIGN_PROTECT_PASSWORD and TELESIGN_PROTECT_API_KEY.");
  }
}

/**
 * Telesign Digest authentication (HMAC signature over the request).
 * https://developer.telesign.com/enterprise/docs/authentication#digest-authentication
 */
export function digestHeaders(request: PreparedRequest, customerId: string, apiKey: string, now: Date = new Date(), nonce: string = crypto.randomUUID()): Record<string, string> {
  const authMethod = "HMAC-SHA256";
  const date = now.toUTCString();
  const contentType = request.body !== undefined ? request.headers["Content-Type"] ?? "" : "";
  const resource = new URL(request.url).pathname;

  let stringToSign = `${request.method}\n${contentType}\n\nx-ts-auth-method:${authMethod}\nx-ts-date:${date}\nx-ts-nonce:${nonce}`;
  if (contentType && request.body) stringToSign += `\n${request.body}`;
  stringToSign += `\n${resource}`;

  const signature = crypto.createHmac("sha256", Buffer.from(apiKey, "base64")).update(stringToSign, "utf8").digest("base64");
  return {
    Authorization: `TSA ${customerId}:${signature}`,
    "x-ts-auth-method": authMethod,
    "x-ts-date": date,
    "x-ts-nonce": nonce,
  };
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

const tokenCache: Record<string, CachedToken | undefined> = {};

async function fetchJson(url: string, init: RequestInit): Promise<{ status: number; data: any }> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(config.timeoutMs) });
  const text = await response.text();
  let data: any = text;
  try {
    data = JSON.parse(text);
  } catch {
    /* keep text */
  }
  return { status: response.status, data };
}

async function oauthToken(): Promise<string> {
  requireOAuth();
  const cached = tokenCache.oauth;
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;
  const { status, data } = await fetchJson("https://login.telesign.com/oidc/token", {
    method: "POST",
    headers: {
      Authorization: basic(config.oauthClientId, config.oauthClientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });
  if (status >= 400 || !data?.access_token) {
    throw new RequestError(`Could not obtain an OAuth access token (HTTP ${status}): ${typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data).slice(0, 300)}`);
  }
  const ttl = Number(data.expires_in) > 0 ? Number(data.expires_in) : 300;
  tokenCache.oauth = { token: data.access_token, expiresAt: Date.now() + ttl * 1000 };
  return data.access_token;
}

async function protectToken(): Promise<string> {
  requireProtect();
  const cached = tokenCache.protect;
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;
  const url = resolveBaseUrl("https://us-east-1.di-platform.telesign.com/authenticationmanager/v1/authenticate/api");
  const { status, data } = await fetchJson(url, {
    method: "POST",
    headers: {
      Authorization: basic(config.protectUsername, config.protectPassword),
      "x-API-key": config.protectApiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ productId: config.protectProductId }),
  });
  // The authentication guide shows accessToken at the top level; the reference page nests it under `data`.
  const payload = data?.accessToken ? data : data?.data;
  if (status >= 400 || !payload?.accessToken) {
    throw new RequestError(`Could not obtain a Protect Platform access token (HTTP ${status}): ${typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data).slice(0, 300)}`);
  }
  const ttl = Number(payload.expirationTimeSeconds) > 0 ? Number(payload.expirationTimeSeconds) : 300;
  tokenCache.protect = { token: payload.accessToken, expiresAt: Date.now() + ttl * 1000 };
  return payload.accessToken;
}

/** Adds authentication headers. With `offline`, bearer tokens are not fetched (used for dry runs). */
async function authorize(op: Operation, request: PreparedRequest, offline: boolean): Promise<void> {
  switch (op.auth) {
    case "oauth":
      request.headers.Authorization = offline ? "Bearer <OAuth access token fetched at request time>" : `Bearer ${await oauthToken()}`;
      if (offline) requireOAuth();
      break;
    case "oauth-client":
      requireOAuth();
      request.headers.Authorization = basic(config.oauthClientId, config.oauthClientSecret);
      break;
    case "protect-basic":
      requireProtect();
      request.headers.Authorization = basic(config.protectUsername, config.protectPassword);
      request.headers["x-API-key"] = config.protectApiKey;
      break;
    case "protect-bearer":
      request.headers.Authorization = offline ? "Bearer <Protect Platform access token fetched at request time>" : `Bearer ${await protectToken()}`;
      if (offline) requireProtect();
      break;
    case "basic":
    default:
      requireStandard();
      if (config.authMethod === "digest" && op.digest) Object.assign(request.headers, digestHeaders(request, config.customerId, config.apiKey));
      else request.headers.Authorization = basic(config.customerId, config.apiKey);
  }
}

// ------------------------------------------------------------------ redaction

const SECRET_HEADERS = /^(authorization|x-api-key)$/i;
const TOKEN_KEYS = /^(access_?token|id_?token|refresh_?token)$/i;

export function redactRequest(request: PreparedRequest): PreparedRequest {
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(request.headers)) {
    if (!SECRET_HEADERS.test(name)) headers[name] = value;
    else if (value.includes("<")) headers[name] = value;
    else headers[name] = `${value.split(" ").length > 1 ? value.split(" ")[0] + " " : ""}<redacted>`;
  }
  return { ...request, url: redactUrl(request.url), headers };
}

/** Query parameters whose values must not be echoed into tool output (a user's one-time passcode). */
const SECRET_QUERY_PARAMS = ["verify_code"];

export function redactUrl(url: string): string {
  const mark = url.indexOf("?");
  if (mark === -1) return url;
  const query = url
    .slice(mark + 1)
    .split("&")
    .map((pair) => (SECRET_QUERY_PARAMS.includes(pair.split("=")[0]) ? `${pair.split("=")[0]}=<redacted>` : pair))
    .join("&");
  return `${url.slice(0, mark)}?${query}`;
}

/** Masks bearer tokens in API responses so they do not end up in the model's context. */
export function redactTokens(value: unknown): unknown {
  if (config.revealTokens) return value;
  if (Array.isArray(value)) return value.map(redactTokens);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = TOKEN_KEYS.test(key) && typeof child === "string" ? `<redacted, ${child.length} chars; set TELESIGN_REVEAL_TOKENS=true to show>` : redactTokens(child);
    }
    return out;
  }
  return value;
}

// ------------------------------------------------------------------ execution

function failure(request: PreparedRequest, message: string): ApiResult {
  return { ok: false, status: 0, statusText: "", data: null, contentType: "", request: redactRequest(request), error: message };
}

function saveDownload(op: Operation, request: PreparedRequest, buffer: Buffer): string | undefined {
  if (!config.downloadDir) return undefined;
  fs.mkdirSync(config.downloadDir, { recursive: true });
  const last = decodeURIComponent(new URL(request.url).pathname.split("/").pop() || op.tool).replace(/[^\w.-]/g, "_");
  const file = path.join(config.downloadDir, last || op.tool);
  fs.writeFileSync(file, buffer);
  return file;
}

/** Builds, authenticates and sends the request for an operation. Never throws. */
export async function execute(op: Operation, args: Args): Promise<ApiResult> {
  let request: PreparedRequest;
  try {
    request = buildRequest(op, args);
    assertSecureUrl(request.url);
  } catch (error) {
    return failure({ method: op.method, url: op.url, headers: {} }, error instanceof Error ? error.message : String(error));
  }

  try {
    await authorize(op, request, config.dryRun);
  } catch (error) {
    if (!config.dryRun) return failure(request, error instanceof Error ? error.message : String(error));
    // In a dry run a missing credential is reported but does not hide the request.
    request.headers.Authorization = `<not configured: ${error instanceof Error ? error.message : String(error)}>`;
  }

  if (config.dryRun) {
    return { ok: true, status: 0, statusText: "DRY RUN", data: null, contentType: "", request: redactRequest(request), dryRun: true };
  }

  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    const contentType = response.headers.get("content-type") ?? "";
    const result: ApiResult = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: null,
      contentType,
      request: redactRequest(request),
    };

    const isText = /json|text|xml|csv|x-www-form-urlencoded/i.test(contentType) || contentType === "";
    if (isText) {
      const text = await response.text();
      try {
        result.data = text ? redactTokens(JSON.parse(text)) : null;
      } catch {
        result.data = text;
      }
    } else {
      const buffer = Buffer.from(await response.arrayBuffer());
      result.savedTo = response.ok ? saveDownload(op, request, buffer) : undefined;
      result.data = result.savedTo
        ? `Binary response (${buffer.length} bytes) saved to ${result.savedTo}`
        : `Binary response (${buffer.length} bytes, ${contentType}). Set TELESIGN_DOWNLOAD_DIR to have the server save downloads to disk.`;
    }
    return result;
  } catch (error) {
    const reason = error instanceof Error ? (error.name === "TimeoutError" ? `timed out after ${config.timeoutMs} ms` : error.message) : String(error);
    return failure(request, `Request to ${new URL(request.url).host} failed: ${reason}`);
  }
}
