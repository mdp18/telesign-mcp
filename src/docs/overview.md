# Telesign product and API overview

Telesign combines digital identity with global communications so a business can know who a user is,
reach them on the right channel, and keep accounts safe throughout the customer journey. Its products
fall into three families: **Verification** (prove a user controls a phone number or device),
**Engagement** (send and receive messages and calls) and **Digital identity** (understand the phone
number and the risk behind an interaction). This MCP server exposes those products as tools.

This page maps Telesign's product names to the server's toolsets, tools and documentation topics.

## Product map

### Verification

| Product | What it does | Toolset | Guide |
| --- | --- | --- | --- |
| Verification (Verify API) | Onboards users and protects accounts with multifactor authentication: one-time passcodes over SMS, voice, WhatsApp, Viber, RCS and email with automatic fallback between channels, plus Silent Verify and Push Verify. | `verify` | `verify-api` |
| SMS Verify | One-time passcodes by SMS, with Telesign-generated or your own codes. Verify Plus adds a risk assessment before the passcode is sent. | `sms-verify` | `sms-verify` |
| Voice Verify | One-time passcodes spoken in a voice call. | `voice-verify` | `voice-verify` |
| Silent Verification | Verifies possession of a mobile number over the carrier data network with zero interaction from the user. | `silent-verify` | `silent-verify` |
| App Verify | Verifies Android app users with a flash call whose caller ID carries the code. | `app-verify` | `app-verify` |

### Engagement

| Product | What it does | Toolset | Guide |
| --- | --- | --- | --- |
| Omnichannel Messaging | Sends and receives SMS, MMS, RCS, WhatsApp, Viber and email through one API, with cascading fallback channels and message templates. | `messaging` | `messaging` |
| SMS | Builds communications and account-security text messaging into web and mobile apps: single SMS, bulk SMS, delivery status. | `sms` | `messaging-sms` |
| RCS, WhatsApp, Viber | Rich, branded messaging channels, sent through Omnichannel Messaging. | `messaging` | `messaging` |
| Voice | Application-to-person, person-to-application and person-to-person calling: dial, text-to-speech, play audio, collect digits, record. | `voice` | `voice` |
| Number Masking | Private conversation sessions between two parties who never see each other's real number. | `number-masking` | `number-masking` |
| Phone Numbers | Telesign-provided numbers and sender IDs used as the origin of messages and calls. Bought through Telesign, not through an API tool. | - | `messaging-sms` |

### Digital identity

| Product | What it does | Toolset | Guide |
| --- | --- | --- | --- |
| Phone ID | Global phone number and subscriber intelligence: phone type, carrier, location, number cleansing, and identity attributes such as SIM swap, porting, contact match, subscriber status and number deactivation. | `phone-id` | `phone-id` |
| Intelligence | Reputation scoring from phone number intelligence, traffic patterns, machine learning and a global data consortium: a risk score, level and allow / flag / block recommendation with reason codes, for phone numbers and email addresses. | `intelligence` | `intelligence` |
| Deactivated Numbers | Files of deactivated phone numbers for cleaning a user base in bulk. | `deactivated-numbers` | `deactivated-numbers` |

### Account and platform

| Product | What it does | Toolset | Guide |
| --- | --- | --- | --- |
| Accounts API | Clone accounts and manage REST API keys. | `accounts` (admin) | `accounts` |
| Accounts API - SCIM | Provision portal users and groups with SCIM 2.0. | `scim` (admin) | `accounts` |
| Protect Platform / Flow Builder | Run decision flows built in Flow Builder. Select regions, full-service accounts. | `protect-platform` (admin) | `protect-platform` |

## Choosing a product

| Goal | Use |
| --- | --- |
| Confirm a user controls a phone number, on the best available channel | Verify API: `verifyapi_send_otp`, then `verifyapi_check_code` |
| Send an SMS passcode only, with your own template or code | SMS Verify: `smsverify_send_code` |
| Read a passcode aloud in a call | Voice Verify: `voiceverify_send_code` |
| Decide whether to trust a sign-up, login or transaction | Intelligence: `intelligence_assess_risk` (phone), `intelligence_assess_email` (email) |
| Learn what kind of number this is, or whether its SIM was swapped | Phone ID: `phoneid_get_info` with `addons` |
| Check whether a number is live and reachable right now | Phone ID Live Status: `phoneid_live_status` |
| Send an alert, reminder or notification by SMS | SMS: `messaging_send_sms` |
| Send a rich or branded message, with SMS as backup | Omnichannel Messaging: `messaging_send_message` |
| Send one text to many recipients | Bulk SMS: `messaging_send_bulk_sms` |
| Connect two people without revealing their numbers | Number Masking: `numbermasking_create_sms_session`, `numbermasking_create_sms_voice_session` |
| Place a call, play audio or text-to-speech, record | Voice: `voice_send_action` |

## Toolsets

Tools are grouped into toolsets in three tiers, so that a conversation does not start with every
tool's schema loaded.

- **Core** toolsets are listed when the server starts.
- **Extended** toolsets are off at first. Find their tools with `telesign_find_tools`, then switch a
  toolset on with `telesign_enable_toolsets` (the tool list updates in place), or run one tool with
  `telesign_call_tool` if the client does not refresh its tool list.
- **Admin** toolsets are available only when the operator names them in the `TELESIGN_TOOLSETS`
  environment variable. They cannot be switched on from inside a conversation.

The operator chooses what is listed at startup with `TELESIGN_TOOLSETS`: toolset keys and/or the groups
`core` (default), `extended` (every product toolset) and `all`, for example `core,voice` or
`extended,accounts`. `TELESIGN_DYNAMIC_TOOLSETS=false` turns runtime switching off.

| Toolset | Tier | Tools |
| --- | --- | --- |
| `verify` | core | `verifyapi_send_otp`, `verifyapi_get_status`, `verifyapi_update_process`, `verifyapi_check_code` |
| `sms` | core | `messaging_send_sms`, `messaging_get_sms_status`, `messaging_report_completion`, `messaging_send_bulk_sms` |
| `phone-id` | core | `phoneid_get_info`, `phoneid_get_info_private`, `phoneid_live_status`, `phoneid_legacy_contact`, `phoneid_legacy_number_deactivation` |
| `intelligence` | core | `intelligence_assess_risk`, `intelligence_assess_email`, `intelligence_score_legacy` |
| `sms-verify` | extended | `smsverify_send_code`, `smsverify_get_status`, `smsverify_report_completion` |
| `voice-verify` | extended | `voiceverify_send_code`, `voiceverify_get_status`, `voiceverify_report_completion` |
| `silent-verify` | extended | `silentverify_initiate`, `silentverify_finalize` |
| `app-verify` | extended | `appverify_initiate`, `appverify_get_status`, `appverify_finalize_call`, `appverify_report_caller_id`, `appverify_report_timeout` |
| `messaging` | extended | `messaging_send_message`, `messaging_get_message_status`, `messaging_check_channel_capability`, `messaging_check_rcs_capability`, `templates_create`, `templates_list`, `templates_get`, `templates_delete` |
| `number-masking` | extended | `numbermasking_create_sms_session`, `numbermasking_create_sms_voice_session` |
| `voice` | extended | `voice_send_action`, `voice_list_recordings_for_call`, `voice_list_recordings`, `voice_delete_recordings` |
| `deactivated-numbers` | extended | `deactivatednumbers_list_files`, `deactivatednumbers_download_file` |
| `accounts` | admin | `accounts_clone_account`, `accounts_list_api_keys`, `accounts_create_api_key`, `accounts_get_api_key`, `accounts_update_api_key`, `accounts_delete_api_key` |
| `scim` | admin | `scim_*` (14 tools), `auth_request_access_token` |
| `protect-platform` | admin | `protect_generate_access_token`, `flowbuilder_init_flow` |

Always available: `telesign_find_tools`, `telesign_enable_toolsets`, `telesign_call_tool`,
`telesign_server_info`, `docs_list`, `docs_search`, `docs_get`, `docs_get_tool_reference`.

Most products must be enabled on your Telesign account before their endpoints answer. A `401` or `403`
on a single product usually means it is not enabled yet; contact Telesign to add it.

## Conventions shared by the APIs

### Phone numbers

Digits only, starting with the country dialing code, with no `+`, spaces or punctuation:
`15551234567`. The server removes a leading `+`, spaces, dashes, dots and parentheses for you.

### Reference IDs

Every transaction returns a `reference_id`. Keep it: status tools, completion reports and callbacks
all identify the transaction by it.

### Status objects

Responses carry a `status` object with a numeric `code` and a `description`, separate from the HTTP
status. A request can return HTTP 200 while `status.code` reports that delivery is still in progress
or failed. Problems with the request itself are listed in `errors`. See `error-codes`.

### Request formats

Older REST endpoints (`/v1/verify/*`, `/v1/messaging`, Intelligence) take
`application/x-www-form-urlencoded` bodies. Newer ones (Verify API, omnichannel Messaging, Phone ID,
Voice, Number Masking) take JSON. The tools handle the encoding; you pass plain arguments.

### Hosts

| Host | Used by |
| --- | --- |
| `https://rest-ww.telesign.com` | SMS, SMS / Voice / App Verify, omnichannel Messaging, Number Masking, Voice, Phone ID |
| `https://verify.telesign.com` | Verify API, Silent Verify |
| `https://detect.telesign.com` | Intelligence Cloud, Email Intelligence |
| `https://deact-api.telesign.com` | Deactivated Numbers |
| `https://accounts.telesign.com` | Accounts API, SCIM |
| `https://login.telesign.com` | OAuth 2.0 token endpoint |
| `https://<region>.di-platform.telesign.com`, `https://<region>.di-hub.telesign.com` | Protect Platform, Flow Builder |

### Callbacks

Delivery reports and events are posted to a callback URL that you host; an MCP server cannot receive
them. Either poll the status tools, or run your own callback endpoint. See `callbacks`.

## Working safely

- Tools that send messages or place calls reach real people and cost money. Confirm the recipient and
  the content before sending.
- Set `TELESIGN_DRY_RUN=true` to make every tool return the request it would send without contacting
  Telesign, and `TELESIGN_READ_ONLY=true` to register only lookup and status tools.
- Account, SCIM and API-key tools are in admin toolsets, which only the operator can enable, because they change who can access the account.

## Documentation topics

Guides: `overview`, `authentication`, `verify-api`, `sms-verify`, `voice-verify`, `silent-verify`,
`app-verify`, `messaging`, `messaging-sms`, `number-masking`, `voice`, `phone-id`, `intelligence`,
`deactivated-numbers`, `accounts`, `protect-platform`, `callbacks`, `error-codes`, `best-practices`.

API reference, generated from Telesign's OpenAPI definitions: `reference/<toolset>` for each toolset
above, and `reference/callbacks` for webhook payloads. `docs_get_tool_reference("<tool>")` returns the
reference for a single tool.

## Related

- `authentication` - credentials and every environment variable.
- `best-practices` - guidance that applies across products.
- Telesign developer portal: <https://developer.telesign.com/enterprise/docs/get-started-with-docs>
- Telesign products: <https://www.telesign.com/products>
