# Number Masking

Telesign Number Masking creates private, limited-duration conversation sessions between two parties.
Each party is given a Telesign virtual number (a "masking ID") to text or call, and Telesign relays the
communication to the other person, so neither one ever sees the other's real phone number. You and
Telesign still know both numbers and can track the interaction, which keeps conversations and
transactions on your platform and lets you enforce your terms of use.

## When to use it

Typical cases are two people who need to reach each other for a short time around one transaction:

- Food delivery: driver and diner.
- Ride sharing: driver and passenger.
- Accommodation rentals: host and renter.
- Recruiting: recruiter and candidate.

Choose the session type by channel:

| Need | Tool | Masking IDs required |
| --- | --- | --- |
| Texting only | `numbermasking_create_sms_session` | Telesign numbers that are SMS-capable only (not voice-capable, not dual-capable) |
| Texting and/or calling | `numbermasking_create_sms_voice_session` | Telesign numbers that are dual-capable (both SMS and voice) |

Pick a different product when:

- You want to send messages from your business to a user: use `messaging-sms`.
- You want to control the call flow yourself (IVR, announcements, deciding per call whom to connect),
  or mask numbers on a call without a pre-created session: use `voice`.
- You want to verify a phone number: use `verify-api`.

## How it works

Key terms:

| Term | Meaning |
| --- | --- |
| Anonymous session | A time-limited pairing of two real phone numbers. Identified by the `reference_id` returned when it is created. |
| Masking ID (`masked_id`) | The Telesign virtual number allocated to conceal one party's real number. |
| `validity_period` | How long the session lasts. |

SMS flow (rider and driver example):

1. One user asks, in your app, to contact the other.
2. Your server creates a session with both real phone numbers (`numbermasking_create_sms_session` or
   `numbermasking_create_sms_voice_session`).
3. The response contains a `masked_id` for each party. Show each user the masking ID to use, as
   returned in the response.
4. The rider sends a text. It arrives at Telesign.
5. Telesign relays the text to the driver, masked, and notifies your callback service with the message
   content.
6. The session stops working when the validity period ends (`session_data.session_end_on`).

Voice flow (sessions created with `numbermasking_create_sms_voice_session`):

1. Your server creates the session with both real numbers.
2. The rider places a call. The call is routed to Telesign.
3. Telesign connects the call to the driver. The caller IDs of both parties are masked from each other.

Creating the session is only one part of a masked voice call. The call itself runs on Telesign Voice,
which is event-driven: Telesign posts events for the call to a webhook you host, and the Voice
`dial_session` action connects a call using the session you created. If the session cannot be
retrieved, Voice sends a `dial_session_completed` event with a reason such as `session_not_found`.
When the call ends, the Voice `call_completed` event includes `session_info` with the session's
`reference_id` and, for each leg, the real `phone_number` and the `virtual_number` shown to the other
party. See the `voice` guide for the webhook, actions and events.

Notes:

- Both parties may be assigned the same masking ID. This does not affect communication between them.
- The MCP tools only create sessions. The sources document no endpoint for listing, extending or
  ending a session early, so choose `validity_period` deliberately.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `numbermasking_create_sms_session` | Creates an anonymous session for masked SMS between two numbers. | `POST https://rest-ww.telesign.com/v1/anonymous/session/sms` |
| `numbermasking_create_sms_voice_session` | Creates an anonymous session usable for masked SMS or masked voice calls. | `POST https://rest-ww.telesign.com/v1/anonymous/session/sms_voice` |

Both tools take the same three arguments and return the same response structure. Use
`docs_get_tool_reference("numbermasking_create_sms_session")` for the full generated reference.

## Quick start

Create an SMS-only session. Returns `reference_id` (the session ID), `status.code` 2700 and a
`masked_id` for each party under `session_data`.

```json
{
  "phone_number_1": "15551234567",
  "phone_number_2": "15557654321",
  "validity_period": 2
}
```

Create a session that can carry both texts and calls (`numbermasking_create_sms_voice_session`). Same
arguments; `session_data.resource` is `sms_voice`.

```json
{
  "phone_number_1": "15551234567",
  "phone_number_2": "15557654321",
  "validity_period": 24
}
```

Example response:

```json
{
  "reference_id": "B5862A14363C016C8832D53625270015",
  "session_data": {
    "message": "",
    "phone_number_1": {
      "complete_phone_number": "15551234567",
      "country_code": "1",
      "country_iso2": "US",
      "country_iso3": "USA",
      "country_name": "United States",
      "masked_id": "15550100233"
    },
    "phone_number_2": {
      "complete_phone_number": "15557654321",
      "country_code": "1",
      "country_iso2": "US",
      "country_iso3": "USA",
      "country_name": "United States",
      "masked_id": "15550100234"
    },
    "resource": "sms",
    "session_end_on": "2018-03-05 10:59:13.761245",
    "validity": 2
  },
  "status": {
    "code": 2700,
    "description": "Session successfully created",
    "updated_on": "2018-02-12T14:57:11.765723Z"
  }
}
```

After the call, store `reference_id` with your transaction (ride, order, booking) and give each user
the masking ID from the response.

## Key parameters

| Parameter | How to choose |
| --- | --- |
| `phone_number_1` | Real phone number of one party: digits with country code, no spaces or special characters. |
| `phone_number_2` | Real phone number of the other party. Must be different from `phone_number_1` (otherwise status 2708). |
| `validity_period` | Integer, minimum 1. How long the two users can communicate. The **unit is configured per account** by Telesign (seconds, minutes, hours or days), so the same number can mean very different durations on different accounts. The maximum is always the equivalent of 720 hours (so 1-720 when the unit is hours). Ask Telesign Customer Support which unit applies, or to change it. |

Because the unit of `validity_period` is not visible in the request, confirm the real expiry from
`session_data.session_end_on` in the response rather than assuming it.

## Responses and status codes

Important response fields:

| Field | Meaning |
| --- | --- |
| `reference_id` | 32-digit hex ID for both the request and the session. Callback notifications refer to it as `session_reference_id`; Voice events carry it in `session_info.reference_id`. |
| `status.code`, `status.description`, `status.updated_on` | Outcome of the request. Code against `status.code`, not the HTTP status. |
| `session_data.resource` | `sms` (SMS only) or `sms_voice` (SMS or voice). |
| `session_data.session_end_on` | Timestamp when the session expires. |
| `session_data.validity` | The validity period granted, in the account's configured unit. |
| `session_data.message` | Extra information about session creation, for example a notice that the country of a phone number and of its masking ID differ. |
| `session_data.phone_number_1`, `session_data.phone_number_2` | For each party: `complete_phone_number`, `country_code`, `country_iso2`, `country_iso3`, `country_name` and the allocated `masked_id`. |
| `error` | Unused; ignore it. |

Status codes:

| Code | HTTP | Meaning | What to do |
| --- | --- | --- | --- |
| 2700 | 200 | Session successfully created | Hand out the masking IDs. |
| 2701 | 200 | Session created, but the country code of a phone number and of its assigned `masked_id` differ | The session works, but a user will be texting or calling a masking number from a different country than their own. Check `session_data.message`. |
| 2702 | 400 | No masking ID available | Your pool of virtual numbers is exhausted or lacks a suitable number; retry later or obtain more numbers. |
| 2703 | 400 | Invalid session type | Check that the right tool / resource is used. |
| 2704 | 503 | Internal error | Retry. |
| 2705 | 400 | `validity_period` must be an integer greater than zero | Fix the value. |
| 2706 | 400 | Phone number blocked by Telesign | The named number cannot be used. |
| 2707 | 400 | Phone number blocked by customer | The number is on your own block list. |
| 2708 | 400 | `phone_number_1` and `phone_number_2` cannot be the same value | Use two different numbers. |

HTTP 429 means too many requests. Authentication failures follow the general Telesign rules (see
`authentication` and `error-codes`).

## Callbacks

To know when users are interacting in an anonymous SMS session, and to see the content of the
messages they exchange, you need a transaction callback service. Session creation itself is
synchronous; there is no status-polling endpoint.

- Host a service on a private URI that accepts HTTP requests from Telesign, and give that URI to your
  Telesign contact.
- Each message exchanged in a session is pushed to the service as a JSON payload.
- Reply with HTTP 200 OK to confirm receipt. If delivery fails, Telesign retries; if the second
  attempt fails it makes a third and final attempt.

Notification payload:

| Property | Type | Description |
| --- | --- | --- |
| `submit_timestamp` | string | Date and time the end user's message was sent. |
| `from_phone_number` | string | The originating end user's phone number, including country code. |
| `to_phone_number` | string | The destination phone number. |
| `mo_message` | string | The content of the message. |
| `mo_reference_id` | string | 32-digit hex ID of this message. |
| `session_reference_id` | string | 32-digit hex ID of the anonymous session the message belongs to. |

```json
{
  "submit_timestamp": "2018-02-12T14:57:11.765723",
  "from_phone_number": "15551234567",
  "mo_message": "I am standing at the corner wearing a blue shirt",
  "mo_reference_id": "SA9WUKGP3TGRCQSRMS78QV5M5REKQ98N",
  "session_reference_id": "B5862A14363C016C8832D53625270015",
  "to_phone_number": "15557654321"
}
```

The MCP server does not receive these notifications; they go to the customer's own service. For
masked voice calls, activity is reported through Voice webhook events instead (see `voice`).

## Requirements and limits

- Number Masking must be enabled on the account by Telesign and is available to full-service accounts only.
- You need Telesign virtual numbers to act as masking IDs: SMS-only numbers for SMS sessions,
  dual-capable (SMS + voice) numbers for SMS/voice sessions. Contact Telesign Customer Support to get them.
- Masked voice calls additionally need Telesign Voice with a registered HTTPS webhook endpoint.
- Session length: at most the equivalent of 720 hours; the unit of `validity_period` is account configuration.
- Voice calls have a maximum duration of four hours.
- Billing: every message sent in an anonymous session is billed as **two** text messages - the one the
  originating user sends to Telesign, and the one Telesign sends to the destination user. Creating a
  session with real credentials is a charged transaction.
- The usual messaging compliance rules apply to traffic in a session.
- Requests are `application/json`, UTF-8; authentication is Basic or Digest. Default per-product rate limits apply.

## Related

Guides: `voice`, `messaging-sms`, `authentication`, `error-codes`, `best-practices`.

Telesign pages:

- https://developer.telesign.com/enterprise/docs/number-masking-overview
- https://developer.telesign.com/enterprise/docs/number-masking-get-started
- https://developer.telesign.com/enterprise/docs/number-masking-create-masked-session-for-sms
- https://developer.telesign.com/enterprise/docs/number-masking-create-masked-session-for-sms-or-voice
- https://developer.telesign.com/enterprise/docs/number-masking-callback-service
- https://developer.telesign.com/enterprise/docs/number-masking-try-it-without-code
- https://developer.telesign.com/enterprise/docs/voice-set-up-a-call-with-number-masking
- https://developer.telesign.com/enterprise/reference/createmaskedsmssession
- https://developer.telesign.com/enterprise/reference/createmaskedvoicesmssession
