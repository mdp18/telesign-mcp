# SMS Verify

Telesign SMS Verify (the SMS Verify API) sends a limited-duration one-time passcode (OTP) to a phone number by SMS and lets you confirm that the person holding the phone typed it back. It is a standalone SMS-only verification product: one call sends the code, a second call checks it or reports completion. Optional add-ons screen the recipient before the SMS is sent - Verify Plus (risk recommendation from Telesign Intelligence) and a SIM swap check - and payment parameters support PSD2 Strong Customer Authentication.

## When to use it

- Multi-factor authentication: send an OTP after the user enters their password.
- Password reset: confirm identity before the reset.
- Phone number verification: confirm that a user owns the number they gave you.
- Account updates and high-value actions: confirm a transaction, a profile change or a money transfer.
- Payment approval under PSD2, with the payee and amount in the message text.
- Blocking risky recipients before paying for the SMS (Verify Plus, SIM swap screening).

Pick something else when:

- You want several channels or automatic fallback (WhatsApp, Viber, RCS, email, voice, Silent Verify): see `verify-api`.
- You want the code delivered by a phone call: see `voice-verify`.
- The message is not a verification code (alerts, reminders, marketing): use Telesign SMS, see `messaging-sms`. SMS Verify is only for delivering verification codes.

## Choosing between Verify API, SMS Verify and Voice Verify

| | SMS Verify API (this guide) | Verify API | Voice Verify API |
| --- | --- | --- | --- |
| Endpoint | `POST https://rest-ww.telesign.com/v1/verify/sms` | `POST https://verify.telesign.com/verification` | `POST https://rest-ww.telesign.com/v1/verify/call` |
| Channels | SMS only | SMS, WhatsApp, Viber, RCS, email, voice, Silent/Push/QR Verify | Voice call only |
| Fallback between channels | No | Yes, `verification_policy` | No |
| Default Telesign code | 7 digits | 6 digits | 5 digits |
| Checking the user's code | `smsverify_get_status` with `verify_code`; success is `verify.code_state` `VALID` | `verifyapi_check_code`; success is `status.code` `3900` | `voiceverify_get_status` with `verify_code`; success is `verify.code_state` `VALID` |
| Extras | Custom text per request, PSD2 amount/payee, Verify Plus, SIM swap check, India DLT IDs, sender ID | Templates per channel, fixed routing by country | Text-to-speech message, PressX, PBX extensions, caller ID |
| Account | Paid account | Full-service accounts only | Full-service accounts only |
| MCP tools | `smsverify_*` | `verifyapi_*` | `voiceverify_*` |

SMS Verify and Voice Verify share the status endpoint (`GET /v1/verify/{reference_id}`) and the completion endpoint, so `reference_id` values work the same way in both. The Verify API is a separate service with its own IDs, states and status codes.

## How it works

Two flows, depending on who generates the code.

Telesign-generated code:

1. Call `smsverify_send_code` with `phone_number`. Do not send `verify_code`.
2. Telesign generates a numeric code (seven digits by default), inserts it where `$$CODE$$` appears in the message template and sends the SMS. The response has `reference_id` and `status.code` `290` ("Message in progress"). Save the `reference_id`.
3. The user types the code into your application.
4. Call `smsverify_get_status` with the `reference_id` and the typed code as `verify_code`.
5. Read `verify.code_state`: `VALID` means verified. The same response carries the delivery status in `status`.

Your own code:

1. Generate a numeric code and call `smsverify_send_code` with `phone_number` and `verify_code`.
2. Telesign sends the SMS with your code in place of `$$CODE$$`.
3. The user types the code; you compare it with the one you generated.
4. Optional but recommended: when they match, call `smsverify_report_completion` with the `reference_id`. Completion data helps Telesign find delivery, operator and route problems.
5. Get delivery status from callbacks or from `smsverify_get_status` (without `verify_code`).

If `verify_code` is present in the send request, your code is used; if it is absent, Telesign generates one. An invalid value or a length out of range returns an error.

### Message text, templates and languages

- Default: a predefined Telesign template in English (`en-US`). Set `language` to use the predefined template in another language.
- Custom text: set `template` and include `$$CODE$$` where the code goes. When `template` is set, `language` is not used.
- Payment text: include `$$AMOUNT$$` and `$$PAYEE$$` in `template`; they are filled from `transaction_amount` and `transaction_payee`.
- With your own code you could write the code straight into a custom `template` without `$$CODE$$`, but Telesign does not recommend it. With the default template, `verify_code` is how your code gets into the message.

### Verify Plus screening

Verify Plus is an add-on powered by Telesign Intelligence. Once activated, every SMS Verify request to a number in your configured countries is evaluated before sending; no extra request parameter is needed.

- Telesign computes a risk recommendation for `phone_number`. If it exceeds your threshold, the SMS is not sent and the transaction ends with `status.code` `233` ("Message blocked due to high risk score").
- A blocked message is not charged as an SMS, but the Intelligence check is still charged.
- Otherwise the code is generated and sent as usual.
- The outcome arrives in the delivery callback. When the "send risk recommendation details" option is enabled, the callback includes a `score_status` object with `risk` (`recommendation`, `score`, `level`), `risk_insights` (reason codes), `phone_type` and `numbering`.
- Configuration: a default risk recommendation threshold (601 by default for self-service accounts), optional country exclusions and optional per-country thresholds.
- Verify Plus can be activated on all account types, including trial accounts.

### SIM swap screening

The SIM swap check uses Telesign's SIM Swap identity signal inside the SMS Verify request, so you do not need a separate Phone ID call.

- Telesign Support enables it for your account and configures: the maximum SIM swap indicator (1-4, default 3), whether the check runs on every transaction or only when requested, which countries it covers, whether to block when the check cannot be completed, and whether SIM swap details are included in the callback.
- If your account runs the check only on request, send `sim_swap_check: "true"`. If it runs on every transaction, `sim_swap_check: "false"` suppresses it for one request.
- The SMS is blocked only when the indicator is higher than your configured maximum (`status.code` `518`). If the check cannot be performed and your account is set to block in that case, the result is `519`.
- Risk indicator scale: `1` very low (no swap, or 15+ days ago), `2` low (3-14 days ago), `3` medium (last 72 hours), `4` high (last 24 hours).
- The send response only confirms that the request was accepted. Whether the SMS was delivered or blocked is reported in the delivery callback (and status lookup), with a `sim_swap` object (`swap_date`, `swap_time`, `risk_indicator`, `status.code`, `status.description`) when enabled.

### PSD2 payment verification

For the EU's PSD2 Strong Customer Authentication, SMS Verify covers the "possession" factor, and putting the payee and amount in the message satisfies dynamic linking.

- Send `transaction_amount` (currency and amount, for example `EUR 95`) and `transaction_payee` together; each is required when the other is present.
- Use a `template` containing `$$CODE$$`, `$$AMOUNT$$` and `$$PAYEE$$`, or set `language` to a language that has a predefined PSD2/SCA template.
- Complete the check with `smsverify_get_status` and `verify_code`, exactly as in the Telesign-generated flow.
- PSD2 requires SCA above EUR 30; you can apply it to every payment or only above that amount.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `smsverify_send_code` | Sends an SMS containing a verification code | `POST https://rest-ww.telesign.com/v1/verify/sms` |
| `smsverify_get_status` | Returns delivery status; with `verify_code`, also checks a Telesign-generated code | `GET https://rest-ww.telesign.com/v1/verify/{reference_id}` |
| `smsverify_report_completion` | Tells Telesign the user was verified, for codes you generated yourself | `PUT https://rest-ww.telesign.com/v1/verify/completion/{reference_id}` |

Use `docs_get_tool_reference("smsverify_send_code")` (or another tool name) for the full parameter and response tables.

## Quick start

Send a Telesign-generated code with the default template (`smsverify_send_code`). Returns `reference_id` and `status.code` `290`.

```json
{ "phone_number": "15551234567" }
```

Check the code the user typed (`smsverify_get_status`). `verify.code_state` is `VALID` on a match; `status` shows delivery.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF", "verify_code": "5724433" }
```

Custom message text in the same request style (`smsverify_send_code`).

```json
{
  "phone_number": "15551234567",
  "template": "Your Example App code is $$CODE$$",
  "ucid": "ATCK"
}
```

Send your own code using the predefined French template, with a per-request callback URL.

```json
{
  "phone_number": "33612345678",
  "verify_code": "57244",
  "language": "fr",
  "callback_url": "https://example.com/callback"
}
```

Report a successful verification of your own code (`smsverify_report_completion`). Returns `status.code` `1900`.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

PSD2 payment approval (`smsverify_send_code`).

```json
{
  "phone_number": "447700900123",
  "transaction_amount": "EUR 95",
  "transaction_payee": "Example Shop",
  "template": "To confirm your payment to $$PAYEE$$ in the amount of $$AMOUNT$$ your code is $$CODE$$."
}
```

Request a SIM swap check for this transaction (account must have SIM swap screening enabled in "on request" mode).

```json
{
  "phone_number": "15551234567",
  "template": "Your code is $$CODE$$",
  "sim_swap_check": "true"
}
```

Look up delivery status only (`smsverify_get_status` without `verify_code`).

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

## Key parameters

Send (`smsverify_send_code`):

| Parameter | Use |
| --- | --- |
| `phone_number` (required) | Destination number, digits only, starting with the country dialing code. |
| `verify_code` | Your own numeric code, 3 to 7 digits (`000` to `9999999`). Omit to let Telesign generate a seven-digit code. |
| `template` | Text that replaces the predefined message. Include `$$CODE$$`. Maximum 160 characters by default; Telesign Support can raise it up to 1600. Keep it short. |
| `language` | Language code for the predefined template (see the table below). Ignored when `template` is set. |
| `sender_id` | Sender ID shown on the SMS, up to 20 characters; 0-9 and A-Z recommended. It must be on your account's allow list or it is not used, and Telesign may override it for delivery quality or local regulations. |
| `ucid` | Use-case code that describes why you are verifying: `ATCK` (2FA on login or account update), `BACF` / `BACS` (account creation exposed to bulk fraud / spam), `CHBK` (expensive or unusual purchase), `PWRT` (password reset), `TRVF` (money transfer), `THEF` (protecting against number takeover), `LEAD`, `RESV`, `RXPF`, `SHIP`, `CLDR`, `OTHR` / `UNKN`. |
| `originating_ip` | The end user's IP address (IPv4 or IPv6), never your server's. Helps Telesign improve its services. |
| `is_primary` | `"true"` (default) if Telesign is your primary provider for this message, `"false"` if you are retrying after another provider failed. Used to optimize routing. |
| `transaction_amount`, `transaction_payee` | Payment details for PSD2; up to 40 characters each; must be sent together. |
| `sim_swap_check` | `"true"` to request, or `"false"` to suppress, the SIM swap check, depending on account configuration. |
| `dlt_template_id`, `dlt_entity_id` | India-local traffic only: DLT template and entity IDs, up to 40 characters each. |
| `callback_url` | URL for delivery reports for this request only; overrides the account's default callback URL. |

Status (`smsverify_get_status`): `reference_id` (required) and `verify_code` (the code the user typed; only meaningful when Telesign generated the code).

Completion (`smsverify_report_completion`): `reference_id` only.

Account-level options set through Telesign Support: code validity period (in minutes), maximum number of attempts, longer templates, message splitting details, phone type / numbering / risk objects in the response, Verify Plus and SIM swap screening.

### Supported template languages

Default is `en-US`. Codes with a predefined PSD2/SCA template:

`bg` Bulgarian, `ca` Catalan, `hr` Croatian, `cs` Czech, `da` Danish, `nl` Dutch, `en` English, `en-GB` English (UK), `et` Estonian, `fi` Finnish, `fr` French, `de` German, `gsw` German (Swiss), `el` Greek, `hu` Hungarian, `is` Icelandic, `it` Italian, `lt` Lithuanian, `lv` Latvian, `no` Norwegian, `pl` Polish, `pt` Portuguese, `pt-PT` Portuguese (European), `ro` Romanian, `sk` Slovakian, `sl` Slovenian, `es-ES` Spanish (Castilian), `es` Spanish (European), `sv` Swedish, `tr` Turkish.

Codes with a standard template only:

`ar` Arabic, `ar-EG` Arabic (Egyptian), `zh-HK` Chinese (Cantonese, Traditional, Hong Kong), `zh-CN` Chinese (Mandarin, Simplified), `zh-TW` Chinese (Mandarin, Traditional, Taiwan), `en-AU` English (Australian), `en-US` English (US), `fil` Filipino, `fr-CA` French (Canadian), `he` Hebrew, `hi` Hindi, `id` Indonesian, `ja` Japanese, `ko` Korean, `ln` Lingala, `ms` Malay, `pt-BR` Portuguese (Brazilian), `ru` Russian, `sr` Serbian, `es-CL` Spanish (Chile), `es-419` Spanish (Latin American), `th` Thai, `uk` Ukrainian, `vi` Vietnamese.

Voice Verify uses different language tables; do not reuse these codes there.

## Responses and status codes

Code against `status.code` and `errors[].code` in the body, not the HTTP status.

| Field | Meaning |
| --- | --- |
| `reference_id` | 32-character hex ID of the transaction. Needed for status and completion. |
| `sub_resource` | `sms` for this product. |
| `status.code`, `status.description`, `status.updated_on` | Delivery status. In the send response it is preliminary (delivery toward the carrier, not the handset). |
| `verify.code_state` | Result of the code check: `VALID`, `INVALID`, `EXPIRED`, `MAX_ATTEMPTS_EXCEEDED` or `UNKNOWN`. Always `UNKNOWN` in the send response. |
| `verify.code_entered` | The code the user entered, when provided. Empty in the send response. |
| `errors[]` | `code` and `description` for each error; empty array on success. |
| `additional_info` | Message split details (`message_parts_count`, `message_part_sequence_number`, `message_parts_reference_ids`), only when enabled. |
| `phone_type`, `numbering`, `risk` | Optional objects in the send response, only when enabled by Telesign Support (`risk.recommendation` is `allow`, `flag` or `block`). |
| `sim_swap` | SIM swap check details in the status response, only when enabled. |

### Code check results

| `verify.code_state` | Meaning | What to do |
| --- | --- | --- |
| `VALID` | The typed code matches. | Verified. |
| `INVALID` | The codes do not match. | Let the user retry. |
| `EXPIRED` | Checked after the validity period ended. | Send a new code with `smsverify_send_code`. |
| `MAX_ATTEMPTS_EXCEEDED` | The user already used the allowed number of attempts. | Send a new code. |
| `UNKNOWN` | No check yet, or any other state (always the case when you generated the code). | - |

`code_state` is only meaningful for Telesign-generated codes. For your own code you do the comparison, and `1900` ("Verify completion successfully recorded") from `smsverify_report_completion` confirms the completion was logged.

### Delivery status codes

| Code | Description | Notes |
| --- | --- | --- |
| `290` | Message in progress | Normal immediate response: being sent to the SMS gateway. |
| `292` | Queued by gateway | Intermediate. |
| `295` | Status delayed | Status temporarily unavailable. |
| `203` | Delivered to gateway | Intermediate; updated if the gateway reports more. |
| `200` | Delivered to handset | Final success. |
| `201` | Transaction successfully completed, suspicious activity detected | Telesign's anti-fraud checks flagged the destination number. |
| `207` | Error delivering SMS to handset (reason unknown) | Final failure. |
| `210` | Temporary phone error | Phone off or out of memory. Final for this message; a new send may work. |
| `211` | Permanent phone error | Phone cannot receive SMS or is blocklisted on the network. |
| `220` | Gateway/network cannot route message | Final failure. |
| `221` | Message expired before delivery | Timed out at the mobile provider. |
| `222` | SMS not supported | By this phone, carrier, plan or user. Consider a voice call. |
| `229` | Message blocked by customer request | You asked Telesign to blocklist this number. |
| `230` | Message blocked by Telesign | Number is on a global blocklist. |
| `231` | Invalid/unsupported | Message content not supported. |
| `233` | Message blocked due to high risk score | Verify Plus blocked the send. |
| `237` | Message blocked in requested country | You asked for this country to be blocked. |
| `250` | Final status unknown | Cannot be determined. |
| `251` | Sent, but no final confirmation of delivery to handset | No delivery receipt within 12 hours; the user most likely did not receive it. |
| `500` | Transaction not attempted | No SMS was attempted; see `errors[]`. |
| `501` | Not authorized | Authentication or permission problem; see `errors[]`. |
| `502` | Campaign error | Problem with the short code used. |
| `503` | Carrier rejected - temporary problem | Can be retried. |
| `504` | Carrier rejected - permanent error | Do not retry. |
| `505` | Error on gateway - temporary error | Can be retried. |
| `506` | Error on gateway - permanent error | Do not retry. |
| `507` | Invalid destination address | Bad format or number not associated with a carrier. |
| `508` | Invalid source address | Check the sender. |
| `509` | Parameters problem | An unsupported parameter was used. |
| `510` | Message blocked by subscriber action or request | The user blocks SMS or this short code. |
| `511` | Subscriber low on credit | User over their spending limit. |
| `512` | Roaming error | Device is roaming and cannot receive SMS. |
| `513` | Mobile number portability error | Ported number unreachable. |
| `514` | Subscriber absent | Operator temporarily cannot reach the user. |
| `515` | Suspected spam | Carrier treats the message as spam. |
| `517` | Selected DLT details for India not supported | DLT template or entity ID not found by the operator. |
| `518` | Message blocked due to high risk SIM swap indicator | SIM swap screening blocked the send. |
| `519` | Message not sent - requested SIM swap check could not be performed | Number outside SIM swap coverage or data missing. |
| `520` | Content sent is not allowed | Carrier does not permit this content. |
| `521` | Requested Sender ID is not allowed for destination | Sender ID blocked or not registered for that country/operator. |
| `599` | Status not available | Try again later. |

### Error codes

| HTTP | `errors[].code` | Description | What to do |
| --- | --- | --- | --- |
| 400 | `-10001` | Invalid Request: {parameter} / Missing Parameter / Not Allowed Host | Fix the named parameter, or the calling IP/host is not allowed. |
| 400 | `-40006` | Bad request | Check the request format. |
| 401 | `-10009` | Invalid source IP address | Call from an allowed IP. |
| 401 | `-10033` | {phone_number} has not been verified for this trial account | Trial accounts can only send to verified numbers; upgrade the account. |
| 401 | `-20002` | This product is not enabled for this Customer ID | Ask Telesign to enable SMS Verify. |
| 401 | `-30000`, `-30001`, `-30002`, `-30003` | Invalid Customer ID / account suspended / not activated / new account limit reached | Check the account. |
| 401 | `-30004` to `-30012`, `-30015` | Authorization header, signature, date, nonce or API key problems | Check credentials; see `authentication`. |
| 401 | `-30013` | Invalid ReferenceID for Verify Completion | Completion call used an unusable `reference_id`. |
| 404 | `-10001` | CustomerID/ReferenceID not found | Wrong `reference_id` or wrong account. |
| 404 | `-10004` | Reference ID expired | Status is no longer available for this transaction. |
| 429 | `-40007` | Rate Limit Exceeded | Slow down and retry. |
| 429 | `-40008` | Verify SMS exceeded transaction hard cap. Request denied. | Account transaction cap reached; contact Telesign. |
| 500 / 503 | `-90001` | System Unavailable, please try again later | Retry. |
| callback | `-10030` | Insufficient funds in prepaid wallet | Top up the prepaid wallet. |

## Callbacks

The send response is only the initial processing status. Final delivery status is pushed to your Transaction Callback Service endpoint (the account default URL, or `callback_url` for a single request).

- Payload: `reference_id`, `sub_resource` (`sms`), `status` (`code`, `description`, `updated_on`), `submit_timestamp`, `errors[]` and `verify` (`code_state`, `code_entered`).
- Optional `additional_info`: `message_parts_count`, `message_parts_reference_ids`, `price`, `currency`, `mcc`, `mnc`, `sender_id` - each only when the related feature is enabled.
- With Verify Plus: `score_status` with `risk`, `risk_insights`, `phone_type` and `numbering`. A blocked send arrives with `status.code` `233`.
- With SIM swap screening: `sim_swap` with the swap date, time and risk indicator. Blocked sends arrive with `518` or `519`.
- A failure callback carries the high-level reason in `status.code` and the specific error in `errors[]`.

Callback or polling? `smsverify_get_status` works for up to 12 hours after the send and is the natural choice when Telesign generates the code, because you already call it to check the code. Callbacks suit high volumes with your own codes, because they avoid an extra request per message. Verify Plus and SIM swap outcomes are documented as arriving through callbacks, so set up the callback service when you use them. Payload details are in `reference/callbacks` under "Receive SMS Verify API Delivery Reports".

## Requirements and limits

- Use a paid account. Trial accounts can only send to the number verified for the account (`-10033`).
- Telesign's guides say you must buy a "from" phone number from Telesign before sending OTPs to numbers other than the one you registered with.
- Authentication is Basic or Digest. Requests are `application/x-www-form-urlencoded` over HTTPS; inputs must be UTF-8; responses are JSON.
- Rate limits follow Telesign's default limits per product (`-40007`), and an account transaction hard cap can apply (`-40008`).
- Sender IDs must be submitted to Telesign Support for the allow list first, and are still not guaranteed; some countries or operators reject them (`521`).
- India-local traffic needs DLT template and entity IDs (`517` if the operator cannot find them).
- `template` is limited to 160 characters by default, up to 1600 on request. Longer messages are split into parts, and each part has its own reference ID.
- `verify_code` must be numeric, 3-7 digits. Validity period and maximum attempts are account settings; after `EXPIRED` or `MAX_ATTEMPTS_EXCEEDED`, send a new code.
- Transaction status can be retrieved for up to 12 hours.
- Verify Plus: blocked sends are not billed as SMS, but the Intelligence check is. SIM swap screening must be enabled by Telesign Support and depends on SIM swap coverage for the destination.
- Compliance rules for SMS apply to every send; see the Compliance section of Telesign's Support Center.
- For very high throughput Telesign also offers SMPP, with SMS Verify specific TLVs; that route is outside these MCP tools.

## Related

- Guides: `verify-api`, `voice-verify`, `messaging-sms`, `phone-id`, `intelligence`, `error-codes`, `authentication`, `best-practices`
- Reference: `reference/sms-verify`, `reference/callbacks`
- Telesign pages:
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-overview
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-get-started
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-verify-with-telesign-code
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-verify-with-your-own-code
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-implement-psd2-compliance-for-payments
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-screen-recipients-using-verify-plus
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-screen-recipients-by-sim-swap-indicator
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-supported-languages
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-callback-service
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-which-method-should-i-use-to-get-delivery-status
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-smpp-tlvs
  - https://developer.telesign.com/enterprise/reference/sendsmsverifycode
  - https://developer.telesign.com/enterprise/reference/getsmsverifystatus
  - https://developer.telesign.com/enterprise/reference/reportsmsverifycompletion
  - https://developer.telesign.com/enterprise/reference/smsverifycallbacks
