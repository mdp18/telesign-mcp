# Telesign SMS (SMS API)

Telesign SMS is the standalone text-messaging endpoint of the Engage API. You post a phone number, a message text and a message type to `/v1/messaging`, and Telesign routes the SMS to the handset and reports what happened to it. It is the simplest way to put alerts, reminders, notifications and marketing texts into a web or mobile application, and it comes with the supporting pieces a production SMS program needs: delivery reports, bulk sends, sender IDs and dedicated numbers, inbound (two-way) SMS with opt-out keyword handling, and an SMPP interface for high-volume senders.

## When to use it

Good fits:

- Account and security alerts, such as a password-change notice.
- Reminders and notifications: appointments, events, package delivery updates, weather or news updates.
- Special offers and promotional announcements.
- The same announcement to a list of numbers (bulk SMS).
- Two-way conversations and opt-out handling on a number or short code you buy from Telesign.

Pick a different product when:

- You are sending one-time passcodes. Telesign recommends the SMS Verify API for that, because it is designed for the verification flow. See `verify-api`.
- You need RCS, WhatsApp, Viber, MMS or email, rich content, stored templates, or automatic fallback between channels. See `messaging`.

### SMS endpoint vs omnichannel Messaging: which tool to pick

| Situation | Tool |
| --- | --- |
| Plain text SMS to one number | `messaging_send_sms` (`POST /v1/messaging`) |
| Same text to up to 1000 numbers in one call | `messaging_send_bulk_sms` |
| Any channel other than SMS, or a rich channel with SMS as fallback | `messaging_send_message` (`POST /v1/omnichannel`, see `messaging`) |
| SMS built from a stored template with variables | `messaging_send_message` with `message.sms.template` |

The SMS endpoint needs no channel setup and no template: three arguments are enough. It takes the message text directly, while omnichannel Messaging wraps everything in `channels` and `message` objects. The two do not share status tools or status codes: check a `messaging_send_sms` transaction with `messaging_get_sms_status` (codes such as `200`, `203`, `290`), and a `messaging_send_message` transaction with `messaging_get_message_status` (codes in the 3000 range). Omnichannel Messaging is available to full-service accounts only.

## How it works

1. **Send.** Call `messaging_send_sms` with `phone_number`, `message` and `message_type`.
2. **Keep the reference ID.** A successful response has status `290` ("Message in progress") and a `reference_id`. This only means Telesign accepted the request and will attempt delivery.
3. **Get the delivery result.** Either poll `messaging_get_sms_status` with the `reference_id`, or receive delivery reports on your Transaction Callback Service. The status moves through intermediate values such as `203` ("Delivered to gateway") to a final one such as `200` ("Delivered to handset") or an error.
4. **Optionally report completion.** `messaging_report_completion` tells Telesign that the end user actually received the SMS.

Key terms:

- **Message type** - the traffic category Telesign needs for every message: `OTP`, `ARN` or `MKT`.
- **Sender ID** - what the recipient sees as the sender: a phone number, short code or alphanumeric name.
- **Delivery report (DLR)** - a callback describing the delivery status of one message.
- **MO message** - mobile originated: an SMS sent by an end user to your number.
- **Message part / segment** - one SMS of a longer message that had to be split.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `messaging_send_sms` | Send one SMS | `POST https://rest-ww.telesign.com/v1/messaging` |
| `messaging_get_sms_status` | Get delivery status of an SMS | `GET https://rest-ww.telesign.com/v1/messaging/{reference_id}` |
| `messaging_report_completion` | Tell Telesign the end user received the SMS | `PUT https://rest-ww.telesign.com/v1/verify/completion/{reference_id}` |
| `messaging_send_bulk_sms` | Send the same SMS to many recipients | `POST https://rest-ww.telesign.com/v1/verify/bulk_sms` |

Use `docs_get_tool_reference("messaging_send_sms")` (or another tool name) for every parameter and response field.

## Quick start

Minimal send. Returns `reference_id` and status `290`.

```json
{
  "phone_number": "15551234567",
  "message": "Your package will arrive tomorrow between 9 and 11 am.",
  "message_type": "ARN"
}
```

Check delivery with `messaging_get_sms_status`. Returns the current `status.code` and `status.description`, for example `200` "Delivered to handset".

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

Send with your own tracking ID, a per-request callback URL, a sender ID and context about the end user. The response echoes `external_id`; delivery reports go to the given URL.

```json
{
  "phone_number": "15551234567",
  "message": "Your password was changed. If this was not you, contact support.",
  "message_type": "ARN",
  "account_lifecycle_event": "update",
  "sender_id": "EXAMPLECO",
  "external_id": "CustomExternalID7349",
  "originating_ip": "203.0.113.45",
  "callback_url": "https://example.com/callback"
}
```

Send to an Indian number with DLT registration details:

```json
{
  "phone_number": "919876543210",
  "message": "Your order 45390 has shipped.",
  "message_type": "ARN",
  "dlt_template_id": "1107160000000000001",
  "dlt_entity_id": "1101000000000000001"
}
```

Report that the end user received the message (`messaging_report_completion`). Returns status `1900` "Verify completion successfully recorded".

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

Bulk send to two recipients, each tagged with your own ID after a colon (`messaging_send_bulk_sms`). Returns one `reference_id` and status `293` "Bulk request accepted".

```json
{
  "recipients": "15551234567:ID0001,15557654321:ID0002",
  "template": "The office is closed on Monday.",
  "ucid": "OTHR"
}
```

## Key parameters

| Parameter | Notes |
| --- | --- |
| `phone_number` | Required. Digits only, with country code. |
| `message` | Required. The text, up to 1600 characters. Long texts are split into several SMS; Telesign recommends avoiding messages that need more than one SMS where possible. |
| `message_type` | Required. `OTP`, `ARN` or `MKT` (see "Message types"). |
| `account_lifecycle_event` | Where the end user is in the account lifecycle: `create`, `sign-in`, `transact`, `update` or `delete`. |
| `sender_id` | The sender to show, up to 20 characters. Must be enabled and allow-listed by Telesign first (see "Sender IDs and buying phone numbers"). |
| `external_id` | Your own ID for the transaction; echoed in the response. |
| `originating_ip` | The end user's IP address (IPv4 or IPv6), never your server's. |
| `callback_url` | Where to send delivery reports for this request only; overrides the account default. |
| `is_primary` | `"true"` (default) if Telesign is your primary provider for this message, `"false"` if you are using Telesign as a backup after another provider failed. Used to optimise routing. |
| `dlt_template_id`, `dlt_entity_id` | India-local traffic only; up to 40 characters each (see "India DLT parameters"). |

## Message types

Every message must be labelled with the kind of traffic it carries.

| `message_type` | Meaning |
| --- | --- |
| `OTP` | One-time passwords |
| `ARN` | Alerts, reminders and notifications |
| `MKT` | Marketing traffic |

A missing value returns `12017`; an unsupported value returns `11017`. For OTP traffic Telesign recommends the SMS Verify API instead of this endpoint.

## Sender IDs and buying phone numbers

- To use `sender_id` you must ask Telesign Support to enable the feature and to add each value you want to use to the allow list.
- Telesign recommends limiting sender IDs to `0-9` and `A-Z`, because support for other ASCII characters varies by carrier.
- The sender ID is not guaranteed to be preserved. Telesign may replace it to improve delivery or to follow the SMS regulations of the destination country. A sender ID that the destination does not allow results in status `521`.
- To send from a dedicated phone number (long code or short code), buy one from Telesign. Full-service accounts follow the support article "How do I register for a sender ID"; self-service accounts follow "How do I purchase a phone number for my account". Telesign markets local numbers with geographically accurate area and country codes as a way to look familiar to recipients.
- A Telesign number or short code is required for inbound SMS.

## Bulk SMS

`messaging_send_bulk_sms` sends one text to many recipients with a single request. Bulk SMS must be enabled for the account.

| Parameter | Notes |
| --- | --- |
| `recipients` | Required. Comma-separated phone numbers, at most 1000. Optionally append your own ID to each number after a colon: `15551234567:ID0001,15557654321:ID0002`. |
| `template` | Required. The message text (despite the name, it is the text itself). |
| `ucid` | Use case code: `ATCK`, `BACF`, `BACS`, `CHBK`, `CLDR`, `LEAD`, `OTHR`, `PWRT`, `RESV`, `RXPF`, `SHIP`, `THEF`, `TRVF` or `UNKN`. For example `SHIP` for shipping notifications, `CLDR` for calendar events, `OTHR` when nothing else fits. |
| `sender_id` | The phone number to send from. |

How tracking works:

- The response gives one `reference_id` for the whole request, with status `293`.
- Telesign then sends a delivery report per recipient to your Transaction Callback Service. Each report carries the request's `reference_id`, `sub_resource` `bulk_sms`, a `status`, and `session_id`, which echoes the ID you attached to that recipient.
- Telesign strongly recommends attaching an ID to every number. Without one you cannot tell which recipient a report is about (`session_id` is `null`).
- Delivery tracking for bulk sends is documented through callbacks, so set up the callback service before sending.

## SMS encoding, character limits and splitting

Send text as UTF-8. Telesign then re-encodes the message for the network, trying GSM 03.38 first, then ASCII, then UTF-16-BE. The encoding that fits decides how many characters one SMS can hold. A single SMS is 140 bytes; when a text is split, each part loses 6 bytes to the header that lets the handset reassemble it.

| Encoding | Characters in a single SMS | Characters per part of a split message |
| --- | --- | --- |
| GSM 03.38 | 160 | 153 |
| ASCII | 140 | 134 |
| Latin-1 (SMPP only) | 140 | 134 |
| UTF-16-BE | 70 | 67 |

Practical consequences:

- Text that cannot be encoded as GSM 03.38 or ASCII (emojis, for example) is sent as UTF-16-BE, with its 70-character limit.
- In GSM 03.38 a few characters are sent with an escape byte and take the space of two.
- A concatenated message typically has at most 10 parts; some carriers do not support more.
- Some emojis that need 32-bit code points (flag emojis, for example) may not display as a single character on every device.
- Some countries and carriers do not support non-ASCII characters; Telesign may adjust the content to avoid a delivery failure.
- **Smart splitting** ends each part at the last whole word that fits, so words, URLs and email addresses are not cut in half (a single word longer than one SMS is still split). It is always on in certain countries and can be enabled for your account by Customer Support.
- If message splitting is enabled for your account, `messaging_get_sms_status` returns `additional_info` with `message_parts_count`, `message_part_sequence_number` and `message_parts_reference_ids` (a comma-separated list with one reference ID per part).
- Telesign's URL shortener (an account feature, see `messaging`) replaces the first `https://` link in an SMS with a link of at most 22 characters, which helps keep a message within one part.

## India DLT parameters

Indian regulation requires DLT registration details on SMS traffic. For traffic local to India, pass the registered IDs with the send:

- `dlt_template_id` - the ID of the DLT template used for this message.
- `dlt_entity_id` - the ID of the entity sending the message.

Both are strings of up to 40 characters and apply to India-local traffic only. Invalid values return `11034` or `11035` on the send. If the operator cannot find the template ID or entity ID, the delivery status is `517` ("Selected DLT details for India not supported"). Telesign's support article "India DLT Update" describes the regulation.

## Inbound SMS, keywords and unsubscribe handling

Inbound SMS delivers messages that end users send to your Telesign number.

Requirements:

- A phone number (long code or short code) purchased from Telesign.
- SMS or SMS Verify API enabled on the account (already the case for self-service accounts).
- Inbound SMS switched on: self-service accounts toggle "SMS 2-Way Inbound Enabled" under SMS > Manage settings in the Telesign portal; full-service accounts ask Customer Support.
- A Transaction Callback Service to receive the notifications. If your integration uses SMPP, inbound messages arrive over SMPP only, never over HTTPS.

Each inbound message is posted to your callback endpoint with `sub_resource` `mo_sms`, a `reference_id`, a `status` of `1500` ("Delivered to customer"), `submit_timestamp`, and a `user_response` object:

| Field | Meaning |
| --- | --- |
| `user_response.phone_number` | The end user's number, with country code |
| `user_response.sender_id` | The short or long code the user wrote to |
| `user_response.mo_message` | The text the user sent |
| `user_response.action` | `start`, `stop`, `help` or `generic` |
| `user_response.keyword` | The keyword that triggered the action (absent for `generic`) |
| `user_response.iso_country_code` | Two-letter country of the number |

Action-to-keyword mapping:

| Action | Keywords | Purpose |
| --- | --- | --- |
| `stop` | "arrêt", "arret", "cancel", "end", "quit", "stop", "unsubscribe" | The user wants to be removed from your list |
| `help` | "aide", "contact", "help", "info" | The user wants assistance; a default response is sent if you have not defined your own |
| `start` | "start" | The user wants to be added to your list |
| `generic` | none | No keyword found in the message |

How an unsubscribe request is handled (HTTP setups):

1. The user replies with a `stop` keyword.
2. Telesign posts the notification to your callback endpoint so that you can update the opt-out list you maintain.
3. If your endpoint answers with an HTTP status in the 200-299 range, Telesign sends the user your "unsubscribe succeeded" response message.
4. If your endpoint answers with anything else, does not answer, or times out, Telesign sends the "unsubscribe failed" message.

`help` and `start` work the same way. You can define a separate response message per keyword (for example a French reply for "arrêt") with Customer Support. In the United States and Canada the automatic responses to these compliance keywords are mandatory: parts of the text can be customised, but they cannot be turned off. You, not Telesign, own the opt-in and opt-out lists.

## Responses and status codes

`messaging_send_sms` returns:

| Field | Meaning |
| --- | --- |
| `reference_id` | 32-digit hex ID of the transaction; needed for status and completion calls |
| `status.code`, `status.description` | `290` "Message in progress" on success |
| `external_id` | Your ID if you sent one, otherwise `null` |
| `phone_number_modified`, `cleansed_phone_number` | Present only if phone number cleansing is enabled for the account: whether Telesign corrected the number, and the number it used |

Always act on `status.code`, not on the HTTP status.

### SMS delivery status codes

Returned by `messaging_get_sms_status` and in delivery reports.

| Code | Text | Meaning and action |
| --- | --- | --- |
| `290` | Message in progress | Being sent to the SMS gateway. Wait. |
| `292` | Queued by gateway | The gateway queued the message. Wait. |
| `203` | Delivered to gateway | Intermediate; updated if the gateway reports more. |
| `295` | Status delayed | Status temporarily unavailable. Check again later. |
| `200` | Delivered to handset | Final success. |
| `201` | Transaction successfully completed, suspicious activity detected | Delivered, but Telesign's anti-fraud checks flagged the destination number. |
| `250` | Final status unknown | The final status cannot be determined. |
| `251` | Sent, no final confirmation | Passed downstream, but no delivery receipt arrived within 12 hours. |
| `207` | Error delivering SMS to handset (reason unknown) | Final failure. |
| `210` | Temporary phone error | For example the phone is off or its memory is full. Final for this message. |
| `211` | Permanent phone error | Phone cannot receive SMS, or the number is blacklisted or wrongly provisioned. Final. |
| `220` | Gateway/network cannot route message | Final failure. |
| `221` | Message expired before delivery | Timed out in the operator's queue. |
| `222` | SMS not supported | Not supported by the phone, carrier, plan or user. |
| `231` | Invalid/unsupported | The message content is not supported. |
| `237` | Message blocked in requested country | You asked Telesign to block this country. |
| `238` | Destination blocked by prefix | You asked Telesign to block this number prefix. |
| `502` | Campaign error | A problem with the short code used. |
| `503` | Carrier rejected - temporary problem | Can be retried. |
| `504` | Carrier rejected - permanent error | Do not retry. |
| `505` | Error on gateway - temporary error | Problem at a Telesign partner; can be retried. |
| `506` | Error on gateway - permanent error | Do not retry. |
| `507` | Invalid destination address | Bad format, or the number belongs to no carrier. |
| `508` | Invalid source address | A valid sender is required. |
| `509` | Parameters problem | A request parameter is not supported. |
| `510` | Message blocked by subscriber action or request | The user blocked SMS, or blocked this short code. |
| `511` | Subscriber low on credit | The user exceeded a spending limit. |
| `512` | Roaming error | The device is roaming and cannot receive SMS. |
| `513` | Mobile number portability error | Ported number combination unreachable. |
| `514` | Subscriber absent | Operator temporarily cannot reach the user. |
| `515` | Suspected spam | The carrier treats the message as spam. |
| `517` | Selected DLT details for India not supported | Check `dlt_template_id` and `dlt_entity_id`. |
| `520` | Content sent is not allowed | The carrier does not permit this content. |
| `521` | Requested Sender ID is not allowed for destination | Blocklisted, or needs allow-listing for that country. |

Delivery reports can carry a few more codes: `233` (blocked due to high risk score), `518` and `519` (blocked by, or unable to run, a SIM swap check), `500` (transaction not attempted), `501` (not authorized), `599` (status not available), `10030` (insufficient funds in prepaid wallet), `10031` (blocked by customer request) and `10032` (blocked by Telesign, number on a global blocklist). Bulk SMS reports also use `230` (message blocked by Telesign) and `286` (not attempted because of the phone type).

### SMS request errors

| Code | Meaning | Fix |
| --- | --- | --- |
| `11000`, `11001` | Invalid `phone_number` / invalid country code | Send digits with a valid country code |
| `11009`, `12009` | Invalid / missing `message` | Provide the text, within 1600 characters |
| `11017`, `12017` | Invalid / missing `message_type` | Use `OTP`, `ARN` or `MKT` |
| `12000` | Missing `phone_number` | Add it |
| `11003`, `11004`, `11010`, `11013`, `11016` | Invalid `account_lifecycle_event`, `callback_url`, `originating_ip`, `sender_id`, `external_id` | Correct the value |
| `11034`, `11035` | Invalid `dlt_template_id` / `dlt_entity_id` | Correct the value |
| `10011` | Product not enabled for this Customer ID | Ask Telesign to enable SMS |
| `10033` | Phone number has not been verified for this trial account | Trial accounts can only message verified numbers |
| `10010`, `10015`, `10022` | Account suspended, invalid Customer ID, invalid API key | Check credentials and account state |
| `10019` | Rate limit exceeded | Slow down and retry |
| `10020` | Transaction hard cap exceeded | Contact Telesign |
| `10000` | System unavailable | Retry later |
| `11011` | Invalid `reference_id` (status call) | Use the ID from the send response |
| `10017`, `10036` | Reference ID not found / expired (status call) | The transaction is unknown to this account or too old |

Bulk SMS failures return status `500` ("Transaction not attempted") or `501` ("Not authorized") plus an entry in `errors`: `-10001` (missing `template`), `-10002` (empty recipients list), `-10003` (more than the maximum number of recipients), `-40006` (bad request), `-20002` (product not enabled), `-40007` (rate limit), `-40008` (hard cap), `-90001` (system unavailable).

`messaging_report_completion` returns `1900` on success and errors such as `-10001` (invalid parameter, or reference ID not found) and `-30013` (invalid reference ID for completion).

## Callbacks

The send response is only an acknowledgement. Final delivery status is pushed to your Transaction Callback Service, or to the `callback_url` of the request.

- **SMS delivery reports** contain `reference_id` and `status` (`code`, `description`, `updated_on`). When the matching account features are enabled, `additional_info` adds `mcc`, `mnc`, `price`, `currency`, `message_parts_count`, `message_parts_reference_ids` and `cleansed_phone_number`.
- **Bulk SMS reports** are sent per recipient with `sub_resource` `bulk_sms`, `session_id`, `status` and an `errors` array.
- **Inbound SMS notifications** use `sub_resource` `mo_sms` and the `user_response` object described above.

Payload schemas are in `reference/callbacks`.

## SMPP as an alternative transport

High-volume senders can submit SMS over SMPP instead of HTTPS. SMPP is not exposed through MCP tools; it matters here mainly because it changes how inbound messages and delivery reports reach you.

- Available for full-service accounts only, on request. Telesign supports SMPP 3.4 and 5.0.
- Gateway `smpp.tsentcloud.com`, port `3550`, TLS 1.2 required. Bind as transmitter, receiver or transceiver (persistent transceiver binds are preferred) with a system ID and password generated in TelePortal or by Telesign.
- Telesign SMS requires the `message_type` TLV (tag `0x1414`, value `OTP`, `ARN` or `MKT`) on every `submit_sm`; without it the message is rejected. `account_lifecycle_event` is TLV `0x1416`.
- Supported `data_coding` values: `0` and `1` (GSM 03.38), `3` (Latin-1), `8` (Unicode).
- The reference ID comes back in `message_id` of `submit_sm_resp`. Delivery reports and inbound messages arrive as `deliver_sm`; request reports with `registered_delivery`.

## Requirements and limits

- **Enablement:** SMS must be enabled on the account; bulk SMS, sender IDs, phone number cleansing, message-part reporting, inbound SMS and SMPP are enabled separately. Some optional features are for full-service accounts only.
- **Trial accounts** can only send to phone numbers verified for the account.
- **Message length:** 1600 characters per request; 160, 140 or 70 characters per single SMS depending on encoding. Each part of a split message is a separate SMS.
- **Bulk:** at most 1000 recipients per request.
- **Input encoding:** UTF-8 only.
- **Rate limits:** Telesign's default per-product limits apply; `10019` signals that you exceeded them.
- **Status lookups:** a delivery receipt that has not arrived within 12 hours results in status `251`; old reference IDs return `10036`.
- **Sender IDs:** allow-listed in advance and subject to override by Telesign and by local rules.
- **India:** DLT template and entity IDs for local traffic.
- **Compliance:** you are responsible for consent and opt-out management for your traffic; Telesign's Support Center has a Compliance section with SMS best practices, and the US and Canada keyword auto-responses are mandatory.
- **Reach:** telesign.com cites more than 700 direct-to-carrier routes and coverage of more than 230 countries and territories.

## Related

- Guides: `messaging` (omnichannel Messaging: RCS, WhatsApp, Viber, MMS, email, templates, fallback), `verify-api` (one-time passcodes), `error-codes`, `best-practices`, `overview`.
- Tool reference: `reference/sms`, `reference/callbacks`.
- Telesign pages:
  - <https://developer.telesign.com/enterprise/docs/sms-overview>
  - <https://developer.telesign.com/enterprise/docs/sms-get-started>
  - <https://developer.telesign.com/enterprise/docs/sms-try-it-without-code>
  - <https://developer.telesign.com/enterprise/docs/sms-send-bulk-sms>
  - <https://developer.telesign.com/enterprise/docs/sms-track-bulk-delivery-status>
  - <https://developer.telesign.com/enterprise/docs/sms-callback-service>
  - <https://developer.telesign.com/enterprise/docs/understand-sms-encoding-character-limits-and-splitting>
  - <https://developer.telesign.com/enterprise/docs/inbound-sms-overview>
  - <https://developer.telesign.com/enterprise/docs/inbound-sms-get-started>
  - <https://developer.telesign.com/enterprise/docs/inbound-sms-action-to-keyword-mapping>
  - <https://developer.telesign.com/enterprise/docs/inbound-sms-handle-unsubscribe-requests>
  - <https://developer.telesign.com/enterprise/docs/buy-a-phone-number>
  - <https://developer.telesign.com/enterprise/docs/smpp-protocol>
  - <https://developer.telesign.com/enterprise/docs/sms-smpp-tlvs>
  - <https://developer.telesign.com/enterprise/reference/sendsms>
  - <https://developer.telesign.com/enterprise/reference/getsmsstatus>
  - <https://developer.telesign.com/enterprise/reference/reportsmscompletion>
  - <https://developer.telesign.com/enterprise/reference/sendbulksms>
