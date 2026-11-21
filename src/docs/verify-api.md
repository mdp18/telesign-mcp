# Verification (Verify API)

Telesign's Verify API (marketed as "Verification") is an omnichannel verification service for multi-factor authentication. One request starts a *verification process* for a recipient, and Telesign works through an ordered list of verification methods - a one-time passcode (OTP) over SMS, WhatsApp, Viber, RCS, email or voice, or an app-based method (Silent Verify, Push Verify, QR Verify) - falling back to the next method when one fails or times out. The same integration covers every channel, so you can change the channel mix without changing code.

## When to use it

- Sign-up, login, password reset and step-up checks where you want one API for several channels.
- You want automatic fallback (for example WhatsApp first, SMS if it is not delivered in 30 seconds).
- You want Telesign to generate the code, track attempts and expiry, and tell you whether the user's answer matches.
- You want frictionless mobile verification (Silent Verify), push approval (Push Verify) or QR login (QR Verify) with an OTP fallback in the same process. These need the Telesign Verify Android or iOS SDK in your app.

Pick something else when:

- You only need SMS OTP, or need PSD2 payment text, Verify Plus or SIM swap screening on the SMS: see `sms-verify`.
- You only need a voice-call OTP with custom text-to-speech, PressX or PBX extension handling: see `voice-verify`.
- You want to send non-verification messages: see `messaging-sms`.
- You want to assess a number before sending anything: see `phone-id` and `intelligence`.

## Choosing between Verify API, SMS Verify and Voice Verify

| | Verify API (this guide) | SMS Verify API | Voice Verify API |
| --- | --- | --- | --- |
| Endpoint | `POST https://verify.telesign.com/verification` | `POST https://rest-ww.telesign.com/v1/verify/sms` | `POST https://rest-ww.telesign.com/v1/verify/call` |
| Channels | SMS, WhatsApp, Viber, RCS, email, voice, Silent/Push/QR Verify | SMS only | Voice call only |
| Fallback between channels | Yes, `verification_policy` | No | No |
| Request body | JSON | Form-encoded | Form-encoded |
| Default Telesign code | 6 digits | 7 digits | 5 digits |
| Checking the user's code | `verifyapi_check_code` (finalize); success is `status.code` `3900` | `smsverify_get_status` with `verify_code`; success is `verify.code_state` `VALID` | `voiceverify_get_status` with `verify_code`; success is `verify.code_state` `VALID` |
| Closing step | Finalize is mandatory, even with your own code | Completion report is optional (own code only) | Completion report is optional (own code only) |
| Account | Full-service accounts only | Paid account; Verify Plus add-on also works on trial accounts | Full-service accounts only |
| MCP tools | `verifyapi_*` | `smsverify_*` | `voiceverify_*` |

Rule of thumb: use the Verify API for new integrations that may ever need more than one channel; use SMS Verify or Voice Verify when you need a feature that only exists there, or the account is not enabled for the Verify API (error `3906`).

## How it works

Key terms:

- **Verification process** - one transaction that verifies one recipient. It can involve several attempts, one per method in the policy. Identified by `reference_id` (32 hex characters).
- **Verification policy** - the ordered list of methods, with a fallback time for each. Sent per request as `verification_policy`, or taken from the account default / fixed routing by country.
- **Verification method** - one channel or service: `sms`, `whatsapp`, `viber`, `rcs`, `email`, `voice`, `silent`, `push` (and QR Verify).
- **Security factor** - the OTP. On create it is the code you want sent (optional); on finalize it is the code the end user typed.
- **Mobile app token** - `mobile_app_token` in the create response; your app passes it to the Telesign Verify SDK for Silent, Push and QR Verify. It expires after five minutes and belongs to one verification process.

OTP flow (all OTP channels):

1. Call `verifyapi_send_otp` with the recipient and, optionally, a `verification_policy`. The response has `reference_id`, `state` and `status.code` `3901` ("Request in progress"). Save the `reference_id`.
2. Telesign sends the OTP on the first method. If it fails or its `fallback_time` runs out, Telesign moves to the next method.
3. The end user types the code into your application.
4. Call `verifyapi_check_code` with the `reference_id` and the typed code. `status.code` `3900` ("Verified") means success.
5. Optionally call `verifyapi_get_status` at any time to see the overall `state` and per-method progress in `inner_methods`.

Step 4 is mandatory, including when you generated the code yourself. Finalizing tells Telesign the real outcome and drives fallback, callbacks and pricing; a process that is never finalized can keep falling back to further channels and be billed for them.

### Telesign-generated code or your own code

- Leave out `security_factor` on create and Telesign generates a numeric OTP (6 digits by default) and compares it with the code you send at finalize.
- Include `security_factor` on create (numeric string, 3 to 10 characters) and that code is sent instead. An invalid or out-of-range value returns an error. It is ignored if the policy has no OTP method.
- In both cases the OTP replaces the `{{otp_code}}` placeholder in the template.

### Verification policy and fallback rules

- Default when no `verification_policy` is sent and no fixed routing applies: SMS with a 60-second fallback time.
- At most three methods per policy.
- `silent`, `push` and QR Verify cannot be combined with each other, and whichever one you use must be first, followed only by OTP methods.
- `fallback_time` is in seconds, minimum 30. Default when omitted: 60 seconds for SMS, WhatsApp, Viber, RCS, voice, Silent, Push and QR; 120 seconds for email.
- The whole process must finish within 300 seconds (5 minutes) across all methods; otherwise it fails (`inner_methods[].err_code` `3056`, state `FAILED`).
- Fallback can happen earlier than `fallback_time` when a method fails outright.

### Fixed fallback method by country

Telesign Support can configure up to two methods per destination country on your account; SMS is added automatically as the third unless you ask otherwise. With this set up you can omit `verification_policy`; sending one overrides the fixed routing for that request. `recipient.phone_number` is required because the dialing prefix selects the country.

### Channel notes

| Method | Recipient field | Notes |
| --- | --- | --- |
| `sms` | `phone_number` | Works with the default template. Register a sender ID for your account. |
| `whatsapp` | `phone_number` | Needs a WhatsApp account set up through Telesign and an approved *authentication* template (OTP is the only variable; no URLs, media or emojis). Templates can use a copy-code button, one-tap autofill or zero-tap (the last two are Android only and need a handshake in your app, otherwise a copy-code button is shown). |
| `viber` | `phone_number` | Needs a Viber business account set up through Telesign and a template containing `{{otp_code}}`. See the note on `viber` under Key parameters. |
| `rcs` | `phone_number` | Needs an RCS agent set up through Telesign (Android test devices until the agent is live) and a template containing `{{otp_code}}`. |
| `email` | `email` | Needs email set up for the account (sender domain, from address, unsubscribe link) and an email template. Transactional mail only; unsolicited mail is not allowed. Add `phone_number` if you fall back to a phone channel. |
| `voice` | `phone_number` | Telesign calls and reads the code twice. Language set with `voice_lang` (default `en-US`). Requires both Verify API and Voice enabled on the account. |
| `silent` | `phone_number` | Verifies over the mobile data connection through the Verify SDK, with no user action. Fails over if no mobile network connection is available. |
| `push` | `phone_number` + `push_app_token` | Push approval in your app through the Verify SDK. Telesign's docs currently state Push Verify is temporarily unavailable during a platform migration. |
| QR Verify | - | Limited release (early access). User scans a QR code shown on your website with a registered device. |

### Silent Verify, Push Verify and QR Verify

These methods are driven by the Telesign Verify Android/iOS SDK inside your app; the MCP tools only cover the server side.

- **Silent Verify**: your server calls `verifyapi_send_otp` (for example `silent` then `sms`), passes `mobile_app_token` to the app, the app calls the SDK's `activate`, and the SDK completes the check with the carrier. If it fails, the SDK moves to the next method and signals the app to collect an OTP. Your server then calls `verifyapi_get_status` and treats `state` `VERIFIED` as success.
- **Push Verify / QR Verify**: the device is first registered (the request carries `device_registration: "stamp"` and, for push, `recipient.push_app_token`; registration itself is confirmed with an OTP). Later, your server creates a verification process, the user approves the push or scans the QR code in the app, and your server polls `verifyapi_get_status` until `state` is `VERIFIED`. Poll no more often than once every 5 seconds.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `verifyapi_send_otp` | Creates a verification process and starts the first method | `POST https://verify.telesign.com/verification` |
| `verifyapi_check_code` | Helper: finalizes a process with the code the user typed and reports VERIFIED / NOT VERIFIED | `PATCH https://verify.telesign.com/verification/{reference_id}/state` |
| `verifyapi_update_process` | Raw finalize call (`action` + `security_factor`); same endpoint as the helper | `PATCH https://verify.telesign.com/verification/{reference_id}/state` |
| `verifyapi_get_status` | Retrieves the process: overall `state`, per-method `inner_methods`, policy, timestamps | `GET https://verify.telesign.com/verification/{reference_id}` |

Use `docs_get_tool_reference("verifyapi_send_otp")` (or another tool name) for the full parameter and response tables.

## Quick start

Send an SMS OTP with a Telesign-generated code. Returns `reference_id` and `status.code` `3901`.

```json
{
  "recipient": { "phone_number": "15551234567" },
  "verification_policy": [{ "method": "sms" }]
}
```

Check the code the user typed (`verifyapi_check_code`). Returns `status.code` `3900` "Verified" on a match.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF", "code": "123456" }
```

The same step with `verifyapi_update_process`:

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "action": "finalize",
  "security_factor": "123456"
}
```

WhatsApp first, SMS after 30 seconds, using a named template (`verifyapi_send_otp`). The same template name must exist on both channels.

```json
{
  "recipient": { "phone_number": "15551234567" },
  "verification_policy": [
    { "method": "whatsapp", "fallback_time": 30 },
    { "method": "sms", "fallback_time": 30 }
  ],
  "message_template": { "name": "verification_template" }
}
```

Send your own code and tag the transaction with your own ID. You must still finalize with the same code once the user has entered it.

```json
{
  "recipient": { "phone_number": "15551234567" },
  "security_factor": "5724433",
  "external_id": "login-8841",
  "verification_policy": [{ "method": "rcs", "fallback_time": 30 }, { "method": "sms", "fallback_time": 60 }]
}
```

Email OTP with SMS fallback. `recipient.email` is required for the `email` method.

```json
{
  "recipient": { "email": "user@example.com", "phone_number": "15551234567" },
  "message_template": { "name": "verification_template" },
  "verification_policy": [
    { "method": "email", "fallback_time": 120 },
    { "method": "sms", "fallback_time": 120 }
  ]
}
```

Voice call OTP in British English.

```json
{
  "recipient": { "phone_number": "447700900123" },
  "verification_policy": [{ "method": "voice" }],
  "voice_lang": "en-GB"
}
```

Silent Verify with SMS fallback. The response also carries `mobile_app_token` for the SDK.

```json
{
  "recipient": { "phone_number": "15551234567" },
  "verification_policy": [{ "method": "silent", "fallback_time": 30 }, { "method": "sms" }]
}
```

Poll the process (`verifyapi_get_status`). Returns `state` and one `inner_methods` entry per method.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

## Key parameters

Create (`verifyapi_send_otp`):

| Parameter | Use |
| --- | --- |
| `recipient` (required) | Object with `phone_number` (digits with country code), `email`, and/or `push_app_token`. Phone-based methods need `phone_number`; `email` needs `email`; `push` needs `push_app_token`. |
| `verification_policy` | Array of `{ "method", "fallback_time" }` in the order to try. Optional when the account default policy or fixed routing already says what to do. |
| `verification_policy[].method` | One of `sms`, `whatsapp`, `viber`, `rcs`, `email`, `voice`, `silent`, `push`. |
| `verification_policy[].fallback_time` | Seconds to wait before moving on. Minimum 30; total across methods at most 300. |
| `security_factor` | Your own numeric OTP, 3-10 characters. Omit to let Telesign generate one. |
| `message_template.name` | Template name (lowercase letters and underscores). Declared once for the whole process, so every channel in the policy needs a template with this name (content may differ). Omit to use the default template. A name that does not exist on a channel fails that method with `err_code` `3112`. |
| `voice_lang` | Language code for the `voice` method, from Telesign's Voice text-to-speech language table. Default `en-US`. |
| `external_id` | Your own transaction ID, up to 100 ASCII characters; echoed back. |
| `device_registration` | `stamp` when the process registers a device for Push/QR Verify. |

Note on `viber` and QR Verify: Telesign's OpenAPI definition omits `viber` from the `method` enum even though the Viber guide uses it, so this server adds it to the `verifyapi_send_otp` schema. No method value for QR Verify is documented anywhere; if your account uses it through default or fixed routing, omit `verification_policy`.

Finalize (`verifyapi_update_process`): `reference_id`, `action` (only `finalize` is documented) and `security_factor` (the code the user entered, 3-10 characters). `verifyapi_check_code` takes `reference_id` and `code` and fills in the rest.

Account-level settings changed through Telesign Support (not request parameters):

| Setting | Default | Range |
| --- | --- | --- |
| Code validity | 300 seconds | 60-300 seconds, counted from when the message is sent to a channel; the timer resets after each fallback |
| Maximum attempts | 3 | 1-5 |
| Generated code length | 6 digits | 3-10 digits |
| Default fallback times | 60 s (120 s email) | on request |
| Fixed routing by country, templates | none | on request |

## Responses and status codes

Important response fields:

| Field | Where | Meaning |
| --- | --- | --- |
| `reference_id` | create, get | ID of the verification process; needed for every later call. |
| `status.code`, `status.description` | create, finalize | Telesign status of this call. Code against this, not the HTTP status. On create it reflects delivery toward the carrier, not to the handset. |
| `state` | create, get, callback | Overall state: `CREATED`, `ONGOING`, `REJECTED`, `FAILED`, `VERIFIED`, `CANCELED`. |
| `inner_methods[]` | get, callback | One entry per method: `method`, `state` (the values above plus `SKIPPED`), `err_code`, `err_msg`, `tried_on`, `updated_on`. |
| `verification_policy` | create, get | The policy actually applied, including default fallback times. |
| `mobile_app_token` | create | Token for the Verify SDK; expires after five minutes. |
| `created_on`, `updated_on` | get | Timestamps for the process. |

### Which code means verified

- `status.code` **`3900` "Verified"** from the finalize call (`verifyapi_check_code` / `verifyapi_update_process`) is the only success code. `verifyapi_check_code` prints `VERIFIED` when it sees `3900` or `state` `VERIFIED`.
- For SDK-driven methods (Silent, Push, QR) there is no finalize call from your server; success is `state` `VERIFIED` from `verifyapi_get_status` (the verified method shows `err_code` `3900`).
- `3901` "Request in progress" only means the process was created or a message was handed to the gateway. It is not a verification result.

### Finalize results

| `status.code` | Description | What to do |
| --- | --- | --- |
| `3900` | Verified | Codes match. Let the user through. |
| `3904` | Verification Failed | Codes do not match. Not verified. |
| `3909` | Invalid code entered | Codes do not match. Not verified. |
| `3935` | Code validity expired | The code's validity period ran out. Start a new process. |
| `3908` | Verification time expired | Time ran out for all methods; the process is `FAILED`. Start a new process. |
| `3931` | Invalid workflow request | Finalize was called on a process or method that is not `ONGOING` (already verified, failed or not started). |
| `3903` | Invalid reference_id | Check the `reference_id`. |
| `3936` | Invalid security_factor | The code is longer than 10 characters. |
| `3922` / `3925` | Missing / invalid parameter action | Use `action: "finalize"`. |

Telesign's sources disagree about `3904` and `3909`. The API reference for the update call says `3904` means a mismatch with retries still available and `3909` means the third mismatch, ending the process unsuccessfully (both with HTTP 200). The status-codes page says `3904` leaves the process `FAILED` and `3909` leaves it `ONGOING` so the user can try again (both with HTTP 400); the code-validity page says `3904` is returned when the maximum number of attempts is exceeded. Treat anything other than `3900` as not verified, and call `verifyapi_get_status` to see whether `state` is still `ONGOING` (another attempt is possible) or `FAILED` (start a new process).

### Request validation and account errors

| HTTP | `status.code` | Description | What to do |
| --- | --- | --- | --- |
| 400 | `3101` | Invalid value for parameter phone_number | Number too long, too short or not digits. |
| 400 | `3103` | Unsupported value for parameter external_id | Over 100 characters or non-ASCII. |
| 400 | `3119` | Invalid value for parameter email | Fix the email address. |
| 400 | `3302` | Missing parameter phone_number | A phone-based method is in the policy but `recipient.phone_number` is missing. |
| 400 | `3309` | Missing parameter email | `email` is in the policy but `recipient.email` is missing. |
| 400 | `3110` | Invalid request | Malformed request or JSON. |
| 400 / 413 | `3116` | Payload limit size exceeded | Body is over the 10KB limit. |
| 400 | `3912` | Invalid verification policy | Wrong format or order (for example `silent` not first), or the account's routing returned an empty policy. |
| 400 | `3913` | Invalid or missing recipient | No phone number or email, or bad format. |
| 400 | `3911` | One or more verification methods not enabled | Ask Telesign to enable the channel. |
| 400 | `3907` | No verification method enabled for Customer ID | No methods enabled; also returned for Silent Verify to a number outside the enabled countries. |
| 400 | `3923` / `3924` | Missing / invalid value for parameter method | Fix `verification_policy[].method`. |
| 401 | `3906` | Unified Verification Product not enabled for Customer ID | The Verify API is not enabled on the account. Contact Telesign, or use `sms-verify` / `voice-verify`. |
| 401 | `3400` | Not authorized | Check credentials and permissions. |
| 401 | `3203` | Callback URL parameter not enabled for Customer ID | Using a callback URL in the request is not allowed for this account. |
| 429 | `3204` | Rate limit exceeded | Too many requests per second; back off and retry. |
| 503 | `3500` | System Unavailable | Resubmit the request. |
| 503 | `3041` | Carrier rejected - temporary problem | Try the request again. |
| - | `3072` | Message blocked due to high risk score | Intelligence score above the configured threshold; Telesign blocked the transaction. |
| - | `3927` | Too many START events without FINALIZE | The account is not finalizing its verification processes. Always finalize. |

### Processing and per-method codes

These appear in `status.code`, or in `inner_methods[].err_code` from `verifyapi_get_status` and callbacks.

| Code | Description | Meaning |
| --- | --- | --- |
| `3900` | Verified | A method completed verification of the end user. |
| `3901` | Request in progress | Delivered to the gateway; process is `ONGOING`. |
| `3001` | Message in progress | Being sent to the selected channel; final status comes later. |
| `3000` | Delivered | Shown as `err_msg` "Delivered" for a delivered message in Telesign's example. |
| `3905` | Method Failed | The previous method failed; the next one in the policy takes over. Process stays `ONGOING`. |
| `3056` | Message failed to deliver in specified fallback time | The method (or the 300-second total) timed out. |
| `3112` | Specified template does not exist for selected channel | `message_template.name` is not set up on that channel. |
| `3932` | Wrong verification method called | A method not in the policy was called; an ongoing method is set to failed (`3905`). |
| `3933` | Method expired | The method's time window ended. |
| `3934` | Method skipped | The method was skipped. |
| `3949` | User rejected verification | The user declined (app-based methods). |

SDK and Push/QR registration codes (returned to the mobile SDK flow): `3941` missing `X-TS-sdk-version`; `3942` invalid or missing `push_app_token`; `3943` invalid `push_registration`; `3944` invalid, missing or mismatched `supported_algorithm`; `3945` invalid or missing `app_id`; `3946` invalid or missing `public_key`; `3947` timestamp expired, register the push device again; `3948` public_key error; `3950` stamp error; `3951` envelope error; `3952` challenge error.

### Silent Verify code mapping

Silent Verify has its own codes, which the Verify API maps as follows.

| Silent Verify code | Description | Verify API result |
| --- | --- | --- |
| `4501` | Success / Successfully verified | `3901` on initiate, `3900` when verified |
| `4502` | The phone number does not match | `3904` |
| `10001`, `40010` (not in coverage), 404 not found | Invalid reference_id / not in coverage | `3905` if another method follows, otherwise `3904` |
| `40002` | Not authorized | `3400` |
| `10019` | Rate Limit Exceeded | `3204` |
| `10039`, `10000`, `4505`, `4506` | Internal error, system unavailable, gateway error (temporary / permanent) | `3905` if another method follows, otherwise `3500` |

### Push Verify code mapping

| Push Verify status | Verify API result |
| --- | --- |
| Request accepted; `53200` MessageProcessed (Firebase accepted and sent) | `3901` |
| Invalid input (missing `parent_reference_id`, `customer_id` or `push_app_token`) | `3045` |
| `53201` MissingRegistration, `53202` InvalidRegistration, `53203` NotRegistered, `53204` InvalidPackageName | `3942` - the `push_app_token` is missing, invalid or expired; re-register the device |
| `53205` MismatchSenderId, `53401` AuthenticationError | `3400` |
| `53206` MessageTooBig (template parameters over 4096 bytes) | `3116` |
| `53207` InvalidDataKey, `53208` InvalidTtl, `53400` InvalidJson, `53402` InvalidParameters | `3904` |
| `53209` DeviceMessageRateExceeded | `3204` |
| `53500` FCMError, `53501` Timeout, `53502` Unavailable, `53503` InternalServerError, `53600` Unknown, `53420` MissingFirebaseCredential | `3041` |
| Internal error; `53520` persistent error after five retries | `3500` |

### Voice method status mapping

For the `voice` method Telesign publishes this mapping (reproduced as published; the description column does not always match the status name).

| Code | Status name | Description |
| --- | --- | --- |
| `0` | Call has been placed on media server | Delivered. |
| `3` | Invalid input | One or more required fields are missing or improperly formatted. |
| `13` | Internal server error | Something unexpected happened. |
| `129` | Call blocked by customer request | Call is blocked by subscriber action or request. |
| `130` | Call blocked by Telesign | Call is blocked by Telesign. |
| `1002` | Number on country blocklist | Line is busy. |
| `1003` | Generic error delivering voice call | Call failed to deliver to end user. |
| `1004` | Exhausted gateway hosts | Call is cancelled by end user. |

## Callbacks

Telesign can post Verify API delivery reports to a web service you host. The payload has the same shape as the `verifyapi_get_status` response: `reference_id`, overall `state`, `recipient`, `verification_policy`, `created_on`, `updated_on` and `inner_methods[]` with each method's `state`, `err_code` and `err_msg` (for example WhatsApp `FAILED` followed by SMS `VERIFIED` with `err_code` `3900`). Reply with HTTP 200. The same endpoint can receive callbacks from other Telesign products. Field details are in `reference/callbacks` under "Receive Verify API Delivery Reports".

Code-validity expiry and exceeded attempts are also reported through GET and callbacks. The sources do not describe how to register the callback URL for the Verify API; arrange it with Telesign Support (status `3203` means request-level callback URLs are not enabled for the account).

Push Verify has a separate, optional callback feature inside the mobile SDK: the app calls `reportPushStatus` with `delivered` or `pushClicked`, and the SDK reports events such as Delivered (203), Message is read (402), Verification approved (400), Verification rejected (401), Message Expired (204), End-user device rejected the message (201) and Invalid/Unsupported message content (102).

## Requirements and limits

- The Verify API is available for full-service accounts only and must be enabled by Telesign (`3906` otherwise). Availability of each method varies by region; ask Telesign sales, especially for Silent Verify and Push Verify.
- Authentication is Basic (Customer ID and API key) or Digest. Requests and responses are JSON; inputs must be UTF-8. Request payload limit is 10KB.
- Rate limits follow Telesign's default limits per product; exceeding them returns `3204`.
- SMS needs a registered sender ID. WhatsApp, Viber, RCS and email each need a one-time account setup with Telesign Support (business profile details, logos, test devices, sender domain and so on) before the method can be used.
- WhatsApp templates must be approved by Telesign and WhatsApp; only authentication templates with the OTP as the single variable are supported. Viber, RCS and email templates are created by Telesign Support. Template names use lowercase letters and underscores.
- Email content is subject to review and to country-specific compliance rules; an unsubscribe link is required in the account setup.
- The `voice` method needs the Voice product enabled as well.
- Policy limits: three methods, 30-second minimum fallback, 300 seconds total.
- OTP limits: 3-10 numeric characters; defaults of 6 digits, 3 attempts and 300 seconds validity unless changed for the account.
- Push Verify is documented as temporarily unavailable; QR Verify is in limited release.
- Always finalize. Unfinalized processes can trigger extra sends and incorrect billing.

## Related

- Guides: `sms-verify`, `voice-verify`, `messaging-sms`, `phone-id`, `intelligence`, `error-codes`, `authentication`, `best-practices`
- Reference: `reference/verify`, `reference/callbacks`, `reference/silent-verify`
- Telesign pages:
  - https://developer.telesign.com/enterprise/docs/verify-api-overview
  - https://developer.telesign.com/enterprise/docs/verify-api-get-started
  - https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time
  - https://developer.telesign.com/enterprise/docs/verify-api-fixed-fallback-method-by-country
  - https://developer.telesign.com/enterprise/docs/verify-api-code-validity
  - https://developer.telesign.com/enterprise/docs/verify-api-verify-with-telesign-code
  - https://developer.telesign.com/enterprise/docs/verify-api-verify-with-your-own-code
  - https://developer.telesign.com/enterprise/docs/verify-api-specify-verify-api-template
  - https://developer.telesign.com/enterprise/docs/verify-api-status-codes
  - https://developer.telesign.com/enterprise/docs/verify-api-get-started-with-sms (also `-whatsapp`, `-viber`, `-rcs`, `-email`, `-voice`, `-silent-verify`, `-push-verify`, `-qr-verify`)
  - https://developer.telesign.com/enterprise/docs/verify-api-set-up-whatsapp-for-your-account (also `-viber-`, `-rcs-`, `-email-`)
  - https://developer.telesign.com/enterprise/docs/verify-api-push-verify-callbacks
  - https://developer.telesign.com/enterprise/reference/createverificationprocess
  - https://developer.telesign.com/enterprise/reference/getverificationprocess
  - https://developer.telesign.com/enterprise/reference/updateverificationprocess
  - https://developer.telesign.com/enterprise/reference/unifiedverifycallbacks
