# Best practices

Practical guidance for building on Telesign, collected from Telesign's developer documentation: how to design a verification screen, how to format phone numbers, how to choose channels and fallback, how long codes should live, what happens when a Telesign location fails, how SMS length and encoding work, and how to handle credentials. Telesign presents the user-interface items as recommendations, not requirements. Limits and defaults quoted here are Telesign's documented values.

## Verification flow user interface

Recommendations for any screen that asks for a phone number and a code:

1. Say why phone verification is needed, for example that it helps prevent account takeover and allows quick, safe account recovery.
2. State that the number and the resulting SMS or call are used for security only (verification, account recovery, account security) and for nothing else.
3. Call it a "verification code" or "one-time verification code", not a PIN. A PIN suggests a reusable secret such as a bank card PIN.
4. Let mobile users choose between SMS and voice. Some users pay per SMS received, some prefer one channel, and in some countries SMS is less reliable than voice.
5. If the user picks voice, advise them to protect their voicemail with a PIN, since the code may land there.
6. Add a disclaimer such as "message and data rates may apply".
7. Separate the country code from the phone number field: either a drop-down of country names with their codes, or a country selector that fills the code in automatically. This cuts down on errors such as the country code being typed twice.
8. Explain what will happen at each step.
9. Offer a resend option, for example a link reading "Didn't receive the verification code?".
10. Offer a second method as a backup (if SMS did not work, offer voice).
11. If you check numbers with Phone ID, re-prompt users whose number is invalid, high risk or unsuitable for the chosen method, for example "please enter a valid mobile number" when SMS is the method.
12. Limit how many times a user can request a code, and offer a route to manual support (contact details or an FAQ link).
13. Expire verification codes. Telesign recommends no more than five minutes, depending on the use case.

## Registration and two-factor authentication flows

At registration:

- Require a phone number, for extra security and account takeover prevention.
- Assess the number's risk with Telesign Intelligence when it is entered (`intelligence_assess_risk` with `account_lifecycle_event` set to `create`), and use the phone type to pick the right delivery method, which improves deliverability and saves cost.

For two-factor authentication (2FA):

- When a user enrols a number for 2FA, look it up with Phone ID (`phoneid_get_info`) for fraud signals.
- Do not display the whole stored number; mask all but the last four digits (`xxx-xxx-1234`).
- Do not let the user edit the number inside the 2FA challenge. An attacker holding a stolen password could otherwise redirect the code.
- Allow up to three attempts, then lock the account and offer a way to contact support.
- Make sure caching is configured so a user cannot skip 2FA.
- Ask users to confirm their contact details every 30 to 90 days. When a number changes, check it again with Phone ID or Intelligence and re-verify it.
- Challenge users periodically (for example every two months), and whenever they sign in from a different location if you track device and location.

## Phone number formatting and cleansing

- Pass numbers as digits only, starting with the country dialing code and with no spaces or punctuation: `15551234567`. The MCP tools strip a leading `+`, spaces and punctuation for you, but the country code must be present.
- Telesign applies phone number cleansing to every transaction: it auto-corrects common formatting problems to maximise deliverability. Keeping the country code as a separate UI field is still recommended so users enter the number correctly in the first place.
- Phone ID returns the result of cleansing under `numbering.cleansing` (separately for `call` and `sms`), including a `cleansed_code`:

| Cleansing code | Text | Meaning |
| --- | --- | --- |
| 100 | No Changes / Exact | The number was already correctly formatted |
| 101 | Changed | The number was changed to ensure completion, for example extraneous digits such as 011 were removed or digits were added to meet dialing rules |
| 102 | Restricted Number | Restricted number, such as premium rate, short codes (for example emergency services) or satellite phones |
| 103 | No Match | Looks correctly formatted but cannot be matched to any specific area |
| 104 | Invalid | Not correctly formatted |
| 105 | Partial Match | The number is too long or too short |

A reasonable rule: accept `100` and `101`, and re-prompt the user on `102` to `105`.

## Phone type and what to do with it

Phone ID and Intelligence return a `phone_type.code`. Telesign attaches a risk level and a recommended action to each type for verification use cases:

| Code | Type | Risk | Recommended action |
| --- | --- | --- | --- |
| 1 | `FIXED_LINE` | Low | Allow |
| 2 | `MOBILE` | Medium-Low | Allow |
| 3 | `PREPAID` | Medium-High | Flag |
| 4 | `TOLL_FREE` | High | Block |
| 5 | `VOIP` (non-fixed VoIP) | High | Block |
| 6 | `PAGER` | High | Block |
| 7 | `PAYPHONE` | High | Block |
| 8 | `INVALID` | High | Block |
| 9 | `RESTRICTED_PREMIUM` | High | Block |
| 10 | `PERSONAL` | Medium-Low | Allow |
| 11 | `VOICEMAIL` | Medium-High | Block |
| 20 | `OTHER` | Medium-High | Block |

Notes: not every prepaid mobile is identified as prepaid (some come back as `MOBILE`); use the phone type to choose the delivery method (the override reasons below show that only some fixed lines are SMS-enabled). If `phone_type.override_reason_id` is present, Telesign changed the type for a stated reason:

| Override code | Reason |
| --- | --- |
| 1 | Value Added Services (VAS) number: virtual numbers, non-fixed VoIP, receive-SMS-online numbers |
| 2 | Reported fraud - high-risk number |
| 5 | Premium rate number |
| 6 | Publicly available number (free registration sites, burner or premium rate numbers) |
| 8 | Carrier prefix analysis |
| 10 | SMS-enabled carrier: an SMS-enabled fixed line overridden to Mobile |
| 11 | Non SMS-enabled phone number on a carrier where some fixed lines are SMS-enabled |

## Choosing channels and fallback

- Offer SMS and voice at minimum, and let the user switch if the first does not arrive.
- With the Verify API, the default when no `verification_policy` is sent (and no fixed routing is configured for the country) is SMS with a 60-second fallback time.
- A `verification_policy` is an ordered list of methods, each with an optional `fallback_time`. Rules:
  - At most three methods. The `method` values the tool accepts are `silent`, `sms`, `push`, `rcs`, `whatsapp`, `email` and `voice`.
  - `fallback_time` is in seconds and starts at 30 (the tool reference gives the range as 30 and up; Telesign's policy page says it has to be greater than 30 seconds while its own examples use 30).
  - Silent Verify, Push Verify and QR Verify cannot be combined in one policy, and if one of them is used it must come first, followed by OTP methods (SMS, WhatsApp, Viber, RCS, email).
  - Default `fallback_time` when omitted: 60 seconds for SMS, Silent Verify, Push Verify, QR Verify, WhatsApp, Viber, RCS and voice; 120 seconds for email.
  - The whole verification attempt must complete within 300 seconds (5 minutes). The fallback times of all channels together, whether set in the request or configured on the account, cannot exceed that. If the attempt has not completed when the time runs out, the transaction fails (the method shows `err_code` `3056`, "Message failed to deliver in specified fallback time").
- Availability of methods varies by region; Telesign asks you to check with its sales team.

A valid policy that tries Silent Verify first and then RCS:

```json
{
  "recipient": { "phone_number": "15551234567" },
  "verification_policy": [
    { "method": "silent", "fallback_time": 30 },
    { "method": "rcs", "fallback_time": 45 }
  ]
}
```

Passed to `verifyapi_send_otp`, this starts a verification process and returns a `reference_id`. If both methods fail, no further method is used. Putting `silent` after another method, or combining `silent` with `push`, is rejected as an invalid policy (status `3912`).

For plain messaging (`messaging_send_message`), list channels in the order to try them; each can have its own `fallback_time`, and fallback must be enabled for the account (status `3202` otherwise).

## Code validity, attempt limits and code length

For Verify API one-time passcodes Telesign applies these settings. Changing them is a feature that Customer Support enables per account.

| Setting | Default | Allowed range | When exceeded |
| --- | --- | --- | --- |
| Code validity | 300 seconds | 60 to 300 seconds | Status `3935` "Code validity expired" |
| Maximum attempts to enter the code | 3 | 1 to 5 | Status `3904` "Verification failed" |
| Length of Telesign-generated code | 6 digits | 3 to 10 digits | |

The validity timer starts when a message is sent to a channel and is reset after each fallback.

On your side:

- Keep codes short-lived (five minutes or less).
- Cap resend requests and wrong-code attempts, and lock or escalate to support after about three failed attempts.
- A wrong code returns `3909` while the verification is still ongoing; the user may try again until attempts run out.

## Automated failover and alternate REST hosts

- `rest-ww.telesign.com` and `rest-api.telesign.com` both retry automatically on any HTTP 500-509 response. Telesign tries all of its available locations before answering the client. Nothing has to be configured.
- The client only notices extra latency: typically about twice the normal response time when failover triggers, and up to three or four times in some situations. Normal HTTP read timeouts cover this; do not set very tight timeouts on Telesign calls.
- Failover is enabled for all products except Voice. It is not available for any Voice product.
- It can be switched off per request by sending the HTTP header `auto-failover: false`.

In the MCP server, REST calls go to `https://rest-ww.telesign.com` by default. Set the `TELESIGN_REST_URL` environment variable to point the server at another Telesign REST host (for example `https://rest-api.telesign.com`). Status `3058` / error `10035` ("The requested API host is not allowed for this CustomerID") means the account is not permitted on the host being used.

Related network guidance from Telesign: do not restrict your outbound traffic to Telesign by IP address, and do not pin Telesign's certificates. Both can cause outages when Telesign shifts traffic between locations or renews certificates.

## SMS encoding, length and splitting

Applies to SMS (`messaging_send_sms`) and SMS Verify API.

- Send text as UTF-8. Telesign then encodes the message for delivery, trying in this order: GSM 03.38, ASCII, UTF-16-BE. Text that cannot be represented in GSM 03.38 or ASCII (emoji, for example) is sent as UTF-16-BE, which lowers the single-message limit to 70 characters.
- A single SMS carries 140 bytes. Longer messages are split into segments, each with a 6-byte header so the handset can reassemble them:

| Encoding | Characters in a single message | Characters per segment of a long message |
| --- | --- | --- |
| GSM 03.38 | 160 | 153 |
| ASCII | 140 | 134 |
| Latin-1 (SMPP connections only) | 140 | 134 |
| UTF-16-BE | 70 | 67 |

- A concatenated message typically has at most 10 parts; some carriers do not support more.
- The `message` argument of `messaging_send_sms` is limited to 1600 characters, and Telesign recommends avoiding messages that need several SMS when possible.
- Some countries and carriers do not support non-ASCII characters; Telesign may adjust content to avoid delivery failure.
- Smart splitting avoids breaking a word, URL or email address across segments (a word longer than one segment is still split). It is always on in some countries and can be enabled for an account through Customer Support.
- Behaviour can vary by carrier, country and language.

Practical consequences: keep OTP messages within one segment, avoid emoji in transactional text if you want the 160-character limit, and remember that each segment is a separate message part (delivery reports can include `message_parts_count`).

## Sender ID and regional compliance notes

- `sender_id` only takes effect for values Telesign has added to your allow list; give Customer Support the sender IDs you intend to use before sending. A value not on the list is not used.
- Preservation of the sender ID is not guaranteed. Telesign may override it to improve delivery or to follow the regulations of the destination country. Status `521` means the requested sender ID is not allowed for the destination country or operator.
- For the SMS API, Telesign recommends limiting sender ID values to `0-9` and `A-Z` (maximum length 20), because support for other characters varies by carrier.
- Telesign leases localized phone numbers, caller IDs and sender IDs on request; you state the expected use cases and delivery regions.
- Always set `message_type` correctly on SMS sends: `OTP` (one-time passwords), `ARN` (alerts, reminders, notifications) or `MKT` (marketing).
- India-local traffic: supply `dlt_template_id` and `dlt_entity_id` on SMS and SMS Verify sends. Status `517` means the DLT template ID or entity ID could not be found by the operator.
- Telesign's SMS template is translated into more than 54 languages and the voice template into more than 84 localized languages; custom messages can be arranged through Customer Support.
- Requests made with real credentials are billed and subject to Telesign's compliance rules, including test requests from the API Explorer on the documentation site.

## Optional risk signals worth sending

Several send and scoring tools accept optional context about the end user. Supplying it costs nothing and helps Telesign's fraud and routing decisions.

| Argument | What to send | Notes |
| --- | --- | --- |
| `originating_ip` | The end user's IP address (IPv4 or IPv6) | Never your own server's address. A badly formatted value is rejected (`11010`, `3105`) |
| `account_lifecycle_event` | `create`, `sign-in`, `transact`, `update` or `delete` | Required for `intelligence_assess_risk`; optional on SMS and Messaging sends. Other values are rejected (`11003`, `3104`) |
| `external_id` | Your own transaction identifier | Echoed back in responses and callbacks; at most 100 ASCII characters |
| `account_id`, `device_id`, `email_address` | Your identifiers for the end user (Intelligence) | Case sensitive |
| `ucid` | Use case code for SMS Verify API and Voice Verify API | See the table below |

Use case codes (`ucid`):

| Code | Use case |
| --- | --- |
| `ATCK` | 2FA situations such as updating an account or signing in |
| `BACF` | Account creation where the service may be vulnerable to bulk attacks or individual fraudsters |
| `BACS` | Account creation where the service may be vulnerable to bulk attacks or individual spammers |
| `CHBK` | Confirming an expensive or unusual purchase |
| `CLDR` | Calendar event |
| `LEAD` | Checking that a person submitting personal details for information (loan, realty, school) is genuine |
| `OTHR` | Other |
| `PWRT` | Password reset |
| `RESV` | Reservations, to reduce no-shows |
| `RXPF` | Preventing prescription fraud |
| `SHIP` | Shipping notification |
| `THEF` | Preventing identity takeover by deactivating or redirecting a phone number |
| `TRVF` | Approving a money transfer |
| `UNKN` | Same as `OTHR` |

Example: an SMS Verify send with context.

```json
{
  "phone_number": "15551234567",
  "ucid": "PWRT",
  "originating_ip": "203.0.113.10"
}
```

Passed to `smsverify_send_code`, this sends a Telesign-generated code for a password reset and returns a `reference_id`.

## Supported languages and time zones

Language support is per product, and each product has its own table of codes. Use the table for the product you are calling:

| Product | Telesign page |
| --- | --- |
| SMS Verify API | https://developer.telesign.com/enterprise/docs/sms-verify-api-supported-languages |
| Voice Verify API (audio templates) | https://developer.telesign.com/enterprise/docs/voice-verify-api-supported-languages-for-audio-templates |
| Voice Verify API (text-to-speech) | https://developer.telesign.com/enterprise/docs/voice-verify-api-supported-languages-for-text-to-speech |
| Voice (text-to-speech) | https://developer.telesign.com/enterprise/docs/voice-supported-languages-for-text-to-speech |
| Voice (call recording transcription) | https://developer.telesign.com/enterprise/docs/voice-supported-languages-for-call-recording-transcription |
| Messaging (WhatsApp templates) | https://developer.telesign.com/enterprise/docs/messaging-supported-languages-for-whatsapp-templates |

Where a tool has a `language` argument, pick the user's language rather than relying on the default; if you override the message text with your own `template`, the `language` argument is not used for SMS Verify.

Country names, two-letter country abbreviations and dialing codes, and the time zone abbreviations Telesign uses in responses (with their UTC offsets) are listed on https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones. Some abbreviations there are ambiguous (for example `CST`, `IST` and `AST` each stand for several zones), so do not rely on an abbreviation alone. Timestamps in responses and callbacks are UTC (RFC 3339 / ISO 8601).

## Credential security

- All requests must use HTTPS; HTTP is not supported.
- Basic authentication (Customer ID and API key) is the easiest and fastest, but the key gives broad access to every product enabled on the account. Digest authentication signs each request so the key itself is not transmitted. OAuth 2.0 client credentials can be limited to a subset of scopes, which suits least-privilege integrations; give each OAuth app only the scopes it needs. The MCP server uses Basic by default and Digest when `TELESIGN_AUTH_METHOD=digest`.
- Keep the Customer ID, API key, OAuth client secret and Protect Platform credentials in environment variables or a secrets manager. Never put them in client-side code, prompts, logs or source control. The MCP server reads them from its environment, so an assistant never needs to be given them in conversation.
- With Digest authentication, send a fresh `x-ts-nonce` on every request to defend against replay, and keep the clock accurate: the date header must be within 15 minutes of Telesign's time.
- Verify the signature on callbacks you receive (topic `callbacks`).
- Rotate REST API keys with the Accounts API where it is available: create the new key, deploy it, then expire the old one (topic `accounts`). A new key's value is shown only once.
- A trial account receives its own API key and Customer ID plus test credit, and can send only to verified numbers; use one for experiments instead of production credentials.

## Coding against responses

- Branch on `status.code` and `errors[].code`, not on the HTTP status and never on description strings, which may change (topic `error-codes`).
- Store the `reference_id` of every transaction; status tools, completion reports and Telesign support all need it.
- An immediate response usually carries an intermediate status. Get the final one from a callback or by polling the status tool (topic `callbacks`).
- For SMS Verify and Voice Verify with your own codes, report successful verifications back with the completion tools (`smsverify_report_completion`, `voiceverify_report_completion`).

## Related

- Topics: `error-codes`, `callbacks`, `authentication`, `verify-api`, `phone-id`, `intelligence`, `accounts`.
- Telesign pages used:
  - https://developer.telesign.com/enterprise/docs/user-interface-best-practices
  - https://developer.telesign.com/enterprise/docs/automated-failover
  - https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones
  - https://developer.telesign.com/enterprise/docs/understand-sms-encoding-character-limits-and-splitting
  - https://developer.telesign.com/enterprise/docs/verify-api-code-validity
  - https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time
  - https://developer.telesign.com/enterprise/docs/get-started-with-docs
  - https://developer.telesign.com/enterprise/docs/try-the-api-explorer
  - https://developer.telesign.com/enterprise/docs/authentication
