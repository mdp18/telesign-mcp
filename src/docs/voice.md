# Voice

Telesign Voice is a programmable voice service for building application-to-person, person-to-application
and person-to-person calling into web and mobile applications. You place and control calls with JSON
"actions" (dial, speak text, play audio, collect digits, record, hang up) and Telesign reports what
happens on the call with "events" posted to a webhook you host. Telesign applies phone number cleansing
to improve deliverability and monitors traffic for patterns that indicate International Revenue Share
Fraud (IRSF).

## When to use it

Use Voice when you need control over the call itself:

- Outbound calls for alerts, reminders, notifications and marketing messages.
- Inbound calls to a Telesign virtual number, typically routed into an IVR.
- IVR menus (inbound or outbound) driven by DTMF digits or speech recognition.
- Connecting two people (click-to-call, cold transfer), optionally hiding both real numbers.
- Text-to-speech (TTS) messages or your own audio files, with digit collection.
- Post-call surveys.
- Call recording, with optional transcription.

Pick a different product when:

- You only need to deliver a one-time passcode by phone call: use `voice-verify` (or `verify-api` for
  omnichannel verification with fallback). Those products need no webhook and no call-flow logic.
- You need a private SMS conversation, or a pre-built masked session for two parties: see `number-masking`.
- You need text messages rather than calls: see `messaging-sms`.

## How it works

Voice is event-driven. There is one API endpoint, `POST https://rest-ww.telesign.com/v2/voice`, and one
webhook endpoint on your side.

Key terms:

| Term | Meaning |
| --- | --- |
| Action | A JSON object (`method` + `params`) that tells Voice what to do. Sent either as an API request or as the body of your HTTP response to an event. |
| Event | A JSON notification (`event`, `reference_id`, `data`) that Telesign POSTs to your webhook: an incoming call, the result of a dial, the end of playback, the end of the call. |
| Engage API (Voice) | The API you call to start calls and to send some actions. |
| Webhook endpoint (customer event URL) | An HTTPS service you host where Telesign sends events. Your HTTP response to an event can carry the next action. |
| `reference_id` | Telesign's ID for the call session. Returned by `dial` and included in every event. Also the key for recordings. |
| Call leg | One connection in a call. The caller's leg is the A-leg and controls the call: if it hangs up, the call ends. Other legs can drop while the call continues. |

Typical outbound flow:

1. You send a `dial` action (`voice_send_action`). Telesign answers HTTP 202 with `status: "dial_accepted"`
   and a `reference_id`.
2. Telesign calls the `to` number. When the call is answered or fails, your webhook receives `dial_completed`.
3. Your webhook replies to that event with the next action, for example `speak` or `play` with `collect_digits`.
4. When the message finishes (or the user presses a digit), your webhook receives `speak_completed` or
   `play_completed`, including any digits collected. Reply with another action or `hangup`.
5. When the call ends your webhook receives `call_completed` with timestamps and billable duration.

Typical inbound flow: someone calls your Telesign number, your webhook receives `incoming_call`, and you
reply with `speak`, `play`, `play_multiple`, `dial` (bridge to another number) or `hangup`.

### What an AI assistant can and cannot do alone

- **Can do with the MCP tools:** start an outbound call with a `dial` action, send the recording actions
  (`record_start`, `record_pause`, `record_resume`, `record_stop`, which take the call's `reference_id`),
  list recordings, read transcripts and recording URLs, and delete recordings.
- **Cannot do alone:** receive events. `incoming_call`, `dial_completed`, `play_completed`,
  `speak_completed`, `call_completed` and the other events are delivered only to the customer's webhook,
  and most actions (`speak`, `play`, `play_multiple`, `send_dtmf`, `hangup`, `dial_session`, bridging
  `dial`) are documented as replies to a specific event, returned in the HTTP response of that webhook.
  An assistant therefore cannot run an IVR, react to an answered call, collect digits or handle inbound
  calls by itself. Without a webhook, a `dial` rings the destination but nothing instructs the call
  afterwards.
- **What to do instead:** start the call with `external_id` so the customer's webhook can correlate it,
  optionally point the call at a specific handler with `event_url`, and help the customer write the
  webhook logic using the action and event definitions below.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `voice_send_action` | Sends one action (`method` + `params`) to Voice. Used to start an outbound call and to control recording. | `POST https://rest-ww.telesign.com/v2/voice` |
| `voice_list_recordings_for_call` | Lists the recording files (download URL, status, transcript) for one call. | `GET https://rest-ww.telesign.com/v2/call_recording/{reference_id}` |
| `voice_list_recordings` | Lists recordings in a date range, with token pagination. | `GET https://rest-ww.telesign.com/v2/call_recording` |
| `voice_delete_recordings` | Deletes all recordings and transcripts for one call. | `DELETE https://rest-ww.telesign.com/v2/call_recording/{reference_id}` |

Use `docs_get_tool_reference("voice_send_action")` (or any other tool name) for the generated reference.

## Quick start

Start an outbound call (`voice_send_action`). Returns HTTP 202 with `reference_id` and
`status: "dial_accepted"`; the `dial_completed` event then goes to the webhook.

```json
{
  "method": "dial",
  "params": { "to": "15551234567", "caller_id_number": "15557654321" }
}
```

Add `external_id` (correlation ID), `event_url` (per-call webhook override) or `max_call_duration` to
`params` as needed; see the `dial` action.

Record an active call: send `record_start` with the `reference_id` from `dial` (see Actions), then list
the call's recordings with `voice_list_recordings_for_call`. Returns one object per recording file
(`status`, `url`, optional `transcribe`). `voice_delete_recordings` takes the same argument and returns HTTP 204.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

Find recordings by date with `voice_list_recordings`. Returns `call_recordings` plus a `token` for the next page.

```json
{ "start_date_time": "2026-04-01T00:00:00", "end_date_time": "2026-04-02T23:59:59", "pagesize": "50" }
```

## Actions

Every action is an object with `method` (the action name) and `params` (that action's fields). With
the MCP server these are exactly the two arguments of `voice_send_action`; in a webhook the same object
is the JSON body of your HTTP response to an event. Some Telesign code samples also add
`"jsonrpc": "2.0"` to the object (the API uses JSON-RPC format); the API reference lists only `method`
and `params`.

All actions accept an optional `params.event_url`: an HTTPS URL with a valid domain name (not a bare
IP; query parameters allowed) that receives the events for the rest of the call, overriding the
account's default webhook.

`dial` can be sent as an API request to start a call. `play`, `play_multiple` and `speak` are replies to
`incoming_call`, an answered `dial_completed`, `speak_completed`, `play_completed` or
`play_multiple_completed`. The `record_*` actions address an active call by `reference_id`. An action
sent in the wrong call state is rejected with `unsupported_call_state`; the Events section lists the
replies each event supports.

### dial

Places an outbound call, or bridges another party into an incoming call when sent in reply to
`incoming_call`. Replying to any other event with `dial` returns an unsupported call state error.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `to` | string | yes | The number to call. Must be a valid phone number. |
| `caller_id_number` | string | yes | The caller ID to display. Must be a number purchased from Telesign, or (when bridging) the `from` number of the `incoming_call` event. |
| `max_call_duration` | string | no | Maximum duration in seconds, as a string (`"600"`). Can only lower the default of 14,400 seconds (four hours). |
| `send_dtmf` | string | no | Digits to enter after the call connects, for example an extension or conference code. Allowed: `0`-`9`, `A`-`D`, `*`, `#`, plus `w` for a 0.5 second pause. |
| `external_id` | string | no | Your own ID for the transaction. Echoed in the response and in related events. |
| `is_primary` | boolean | no | `true` if Telesign is your primary provider for this call, `false` if it is a backup after another provider failed. Used to optimize routing. |
| `event_url` | string | no | Per-call webhook override (see above). |

```json
{
  "method": "dial",
  "params": {
    "to": "15551234567",
    "caller_id_number": "15557654321",
    "send_dtmf": "ww6458",
    "external_id": "4142b474-d65d-4265-a5fa-a581b1fe6101",
    "is_primary": true
  }
}
```

### dial_session

Connects a call using a session created earlier with Number Masking (see `number-masking`, tool
`numbermasking_create_sms_voice_session`). If the session is found the call is connected; if not,
Telesign sends a `dial_session_completed` event describing the failure. Do not use it in reply to
`call_leg_completed`: that is unsupported and terminates the call.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `event_url` | string | no | Per-call webhook override. `params` itself is optional for this action. |

```json
{ "method": "dial_session" }
```

### hangup

Ends the call. Also the way to reject an incoming call from a number you do not recognize. It can only
be requested in reply to an event.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `event_url` | string | no | Per-call webhook override. `params` itself is optional for this action. |

```json
{ "method": "hangup" }
```

### play

Plays one audio file to the end user, optionally collecting digits or speech afterwards.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | yes | URL of a 16-bit, 8 kHz, mono `.wav` or `.pcm` file. Other file types and stereo audio are not supported. |
| `collect_digits` | object | no | Collect DTMF digits from the end user. |
| `collect_digits.max` | integer | no | Maximum number of digits to collect. Default `3`. |
| `collect_digits.timeout` | integer | no | Milliseconds to wait for the first digit after the audio ends. Default `30000`. |
| `collect_digits.inter_digit_timeout` | integer | no | Milliseconds to wait for the next digit after the most recent one; resets on every digit. Defaults to `timeout`, or `30000` if that is not set. |
| `collect_digits.terminators` | string | no | A single character that ends input: `0`-`9`, `A`-`D`, `*` or `#`. Default `#`. Not returned when `detect_speech` is used. |
| `detect_speech` | object | no | Speech recognition for user input. Must be enabled for the account by Telesign Customer Support. |
| `detect_speech.language` | string | no | Language code for recognition. Default `en-US`. |
| `detect_speech.max_speech_duration` | integer | no | How long the user may speak, in ms. Minimum `1000`. |
| `detect_speech.timeout` | integer | no | Ms to wait after the audio ends for the user to speak or press digits. Default `5000`, range `1000`-`5000`. |
| `detect_speech.inter_speech_timeout` | integer | no | Ms of silence after the last word before recognition stops. Default `2000`, range `1000`-`5000`. |

```json
{
  "method": "play",
  "params": {
    "url": "https://example.com/audio/menu.wav",
    "collect_digits": { "max": 5, "timeout": 10000, "inter_digit_timeout": 3000, "terminators": "*" }
  }
}
```

A sampling frequency above 8 kHz works but is not recommended because it wastes bandwidth.

### play_multiple

Plays a series of audio files in order. It has no digit collection options.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `urls` | array of string | yes | At least one audio file URL (same format rules as `play`). Files play in array order. |

```json
{
  "method": "play_multiple",
  "params": {
    "urls": [
      "https://example.com/audio/greeting.wav",
      "https://example.com/audio/hours.wav",
      "https://example.com/audio/goodbye.wav"
    ]
  }
}
```

### speak

Converts text to speech and plays it, optionally collecting digits or speech afterwards.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `tts` | object | yes | The text-to-speech message. |
| `tts.message` | string | yes | The text to speak, as plain text or SSML. |
| `tts.language` | string | yes | A language code from the text-to-speech table below, for example `en-US`. |
| `tts.type` | string | no | `text` or `ssml`. |
| `collect_digits` | object | no | Same fields as for `play`: `max`, `timeout`, `inter_digit_timeout`, `terminators`. Timeouts start when the message finishes. |
| `detect_speech` | object | no | Same fields as for `play`: `language`, `max_speech_duration`, `timeout`, `inter_speech_timeout`. |

```json
{
  "method": "speak",
  "params": {
    "tts": {
      "message": "<speak>Press <prosody volume='loud'>1</prosody> for your balance. Press <prosody volume='loud'>2</prosody> for an agent.</speak>",
      "language": "en-US",
      "type": "ssml"
    },
    "collect_digits": { "max": 1, "timeout": 10000, "inter_digit_timeout": 3000, "terminators": "*" }
  }
}
```

### send_dtmf

Enters digits into the call programmatically, with the same effect on call-flow logic as if the end
user had pressed them. Use it only in reply to `dial_completed`. The result arrives as a
`send_dtmf_completed` event.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `dtmf` | string | yes | One string of digits: `0`-`9`, `A`-`D`, `*`, `#`, plus `w` for a 0.5 second pause before the next digit. |

```json
{ "method": "send_dtmf", "params": { "dtmf": "1ww23w4567890ABCD*#" } }
```

### record_start

Begins recording a call.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The `reference_id` of the call session to record. |
| `transcribe` | string | no | `"true"` to also generate a transcript, `"false"` otherwise. A Boolean formatted as a string. Default `"false"`. |
| `language_code` | string | no | Expected spoken language, used to optimize transcription. One of the transcription language codes below. Default `"en-US"`. |

```json
{
  "method": "record_start",
  "params": {
    "reference_id": "0123456789ABCDEF0123456789ABCDEF",
    "transcribe": "true",
    "language_code": "es-ES"
  }
}
```

### record_pause

Pauses a recording that was started.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The `reference_id` of the call session whose recording to pause. |

```json
{ "method": "record_pause", "params": { "reference_id": "0123456789ABCDEF0123456789ABCDEF" } }
```

### record_resume

Resumes a paused recording.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The `reference_id` of the call session whose recording to resume. |

```json
{ "method": "record_resume", "params": { "reference_id": "0123456789ABCDEF0123456789ABCDEF" } }
```

### record_stop

Stops recording. If recording is stopped and started again during a call, the call ends up with
several recording files under the same `reference_id`.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The `reference_id` of the call session whose recording to stop. |

```json
{ "method": "record_stop", "params": { "reference_id": "0123456789ABCDEF0123456789ABCDEF" } }
```

## Events

Events are HTTP POST requests with a JSON body that Telesign sends to your webhook. Every event has
`event` (the type), `reference_id` (the call session) and `data`. Events other than `incoming_call`
also carry `external_id` when the originating action included one. The MCP server does not receive
events; this section is for writing the webhook.

| Event | Sent when | Actions you can reply with |
| --- | --- | --- |
| `incoming_call` | A call arrives at one of your Telesign numbers | `hangup`, `speak`, `play`, `play_multiple`, `dial` |
| `dial_completed` | A dialed call is answered or fails | `speak`, `play`, `play_multiple`, `hangup`, `send_dtmf` |
| `dial_session_completed` | A `dial_session` could not retrieve the session | - |
| `play_completed` | A `play` finished or was interrupted by input | `speak`, `play`, `play_multiple`, `hangup` |
| `play_multiple_completed` | A `play_multiple` finished or was interrupted | `speak`, `play`, `play_multiple`, `hangup` |
| `speak_completed` | A `speak` finished or was interrupted by input | `speak`, `play`, `play_multiple`, `hangup` |
| `send_dtmf_completed` | A `send_dtmf` action was processed | - |
| `call_leg_completed` | A child leg of the call hung up | For example `dial` (transfer) or `play` (survey); not `dial_session` |
| `call_completed` | The call ended; no further call flow is processed | none |

### incoming_call

| Field | Description |
| --- | --- |
| `data.to` | Your virtual number that the end user called. |
| `data.from` | The caller ID of the end user. |

### dial_completed

| Field | Description |
| --- | --- |
| `data.to` | Number the call was made to. |
| `data.from` | Number the call was made from. |
| `data.status` | `answered` or `failed`. Only continue with `play`, `speak` or `play_multiple` when answered. |

### dial_session_completed

| Field | Description |
| --- | --- |
| `data.to`, `data.from` | The `to` and `from` values of the dial-session request. |
| `data.status` | A snake_case reason why the session could not be retrieved, for example `session_not_found`. |

### play_completed

Sent when playback ends, including when the user presses a digit mid-playback (which stops the audio).

| Field | Description |
| --- | --- |
| `data.to`, `data.from` | Numbers the call was made to and from. |
| `data.status` | `playback_successful`, `playback_failed`, `digit_collection_timeout`, `detect_speech_no_match`, `detect_speech_timeout`, `detect_speech_failed`. |
| `data.collected_digits` | Digits entered, including the terminator used (for example `"923#"`). Once a digit is entered, only digits are collected. |
| `data.detected_speech` | Transcribed speech. Only present when `detect_speech` is enabled for the account. Once the user starts speaking, only speech is collected. |

```json
{
  "event": "play_completed",
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "external_id": "order-48213",
  "data": {
    "from": "15557654321", "to": "15551234567",
    "status": "playback_successful", "collected_digits": "923#"
  }
}
```

### play_multiple_completed

| Field | Description |
| --- | --- |
| `data.to`, `data.from` | Numbers the call was made to and from. |
| `data.status` | `playback_successful` or `playback_failed`. |

### speak_completed

| Field | Description |
| --- | --- |
| `data.to`, `data.from` | Numbers the call was made to and from. |
| `data.status` | `speak_successful`, `speak_failed`, `digit_collection_timeout`, `detect_speech_no_match`, `detect_speech_timeout`, `detect_speech_failed`. |
| `data.collected_digits` | Digits entered, including the terminator used. |
| `data.detected_speech` | Transcribed speech, when `detect_speech` is enabled for the account. |

### send_dtmf_completed

| Field | Description |
| --- | --- |
| `data.to`, `data.from` | Numbers the call was made to and from. |
| `data.status` | `send_dtmf_success`, `send_dtmf_failed`, or `invalid_dtmf` (a digit in the request is not supported). |

### call_leg_completed

Sent when a leg other than the A-leg hangs up. The call can continue with a transfer or another menu.

| Field | Description |
| --- | --- |
| `data.to`, `data.from` | The numbers of the leg. |
| `data.caller_id` | The intermediate virtual number. |
| `data.hangup_cause` | `call_answered`, `call_cancelled`, `call_not_answered`, `line_busy`, `call_blocked_by_customer_request`, `call_blocked_by_telesign`. |

### call_completed

| Field | Description |
| --- | --- |
| `data.to`, `data.from` | Numbers the call was made to and from. |
| `data.direction` | `inbound` or `outbound`. |
| `data.status` | Documented values: `completed`, `busy`, `no_answer`, `call_failed`. |
| `data.created_on_utc`, `data.answered_on_utc`, `data.ended_on_utc` | ISO 8601 timestamps for creation, answer and end of the call. |
| `data.duration` | Billable air time in seconds. |
| `data.session_info` | Empty object unless a Number Masking session was used. Then it holds `reference_id` (the session ID) and `session_legs[]`, each with `phone_number` (real number) and `virtual_number` (the masking ID shown to the other party). |

Telesign's own example payloads sometimes show status strings that differ from the documented tables
(for example `"status": "hangup"` on `call_completed`, `"play_successful"` on play events, and a
`status` field instead of `hangup_cause` on `call_leg_completed`). Write webhook logic that tolerates
unknown values.

## Call recordings

Recording is controlled with the four `record_*` actions; the files are managed through the
`/v2/call_recording` resource.

1. Record the call with `record_start` (and `record_pause` / `record_resume` / `record_stop` as needed).
2. If you do not have the call's `reference_id`, call `voice_list_recordings` with `start_date_time`
   and `end_date_time` (format `YYYY-MM-DDThh:mm:ss`, both inclusive) and note each `reference_id`.
3. Call `voice_list_recordings_for_call` with a `reference_id`. The response is an array with one
   object per recording file.
4. For each object whose `status` is `available`, download the audio from `url`.
5. If the object has a `transcribe` property, check that `transcribe.transcription[0].status` is
   `completed` and read the text from `transcribe.transcription[0].result`. The transcript can become
   available several seconds after the audio file.
6. Call `voice_delete_recordings` for calls whose recordings you do not want to keep, for example
   when sensitive information was recorded by accident.

**Pagination by date range.** `voice_list_recordings` accepts either the date pair or a `token`, never
both. The first request uses `start_date_time` + `end_date_time` (and optionally `pagesize`, 0-100
records per page). Each response carries a `token`; pass only that token in the next call to get the
next page. A `token` of `null` means the last page was reached.

```json
{ "token": "Z0FBQUFBQmRTM01KYUtpQUlRc0FNcEpuMjczYmlZcC1CMlZVe" }
```

**Recording fields.**

| Field | Description |
| --- | --- |
| `reference_id` | The call the recording belongs to. |
| `file_name` | Name of the recording file (`<reference_id>_<number>.wav`). Absent while recording is in progress. |
| `status` | `recording` (still in progress), `available` (ready to download) or `deleted`. |
| `date` | UTC creation time, `YYYY-MM-DDThh:mm:ss`. |
| `url` | Signed download URL. Returned by `voice_list_recordings_for_call` only. |
| `transcribe.language_code` | Language used for transcription. |
| `transcribe.transcription[].status` / `.result` | Transcript status (`completed` when ready) and text. |

The download itself is a plain HTTP GET of `url`, outside the MCP tools. The URL carries an expiry and
signature in its query string, so fetch it soon after listing.

**Deleting.** `voice_delete_recordings` removes all recordings and transcripts of the call and returns
HTTP 204. If one or more files cannot be deleted the response is HTTP 503 with `reference_id`,
`failed_delete` (file names not deleted) and, on partial success, `succeed_delete` (file names deleted).

Check the privacy, data retention and call recording laws that apply to you and to your end users'
countries before recording or retrieving calls.

### Transcription languages

Only recordings in these languages can be transcribed. Pass the code as `language_code` in `record_start`.

- Afrikaans `af-ZA`; Arabic (Gulf) `ar-AE`; Arabic (Modern Standard) `ar-SA`
- Chinese (Mandarin, Simplified) `zh-CN`; Chinese (Mandarin, Traditional, Taiwan) `zh-TW`
- Danish `da-DK`; Dutch `nl-NL`; Farsi `fa-IR`; Hebrew `he-IL`; Hindi (India) `hi-IN`
- English: Australia `en-AU`, Great Britain `en-GB`, India `en-IN`, Ireland `en-IE`, New Zealand
  `en-NZ`, Scotland `en-AB`, South Africa `en-ZA`, US `en-US`, Wales `en-WL`
- French `fr-FR`; French (Canada) `fr-CA`; German `de-DE`; German (Swiss) `de-CH`
- Indonesian `id-ID`; Italian `it-IT`; Japanese `ja-JP`; Korean `ko-KR`; Malay `ms-MY`
- Portuguese (European) `pt-PT`; Portuguese (Brazilian) `pt-BR`; Russian `ru-RU`
- Spanish `es-ES`; Spanish (US) `es-US`; Tamil `ta-IN`; Telugu `te-IN`; Thai `th-TH`; Turkish `tr-TR`

## Text-to-speech languages and SSML

Pass one of these codes as `tts.language` in a `speak` action. Every language uses a female voice
except English (Welsh), `en-GB-WLS`, which uses a male voice. This table is specific to Voice; Voice
Verify has its own language lists.

- Arabic `arb`; Arabic (Gulf) `ar-AE`; Catalan `ca-ES`
- Chinese (Cantonese) `yue-CN`; Chinese (Mandarin) `cmn-CN`
- Danish `da-DK`; Dutch `nl-NL`; Dutch (Belgian) `nl-BE`; Finnish `fi-FI`
- English: Australian `en-AU`, British `en-GB`, Indian `en-IN`, Ireland `en-IE`, New Zealand `en-NZ`,
  South African `en-ZA`, US `en-US`, Welsh `en-GB-WLS`
- French `fr-FR`; French (Belgian) `fr-BE`; French (Canadian) `fr-CA`
- German `de-DE`; German (Austrian) `de-AT`; Hindi `hi-IN`; Icelandic `is-IS`; Italian `it-IT`
- Japanese `ja-JP`; Korean `ko-KR`; Norwegian `nb-NO`; Polish `pl-PL`
- Portuguese (Brazilian) `pt-BR`; Portuguese (European) `pt-PT`; Romanian `ro-RO`; Russian `ru-RU`
- Spanish (European) `es-ES`; Spanish (Mexican) `es-MX`; Spanish (US) `es-US`
- Swedish `sv-SE`; Turkish `tr-TR`; Welsh `cy-GB`

**SSML.** Set `tts.type` to `ssml` and wrap the whole message in `<speak>...</speak>` to control how
the text is spoken. Supported tags:

| Tag | Attributes | Effect |
| --- | --- | --- |
| `<speak>` | - | Encloses the entire message. |
| `<break>` | `strength`: `none`, `x-weak` (no pause), `weak`, `medium` (comma-length pause), `strong` (sentence-length), `x-strong` (paragraph-length). `time`: `{n}s` up to `10s`, or `{n}ms` up to `10000ms`. | Adds a pause. With no attributes it acts as `strong` next to a comma, `x-strong` next to a period and `medium` elsewhere. |
| `<prosody>` | `volume`: `default`, `silent`, `x-soft`, `soft`, `medium`, `loud`, `x-loud`, or `+{n}dB` / `-{n}dB`. `rate`: `x-slow`, `slow`, `medium`, `fast`, `x-fast`, or `{n}%` from `20%` to `200%`. `pitch`: `default`, `x-low`, `low`, `medium`, `high`, `x-high`, or `+{n}%` / `-{n}%`. | Controls volume, speaking rate and pitch. At least one attribute is required. Can be nested. |

```xml
<speak><prosody volume="loud" rate="slow">Your appointment is tomorrow.</prosody><break time="1s"/> Press 1 to confirm.</speak>
```

Reserved characters must be escaped in message content: `"` as `&quot;`, `&` as `&amp;`, `'` as
`&apos;`, `<` as `&lt;`, `>` as `&gt;`. Double quotes need escaping only inside an attribute value
delimited by double quotes. A single quote must be escaped when used as an apostrophe, but not inside
an attribute value delimited by double quotes. Because the message travels inside JSON, single-quoted
attribute values (`volume='loud'`) avoid extra JSON escaping.

## Recipes for common call flows

Steps marked (API) can be sent with `voice_send_action`; steps marked (webhook) are replies your event
handler returns, so an assistant cannot perform them itself.

| Recipe | Sequence |
| --- | --- |
| Outbound call with a message | (API) `dial` with `to` and `caller_id_number`, optionally `send_dtmf` to reach an extension. (webhook) On `dial_completed` with `status: "answered"`, reply `speak` or `play`. (webhook) On `speak_completed` / `play_completed`, reply `hangup` or another message. `call_completed` closes the flow; if the user hangs up mid-message it arrives directly. |
| Inbound call | `incoming_call` arrives with the caller (`from`) and your number (`to`). (webhook) Reply `speak`, `play` or `play_multiple` to answer with a message, `dial` to bridge the caller to someone, or `hangup` to reject. |
| IVR (phone tree) | Start from `incoming_call` (inbound IVR) or an answered `dial_completed` (outbound IVR). (webhook) Reply `play` or `speak` with `collect_digits` (and `detect_speech` if enabled) to read the menu. (webhook) On `play_completed` / `speak_completed`, branch on `collected_digits` or `detected_speech`: next menu, `dial` an agent, or `hangup`. Repeat the prompt on `digit_collection_timeout` and the `detect_speech_*` statuses. |
| Play audio and collect digits | (API) `dial`. (webhook) On answered `dial_completed`, reply `play` with `url` and `collect_digits`. (webhook) On `play_completed`, read `collected_digits`, then `hangup` or continue. Use `play_multiple` when the prompt is assembled from several files (no digit collection). |
| TTS message and collect digits | Same as above, replying with `speak` (`tts.message`, `tts.language`, optional `tts.type: "ssml"`) and reading the result from `speak_completed`. |
| Click-to-call | A user taps a button in your app to talk to someone (rider to driver). (API) Your server sends `dial` to the user who tapped. (webhook) On `dial_completed` with `status: "answered"`, send a second `dial` to the other party; when they answer, Telesign bridges the two. When either side hangs up you receive a `call_completed` event for each leg. |
| Cold transfer | The first agent drops off and the caller is connected to a second agent with no overlap. `incoming_call` from caller A. (webhook) Reply `dial` to agent B with a Telesign `caller_id_number`; A and B are bridged. Agent B hangs up and you receive `call_leg_completed`. (webhook) Reply `dial` to agent C; A is bridged to C. `call_completed` arrives when A hangs up; if A stays on the line you can `hangup` or offer other options. |
| Survey after a call | Requires the cold transfer flow. The agent asks the caller to stay on the line and hangs up; you receive `call_leg_completed`. (webhook) Reply `play` or `speak` with `collect_digits` for the first question. (webhook) On each `play_completed` / `speak_completed`, store `collected_digits` and ask the next question; finish with `hangup`. |
| Number masking with voice | A user calls a Telesign virtual number; `incoming_call` gives the real caller (`from`) and the virtual number dialed (`to`). Your logic decides whether to connect and to whom. (webhook) To connect, reply `dial` with `to` set to the real destination and `caller_id_number` set to the Telesign number used as the masking ID; to refuse, reply `hangup`. `call_completed` reports both the inbound and outbound parts when connected, only the inbound part when refused. |

Number masking can also be prepared in advance: create the pairing with
`numbermasking_create_sms_voice_session` and connect the call with the `dial_session` action;
`call_completed` then includes `session_info`. See `number-masking`.

## Key parameters

- `to` / `caller_id_number` (dial): digits with country code. The caller ID must be a voice-capable
  Telesign number, except when bridging an incoming call, where the caller's `from` number may be used.
- `external_id`: set it on every `dial`; it links the API response, every event and your own records.
- `event_url`: routes one call to a specific handler without changing the account default.
- `max_call_duration`: a string of seconds; lowers the four hour ceiling.
- `collect_digits`: the default `timeout` is 30 seconds; shorten it for menus and set `max` / `terminators`.
- `tts.language` and `language_code` use different lists (text-to-speech vs transcription).
- `transcribe` is a string (`"true"`), not a JSON boolean.

## Responses and status codes

`voice_send_action` returns `reference_id`, a `status` string and, when supplied, `external_id`.

| HTTP | `status` string | Meaning and action |
| --- | --- | --- |
| 202 | `dial_accepted` | The action was accepted. Keep `reference_id`; the outcome arrives as events. |
| 200 | `premium_to_number_rejected` | `to` is a premium-rate number, which is unsupported. Use another number. |
| 200 | `to_number_blocked_by_country` | The destination country is blocked, by you in the customer portal or by Telesign. |
| 200 | `to_number_blocked_by_customer` | `to` is on your blocked list in the customer portal. |
| 200 | `to_number_blocked_by_telesign` | `to` is blocked by Telesign for all requests. |
| 400 | `caller_id_number_not_owned` | `caller_id_number` is not one of your Telesign numbers. |
| 400 | `caller_id_number_not_provided` | `caller_id_number` is missing. |
| 400 | `invalid_phone_number` | `to` is not a valid number. |
| 400 | `to_number_not_provided` | `to` is missing. |
| 400 | `unsupported_call_state` | The action is not allowed in the current call state or for this event. |
| 401 | `credentials_not_provided` | Customer ID and/or API key missing from the request. |
| 401 | `not_authorized` | The credentials could not be authenticated. |
| 429 | `rate_limit_exceeded` | The account exceeded its inbound or outbound rate limit. Retry later. |

Note that HTTP 200 on this endpoint means the request was processed but the action was **not** taken;
success is HTTP 202.

Recordings endpoints:

| HTTP | Meaning |
| --- | --- |
| 200 | List returned (`voice_list_recordings`, `voice_list_recordings_for_call`). |
| 204 | Recordings and transcripts deleted (`voice_delete_recordings`). |
| 400 | Invalid or missing parameters: a bad `reference_id`, timestamps in the wrong format, or `token` combined with the date parameters. |
| 401 | Customer ID and/or API key missing or invalid. |
| 404 | No records match the request. |
| 503 | Deletion failed for one or more files; see `failed_delete` / `succeed_delete`. |

## Callbacks

Voice does not use delivery-report callbacks; its webhook events are described in the Events section
above. Webhook requirements:

- A valid DNS name (not an IP address), HTTPS only, with a certificate signed by a valid certificate authority.
- Authenticating Telesign's requests is optional; Telesign recommends Digest authentication to keep
  third parties from calling your endpoint (see `authentication`).
- Send the endpoint URL to Telesign Customer Support (support@telesign.com). If you use several
  endpoints, tell them which is the default. Events start flowing about one business day later.
  Double-check the URL: with a wrong URL no events can be delivered.
- Any action can override the default for the rest of that call with `params.event_url`.

## Requirements and limits

- Voice must be added to the account by Telesign and is available to full-service accounts only.
- You need at least one voice-capable Telesign phone number (leased through Customer Support) and a
  webhook endpoint registered with Telesign. Click-to-call and number masking need a pool of virtual numbers.
- Maximum call duration is four hours (14,400 seconds); `max_call_duration` can only shorten it.
- Audio files for `play` / `play_multiple`: 16-bit, 8 kHz, mono, `.wav` or `.pcm`.
- Call codecs: PCMU and PCMA (G.711).
- DTMF: RFC-2833, used for both digit collection and `send_dtmf`; Telesign does not transcode DTMF.
  Digits are `0`-`9`, `A`-`D`, `*` and `#`.
- Phone numbers: E.164.
- `detect_speech` must be enabled per account by Customer Support.
- Authentication is Basic or Digest for `/v2/voice` and Basic for the recordings endpoints; requests
  and responses are UTF-8 JSON.
- Rate limits follow Telesign's default limits per product; exceeding them returns `rate_limit_exceeded`.

## Related

Guides: `number-masking`, `voice-verify`, `verify-api`, `messaging-sms`, `authentication`, `error-codes`, `best-practices`.

Telesign pages (the how-to page for each recipe is linked from the overview):

- https://developer.telesign.com/enterprise/docs/voice-overview
- https://developer.telesign.com/enterprise/docs/voice-get-started
- https://developer.telesign.com/enterprise/docs/voice-actions
- https://developer.telesign.com/enterprise/docs/voice-events
- https://developer.telesign.com/enterprise/docs/voice-receive-events-with-webhooks
- https://developer.telesign.com/enterprise/docs/voice-use-ssml-for-tts
- https://developer.telesign.com/enterprise/docs/voice-get-started-with-recordings
- https://developer.telesign.com/enterprise/docs/voice-supported-standards-and-codecs
- https://developer.telesign.com/enterprise/docs/voice-supported-languages-for-text-to-speech
- https://developer.telesign.com/enterprise/docs/voice-supported-languages-for-call-recording-transcription
- https://developer.telesign.com/enterprise/reference/sendvoiceaction
- https://developer.telesign.com/enterprise/reference/getrecordingslistbydaterange
