# Voice Verify

Telesign Voice Verify (the Voice Verify API) delivers a one-time passcode (OTP) in a phone call. Telesign calls the number and, once the call is answered, plays a message containing the code - either a pre-recorded audio template in one of many languages or your own text converted to speech. It is built and optimized for sending verification codes by voice, which makes it the option for landlines, for users who cannot receive or read SMS, and as a second attempt when a text message does not arrive.

## When to use it

- Verifying a number that cannot receive SMS (landline, SMS blocked or not supported).
- Offering "call me instead" as an alternative or retry path in a login, sign-up or password-reset flow.
- Accessibility: users who prefer to hear the code.
- Reaching users behind a switchboard (PBX extension support).
- Requiring the listener to press a digit before the code is read out (`pressx`, `prompt_message`).

Pick something else when:

- You want Telesign to try several channels in order, with voice as one of them: see `verify-api` (method `voice`).
- You want the code sent by text message: see `sms-verify`.
- You want general voice calls, IVR or call control that are not OTP delivery: use Telesign Voice (`reference/voice`).

## Choosing between Verify API, SMS Verify and Voice Verify

| | Voice Verify API (this guide) | SMS Verify API | Verify API |
| --- | --- | --- | --- |
| Endpoint | `POST https://rest-ww.telesign.com/v1/verify/call` | `POST https://rest-ww.telesign.com/v1/verify/sms` | `POST https://verify.telesign.com/verification` |
| Channels | Voice call only | SMS only | SMS, WhatsApp, Viber, RCS, email, voice, Silent/Push/QR Verify |
| Fallback between channels | No | No | Yes, `verification_policy` |
| Default Telesign code | 5 digits | 7 digits | 6 digits |
| Checking the user's code | `voiceverify_get_status` with `verify_code`; success is `verify.code_state` `VALID` | `smsverify_get_status` with `verify_code`; success is `verify.code_state` `VALID` | `verifyapi_check_code`; success is `status.code` `3900` |
| Voice options | Audio templates, custom text-to-speech, PressX, prompt digit, caller ID, PBX extensions | - | Fixed spoken message, language via `voice_lang` |
| Account | Full-service accounts only | Paid account | Full-service accounts only |
| MCP tools | `voiceverify_*` | `smsverify_*` | `verifyapi_*` |

Voice Verify and SMS Verify share the status endpoint (`GET /v1/verify/{reference_id}`) and the completion endpoint; the two status tools hit the same URL, and `sub_resource` in the response (`call` or `sms`) tells you which product created the transaction. The Verify API is a separate service with its own IDs and status codes.

## How it works

Telesign-generated code:

1. Call `voiceverify_send_code` with `phone_number`. Do not send `verify_code`.
2. Telesign generates a five-digit code, places the call and plays the message once the call is answered. The response has `reference_id` and usually `status.code` `103` ("Call in progress"). Save the `reference_id`.
3. The user types the code they heard into your application.
4. Call `voiceverify_get_status` with the `reference_id` and the typed code as `verify_code`.
5. `verify.code_state` `VALID` means verified. `status` in the same response shows how the call ended (for example `100` "Call answered").

Your own code:

1. Generate a numeric code and call `voiceverify_send_code` with `phone_number` and `verify_code`.
2. Telesign plays your code in the call.
3. Compare the code the user types with the one you generated.
4. Optional but recommended: on a match, call `voiceverify_report_completion` with the `reference_id`. Completion data helps Telesign find delivery, operator and route problems.
5. Get the call outcome from `voiceverify_get_status` (without `verify_code`) or from callbacks.

If `verify_code` is present in the send request, your code is used; otherwise Telesign generates one. An invalid value or a length out of range returns an error.

### Audio templates and text-to-speech

There are two ways to produce the spoken message:

- **Audio template (default).** Telesign plays a predefined recording. The default is English (`en-US`); set `language` to one of the audio-template codes for another language. If your language is not available, Telesign Support may be able to add a custom audio template to your account.
- **Text-to-speech (TTS).** Set `tts_message` to your own text, including the `$$CODE$$` variable where the code should be read, and set `language` to the language of that text using a TTS language code. This overrides the default template.

### Text-to-speech writing tips

- Ordinary text is read as expected, with pauses at commas, semicolons, dashes and sentence ends.
- A colon or semicolon gives a short pause; a newline character (`\n`) gives a longer one. Semicolons are the most reliable separator between words or digits.
- Non-dictionary strings (URLs, email addresses, company names, made-up words) may be pronounced, spelled out or a mix, and results get less predictable the further the string is from a real word.
- Commas pause in some languages but are spoken aloud in others (French reads "virgule").
- How digit groups are read depends on punctuation and language: for English, `1;2;3;4;5` reads digits slowly one by one, while `12,345` is read as a single number.
- Unicode text is allowed.
- The only reliable test is a real call in the target language, ideally checked by a native speaker.

### Press-a-digit options

- **PressX** (`pressx: "1"`): Telesign first plays a fixed English message asking the listener to press a randomly chosen digit to hear the code. The listener gets two tries. English only, so do not combine it with another `language`, and it cannot be used with TTS.
- **Custom prompt** (`prompt_message` + `prompt_digit`): you supply the prompt text (converted to speech, up to 2000 code points, for example "Press 7 to continue") and the single digit 0-9 to expect. The code message plays only after the correct digit is pressed. A wrong digit repeats the prompt, up to three plays, then the call hangs up; no key press repeats the prompt once and then hangs up. All messages in the call use the same `language`.

### Verify Plus screening

Verify Plus is an add-on, powered by Telesign Intelligence, that evaluates the recipient before the call is placed. Telesign Support enables it for your Voice Verify account and agrees a risk recommendation threshold with you; after that nothing extra is needed in the request.

- If the number's risk recommendation is too high for your threshold, the call is not placed, `status.code` is `233` ("Message blocked due to high risk score") and you are not charged for the transaction.
- Either way the send response includes extra objects: `risk` (`recommendation`, `score`, `level`), `phone_type` (`code`, `description`) and `numbering`.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `voiceverify_send_code` | Calls the number and plays a verification code | `POST https://rest-ww.telesign.com/v1/verify/call` |
| `voiceverify_get_status` | Returns the call status; with `verify_code`, also checks a Telesign-generated code | `GET https://rest-ww.telesign.com/v1/verify/{reference_id}` |
| `voiceverify_report_completion` | Tells Telesign the user was verified, for codes you generated yourself | `PUT https://rest-ww.telesign.com/v1/verify/completion/{reference_id}` |

Use `docs_get_tool_reference("voiceverify_send_code")` (or another tool name) for the full parameter and response tables.

## Quick start

Call with a Telesign-generated code and the default English audio template (`voiceverify_send_code`). Returns `reference_id` and `status.code` `103`.

```json
{ "phone_number": "15551234567" }
```

Check the code the user typed (`voiceverify_get_status`). `verify.code_state` is `VALID` on a match.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF", "verify_code": "57244" }
```

Use the predefined French audio template (`voiceverify_send_code`).

```json
{ "phone_number": "33612345678", "language": "fr-FR" }
```

Send your own code with a custom text-to-speech message. Semicolons slow the delivery down.

```json
{
  "phone_number": "15551234567",
  "verify_code": "57244",
  "language": "en-US",
  "tts_message": "Hello; your Example App code is $$CODE$$. Once again; your code is $$CODE$$."
}
```

Report a successful verification of your own code (`voiceverify_report_completion`). Returns `status.code` `1900`.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

Require a key press before the code is read (PressX), and tag the use case.

```json
{ "phone_number": "15551234567", "pressx": "1", "ucid": "ATCK" }
```

Custom prompt digit in British English, with a caller ID bought from Telesign and a per-request callback URL.

```json
{
  "phone_number": "447700900123",
  "language": "en-GB",
  "prompt_message": "Press 7 to hear your verification code.",
  "prompt_digit": "7",
  "caller_id": "442079460000",
  "callback_url": "https://example.com/callback"
}
```

Look up the call outcome only (`voiceverify_get_status` without `verify_code`).

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

## Key parameters

Send (`voiceverify_send_code`):

| Parameter | Use |
| --- | --- |
| `phone_number` (required) | Destination number, digits only, starting with the country dialing code. |
| `verify_code` | Your own numeric code: three to five digits, `100` to `99999`. Omit to let Telesign generate a five-digit code. |
| `language` | Language of the message. Default `en-US`. Use an audio-template code normally, or a TTS code when `tts_message` is set (tables below). |
| `tts_message` | Custom text to speak instead of the audio template. Must contain `$$CODE$$`, and `language` must be set to the text's language. |
| `pressx` | `"1"` to play the fixed English "press a digit to hear your code" step first. Not with TTS or other languages. |
| `prompt_message`, `prompt_digit` | Your own "press N" prompt text and the digit (0-9) to expect; use both together. |
| `caller_id` | Phone number to show as caller ID. Must be a number purchased from Telesign. Not guaranteed: Telesign or the terminating operator may override it. |
| `extension_type`, `extension_template` | For numbers behind an older PBX that needs an operator or automated attendant. Use both together. `extension_template` is the extension, digits only, up to 28 characters; with `extension_type` `1` (DTMF digits are dialed) commas add one-second pauses. |
| `ucid` | Use-case code: `ATCK` (2FA on login or account update), `BACF` / `BACS` (account creation exposed to bulk fraud / spam), `CHBK` (expensive or unusual purchase), `PWRT` (password reset), `TRVF` (money transfer), `THEF` (protecting against number takeover), `LEAD`, `RESV`, `RXPF`, `SHIP`, `CLDR`, `OTHR` / `UNKN`. |
| `originating_ip` | The end user's IP address (IPv4 or IPv6), never your server's. |
| `callback_url` | URL for delivery reports for this request only; overrides the account's default callback URL. |

Status (`voiceverify_get_status`): `reference_id` (required) and `verify_code` (the code the user typed; only meaningful when Telesign generated the code).

Completion (`voiceverify_report_completion`): `reference_id` only.

### Supported languages for audio templates

Use these `language` codes when Telesign's predefined recording is played (no `tts_message`):

`ca-ES` Catalan, `zh-HK` Chinese (Cantonese, Hong Kong), `zh-CN` Chinese (Mandarin, Simplified), `zh-TW` Chinese (Mandarin, Taiwan), `da-DK` Danish, `nl-NL` Dutch, `en-AU` English (Australia), `en-CA` English (Canada), `en-GB` English (Great Britain), `en-IN` English (India), `en-UK` English (UK), `en-US` English (US), `fi-FI` Finnish, `fr-FR` French, `fr-CA` French (Canada), `de-DE` German, `it-IT` Italian, `ja-JP` Japanese, `ko-KR` Korean, `nb-NO` Norwegian, `pl-PL` Polish, `pt-BR` Portuguese (Brazil), `pt-PT` Portuguese (Europe), `ru-RU` Russian, `es-MX` Spanish (Mexico), `es-ES` Spanish (Spain), `sv-SE` Swedish.

### Supported languages for text-to-speech

Use these `language` codes together with `tts_message`:

`zh-HK` Chinese (Hong Kong, Cantonese), `zh-CN` Chinese (Mandarin), `zh-TW` Chinese (Taiwan), `da-DK` Danish, `nl-NL` Dutch, `en-AU` English (Australian), `en-GB` English (UK), `en-US` English (US), `en-CA` English (Canadian), `en-IN` English (India), `fi-FI` Finnish, `fr-FR` French, `fr-CA` French (Canadian), `de-DE` German, `it-IT` Italian, `ja-JP` Japanese, `ko-KR` Korean, `nb-NO` Norwegian, `pl-PL` Polish, `pt-BR` Portuguese (Brazil), `pt-PT` Portuguese (Europe), `ru-RU` Russian, `es-MX` Spanish (Mexico), `es-ES` Spanish (Spain, Castilian), `ca-ES` Catalan, `sv-SE` Swedish.

These are not the SMS Verify language codes (which are mostly two-letter codes such as `fr`).

## Responses and status codes

Code against `status.code` and `errors[].code` in the body, not the HTTP status.

| Field | Meaning |
| --- | --- |
| `reference_id` | 32-character hex ID of the transaction. Needed for status and completion. |
| `sub_resource` | `call` for this product. |
| `status.code`, `status.description`, `status.updated_on` | Call status. In the send response it is the status of the call attempt, not proof the user heard the code. |
| `verify.code_state` | Result of the code check: `VALID`, `INVALID`, `EXPIRED`, `MAX_ATTEMPTS_EXCEEDED` or `UNKNOWN`. |
| `verify.code_entered` | The code the user entered, when provided. |
| `voice.caller_id` | The caller ID used for the call. |
| `errors[]` | `code` and `description` for each error; empty array on success. |
| `risk`, `phone_type`, `numbering` | Present in the send response when Verify Plus is enabled. |

### Code check results

| `verify.code_state` | Meaning | What to do |
| --- | --- | --- |
| `VALID` | The typed code matches. | Verified. |
| `INVALID` | The codes do not match. | Let the user retry. |
| `EXPIRED` | Checked after the code's validity period ended. | Place a new call with `voiceverify_send_code`. |
| `MAX_ATTEMPTS_EXCEEDED` | The user already used the allowed number of attempts. | Place a new call. |
| `UNKNOWN` | No check yet, or any other state (always the case when you generated the code). | - |

For your own code you do the comparison, and `1900` ("Verify completion successfully recorded") from `voiceverify_report_completion` confirms the completion was logged.

### Call status codes

| Code | Description | Notes |
| --- | --- | --- |
| `103` | Call in progress | Normal immediate response; Telesign is placing the call or playing the message. Resolves to another code later. |
| `105` | Call not handled yet | The call has not been attempted yet. |
| `100` | Call answered | Answered by the end user or by voicemail. Answered does not mean verified. |
| `101` | Not answered | Nobody picked up. Offer a retry or another channel. |
| `107` | Line busy | The line was busy. Retry later. |
| `106` | Call failed | The call did not go through, typically an upstream provider failure. Retrying sometimes works. |
| `108` | Call canceled by Telesign | Telesign canceled the call. |
| `129` | Call blocked by your request | You asked Telesign to blocklist this number. |
| `130` | Call blocked by Telesign | Number on a global blocklist, or the content or usage was judged inappropriate or abusive. |
| `233` | Message blocked due to high risk score | Verify Plus blocked the call. |
| `238` | Destination blocked by prefix | You asked for numbers with this prefix to be blocked. |
| `500` | Transaction not attempted | No request was attempted; see `errors[]`. |
| `501` | Not authorized | Authentication or permission problem; see `errors[]`. |
| `599` | Status not available | Try again later. |

Because the status endpoint is shared with SMS Verify, its reference also lists the SMS delivery codes (`200`-`295`, `502`-`521`). A Voice Verify transaction normally reports the call codes above; see `sms-verify` for the SMS ones.

### Error codes

| HTTP | `errors[].code` | Description | What to do |
| --- | --- | --- | --- |
| 400 | `-10001` | Not Allowed Host / Invalid Request: {parameter} | The calling IP is not authorized, or a parameter is invalid. |
| 400 | `-40006` | Bad Request | Check the request format. |
| 400 | `-40007` | No Data Submitted (send) | Send the required parameters. |
| 401 | `-10009` | Invalid source IP address | Call from an allowed IP. |
| 401 | `-20002` | This product is not enabled for this Customer ID | Ask Telesign to enable Voice Verify. |
| 401 | `-20003` | This feature is not enabled for this Customer ID | Ask Telesign to enable the feature you used. |
| 401 | `-20004` | This product is not enabled for this country | Destination country not enabled. |
| 401 | `-30000`, `-30001`, `-30002`, `-30003` | Invalid Customer ID / account suspended / not activated / new account limit reached | Check the account. |
| 401 | `-30004` to `-30012`, `-30015` | Authorization header, signature, date, nonce or API key problems | Check credentials; see `authentication`. |
| 401 | `-30013` | Invalid ReferenceID for Verify Completion | Completion call used an unusable `reference_id`. |
| 401 | `-40002` | Not Authorized | Check credentials and permissions. |
| 404 | `-10001` | CustomerID/ReferenceID not found | Wrong `reference_id` or wrong account. |
| 404 | `-10004` | Reference ID expired | Status is no longer available for this transaction. |
| 404 / 405 | `-40004` / `-40005` | Resource Not Found / Method Not Allowed | Check the endpoint and method. |
| 429 | `-40007` | Rate Limit Exceeded (status lookup) | Slow down and retry. |
| 429 | `-40008` | {product} exceeded transaction hard cap. Request denied. | Account transaction cap reached; contact Telesign. |
| 503 | `-90001` | System Unavailable, please try again later | Retry. |

## Callbacks

The send response only reports the start of the call. To be told how the call ended without polling, set up Telesign's Transaction Callback Service (Telesign's own-code guide lists it as a prerequisite) or pass `callback_url` on a request to override the account's default callback URL for that request.

Polling is the alternative: `voiceverify_get_status` works for up to 12 hours after the request. Telesign recommends waiting 3-5 minutes after a transaction before querying for its final status; checking a user-entered code with `verify_code` can of course be done as soon as the user submits it.

The sources for this guide do not include a Voice Verify specific callback schema; see `reference/callbacks` for the callback payloads Telesign documents.

## Requirements and limits

- Voice Verify is available for full-service accounts only and must be enabled by Telesign (`-20002` otherwise). Individual features and destination countries can also need enabling (`-20003`, `-20004`).
- Authentication is Basic or Digest. Requests are `application/x-www-form-urlencoded`; inputs must be UTF-8; responses are JSON.
- Rate limits follow Telesign's default limits per product; an account transaction hard cap can apply (`-40008`).
- `verify_code` must be numeric, three to five digits.
- `tts_message` needs `$$CODE$$` and an explicit `language`; `prompt_message` is limited to 2000 code points; `extension_template` to 28 characters.
- PressX is English only and cannot be combined with TTS.
- `caller_id` requires a number purchased from Telesign and may still be overridden for delivery quality or local telecom regulations.
- Older PBX systems are not supported unless you send `extension_type` and `extension_template`.
- Transaction status can be retrieved for up to 12 hours.
- With Verify Plus, calls blocked for high risk are not charged.
- Using your credentials in Telesign's API explorer places real, billed calls; compliance rules apply to every transaction.

## Related

- Guides: `verify-api`, `sms-verify`, `phone-id`, `intelligence`, `error-codes`, `authentication`, `best-practices`
- Reference: `reference/voice-verify`, `reference/callbacks`, `reference/voice`
- Telesign pages:
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-overview
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-verify-with-telesign-code
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-verify-with-your-own-code
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-get-transaction-status
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-screen-recipients-using-verify-plus
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-supported-languages-for-audio-templates
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-supported-languages-for-text-to-speech
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-text-to-speech-tips
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-try-it
  - https://developer.telesign.com/enterprise/reference/sendvoiceverifycode
  - https://developer.telesign.com/enterprise/reference/getvoiceverifystatus
  - https://developer.telesign.com/enterprise/reference/reportvoiceverifycompletion
