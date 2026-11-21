# Telesign MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server that gives AI assistants (Claude, ChatGPT, Gemini, Cursor and other MCP clients) direct access to Telesign's APIs: verification, messaging, voice, number masking, phone number intelligence and fraud risk scoring.

- **68 API tools across 16 Telesign product areas**, generated from the OpenAPI definitions Telesign publishes, so parameters, enums and endpoints match the official reference.
- **A small default footprint**: only the core toolsets (Verify API, SMS, Phone ID, Intelligence) are listed at startup. The assistant switches on the rest when a task needs them.
- **Bundled documentation**: 19 product guides plus a full API reference, searchable by the assistant.
- **Safe by design**: dry-run mode, read-only mode, opt-in admin toolsets, credentials that never reach the model.

## Contents

- [Products and tools](#products-and-tools)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage examples](#usage-examples)
- [Trying it without sending anything](#trying-it-without-sending-anything)
- [Documentation tools](#documentation-tools)
- [Prompts](#prompts)
- [Development](#development)

## Products and tools

### Verification

| Product | Tools |
| --- | --- |
| **Verify API** - omnichannel one-time passcodes over SMS, voice, WhatsApp, Viber, RCS and email with automatic fallback, plus Silent Verify and Push Verify | `verifyapi_send_otp`, `verifyapi_check_code`, `verifyapi_get_status`, `verifyapi_update_process` |
| **SMS Verify** - SMS one-time passcodes with Telesign-generated or your own codes | `smsverify_send_code`, `smsverify_get_status`, `smsverify_report_completion` |
| **Voice Verify** - one-time passcodes by voice call | `voiceverify_send_code`, `voiceverify_get_status`, `voiceverify_report_completion` |
| **Silent Verification** - zero-interaction verification over the carrier data network | `silentverify_initiate`, `silentverify_finalize` |
| **App Verify** - Android flash-call verification | `appverify_initiate`, `appverify_get_status`, `appverify_finalize_call`, `appverify_report_caller_id`, `appverify_report_timeout` |
| **Smart Verify** - Telesign picks SMS or voice | `smartverify_send_code` |

### Engagement

| Product | Tools |
| --- | --- |
| **Omnichannel Messaging** - SMS, MMS, RCS, WhatsApp, Viber and email through one API with fallback channels | `messaging_send_message`, `messaging_get_message_status`, `messaging_check_channel_capability`, `messaging_check_rcs_capability` |
| **Message templates** | `templates_create`, `templates_list`, `templates_get`, `templates_delete` |
| **SMS** - single and bulk SMS | `messaging_send_sms`, `messaging_get_sms_status`, `messaging_send_bulk_sms`, `messaging_report_completion` |
| **Voice** - dial, text-to-speech, play audio, collect digits, record | `voice_send_action`, `voice_list_recordings`, `voice_list_recordings_for_call`, `voice_delete_recordings` |
| **Number Masking** - private SMS and voice sessions between two parties | `numbermasking_create_sms_session`, `numbermasking_create_sms_voice_session` |

### Digital identity

| Product | Tools |
| --- | --- |
| **Phone ID** - phone type, carrier, location, number cleansing, and identity attributes (SIM swap, porting, contact match, subscriber status, number deactivation and more), plus Live Status | `phoneid_get_info`, `phoneid_get_info_private`, `phoneid_live_status`, `phoneid_legacy_contact`, `phoneid_legacy_number_deactivation` |
| **Intelligence** - risk score, level and allow / flag / block recommendation with reason codes, for phone numbers and email addresses | `intelligence_assess_risk`, `intelligence_assess_email`, `intelligence_score_legacy` |
| **Deactivated Numbers** - bulk files of deactivated numbers | `deactivatednumbers_list_files`, `deactivatednumbers_download_file` |

### Account and platform (admin toolsets, enabled only through configuration)

| Product | Tools |
| --- | --- |
| **Accounts API** - clone accounts, manage REST API keys | `accounts_clone_account`, `accounts_list_api_keys`, `accounts_create_api_key`, `accounts_get_api_key`, `accounts_update_api_key`, `accounts_delete_api_key` |
| **Accounts API - SCIM** - provision portal users and groups | `scim_list_users`, `scim_create_user`, `scim_get_user`, `scim_replace_user`, `scim_patch_user`, `scim_delete_user`, `scim_list_groups`, `scim_get_group`, `scim_patch_group`, `scim_list_schemas`, `scim_get_schema`, `scim_list_resource_types`, `scim_get_resource_type`, `scim_get_service_provider_config`, `auth_request_access_token` |
| **Protect Platform / Flow Builder** | `protect_generate_access_token`, `flowbuilder_init_flow` |

### Always available

| Tool | Purpose |
| --- | --- |
| `telesign_find_tools` | Searches every tool the server can provide, including toolsets that are switched off |
| `telesign_enable_toolsets` | Switches toolsets on or off for the session |
| `telesign_call_tool` | Runs any available tool by name (for clients that do not refresh their tool list) |
| `telesign_server_info` | Shows enabled toolsets, which credentials are present (never their values), hosts and modes |
| `docs_list`, `docs_search`, `docs_get`, `docs_get_tool_reference` | Bundled Telesign documentation |

Most Telesign products must be enabled on your account before their endpoints respond. A `401` or `403` from one product usually means Telesign has not enabled it yet.

## Installation

### Prerequisites

- Node.js 18 or newer
- An MCP client (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, ...)
- A Telesign account with API credentials ([sign up](https://portal.telesign.com/signup))

### With npx

No install step: point your MCP client at `npx -y telesign-mcp` (see [Configuration](#configuration)).

### From source

```bash
git clone https://github.com/mdp18/telesign-mcp.git
cd telesign-mcp
npm install
npm run build
```

## Configuration

### Claude Desktop

Add the server to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`):

```json
{
  "mcpServers": {
    "telesign": {
      "command": "npx",
      "args": ["-y", "telesign-mcp"],
      "env": {
        "TELESIGN_CUSTOMER_ID": "your-customer-id",
        "TELESIGN_API_KEY": "your-api-key"
      }
    }
  }
}
```

When running from source, use `"command": "node"` and `"args": ["/path/to/telesign-mcp/build/index.js"]`.

### Claude Code

```bash
claude mcp add telesign \
  --env TELESIGN_CUSTOMER_ID=your-customer-id \
  --env TELESIGN_API_KEY=your-api-key \
  -- npx -y telesign-mcp
```

### Environment variables

Only the first two are required for the standard product tools.

| Variable | Purpose |
| --- | --- |
| `TELESIGN_CUSTOMER_ID` | Your Telesign Customer ID |
| `TELESIGN_API_KEY` | Your Telesign API key |
| `TELESIGN_TOOLSETS` | Which toolsets are listed at startup: unset or `core` (default), `extended` (every product toolset), `all`, or a comma-separated list such as `core,voice` or `extended,accounts`. See [Toolsets](#toolsets) |
| `TELESIGN_DYNAMIC_TOOLSETS` | `false` stops the assistant from switching on toolsets that are not in `TELESIGN_TOOLSETS` |
| `TELESIGN_READ_ONLY` | `true` registers only tools that neither contact an end user nor change data |
| `TELESIGN_DRY_RUN` | `true` returns the HTTP request each tool would send, without sending it |
| `TELESIGN_AUTH_METHOD` | `basic` (default) or `digest` (HMAC-signed requests, on endpoints that support it) |
| `TELESIGN_TIMEOUT_MS` | Request timeout, default `30000` |
| `TELESIGN_DOWNLOAD_DIR` | Directory for downloaded files (Deactivated Numbers) |
| `TELESIGN_REST_URL`, `TELESIGN_VERIFY_URL`, `TELESIGN_DETECT_URL` | Override API hosts, for example during a failover |
| `TELESIGN_OAUTH_CLIENT_ID`, `TELESIGN_OAUTH_CLIENT_SECRET` | OAuth app credentials, needed only for the `scim` toolset |
| `TELESIGN_PROTECT_USERNAME`, `TELESIGN_PROTECT_PASSWORD`, `TELESIGN_PROTECT_API_KEY`, `TELESIGN_PROTECT_REGION` | Protect Platform credentials and region, needed only for the `protect-platform` toolset |
| `TELESIGN_REVEAL_TOKENS` | `true` stops masking bearer tokens in tool results |

### Toolsets

Every tool's description is sent to the model at the start of a conversation, so the server does not list all 68 by default. Tools are grouped into toolsets in three tiers:

| Tier | Toolsets | Behaviour |
| --- | --- | --- |
| **Core** | `verify`, `sms`, `phone-id`, `intelligence` | Listed at startup |
| **Extended** | `sms-verify`, `voice-verify`, `silent-verify`, `app-verify`, `smart-verify`, `messaging`, `number-masking`, `voice`, `deactivated-numbers` | Off at startup. The assistant finds them with `telesign_find_tools` and switches them on with `telesign_enable_toolsets` when a task needs them |
| **Admin** | `accounts`, `scim`, `protect-platform` | Only available when you list them in `TELESIGN_TOOLSETS`. They can never be switched on from inside a conversation |

With the default settings the server lists 24 tools (about 49 KB of schema). With everything on it lists 77 (about 142 KB).

**Choosing what is on at startup** - set `TELESIGN_TOOLSETS` to toolset keys and/or the groups `core`, `extended`, `all`:

| Value | Listed at startup |
| --- | --- |
| *(unset)* or `core` | The four core toolsets |
| `core,voice,messaging` | Core plus Voice and omnichannel Messaging |
| `phone-id,intelligence` | Only those two |
| `extended` | Every product toolset |
| `extended,accounts` | Every product toolset plus the Accounts API |
| `all` | Everything |

**Switching on more during a conversation** - when the model needs a tool that is not listed, it calls `telesign_find_tools` (for example with the query "whatsapp") and then `telesign_enable_toolsets`. The server enables the tools and sends the MCP `tools/list_changed` notification, so clients such as Claude Code show them immediately. For clients that do not refresh their tool list, `telesign_call_tool` runs any available tool by name.

Set `TELESIGN_DYNAMIC_TOOLSETS=false` if you want the startup list to be a hard limit.

## Usage examples

Once configured, ask your assistant things like:

- "Send a verification code to +1 555 123 4567 by WhatsApp, falling back to SMS after 30 seconds." Then: "The code is 482913, check it."
- "Is +1 555 123 4567 a mobile, landline or VoIP number, and who is the carrier?"
- "Has the SIM for this number been swapped recently?"
- "Score the fraud risk of a sign-up from +1 555 123 4567 with IP 203.0.113.5."
- "Text +1 555 123 4567: 'Your order has shipped.' and tell me when it is delivered."
- "What does Telesign status code 3900 mean?"

Phone numbers are sent to Telesign as digits with the country code. The server strips `+`, spaces and punctuation for you.

Tools that send messages or place calls reach real people and are billed to your account. Each tool carries MCP annotations (`readOnlyHint`, `destructiveHint`) so clients can ask for confirmation.

## Trying it without sending anything

Set `TELESIGN_DRY_RUN=true` and every tool returns the request it would have sent, with credentials removed:

```text
DRY RUN - Send SMS verification code (smsverify_send_code). Nothing was sent to Telesign.

POST https://rest-ww.telesign.com/v1/verify/sms
Accept: application/json
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <redacted>

phone_number=15551234567&verify_code=12345
```

Use it to review request syntax, to demo the server, or to develop prompts without spending credit. `TELESIGN_READ_ONLY=true` is the complementary guard for live credentials: only lookups, risk scores, status checks and listings are registered.

## Documentation tools

The server ships Telesign documentation that the assistant can read on demand:

| Tool | Purpose |
| --- | --- |
| `docs_list` | List all topics |
| `docs_search` | Ranked full-text search across guides and reference |
| `docs_get` | Read a topic, or one section of it |
| `docs_get_tool_reference` | Full reference for one tool: endpoint, every parameter, response fields, status codes, examples |

Guide topics: `overview`, `authentication`, `verify-api`, `sms-verify`, `voice-verify`, `silent-verify`, `app-verify`, `messaging`, `messaging-sms`, `number-masking`, `voice`, `phone-id`, `intelligence`, `deactivated-numbers`, `accounts`, `protect-platform`, `callbacks`, `error-codes`, `best-practices`.

Reference topics: `reference/<toolset>` for every toolset, and `reference/callbacks` for webhook payloads.

Every topic is also an MCP resource at `docs://telesign/<topic>`.

## Prompts

Reusable workflows exposed as MCP prompts:

| Prompt | What it does |
| --- | --- |
| `verify_phone_number` | Send a passcode with channel fallback, then check the code |
| `assess_signup_risk` | Combine Intelligence and Phone ID into an allow / step-up / block recommendation |
| `check_number_before_messaging` | Decide whether and how to message a number |
| `send_message_with_fallback` | Send an omnichannel message with fallback and report delivery |

## Development

```bash
npm run build       # compile TypeScript and copy docs into build/
npm test            # build, then run the offline test suite
npm run dev         # TypeScript watch mode
npm start           # run the compiled server on stdio
npm run sync-specs  # regenerate the tool catalog and reference docs from Telesign's published OpenAPI definitions
```

### How the tools are generated

Every Telesign API reference page publishes an OpenAPI definition. `scripts/sync-specs.mjs` reads those definitions and writes:

- `src/catalog/operations.ts` - one descriptor per operation (URL, method, auth, parameters, body schema), which the server turns into MCP tools at startup;
- `src/docs/reference/*.md` - the bundled API reference.

`scripts/tool-map.mjs` maps each reference page to a tool name and toolset. To add an endpoint, add its page slug there and run `npm run sync-specs`. The product guides in `src/docs/*.md` are written by hand.

The test suite never contacts Telesign: it checks the catalog, builds a request for every operation, compares key requests with the documented syntax, and exercises the server over an in-memory MCP connection in dry-run mode.

## License

Apache 2.0 - see [LICENSE](LICENSE).

## Support

- [Telesign developer portal](https://developer.telesign.com/)
- [Telesign support](https://support.telesign.com/)
- [MCP documentation](https://modelcontextprotocol.io/)

## Disclaimer

This is a community-driven, open source project and is **not officially affiliated with, endorsed by, or supported by Telesign**. The author(s) do not own or claim any rights to the Telesign trademark, name, or branding. "Telesign" and any associated logos are trademarks of Telesign Corporation. The bundled API reference is derived from Telesign's public developer documentation at <https://developer.telesign.com/>, which remains the authoritative source.

This project is provided "as is" without warranty of any kind. Use at your own risk. For official Telesign support not related to this MCP server, please contact Telesign directly.
