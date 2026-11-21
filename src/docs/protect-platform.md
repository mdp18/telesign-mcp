# Protect Platform and Flow Builder

The Telesign Protect Platform is the portal and API surface that houses Telesign's Digital Intelligence products. Its main feature is Flow Builder, a no-code tool for building adaptive fraud protection workflows: you draw a flow on a canvas (call a service, check a phone number, branch on the result, split traffic, send a message), activate it, and then trigger it from your own systems with one API call. Business rules can change in the portal without a code change in the calling application.

Through the MCP server an assistant can do the run-time half of this: obtain a Protect Platform access token and start an activated flow with input data. Designing, editing and activating flows is done by a person in the Protect portal.

## When to use Flow Builder

Telesign positions Flow Builder for:

- **Account opening / pre-eKYC**: validate phone numbers and screen out fraudulent or high-risk sign-ups before a costly full eKYC check.
- **Authentication**: prevent account takeover and apply risk-based authentication.
- **Password reset, transactions, account takeover**: identify risky phone numbers before the action is processed.
- **Lead validation**: check that incoming leads are genuine.

It suits teams that want non-developers to see and adjust decision logic, want inputs validated before external services are called, and want reports on where flows succeed and fail.

Use a different tool when:

- You just need one lookup or one message. Call the product directly (`phoneid_get_info`, `intelligence_assess_risk`, `messaging_send_sms`, `verifyapi_send_otp`); no flow is needed.
- You do not have Flow Builder. It is offered only in select regions and only to full-service accounts (see "Requirements and limits").

## Key terms

| Term | Meaning |
| --- | --- |
| Flow (transactional flow) | The complete process: step-by-step instructions that read input, call services, make decisions and produce an output |
| Node | One step in a flow, for example call an API, validate a phone number, split traffic |
| Service | A reusable HTTP call (URL, headers, body and how to read the response) |
| Tool | A decision-making node that applies business rules to the outputs of other steps, for example the Format tool (validate a parameter's format) and the Segment tool (split traffic by percentage) |
| Condition | A rule on a node's response that decides which path the flow follows next |
| Request parameters | The named inputs a flow expects; the caller supplies them in `dataToReplace` |
| Session variable | A temporary key-value pair (for example `phoneType`, `riskScore`) kept during a run and used for later decisions |
| Bearer token | The access token that authorizes Flow Builder API calls |
| Pre-eKYC | A low-cost screening step using mobile and IP data during sign-up, before full electronic Know Your Customer checks |

## How it works: create, authenticate, run, validate

1. **Create the flow in the Protect portal.** Sign in at `https://di-portal.telesign.com/auth/login` and open Flow Builder. The Flow Wizard asks for:
   - a flow name (for example "Password Reset - Email"),
   - the request parameters the flow needs, marking which one is the Phone and/or Email field,
   - under Advanced, which parameters are required,
   - then **Build** opens the canvas, where you drag in services, tools and channels, configure each node and add conditions to connect them. A flow needs at least two nodes.
2. **Activate the flow.** When the flow is finished the portal displays the JSON request for it, including its `flowId` and a `dataToReplace` skeleton. Copy it.
3. **Generate an access token.** `POST` to the authentication endpoint with Basic credentials and the API key header. The response contains an `accessToken` and its lifetime.
4. **Initialize the flow.** `POST` the JSON from step 2, with real values, to the init-flow endpoint with `Authorization: Bearer <accessToken>`.
5. **Validate the response.** HTTP 200 with a body confirming the flow was initialized means success; the body includes a tracking identifier. Any other HTTP status comes with an error message in the body.

At run time the flow starts on its first node and moves along the connectors; when a node finishes, its conditions decide the next path; the flow ends at a terminal node or when there are no more connections. Outcomes are visible in the portal's reports (Executive report, Live traffic, Transaction Monitoring).

With the MCP server, steps 3 and 4 collapse into a single call to `flowbuilder_init_flow`, because the server obtains the token itself.

## MCP tools

Both tools are in the `protect-platform` toolset, which is opt-in.

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `protect_generate_access_token` | Generate a Protect Platform access token from the configured username, password and API key | `POST https://us-east-1.di-platform.telesign.com/authenticationmanager/v1/authenticate/api` |
| `flowbuilder_init_flow` | Start an activated transactional flow with input data | `POST https://us-east-1.di-hub.telesign.com/hubv2/model/flow/init-flow` |

The host shown is for the default region; see "Regional hosts and TELESIGN_PROTECT_REGION".

## MCP server configuration for the Protect Platform

| Environment variable | Required | Purpose |
| --- | --- | --- |
| `TELESIGN_TOOLSETS` | yes | Must include `protect-platform`, for example `TELESIGN_TOOLSETS=default,protect-platform` |
| `TELESIGN_PROTECT_USERNAME` | yes | Protect Platform user name (from the DI portal) |
| `TELESIGN_PROTECT_PASSWORD` | yes | Protect Platform password |
| `TELESIGN_PROTECT_API_KEY` | yes | Protect Platform API key, sent as the `x-API-key` header |
| `TELESIGN_PROTECT_REGION` | no | Region prefix of the hosts; default `us-east-1` |
| `TELESIGN_PROTECT_PRODUCT_ID` | no | `productId` sent when the server fetches a token; default `3` (Flow Builder) |

These credentials are separate from the Customer ID and API key used by the other Telesign tools. If any of the three required values is missing, the Protect tools fail with a message naming the variables to set.

How the server uses them:

- `flowbuilder_init_flow` needs a bearer token. The server requests one with the configured credentials and product ID, caches it for the lifetime Telesign reports, and reuses it for later calls. You never pass a token as a tool argument.
- `protect_generate_access_token` exists for checking that the credentials work or for obtaining a token to use outside the server. Tokens are masked in tool output unless `TELESIGN_REVEAL_TOKENS=true` is set. It is not needed before `flowbuilder_init_flow`.

## Authentication: Basic credentials plus x-API-key, then a bearer token

Protect Platform authentication is its own scheme, distinct from the Basic / Digest / OAuth 2.0 authentication of the other Telesign APIs.

1. Get the API credentials (username, password and API key) from the DI portal.
2. Call the token endpoint with:
   - `Authorization: Basic <base64(username:password)>`
   - `x-API-key: <API key>`
   - `Content-Type: application/json`
   - a JSON body carrying the `productId`. The product ID for Flow Builder is `3`.
3. The response contains `accessToken` and `expirationTimeSeconds` (the validity in seconds; Telesign's examples show about eight hours, `28800`).
4. Send `Authorization: Bearer <accessToken>` on Flow Builder requests.
5. The token is valid only for `expirationTimeSeconds`. When it expires, request a new one with the Basic credentials.

Transport rules: HTTPS only. TLS is enforced (TLS 1.3 with fallback to TLS 1.2). Use standard certificate path validation; Telesign warns against certificate pinning because certificates are rotated.

## Token rate limit

Telesign rate-limits requests per token, "to prevent abuse and ensure fair usage": each token can make a limited number of requests in a time window, and going over five requests within 30 seconds is answered with HTTP `429 Too Many Requests`. Design for this:

- Pace flow initializations. The MCP server reuses one cached token, so a burst of more than five `flowbuilder_init_flow` calls inside 30 seconds can hit the limit.
- On a 429, wait for the window to pass before trying again instead of retrying immediately.
- Do not call `protect_generate_access_token` in a loop; one token lasts for hours.

## Regional hosts and TELESIGN_PROTECT_REGION

Protect Platform services are deployed per region, and each region has its own DNS endpoint. Choosing the right region reduces latency and keeps your traffic within the intended geographic boundaries.

| Region name | Region | Host |
| --- | --- | --- |
| US East (N. Virginia) | `us-east-1` | `https://us-east-1.di-platform.telesign.com` |
| Asia Pacific (Jakarta) | `ap-southeast-3` | `https://ap-southeast-3.di-platform.telesign.com` |
| Asia Pacific (Mumbai) | `ap-south-1` | `https://ap-south-1.di-platform.telesign.com` |

Set `TELESIGN_PROTECT_REGION` to one of the region values (`us-east-1`, `ap-southeast-3`, `ap-south-1`). The server substitutes it into both the authentication host (`<region>.di-platform.telesign.com`) and the Flow Builder host (`<region>.di-hub.telesign.com`). Telesign's documentation lists the regional hosts for `di-platform` and gives the Flow Builder base URL only for `us-east-1`; if a flow call fails in another region, confirm the correct Flow Builder host with Telesign.

## Quick start

Check that the Protect credentials work (`protect_generate_access_token`). With no arguments the product ID defaults to `3`. Returns `message` and `data.accessToken` (masked) with `data.expirationTimeSeconds`.

```json
{}
```

The same, stating the product ID explicitly.

```json
{ "productId": 3 }
```

Start a flow that has one request parameter (`flowbuilder_init_flow`). Returns `data.status` and `data.pTracking`.

```json
{
  "flowId": "18380c27-1d1c-4f79-a449-a7c8b12ddf62",
  "dataToReplace": {
    "idNumber": "90123456"
  }
}
```

Route a customer by segment: the flow has a parameter called `segment` and its branching rules send `GOLD` customers down a premium path.

```json
{
  "flowId": "18380c27-1d1c-4f79-a449-a7c8b12ddf62",
  "dataToReplace": {
    "segment": "GOLD"
  }
}
```

A fuller flow with several parameters of different types.

```json
{
  "flowId": "18380c27-1d1c-4f79-a449-a7c8b12ddf62",
  "dataToReplace": {
    "name": "Juan",
    "cellphone": "15551234567",
    "email": "juan.perez@example.com",
    "age": 28,
    "message": "Hello, this is an example"
  }
}
```

A successful response:

```json
{
  "data": {
    "status": "success",
    "pTracking": "802f22a7-c98c-43aa-9ac0-0a0060de8360"
  },
  "error": null
}
```

Before calling `flowbuilder_init_flow`, an assistant should ask the user for the `flowId` and the exact parameter names from the activated flow's JSON. They cannot be discovered through the API, and starting a flow may send messages or call paid services, depending on how it was designed.

## How dataToReplace works

`dataToReplace` is the input of the flow: a flat JSON object in which each key is the name of a request parameter defined when the flow was created, and each value is the data for this run.

**Required versus optional parameters.** A parameter is required at run time in two situations:

| Set in the Flow Wizard | Effect |
| --- | --- |
| The parameter is marked as the flow's Mail field or Phone field | It is flagged as required for nodes that depend on it, such as Phone ID |
| The parameter is selected under Advanced > Select required fields | It must be present (and not empty) in every request |

Every other parameter is optional and can be left out without error.

**Naming and value rules.**

| Rule | Detail |
| --- | --- |
| Keys are case-sensitive | `clientId`, `clientID` and `CLIENTID` are three different parameters |
| Keys must match exactly | Same case, spelling, digits and underscores as the name configured under Request parameters |
| Allowed characters | Letters, numbers and underscores (`segment`, `Segment1`, `customer_email`). Avoid spaces and special characters |
| Values are primitives | String, number or boolean. No nested objects or arrays |
| One-to-one mapping | Every required parameter must appear; optional ones may be skipped |

Telesign's naming advice for flow designers: keep parameter names short, avoid spaces and special characters, and document the expected format (date format, country code and so on) in the parameter description. For phone parameters E.164 format is recommended in the portal documentation.

**The missing-field error.** If a required parameter is absent, or its key is misspelled or differs in case, the flow does not start and the API answers HTTP 400:

```json
{
  "data": null,
  "error": {
    "message": "Required fields missing: <parameterName>"
  }
}
```

The message lists the missing parameter names. Fix the key names and resend. If someone renames or deletes a parameter in the flow designer, every caller's `dataToReplace` keys must be updated to match, or this error appears.

## Key parameters

| Parameter | Tool | Notes |
| --- | --- | --- |
| `flowId` | `flowbuilder_init_flow` | Required. The identifier (UUID v4) of the activated flow, taken from the JSON shown at activation |
| `dataToReplace` | `flowbuilder_init_flow` | Required object, even when the flow needs no values. Keys as described above |
| `productId` | `protect_generate_access_token` | Optional integer; `3` is Flow Builder and is the default |

## Responses and errors

The Protect Platform does not use Telesign's numeric status codes. Check the HTTP status and `error.message`.

Token endpoint (`protect_generate_access_token`):

| HTTP | `error.message` | Meaning | What to do |
| --- | --- | --- | --- |
| 200 | (none) | Token issued: `data.accessToken`, `data.expirationTimeSeconds` | |
| 400 | Request validation failed | Body fields missing or of the wrong type | Send `productId` as an integer |
| 401 | Error validating token | Credentials could not be parsed or verified | Check username, password and API key |
| 401 | Error validating token access to product | The credentials have no access to the product | Check `productId`; ask Telesign to enable Flow Builder |
| 401 | No authorization header provided | Authorization header absent | Check the server's Protect configuration |
| 401 | Invalid or expired token | Token expired or no longer accepted | Authenticate again |
| 404 | Endpoint not found | Wrong path or host | Check the region setting |
| 500 | Internal Server Error | Unexpected server-side failure | Retry later |

Flow initialization (`flowbuilder_init_flow`):

| HTTP | `error.message` | Meaning | What to do |
| --- | --- | --- | --- |
| 200 | (none, `error` is `null`) | Flow initialized. `data.status` describes the result; `data.pTracking` is a UUID v4 for tracing the transaction | Keep `pTracking` to find the run in the portal reports |
| 400 | Request validation failed | `flowId` or `dataToReplace` missing or of the wrong type | Send both; `flowId` must be a UUID v4 and `dataToReplace` an object |
| 400 | Required fields missing: <param1>, <param2>... | Required flow parameters were not supplied | Add the named keys with exact spelling and case |
| 400 | Invalid Flow | The flow exists but its status does not allow this operation | Check the flow in the portal; it must be activated before it can be run |
| 401 | No authorization header provided / Authorization header format error / Unsupported authorization method / Error validating token / Invalid or expired token | Authentication problem | Check the Protect credentials; the server fetches a new token on the next call once the cached one has expired |
| 429 | (rate limit) | The token made more than five requests within 30 seconds | Wait, then pace requests |
| 404 | This FlowId was not found | The `flowId` does not exist or does not belong to the authenticated account | Check the ID, the account and the region |
| 500 | Internal Server Error | Unexpected server-side failure | Retry later |

## Requirements and limits

- **Regional availability.** Flow Builder is available only for customers with end users in select countries. Ask Telesign whether it is offered in your region.
- **Full-service accounts only.**
- **Enablement.** Flow Builder must be enabled for the account by Telesign Customer Support, and so must every Telesign product a flow uses.
- **A flow must be created and activated in the portal first.** The API cannot create, edit, list or activate flows.
- **Token rate limit.** Each token is limited to five requests per 30 seconds, then HTTP 429.
- **Request format.** UTF-8 JSON, `Content-Type: application/json`.
- **Portal requirements.** A current Chrome, Edge or Firefox with cookies and pop-ups allowed for the portal domain, outbound HTTPS on port 443, and a display of at least 1366x768 (1920x1080 or higher recommended for canvas work).
- **Side effects.** Running a flow executes whatever its nodes do (service calls, lookups, messages), which may be billable.

## Related

- Topics: `authentication` (the separate authentication used by other Telesign APIs), `best-practices`, `intelligence` and `phone-id` (products commonly used inside flows), `reference/protect-platform` (generated parameter and response tables).
- `docs_get_tool_reference("flowbuilder_init_flow")` and `docs_get_tool_reference("protect_generate_access_token")` for the full reference.
- Telesign pages used:
  - https://developer.telesign.com/enterprise/docs/flow-builder-overview
  - https://developer.telesign.com/enterprise/docs/flow-builder-get-started
  - https://developer.telesign.com/enterprise/docs/flow-builder-understand-protect-platform
  - https://developer.telesign.com/enterprise/docs/flow-builder-create-a-flow
  - https://developer.telesign.com/enterprise/docs/flow-builder-run-test-and-validate-a-flow
  - https://developer.telesign.com/enterprise/docs/flow-builder-authentication
  - https://developer.telesign.com/enterprise/docs/protect-platform-authentication
  - https://developer.telesign.com/enterprise/reference/initiateauthentication
  - https://developer.telesign.com/enterprise/reference/initializetransactionalflow
