# Authentication and server configuration

How the Telesign MCP server authenticates to Telesign, which credentials each toolset needs, and every
environment variable the server reads. Credentials live only in the server's environment: tools never
take them as arguments and never print them.

## Credentials by toolset

| Toolsets | Authentication | Environment variables |
| --- | --- | --- |
| `verify`, `sms`, `phone-id`, `intelligence`, `sms-verify`, `voice-verify`, `silent-verify`, `app-verify`, `smart-verify`, `messaging`, `number-masking`, `voice`, `deactivated-numbers`, `accounts` | Basic (default) or Digest, with your Customer ID and API key | `TELESIGN_CUSTOMER_ID`, `TELESIGN_API_KEY` |
| `scim` | OAuth 2.0 client credentials (bearer token) | `TELESIGN_OAUTH_CLIENT_ID`, `TELESIGN_OAUTH_CLIENT_SECRET` |
| `protect-platform` | Protect Platform Basic (username and password) plus `x-API-key`, exchanged for a bearer token | `TELESIGN_PROTECT_USERNAME`, `TELESIGN_PROTECT_PASSWORD`, `TELESIGN_PROTECT_API_KEY` |

Find your Customer ID and API key in the Telesign portal. A request authenticated with them can use
every product enabled for the account, so treat the API key like a password.

Run the `telesign_server_info` tool to see which credentials the server has picked up (it reports
"set" or "not set", never the values).

## Basic authentication

The default. The server sends `Authorization: Basic base64(customer_id:api_key)` over HTTPS on every
request. Telesign describes it as the easiest method and the best performing one. Its weakness is that
the credentials travel with each request, which is why HTTPS is mandatory (Telesign does not accept
plain HTTP).

## Digest authentication

Set `TELESIGN_AUTH_METHOD=digest` to sign requests instead of sending the API key. The server then
adds these headers:

| Header | Value |
| --- | --- |
| `Authorization` | `TSA <customer_id>:<signature>` |
| `x-ts-auth-method` | `HMAC-SHA256` |
| `x-ts-date` | Request time in RFC 1123 format (GMT). Must be within 15 minutes of Telesign's clock. |
| `x-ts-nonce` | A random UUID, unique per request, to defend against replay. |

The signature is `base64(HMAC-SHA256(base64decode(api_key), string_to_sign))`, where the string to
sign is built from the method, content type, the `x-ts-` headers in alphabetical order, the request
body (when there is one) and the path:

```text
POST\n
application/x-www-form-urlencoded\n
\n
x-ts-auth-method:HMAC-SHA256\n
x-ts-date:Tue, 31 Jan 2017 11:36:42 GMT\n
x-ts-nonce:<nonce>\n
phone_number=4445551212&language=en-US\n
/v1/verify/sms
```

Digest is only applied to endpoints whose Telesign reference page documents Digest support. All other
endpoints keep using Basic even when `TELESIGN_AUTH_METHOD=digest`. Basic is the safer choice if you
are unsure; switch to Digest only if your security policy asks for signed requests.

## OAuth 2.0 client credentials (SCIM)

The SCIM operations of the Accounts API need a bearer token:

1. Telesign must enable Integrations / OAuth 2.0 for your organization.
2. An org-level admin creates an OAuth app in the portal under **Settings > Integrations > OAuth Apps**,
   with only the scopes it needs (`accounts`, `scim`).
3. Put the app's client ID and client secret in `TELESIGN_OAUTH_CLIENT_ID` and `TELESIGN_OAUTH_CLIENT_SECRET`.

The server requests a token from `POST https://login.telesign.com/oidc/token`
(`grant_type=client_credentials`, client credentials in a Basic header), caches it until shortly before
it expires, and sends it as `Authorization: Bearer <token>` to SCIM endpoints. You never handle the
token yourself. The `auth_request_access_token` tool exists to check that the OAuth app works; its
result masks the token value.

## Protect Platform authentication

Protect Platform and Flow Builder use their own credentials, issued in the DI portal:

1. The server calls `POST https://<region>.di-platform.telesign.com/authenticationmanager/v1/authenticate/api`
   with `Authorization: Basic base64(username:password)`, the `x-API-key` header and a JSON body
   `{"productId": 3}`.
2. Telesign answers with `accessToken` and `expirationTimeSeconds`.
3. The server caches the token and sends `Authorization: Bearer <accessToken>` to Flow Builder.

Tokens are rate limited (Telesign documents five requests per 30 seconds per token before a
`429 Too Many Requests`). Choose the region with `TELESIGN_PROTECT_REGION`:

| Region | Value |
| --- | --- |
| US East (N. Virginia) | `us-east-1` (default) |
| Asia Pacific (Jakarta) | `ap-southeast-3` |
| Asia Pacific (Mumbai) | `ap-south-1` |

## Environment variables

### Credentials

| Variable | Purpose |
| --- | --- |
| `TELESIGN_CUSTOMER_ID` | Customer ID for Basic / Digest authentication. |
| `TELESIGN_API_KEY` | API key (the base64 string from the portal). |
| `TELESIGN_AUTH_METHOD` | `basic` (default) or `digest`. |
| `TELESIGN_OAUTH_CLIENT_ID`, `TELESIGN_OAUTH_CLIENT_SECRET` | OAuth app credentials for SCIM tools. |
| `TELESIGN_PROTECT_USERNAME`, `TELESIGN_PROTECT_PASSWORD`, `TELESIGN_PROTECT_API_KEY` | Protect Platform credentials. |
| `TELESIGN_PROTECT_REGION` | Protect Platform region. Default `us-east-1`. |
| `TELESIGN_PROTECT_PRODUCT_ID` | Product ID sent when requesting a Protect Platform token. Default `3` (Flow Builder). |

### Behaviour

| Variable | Purpose |
| --- | --- |
| `TELESIGN_TOOLSETS` | Which toolsets are listed at startup. Unset, `core` or `default`: the core toolsets (`verify`, `sms`, `phone-id`, `intelligence`). `extended`: every product toolset. `all`: everything, including the admin toolsets (`accounts`, `scim`, `protect-platform`). Or a comma-separated mix of keys and groups, such as `core,voice` or `extended,accounts`. Admin toolsets are available only when named here. |
| `TELESIGN_DYNAMIC_TOOLSETS` | On by default: the assistant may switch on extended toolsets during a session with `telesign_enable_toolsets`, or run their tools with `telesign_call_tool`. Set to `false` to make `TELESIGN_TOOLSETS` a hard limit. |
| `TELESIGN_READ_ONLY` | `true` registers only tools that neither send anything to an end user nor change data (lookups, status checks, risk scores, listings). Status tools stay available, but their `verify_code` parameter is hidden and rejected, because checking a code completes a verification or uses up an attempt. |
| `TELESIGN_DRY_RUN` | `true` makes every tool return the exact HTTP request it would send (method, URL, headers with secrets removed, body) without contacting Telesign. Use it to review request syntax or to demo safely. |
| `TELESIGN_REVEAL_TOKENS` | `true` stops masking `access_token` values in tool results. Leave off unless you need the raw token. |
| `TELESIGN_TIMEOUT_MS` | Request timeout in milliseconds. Default `30000`. |
| `TELESIGN_DOWNLOAD_DIR` | Directory where binary responses (for example Deactivated Numbers files) are saved. When unset, binary responses are only described. |

### Hosts

| Variable | Replaces | Use |
| --- | --- | --- |
| `TELESIGN_REST_URL` | `https://rest-ww.telesign.com` | Point REST calls at another Telesign REST host, for example during a failover. |
| `TELESIGN_VERIFY_URL` | `https://verify.telesign.com` | Alternate Verify API host. |
| `TELESIGN_DETECT_URL` | `https://detect.telesign.com` | Alternate Intelligence host. |

Overrides must be `https://` URLs. A request to any other scheme is refused before credentials are
attached, so the API key is never sent unencrypted. The only exception is `http://` on a loopback
host (`localhost`, `127.0.0.1`), which is allowed for local mock servers.

## Security requirements from Telesign

- HTTPS only. HTTP is not supported.
- Rely on standard certificate validation rather than pinning Telesign's certificates; pinned
  certificates break when certificates are rotated.
- Telesign advises against restricting your outbound requests to Telesign by IP address, because
  traffic can shift between service locations.

## Troubleshooting authentication errors

| Symptom | Likely cause |
| --- | --- |
| Tool result says credentials are not configured | The variable is missing from the MCP server's environment (set it in the client's server config, not in your shell). |
| HTTP 401 with error `-30000` to `-30012` range | Wrong Customer ID or API key, a malformed header, or a Digest timestamp more than 15 minutes off. See `error-codes`. |
| HTTP 401 / 403 on one product only | That product is not enabled for the account. Contact Telesign. |
| SCIM tools fail with "Could not obtain an OAuth access token" | OAuth is not enabled for the organization, or the client ID / secret are wrong. |
| HTTP 429 from Protect Platform | Token rate limit exceeded; wait before retrying. |

## Related

- `overview` - product map and toolsets.
- `accounts` - Accounts API and SCIM.
- `protect-platform` - Protect Platform and Flow Builder.
- `error-codes` - authentication error codes.
- Telesign docs: <https://developer.telesign.com/enterprise/docs/authentication>, <https://developer.telesign.com/enterprise/docs/protect-platform-authentication>
