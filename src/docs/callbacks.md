# Callbacks and delivery reports

The HTTP response to a Telesign send only tells you that the request was accepted. What happened afterwards (delivered, failed, read, replied to, verified) is reported asynchronously: Telesign makes an HTTPS `POST` with a JSON body to a URL that you host. Telesign calls this endpoint a Transaction Callback Service; the notifications are also called callbacks, webhooks or delivery reports (DLRs). This guide explains how the mechanism works across products, how to point Telesign at your endpoint, how retries work, how to check that a callback really came from Telesign, and which callbacks each product sends.

## The MCP server does not receive callbacks

The `telesign-mcp` server only makes outbound requests to Telesign. It does not listen for incoming HTTP requests, so it cannot receive, store or show callbacks. Two consequences:

- A callback endpoint has to be built and hosted by the customer (a public HTTPS service). An assistant can help write that handler, and can pass a `callback_url` on a send, but it will never see the notification itself.
- To find out what happened to a transaction from inside an MCP session, poll the status tool for the product with the `reference_id` returned by the send. See "Polling status tools instead of callbacks" below.

Payload field tables and example payloads for every callback type are in the generated topic `reference/callbacks`.

## When to use callbacks and when to poll

Use callbacks when:

- You send at volume. One endpoint receives updates for all transactions, which is cheaper than one status request per message.
- You need events that have no status endpoint: inbound (mobile originated) messages, Number Masking session messages, Voice call events, template approval results, read receipts.
- You generate your own verification codes with SMS Verify API and so have no other reason to call the status endpoint.

Poll instead when:

- You are working interactively through MCP tools, or have no public endpoint.
- You use SMS Verify API with a Telesign-generated code. You already call the status endpoint to check the code the user typed, and the same response carries the delivery status, so no extra integration is needed. Status can be fetched for up to 12 hours after the send.

Telesign's own recommendation for SMS Verify API: use the Transaction Callback Service if you generate your own codes and expect high volume; otherwise use the status request.

## How the Transaction Callback Service works

1. You send a request (for example an SMS). The synchronous response contains a `reference_id` and an initial `status.code`, usually an intermediate one such as `290` (SMS) or `3001` (Messaging, Verify API).
2. When the transaction completes, or when Telesign learns its final status, Telesign posts a JSON notification to your callback URL. Voice sends an event for each step of a call.
3. Your service answers with HTTP `200`. Any other answer, or no answer, makes Telesign retry (see "Callback retry behaviour").
4. You match the notification to your transaction with `reference_id` (or your own `external_id` where the product supports it) and act on `status.code`.

The Transaction Callback Service architecture is supported for Messaging, SMS, SMS Verify API, Voice, Voice Verify API and inbound SMS. One endpoint can receive notifications from several Telesign products; a single notification can also be used to learn the status of several transactions.

Endpoint requirements:

| Requirement | Value |
| --- | --- |
| URL | Any URL you control |
| Protocol | `https` |
| Port | 443 |
| Accepts | `application/json` |
| Responds with | `application/json` |
| Authentication | Optional but recommended (see "Authenticating callbacks from Telesign") |

## General callback payload schema

Every product adds its own fields, but most notifications share this core:

| Field | Type | Meaning |
| --- | --- | --- |
| `reference_id` | string | Telesign's 32-digit hex identifier for the original request |
| `status.code` | integer | Status of the transaction (look it up in topic `error-codes`) |
| `status.description` | string | Text for the status. Do not code against it |
| `status.updated_on` | string | RFC 3339 timestamp of the last status change |
| `submit_timestamp` | string | ISO 8601 UTC timestamp of when the request was received |
| `errors` | array of objects | One object per error, each with `code` and `description` |

A typical delivery report:

```json
{
  "status": {
    "updated_on": "2016-07-08T20:52:46.417428Z",
    "code": 200,
    "description": "Delivered to handset"
  },
  "submit_timestamp": "2016-07-08T20:52:41.203000Z",
  "errors": [],
  "sub_resource": "sms",
  "reference_id": "0123456789ABCDEF0123456789ABCDEF"
}
```

## Setting a callback URL: account default and per-request override

There are two ways to tell Telesign where to send notifications.

**Account default.** A default callback URL is stored per product on the account.

1. Create the web service with a private URL. For mission-critical applications Telesign recommends two URLs for redundancy.
2. Self-service accounts: enter the callback URL in the Settings section of the portal for each product. Full-service accounts: send the URL to Telesign Customer Support (support@telesign.com).
3. Allow up to one business day for the setup to complete.

For Voice, send the webhook endpoint URL to Customer Support; events start flowing after one business day. Telesign warns that a wrong URL means no events are delivered, so double-check it. For Number Masking, send the private URI to your Telesign contact.

**Per-request `callback_url`.** Some send operations accept a `callback_url` argument that overrides the account default for that one request only.

| MCP tool | Has `callback_url` | Notes |
| --- | --- | --- |
| `messaging_send_sms` | yes | Overrides the default for this request. Error `11004` if the value is empty |
| `messaging_send_message` | yes | Status `3106` if the value is empty; `3203` if per-request callback URLs are not enabled for the Customer ID |
| `smsverify_send_code` | yes | Overrides the default for this request |
| `voiceverify_send_code` | yes | Overrides the default for this request |

Tools without a `callback_url` argument (for example `verifyapi_send_otp`, `messaging_send_bulk_sms`, the Number Masking and Voice tools) rely on the URL configured for the account. For Voice, Telesign says an alternate webhook endpoint can be passed in a Voice request to override the default for the duration of that call; see `docs_get_tool_reference("voice_send_action")` for the action parameters.

Example: send an SMS and ask for its delivery report at a specific URL.

```json
{
  "phone_number": "15551234567",
  "message": "Your order has shipped.",
  "message_type": "ARN",
  "callback_url": "https://example.com/callback"
}
```

Passed to `messaging_send_sms`, this returns a `reference_id` and an initial status; the delivery report is later posted to `https://example.com/callback`.

Example: the same for an SMS Verify API code.

```json
{
  "phone_number": "15551234567",
  "callback_url": "https://example.com/callback"
}
```

Passed to `smsverify_send_code`, this sends a Telesign-generated code and directs delivery reports for this transaction to the given URL.

## Callback retry behaviour

**SMS and SMS Verify API.** Telesign makes up to four attempts, waiting longer after each failure:

| Attempt | If no HTTP response within 5 seconds | If a non-200 response is received |
| --- | --- | --- |
| 1st | Makes the next attempt | Waits an additional 5 seconds, then makes the next attempt |
| 2nd | Makes the next attempt | Waits an additional 10 seconds, then makes the next attempt |
| 3rd | Makes the next attempt | Waits an additional 15 seconds, then makes the next attempt |
| 4th | Final attempt | Final attempt |

**Number Masking.** If the first attempt fails, Telesign tries again; if the second fails it makes a third and final attempt. Confirm receipt with HTTP `200 OK`.

Practical consequences for a handler:

- Respond with `200` quickly (well inside 5 seconds) and do slow work after responding.
- After the last attempt the notification is not sent again, so keep the status tools as a fallback for transactions whose callback never arrived.
- A retry can deliver the same notification more than once; make processing idempotent by keying on `reference_id` and `status.code`.

Telesign's documentation does not describe a retry schedule for the other products.

## Authenticating callbacks from Telesign

Telesign signs every callback it sends, in the same spirit as Digest authentication for requests, but with a simpler string-to-sign: only the body is signed. Each callback carries two headers, and both are always present:

- `Authorization` with the value `TSA {Customer ID}:{signature}`
- `X-TS-Authorization` with the value `{signature}`

To verify a callback:

1. Have your Customer ID and API key available to the handler.
2. Read the signature from one of the two headers. For `Authorization`, split the value on the space and keep the second part, then split that on `:` and keep the second part. For `X-TS-Authorization`, the whole value is the signature.
3. Take the raw request body as a string (UTF-8 for JSON). This is the string-to-sign. Use the bytes exactly as received; do not re-serialise the JSON.
4. UTF-8 encode the string-to-sign.
5. Base64-decode your API key.
6. Create an HMAC using the decoded API key as the key, the encoded string-to-sign as the message and `HMAC-SHA256` as the hash (currently the only supported method; the name may be upper or lower case).
7. Take the digest and Base64-encode it. This is the expected signature.
8. Compare the expected signature with the received one using a constant-time comparison (for example `hmac.compare_digest` in Python). Reject the request if they differ.

Authentication of callbacks is optional but recommended, including for Voice webhooks, to stop third parties from posting forged events to your endpoint. Telesign publishes sample verification code for Python and Java in its `TeleSign/sample_code` GitHub repository (under `python/webhooks/shared` and `java/webhooks/shared`).

Note that callbacks are signed with the account's API key. If you rotate keys (topic `accounts`), update the handler too.

## Callbacks by product: summary

| Product | What Telesign sends | Per-request URL | Payload reference in `reference/callbacks` |
| --- | --- | --- | --- |
| SMS (`messaging_send_sms`) | Delivery reports with 2xx / 5xx status codes | `callback_url` | Receive SMS delivery reports |
| Bulk SMS (`messaging_send_bulk_sms`) | Delivery report per recipient | account default | Receive Bulk SMS callbacks |
| SMS Verify API | Delivery reports plus `verify` code state | `callback_url` | Receive SMS Verify API Delivery Reports |
| Voice Verify API | Status updates through the Transaction Callback Service | `callback_url` | (general schema) |
| Verify API | State of the verification process and each method | account default | Receive Verify API Delivery Reports |
| Messaging (omnichannel) | Delivery status and read notifications per channel | `callback_url` | Receive RCS / WhatsApp / Viber / MMS / email callbacks |
| Inbound SMS and other inbound channels | Mobile originated (MO) messages from end users | account default | Receive inbound SMS callbacks and the per-channel sections |
| Message templates | Template approval, rejection and removal results | account default | Receive template management callbacks |
| Number Masking | Each message exchanged in an anonymous session | account default | (see "Number Masking session callbacks") |
| Voice | Call events at your webhook endpoint | account default, per-call override | (see "Voice events and webhooks") |

## SMS and bulk SMS delivery reports

Sent for `messaging_send_sms` transactions (bulk is documented separately). A success looks like the general example with `status.code` `200`; a failure carries a different code, for example `238` "Destination blocked by prefix".

`additional_info` appears only if at least one optional feature is enabled for the account, and each sub-property only if its feature is enabled (some are full-service only; ask Telesign Customer Support). Fields shown in Telesign's examples: `mcc`, `mnc`, `price`, `currency`, `message_parts_count`, `message_parts_reference_ids`, `cleansed_phone_number`.

Bulk SMS callbacks use the same `status` object and add `session_id`, your own identifier for the recipient the notification relates to, so that you can tell recipients of one bulk request apart. Bulk requests are answered with status `293` "Bulk request accepted"; the per-recipient outcome arrives by callback.

## SMS Verify API callbacks

Same structure as SMS delivery reports, plus:

- `verify.code_state` and `verify.code_entered`, describing the verification code (for example `"code_state": "UNKNOWN"`, `"code_entered": null` on a delivery report).
- `sub_resource`, for example `sms`.
- `errors`, with an object per error. A blocked message, for example, arrives with `status.code` `230` and `errors[0].code` `-40025`, both described as "Message blocked by Telesign".

`additional_info` follows the same opt-in rules as for SMS.

## Verify API callbacks

The Verify API reports the state of the whole verification process, not just one message. The payload carries `reference_id`, the overall `state` (`CREATED`, `ONGOING`, `REJECTED`, `FAILED`, `VERIFIED`, `CANCELED`), the `recipient`, the `verification_policy`, and `inner_methods`: one entry per method tried with its `method`, `state`, `err_code`, `err_msg`, `tried_on` and `updated_on`. This is how you see that, say, WhatsApp failed and SMS then verified the user.

`verifyapi_send_otp` has no `callback_url` argument in this server; callbacks go to the URL configured for the account. Without callbacks, call `verifyapi_get_status` with the `reference_id`.

**Push Verify events.** Push Verify callbacks are a different thing: the mobile app (through the Telesign Verify SDK method `reportPushStatus`, with event `delivered` or `pushClicked`) reports to Telesign what happened to a push notification on the device. They are optional, and Telesign's documentation currently marks Push Verify as temporarily unavailable. The events reported back to the Verify API are:

| Event | Event code |
| --- | --- |
| Invalid/Unsupported message content | 102 |
| End-user device rejected the message | 201 |
| Delivered | 203 |
| Message Expired | 204 |
| Verification approved | 400 |
| Verification rejected | 401 |
| Message is read | 402 |

## Messaging channel callbacks: delivery status and read notifications

Messaging (`messaging_send_message`; full-service accounts only) sends two kinds of notification.

**Delivery status notifications** extend the general schema with:

| Field | Meaning |
| --- | --- |
| `status.last_channel` | The last channel the service tried, for example `sms` |
| `channel_status` | Array with one object per attempted channel, keyed by channel name |
| `channel_status[].{channel}.code` / `.description` | Delivery status of the send on that channel, for example `3000` Delivered |
| `channel_status[].{channel}.reference_id` | 32-digit hex identifier of the send on that channel |
| `channel_status[].{channel}.updated_on` | When that channel's status last changed |
| `external_id` | Your `external_id` from the request, or `null` |

A message that timed out on RCS and was then delivered by SMS shows `3056` under `rcs`, `3000` under `sms`, and an overall `status.code` of `3000` with `last_channel` `sms`.

**Read notifications** are supported for the WhatsApp, Viber and RCS channels. They have no extra fields: `status.code` is `3005` "Message is read".

Status codes used in Messaging callbacks are the 3xxx codes in topic `error-codes`.

## Inbound message callbacks

When an end user replies or writes to one of your numbers or senders, Telesign posts a mobile originated (MO) notification. Inbound channels must be enabled by Telesign Customer Support first. For inbound SMS:

- `status.code` is `1500` "Delivered" (delivered to you).
- `user_response` holds the content: `phone_number` (the end user), `sender_id` (the short or long code they wrote to), `mo_message`, `iso_country_code`, and the keyword handling result in `action` (`start`, `stop`, `help` or `generic`) and `keyword`.
- `sub_resource` identifies the inbound channel (for example `mo_sms`), which helps when several channels share one callback URL.
- `errors` is currently always empty.

RCS, WhatsApp, Viber, MMS and email have their own inbound payloads; see the matching sections of `reference/callbacks`. MO keyword handling is available for RCS, WhatsApp and SMS on request.

## Template management callbacks

Creating or deleting a message template (`templates_create`, `templates_delete`) is asynchronous: the response says the request is being processed (`3801`) and the outcome is posted to your callback endpoint with the template `name`, `channel` and one of these status codes:

| Code | Text | Meaning |
| --- | --- | --- |
| 3850 | Template successfully created | Created and ready for use |
| 3851 | Template approved by provider | Created by Telesign, approved by the channel provider, ready for use |
| 3852 | Template rejected by provider | Rejected by the channel provider |
| 3853 | Template successfully removed | Removed |
| 3854 | Template flagged by provider | Flagged by the channel provider due to misuse |
| 3855 | Template disabled by provider | Disabled by the channel provider |
| 3857 | Removal unsuccessful - provider temporary problem | The removal was rejected by the channel provider |

Without a callback endpoint, check a template with `templates_get` or `templates_list`.

## Number Masking session callbacks

Number Masking (full-service accounts only) has no status endpoint for messages: a callback service is required if you want to know when the two parties of an anonymous SMS session interact and what they wrote. Each message exchanged is pushed to your endpoint as JSON:

| Field | Meaning |
| --- | --- |
| `submit_timestamp` | When the end user's message was sent |
| `from_phone_number` | The sending end user's number, with country code |
| `to_phone_number` | The receiving number |
| `mo_message` | The text of the message |
| `mo_reference_id` | 32-digit identifier of this message |
| `session_reference_id` | 32-digit identifier of the anonymous session, i.e. the `reference_id` returned by `numbermasking_create_sms_session` |

Answer each notification with HTTP `200 OK`. Retries: up to three attempts in total.

## Voice events and webhooks

For Telesign Voice (full-service accounts only) a webhook endpoint is not optional. It is a required part of the integration: Telesign sends the events for your calls to this service. The endpoint must:

- have a valid DNS name (a bare IP address is not accepted),
- use HTTPS,
- present a certificate signed by a valid certificate authority,
- optionally verify Telesign's signature (recommended).

One default endpoint is registered with Customer Support; an alternate endpoint can be supplied in a Voice request for the duration of that call. Because the MCP server cannot receive events, the Voice tools (`voice_send_action` and the recording tools) are only useful alongside a customer-hosted webhook service.

## Polling status tools instead of callbacks

Use these with the `reference_id` returned by the send.

| Sent with | Check with |
| --- | --- |
| `messaging_send_sms` | `messaging_get_sms_status` |
| `messaging_send_message` | `messaging_get_message_status` |
| `smsverify_send_code` | `smsverify_get_status` |
| `voiceverify_send_code` | `voiceverify_get_status` |
| `verifyapi_send_otp` | `verifyapi_get_status` (or `verifyapi_check_code` to submit the code) |
| `templates_create` | `templates_get` |

Example: check an SMS a little after sending it.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

Passed to `messaging_get_sms_status`, this returns the current `status.code`. An intermediate code such as `290` or `203` means "ask again later"; a final code such as `200` or `207` will not change. Poll with a growing delay rather than in a tight loop, and stop on a final status.

Inbound messages, Number Masking session messages and Voice events cannot be polled; they are only available by callback.

## Related

- Topics: `reference/callbacks` (payload field tables, status code lists and example payloads for each callback), `error-codes` (meaning of every `status.code` and `errors[].code`), `authentication` (Digest authentication for requests to Telesign), `verify-api`, `best-practices`.
- Telesign pages used:
  - https://developer.telesign.com/enterprise/docs/transaction-callback-service
  - https://developer.telesign.com/enterprise/docs/authenticate-callbacks
  - https://developer.telesign.com/enterprise/docs/sms-callback-service
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-callback-service
  - https://developer.telesign.com/enterprise/docs/messaging-callback-service
  - https://developer.telesign.com/enterprise/docs/number-masking-callback-service
  - https://developer.telesign.com/enterprise/docs/voice-receive-events-with-webhooks
  - https://developer.telesign.com/enterprise/docs/verify-api-push-verify-callbacks
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-which-method-should-i-use-to-get-delivery-status
