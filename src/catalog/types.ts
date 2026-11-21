/** Minimal JSON Schema subset used by the generated operation catalog. */
export interface JsonSchema {
  type?: string;
  description?: string;
  enum?: Array<string | number | boolean | null>;
  const?: unknown;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  additionalProperties?: boolean | JsonSchema;
  default?: unknown;
  nullable?: boolean;
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
}

export interface OperationParam {
  name: string;
  required: boolean;
  schema: JsonSchema;
}

/**
 * How a request is authenticated.
 * - basic:          Customer ID + API key (Basic, or Digest when TELESIGN_AUTH_METHOD=digest and the endpoint supports it)
 * - oauth:          OAuth 2.0 bearer token obtained with the client credentials flow
 * - oauth-client:   Basic auth with the OAuth client ID + secret (the token endpoint itself)
 * - protect-basic:  Protect Platform username + password, plus the x-API-key header
 * - protect-bearer: Protect Platform bearer token
 */
export type AuthKind = "basic" | "oauth" | "oauth-client" | "protect-basic" | "protect-bearer";

export interface Operation {
  /** MCP tool name. */
  tool: string;
  /** Toolset key (see TOOLSETS). */
  toolset: string;
  title: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | string;
  /** Full URL template, e.g. https://rest-ww.telesign.com/v1/verify/{reference_id}. */
  url: string;
  auth: AuthKind | string;
  /** True when Telesign documents Digest authentication for this endpoint. */
  digest?: boolean;
  bodyType: "json" | "form" | null | string;
  /**
   * none    - no request body
   * flatten - body properties are top-level tool arguments
   * single  - the whole body is passed in a `body` argument
   */
  bodyMode: "none" | "flatten" | "single" | string;
  pathParams: OperationParam[];
  queryParams: OperationParam[];
  headerParams: OperationParam[];
  body: JsonSchema | null;
  /**
   * Parameters that make an otherwise read-only call change state at Telesign, for example `verify_code`
   * on a status lookup, which checks the code and uses up an attempt. They are not offered in read-only mode.
   */
  stateChangingParams?: string[];
  /** Body fields sent when the caller does not supply them. */
  defaults?: Record<string, unknown>;
  /** Telesign marks the operation deprecated; it is offered only as a labelled legacy tool. */
  deprecated?: boolean;
  readOnly: boolean;
  destructive: boolean;
  idempotent: boolean;
  docsUrl: string;
}

export interface ToolsetInfo {
  title: string;
  blurb: string;
  /**
   * core     - registered by default
   * extended - off by default; can be switched on at runtime or pinned on with TELESIGN_TOOLSETS
   * admin    - only available when the operator lists it in TELESIGN_TOOLSETS (or uses "all")
   */
  tier: "core" | "extended" | "admin" | string;
}
