# Telesign Messaging (Omnichannel Messaging)

Telesign Messaging is the omnichannel part of the Engage API: one request to `/v1/omnichannel` can deliver a message over RCS, WhatsApp, Viber, MMS, SMS or email. You list the channels in the order you want them tried, describe the message for each channel with a template, and Telesign cascades to the next channel when delivery on the current one fails or is not confirmed in time. It exists so that you can use rich features (images, video, files, buttons, suggested replies, branded senders) where the recipient's device supports them and still reach everyone else through a plain fallback, without building a separate integration per channel.

## When to use it

Use Messaging when you need any of the following:

- Rich content: images, GIFs, video, audio, file attachments, location, link buttons, click-to-call buttons, suggested replies, rich cards.
- A channel other than SMS (RCS, WhatsApp, Viber, MMS, email), or a cascade such as WhatsApp first, SMS second.
- Transactional email (password reset notices, onboarding, appointment reminders, shipping confirmations) through the same API as your phone channels.
- Reusable templates with variables, including WhatsApp templates that must be approved before you can start a conversation.
- One-time passcodes on rich channels, either with your own code or with a code Telesign generates and checks for you.
- Two-way conversations: replies from end users arrive on a callback URL.

Pick something else when:

- You only send plain SMS. Telesign itself says the SMS product is "more convenient and streamlined" for that case. See the `messaging-sms` guide.
- You want a purpose-built OTP product with its own verification flow. See `verify-api`.

### SMS endpoint vs omnichannel Messaging: which tool to pick

| Situation | Tool |
| --- | --- |
| Plain text SMS to one number, no fallback, no template | `messaging_send_sms` (`POST /v1/messaging`) |
| Same SMS text to many numbers | `messaging_send_bulk_sms` |
| Any RCS, WhatsApp, Viber, MMS or email message | `messaging_send_message` (`POST /v1/omnichannel`) |
| Rich channel first, SMS as fallback | `messaging_send_message` with `sms` as a later entry in `channels` |
| SMS built from a stored template with variables | `messaging_send_message` with `message.sms.template` |

The two APIs do not share status codes or status tools. A `reference_id` from `messaging_send_message` must be checked with `messaging_get_message_status` (codes in the 3000 range); one from `messaging_send_sms` must be checked with `messaging_get_sms_status` (codes in the 200 and 500 ranges). Telesign recommends using the SMS channel inside Messaging only as a fallback, not as the primary channel, because advanced features do not render reliably there.

## How it works

1. **Enable the product and the channels.** Messaging is available for full-service accounts only and must be added to the account by Telesign. RCS, WhatsApp, Viber and email each need a one-time setup with Telesign Customer Support (see "Channel setup prerequisites").
2. **Set up a callback endpoint.** Delivery status and read notifications are pushed to your Transaction Callback Service; inbound messages go to an MO callback URL.
3. **Choose a primary channel and a template** for it (see "Templates and parameters by channel").
4. **Optionally add fallback channels.** `channels` is an ordered array. For each entry you may set `fallback_time`, the number of seconds to wait before Telesign gives up on that channel and tries the next one.
5. **Send** with `messaging_send_message`. The response carries `reference_id` and status `3001` ("Message in progress").
6. **Track delivery** through callbacks, or poll `messaging_get_message_status` with the `reference_id`. Each attempted channel reports its own status and its own per-channel reference ID.

Key terms:

- **Channel** - one of `rcs`, `whatsapp`, `sms`, `mms`, `viber`, `email`.
- **Template** - a named message layout. Telesign provides predefined templates per channel (`text`, `image`, `url_action`, ...); you can add custom ones.
- **Parameters** - values for the template's variables, sent under `message.<channel>.parameters`.
- **`message.default`** - a template and parameters applied to every channel in `channels` that has no entry of its own under `message`. Handy when the same text goes to all channels.
- **MO message** - mobile originated, i.e. a message sent by the end user to you.
- **RBM agent** - the RCS Business Messaging identity that sends your RCS messages.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `messaging_send_message` | Send a message on one channel or a cascade of channels | `POST https://rest-ww.telesign.com/v1/omnichannel` |
| `messaging_get_message_status` | Get delivery status per channel; with `verify_code`, also check a Telesign-generated OTP | `GET https://rest-ww.telesign.com/v1/omnichannel/{reference_id}` |
| `messaging_check_channel_capability` | Check whether a phone number can use a channel (only `rcs` is supported) | `GET https://rest-ww.telesign.com/capability/{channel}/{phone_number}` |
| `messaging_check_rcs_capability` | Check whether a phone number can receive messages from a specific RBM agent | `GET https://rest-ww.telesign.com/capability/rcs/{phone_number}/{agent_id}` |
| `templates_create` | Create a WhatsApp or SMS template | `POST https://rest-ww.telesign.com/v1/omnichannel/templates` |
| `templates_list` | List all templates for the account | `GET https://rest-ww.telesign.com/v1/omnichannel/templates` |
| `templates_get` | Get one template by channel and name | `GET https://rest-ww.telesign.com/v1/omnichannel/templates/{channel}/{name}` |
| `templates_delete` | Delete a template | `DELETE https://rest-ww.telesign.com/v1/omnichannel/templates/{channel}/{name}` |

Use `docs_get_tool_reference("messaging_send_message")` (or any tool name above) for the complete parameter list.

## Quick start

Text to WhatsApp with SMS fallback, same text on both channels. Returns `reference_id` and status `3001`.

```json
{
  "channels": [{"channel": "whatsapp", "fallback_time": 600}, {"channel": "sms"}],
  "phone_number": "15551234567",
  "message": { "default": {"template": "text", "parameters": {"text": "Your order 45390 has shipped."}} },
  "message_type": "ARN"
}
```

Check delivery with `messaging_get_message_status`. Returns the overall `status`, `status.last_channel` and a `channel_status` entry per attempted channel.

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF" }
```

Before sending RCS, check that the handset supports it with `messaging_check_channel_capability`. Returns `3060` (supported), `3055` (not supported) or `3115` (not in coverage).

```json
{ "channel": "rcs", "phone_number": "15551234567" }
```

More send examples, one per channel, are in "Worked examples by channel". Template management examples are in "Managing templates".

## Key parameters

| Parameter | Notes |
| --- | --- |
| `channels` | Required. Ordered array of `{ "channel": ..., "fallback_time": ... }`. The same channel may not appear twice (error `3113`). |
| `channels[].fallback_time` | Seconds to wait before cascading. Default `300`, range 30 to 3600. Pointless on the last channel. |
| `phone_number` or `recipient.phone_number` | Recipient number, digits only with country code. Required for every channel except email. Send one or the other. |
| `recipient.email` | Required when `email` is one of the channels. A request may carry both `recipient.phone_number` and `recipient.email` for an email-then-SMS cascade. |
| `message` | Required. One object per channel (`rcs`, `whatsapp`, `viber`, `mms`, `sms`, `email`) and/or `default`, each with `template` and `parameters`. |
| `message_type` | Required. `OTP` (one-time passwords), `ARN` (alerts, reminders, notifications) or `MKT` (marketing). |
| `callback_url` | Overrides the account's callback URL for this transaction. Must be enabled for the account (error `3203` otherwise). |
| `external_id` | Your own transaction ID, up to 100 ASCII characters; echoed in the response, status and callbacks. |
| `sender_id` | Sender to display. Must be on Telesign's allow list for your account; Telesign may still override it for deliverability or local regulation. |
| `account_lifecycle_event` | `create`, `sign-in`, `transact`, `update` or `delete`. |
| `originating_ip` | The end user's IP address, in IETF format. |

## Templates and parameters by channel

Parameters go under `message.<channel>.parameters`. This table follows the API reference for `POST /v1/omnichannel`.

| Channel | Template | Required parameters |
| --- | --- | --- |
| RCS | `text` | `text` |
| RCS | `media` (image, video or audio) | `url` |
| RCS | `file` | `url` |
| RCS | `location` | `latitude`, `longitude` |
| RCS | `url_action` (link button) | `text`, `url_text`, `url_payload`, `url` |
| RCS | `dial_action` (click-to-call button) | `text`, `dial_text`, `phone_number_to_dial`, `dial_payload` |
| RCS | `rc_url_action_vertical`, `rc_url_action_horizontal` (rich card with link button) | `url_text`, `url_payload`, `url`, `media_url` |
| RCS | `rc_dial_action_vertical`, `rc_dial_action_horizontal` (rich card with call button) | `dial_text`, `phone_number_to_dial`, `dial_payload`, `media_url` |
| RCS | `2_suggested_replies` | `text`, `button_text_1`, `button_payload_1`, `button_text_2`, `button_payload_2` |
| RCS | `3_suggested_replies` | as above plus `button_text_3`, `button_payload_3` |
| WhatsApp | `text` | `text` |
| WhatsApp | `image`, `video`, `audio` | `header_url` |
| WhatsApp | `file` | `header_url`; optional `file_name` (display name, defaults to "file") |
| WhatsApp | `location` | `latitude`, `longitude` |
| WhatsApp | your own template | the template's `mandatory_parameters` (see `templates_get`) |
| Viber | `text`, `text_session` | `text`; optional `reply_id` |
| Viber | `image`, `image_session` | `url` |
| Viber | `url_action` (link button) | `text`, `url`, `url_id`, `url_text` |
| Viber | `video` | `url`; `reply_id` |
| Viber | `text_video` | `text`, `url`, `url_thumbnail`; `reply_id` |
| Viber | `url_action_video` | `text`, `url`, `url_thumbnail`, `open_url`; `button_text`, `reply_id` |
| Viber | `otp_verify` | `otp_code`; optional `language` |
| MMS | `image`, `video`, `audio` | `url` |
| SMS | `text` | `text` |
| SMS | your own template | the variables you defined |
| Email | your custom template | the variables defined in that template |

Notes:

- `url_payload`, `dial_payload` and `button_payload_N` are identifiers you choose. They let you recognise which link, number or reply was used, and let you change the dialled number later without breaking data keyed to the ID.
- `phone_number_to_dial` takes a complete number; include `+` at the start of international numbers.
- `latitude` and `longitude` are strings holding positive or negative numbers, for example `"37.423021"` and `"-122.083739"`.
- Media and files are hosted by you and referenced by a publicly reachable URL.
- Viber templates depend on the Viber account type: one-way chat supports `text`, `image`, `url_action`; session chat supports `text_session`, `image_session`. The Messaging overview also lists `text_2way` and `image_2way` for two-way chat accounts (same parameters as `text` and `image`), but those names are not in the API reference's list of allowed Viber template values.
- `reply_id` (Viber) is returned with the end user's replies so that you can match them to the request. The how-to pages for the three Viber video templates mark it as required.
- `otp_verify` is Viber's pre-approved verification message. Its fixed content is "Your code is {{otp_code}}. Please don't share your code with ANYONE. We'll never call or message you and ask for it." It is localized to 33 languages selected with a two-letter ISO 639-1 `language` code.
- The docs are not fully consistent on two parameter names. For Viber `url_action` the reference uses `url_id` while the how-to page and the Templates page use `url_payload`. For WhatsApp `file` the reference uses `header_url` while the how-to page uses `url`. If a send is rejected with `3305` ("Missing template specific parameters"), try the other name.
- If SMS is a fallback, use the `text` template for it.

## Worked examples by channel

All of these are arguments for `messaging_send_message`. Each returns `reference_id` and status `3001`; final status arrives by callback or through `messaging_get_message_status`.

RCS link button, with a plain SMS fallback after 10 minutes:

```json
{
  "channels": [{"channel": "rcs", "fallback_time": 600}, {"channel": "sms"}],
  "phone_number": "15551234567",
  "message": {
    "rcs": {
      "template": "url_action",
      "parameters": {
        "text": "Thanks for your purchase! Track your order status here:",
        "url_text": "Track Order",
        "url_payload": "urlid1",
        "url": "https://example.com/orders?id=45390"
      }
    },
    "sms": {
      "template": "text",
      "parameters": { "text": "Thanks for your purchase! Track your order: https://example.com/orders?id=45390" }
    }
  },
  "message_type": "MKT"
}
```

WhatsApp image, with SMS fallback:

```json
{
  "channels": [{"channel": "whatsapp", "fallback_time": 600}, {"channel": "sms"}],
  "phone_number": "15551234567",
  "message": {
    "whatsapp": { "template": "image", "parameters": {"header_url": "https://example.com/media/bogo_coupon.jpg"} },
    "sms": {
      "template": "text",
      "parameters": { "text": "Buy one get one free! Use code BOGO at checkout on example.com." }
    }
  },
  "message_type": "MKT"
}
```

Viber text with a reply tracking ID, with SMS fallback:

```json
{
  "channels": [{"channel": "viber", "fallback_time": 600}, {"channel": "sms"}],
  "phone_number": "15551234567",
  "message": {
    "viber": {
      "template": "text",
      "parameters": { "text": "Your appointment is tomorrow at 10:00.", "reply_id": "100035" }
    },
    "sms": { "template": "text", "parameters": {"text": "Your appointment is tomorrow at 10:00."} }
  },
  "message_type": "ARN"
}
```

Viber verification message with your own code, in Italian:

```json
{
  "channels": [{"channel": "viber"}],
  "phone_number": "15551234567",
  "message": { "viber": {"template": "otp_verify", "parameters": {"otp_code": "12345", "language": "it"}} },
  "message_type": "OTP"
}
```

MMS image, with SMS fallback:

```json
{
  "channels": [{"channel": "mms", "fallback_time": 600}, {"channel": "sms"}],
  "phone_number": "15551234567",
  "message": {
    "mms": { "template": "image", "parameters": {"url": "https://example.com/media/bogo_coupon.jpg"} },
    "sms": {
      "template": "text",
      "parameters": { "text": "Buy one get one free! Use code BOGO at checkout on example.com." }
    }
  },
  "message_type": "MKT"
}
```

Email with a custom template, with SMS fallback. The email parameters are whatever variables your template defines.

```json
{
  "channels": [{"channel": "email", "fallback_time": 600}, {"channel": "sms"}],
  "recipient": { "phone_number": "15551234567", "email": "jsmith@example.com" },
  "message": {
    "email": {
      "template": "your-custom-template-name",
      "parameters": { "your-custom-template-param-1": "Your first custom template param value." }
    },
    "sms": {
      "template": "text",
      "parameters": { "text": "You requested a password reset. Go to example.com to change your password." }
    }
  },
  "message_type": "ARN"
}
```

SMS from a stored SMS template with a variable (see "Managing templates" for creating `sms_bogo`):

```json
{
  "channels": [{"channel": "sms"}],
  "phone_number": "15551234567",
  "message": { "sms": {"template": "sms_bogo", "parameters": {"code_name": "BOGO"}} },
  "message_type": "MKT"
}
```

## Channel setup prerequisites

Every channel must be enabled for your account by Telesign Customer Support. The ones below also need details from you.

| Channel | What you provide | Things to know |
| --- | --- | --- |
| RCS | A technical contact; Android test device numbers; contact display items (banner image 1440 x 448 px, logo 224 x 224 px, display name, description up to 100 characters, phone, website and email with labels); a brand colour with at least 4.5:1 contrast against white; terms of service and privacy policy URLs; an approval contact; an Agent ID for each RBM agent | Until the agent goes live it can only message the registered test devices. Agent ID: at most 20 characters, lowercase, snake case, no hyphens. |
| WhatsApp | A technical contact; a test device with WhatsApp; profile picture (640 x 640 px, up to 5 MB), account name (up to 256 characters, no emojis), address, business description (up to 256 characters), website; Facebook Business ID; a phone number not previously used on WhatsApp that can receive an OTP; contact email; about/status text (up to 139 characters) | The account name cannot be changed later. Pricing is per 24-hour conversation, not per message, and varies by destination and conversation type. |
| Viber | Logos as PNG files of 150 KB or less in five sizes (50 x 50, 65 x 65, 100 x 100, 130 x 130, 360 x 280 px); an "about" text of 10 to 400 characters; address; phone number; website (not a Facebook or Instagram page); company name up to 25 characters; whether you accept inbound replies | If you do not accept replies, users who reply get an automatic notice that your company does not receive messages. |
| Email | A technical contact; account (brand) name; sender domain; from name and from address; an unsubscribe link and its link text; optionally a logo URL and a website link | An unsubscribe link is required for all email campaigns. Email templates are created by Customer Support. Only email to people who already gave permission is allowed; cold outreach and unsolicited email are prohibited, and content may be reviewed by Telesign. |
| MMS | Nothing extra | MMS can only be sent from US sender IDs, and only with short codes. |

If the recipient does not have WhatsApp or Viber installed, the send on that channel fails, so include a fallback channel for those users.

## Managing templates

There are three kinds of template:

- **Predefined templates** (`text`, `image`, `url_action`, ...) are ready to use; see the table above.
- **Templates you create through the API** with `templates_create`. The API supports the `whatsapp` and `sms` channels only.
- **Custom templates set up by Telesign** for other channels and for email. You send Customer Support the template name, the variables (snake case names with descriptions) and optionally a mock-up; they add it to your account and tell you when it is ready.

A template is identified by its `channel` plus `name`. Names use lowercase letters and underscores, up to 512 characters.

### Template types and WhatsApp approval

| `type` | Meaning |
| --- | --- |
| `verified` | Must be approved by Telesign and by WhatsApp before use. Required for WhatsApp templates that start a new conversation. Telesign submits the template to WhatsApp for you. |
| `standard` | Used inside an active conversation (no more than 24 hours since the last user-initiated message). No provider approval, but you must still wait for Telesign's "template created" notification. Also the type used for SMS templates. |

`templates_create` answers immediately with a "Request successful" status that only means the request was accepted. The outcome arrives later on your callback endpoint (see "Callbacks for delivery, read receipts and templates"), and `templates_get` shows the current approval `status` (for example `Approved`) and the `mandatory_parameters` you must supply when sending with the template.

WhatsApp templates also need:

- `category`: `marketing`, `utility` or `authentication` (the API also accepts `1way`). Marketing, utility and authentication conversations are business-initiated and require end-user opt-in. Utility templates relate to a specific agreed transaction (order updates, account alerts); anything that mixes utility and marketing content counts as marketing. Authentication templates carry a one-time passcode, must use an OTP button, and may not contain URLs, media or emojis.
- `language`: a code from "Supported languages for WhatsApp templates". It is required for WhatsApp and not supported for other channels.

### Template content components

`content` is an array holding at most one of each object below. `body` is always required. SMS templates can only have a `body`.

| Component | Contents | Variables |
| --- | --- | --- |
| `header` | `type` of `text` (up to 60 characters), `image`, `video`, `file` or `location`. Verified templates with a media or file header must include `sample_url`. | Up to one |
| `body` | `type` `text`, `text` up to 1024 characters | Any number |
| `footer` | `type` `text`, `text` up to 60 characters | Not supported |
| `suggested_action` | Call-to-action buttons: `action_type` of `dial` (`phone_number_to_dial`, `dial_text`), `url` (fixed `url`, `url_text` up to 25 characters), `url_dynamic` (base `url` that each message extends, `url_text`) or `otp` (`otp_text` up to 25 characters; for one-tap autofill and zero-tap also `package_name`, `signature_hash`, and for zero-tap `zero_tap_terms_accepted`) | Not supported |
| `suggested_reply` | `reply_type` `button` (quick replies: up to 3 `buttons`, each with `button_text` up to 25 characters) or `list` (options list: `sections`, at most 10 rows in total) | Not supported |

Rules worth knowing:

- Variables are written `{{variable_name}}` in `header.text` or `body.text`. An unnamed variable `{{}}` gets a default name: `header_text` for the header, `body_text_1`, `body_text_2`, ... for the body. A default value can be supplied as `{{first_name : you}}`. A variable may not share a name with one of the template's mandatory parameters.
- When a text contains variables, `sample_text` must list one sample value per variable, otherwise the request fails with `3819`.
- At send time, pass variable values as extra keys in `message.<channel>.parameters`. For a `url_dynamic` button, pass the path suffix as `dynamic_url`. For an OTP button, pass the code as `otp_code`.
- An options list (`reply_type` `list`) can only be used in a standard template, so it cannot open a conversation.
- WhatsApp authentication templates may contain only the OTP button text; a header, footer or suggested reply makes the request invalid. Use `otp_text` `Autofill` for one-tap autofill and zero-tap templates. One-tap and zero-tap work on Android only and need an app-side handshake; when the eligibility check fails WhatsApp shows a copy-code button instead.
- `url_dynamic.url`: stay well below the maximum length, because the limit includes the characters each message appends.

### Template tool examples

Create an SMS template with one variable (`templates_create`):

```json
{
  "name": "sms_bogo",
  "type": "standard",
  "channel": "sms",
  "content": [
    {
      "body": {
        "type": "text",
        "text": "Buy one get one free! Use code '{{code_name}}' at checkout on example.com."
      }
    }
  ]
}
```

Create a verified WhatsApp marketing template with an image header (`templates_create`):

```json
{
  "name": "wa_welcome",
  "type": "verified",
  "channel": "whatsapp",
  "category": "marketing",
  "language": "en",
  "content": [
    { "header": {"type": "image", "sample_url": "https://example.com/media/small-logo.jpg"} },
    { "body": {"type": "text", "text": "Hello, welcome to {{1}}.", "sample_text": ["Example Co"]} }
  ]
}
```

Create a WhatsApp copy-code authentication template (`templates_create`):

```json
{
  "name": "copy_code_template",
  "type": "verified",
  "channel": "whatsapp",
  "category": "authentication",
  "language": "en",
  "content": [
    { "body": {"type": "text"} },
    { "suggested_action": [{"action_type": "otp", "otp": {"otp_text": "Copy code"}}] }
  ]
}
```

List every template (`templates_list` takes no arguments). Get or delete one (`templates_get`, `templates_delete`):

```json
{ "channel": "whatsapp", "name": "wa_welcome" }
```

`templates_list` and `templates_get` return `name`, `type`, `channel`, `category`, `language`, `status` and `mandatory_parameters`. `templates_delete` is asynchronous like creation; the result arrives as a callback (`3853` on success).

### Supported languages for WhatsApp templates

Use one of these codes in `language`. Any other value is rejected with `3817`; a missing language on a WhatsApp template is rejected with `3110`.

Afrikaans `af`, Albanian `sq`, Arabic `ar`, Azerbaijani `az`, Bengali `bn`, Bulgarian `bg`, Catalan `ca`, Chinese (China) `zh_CN`, Chinese (Hong Kong) `zh_HK`, Chinese (Taiwan) `zh_TW`, Croatian `hr`, Czech `cs`, Danish `da`, Dutch `nl`, English `en`, English (UK) `en_GB`, English (US) `en_US`, Estonian `et`, Filipino `fil`, Finnish `fi`, French `fr`, Georgian `ka`, German `de`, Greek `el`, Gujarati `gu`, Hausa `ha`, Hebrew `he`, Hindi `hi`, Hungarian `hu`, Indonesian `id`, Irish `ga`, Italian `it`, Japanese `ja`, Kannada `kn`, Kazakh `kk`, Kinyarwanda `rw_RW`, Korean `ko`, Kyrgyz (Kyrgyzstan) `ky_KG`, Lao `lo`, Latvian `lv`, Lithuanian `lt`, Macedonian `mk`, Malay `ms`, Malayalam `ml`, Marathi `mr`, Norwegian `nb`, Persian `fa`, Polish `pl`, Portuguese (Brazil) `pt_BR`, Portuguese (Portugal) `pt_PT`, Punjabi `pa`, Romanian `ro`, Russian `ru`, Serbian `sr`, Slovak `sk`, Slovenian `sl`, Spanish `es`, Spanish (Argentina) `es_AR`, Spanish (Mexico) `es_MX`, Spanish (Spain) `es_ES`, Swahili `sw`, Swedish `sv`, Tamil `ta`, Telugu `te`, Thai `th`, Turkish `tr`, Ukrainian `uk`, Urdu `ur`, Uzbek `uz`, Vietnamese `vi`, Zulu `zu`.

## Capability checks for RCS

RCS only works on devices and networks that support it, so check before sending or rely on a fallback channel.

- `messaging_check_channel_capability` takes `channel` (only `rcs` is allowed) and `phone_number`.
- `messaging_check_rcs_capability` takes `phone_number` and `agent_id` (up to 20 characters) and answers for one specific RBM agent:

```json
{ "phone_number": "15551234567", "agent_id": "my_rbm_id" }
```

Both return `reference_id` and a `status` with one of these codes:

| Code | Meaning | What to do |
| --- | --- | --- |
| `3060` | Delivery channel supported by the end user's device | Send on RCS |
| `3055` | Delivery channel not supported by the end user's device | Use another channel |
| `3115` | Destination phone number not in coverage | The device supports RCS but is outside Telesign Messaging coverage; use another channel |
| `3210` | Capability Check not enabled for Customer ID | Ask Customer Support to enable the feature |
| `3041` | The channel provider failed to respond | Retry |

## OTP auto-generation and status checks

Messaging can generate the one-time passcode for you and verify what the user typed, so one integration covers both notifications and verification.

- The generated code is numeric, 4 to 9 digits long (7 by default).
- It works on WhatsApp, Viber, RCS, SMS and email. The same code is used on every channel in the cascade, so a fallback channel continues the same verification.
- The feature must be enabled for the account. If it is not, a request using the OTP template is rejected with `3112` ("Specified template does not exist for selected channel").

Template names for auto-generated codes:

| Channel | Template |
| --- | --- |
| Viber, RCS | Must be exactly `telesign_otp` (content: "<otp_code> is your verification code"). Any other name returns `3110`. |
| SMS | The predefined `telesign_otp`, or your own template set up with Customer Support |
| WhatsApp, email | A customer-specific verified template whose name contains `telesign_otp`, for example `acme_telesign_otp_wa_template`; created with Customer Support |

Send with `message_type` `OTP` and do not include `parameters` for the OTP template:

```json
{
  "channels": [{"channel": "whatsapp", "fallback_time": 60}, {"channel": "sms"}],
  "phone_number": "15551234567",
  "message": { "whatsapp": {"template": "acme_telesign_otp_wa_template"}, "sms": {"template": "telesign_otp"} },
  "message_type": "OTP"
}
```

When the user submits a code, call `messaging_get_message_status` with the `reference_id` and the code in `verify_code`:

```json
{ "reference_id": "0123456789ABCDEF0123456789ABCDEF", "verify_code": "57244" }
```

Read `verify.code_state` in the response:

| `verify.code_state` | Meaning |
| --- | --- |
| `VALID` | The submitted code matches the one Telesign sent |
| `INVALID` | The submitted code does not match |
| `UNKNOWN` | Any other state; this is what you get when you query without `verify_code` |

`verify.code_entered` echoes the submitted code (`null` when none was sent). The `verify` object appears only for transactions where Telesign generated the code. If you generate the code yourself (for example with Viber `otp_verify` or a WhatsApp authentication template plus `otp_code`), you compare the code in your own application.

## Receiving inbound messages

Replies and other messages from end users (MO messages) are delivered to an MO callback URL as HTTP requests. Ask Customer Support to enable each channel for inbound traffic, enable the MO Callback feature and set the URL. Telesign recommends a separate MO callback URL per channel so that you can tell the channels apart. You only receive MO callbacks if you have sent a Messaging request.

MO notifications use a different schema from delivery reports and differ by channel:

| Channel | Distinguishing fields | Content |
| --- | --- | --- |
| RCS | `sub_resource` `mo_rcs`, `rcs_sender_id`, `phone_number` | `content` with text, a `file` payload (`name`, `mime_type`, `uri`, `size_bytes`), or `end_user_action` |
| WhatsApp | `waba_phone_number`, `phone_number` | `content.type` and `content.content` (for text, `body`), or `content.end_user_action` |
| Viber | `phone_number` | `content.text` |
| MMS | `sub_resource` `mo_mms`, `phone_number` | `content.text_1`, `content.url_image_1`, `content.subject` |
| SMS | `sub_resource` `mo_sms` | `user_response` with `phone_number`, `sender_id`, `mo_message`, `action`, `keyword`, `iso_country_code` |
| Email | `sub_resource` `mo_email`, `email` | `content.end_user_action` with `template` and `event` (for example `unsubscribe`) |

Every MO notification carries `reference_id` and a `status` with code `1500` ("Delivered to customer"), meaning the message was handed to you.

**Keyword handling** is available for RCS and WhatsApp (and, with its own action set, for SMS; see `messaging-sms`). When it is enabled, Telesign recognises keywords in an inbound message, tells you which action they map to in `content.end_user_action` (`action`, `keyword`, `text`, `iso_country_code`), and can send the end user a response message you defined per keyword.

| Action | Keywords |
| --- | --- |
| `stop` | "arrêt", "arret", "cancel", "end", "quit", "stop", "unsubscribe" |
| `help` | "aide", "contact", "help", "info" |
| `start` | "start" |
| `generic` | no keyword found |

You remain responsible for maintaining your own opt-in and opt-out lists.

## Responses and status codes

`messaging_send_message` returns `reference_id`, `status.code`, `status.description` and `external_id` (`null` if you did not send one). Always act on `status.code`, not the HTTP status.

`messaging_get_message_status` returns:

| Field | Meaning |
| --- | --- |
| `status.code`, `status.description` | Overall delivery status |
| `status.last_channel` | The last channel tried |
| `status.updated_on` | Time of the last status change |
| `channel_status[]` | One object per attempted channel, keyed by channel name, with `code`, `description`, `updated_on` and a per-channel `reference_id` (useful for troubleshooting with Telesign) |
| `additional_info` | `mcc` and `mnc` of the carrier, and `price` and `currency`, each only when the matching feature is enabled for the account |
| `verify` | `code_state` and `code_entered`, only for Telesign-generated OTPs |

### Delivery status values

| Code | Text | Meaning |
| --- | --- | --- |
| `3001` | Message in progress | Request accepted and being processed (intermediate). This is the normal send response. |
| `3002` | Delivered to Gateway | Delivery in progress; updated once all options are exhausted (intermediate) |
| `3000` | Delivered | Delivered to the end user. Final unless the last channel supports read status |
| `3005` | Message is read | The end user read the message (final). WhatsApp, Viber and RCS only |
| `3003` | Delivery error | Could not be delivered (final) |
| `3004` | Sent, no final confirmation | Sent out for delivery but no confirmation of delivery to the handset was received |
| `3006` | None of the channels is enabled for the customer | All requested channels are disabled for the account or invalid (final) |
| `3055` | Delivery channel not supported by the end user's device | The device does not support the channel used for delivery (final) |
| `3056` | Message failed to deliver in specified fallback time | Not confirmed within `fallback_time`; triggers the next channel (intermediate) |
| `3052`, `3053` | Message blocked by your request / by Telesign | A custom block for your account, or the number is on a global blocklist |
| `3061`, `3062` | Media size exceeds the limit / MMS not supported | Fix the media or use another channel |
| `3073` | Insufficient funds in prepaid wallet | Top up |
| `3112` | Specified template does not exist for selected channel | The template name is not available on that channel; also returned when an OTP template is used without OTP auto-generation enabled |
| `3114` | Specified message type not allowed outside of conversation window | The message cannot be sent outside an active conversation window |
| `3115` | Destination phone number not in coverage | Use another channel |
| `3200` | {channel} channel is not enabled for customer | Ask Telesign to enable the channel (intermediate; the cascade continues) |
| `3202` | Fallback is not enabled for Customer ID | Several channels were requested but fallback is not enabled |
| `3209` | Phone number not registered for testing | Register the number as a test device with Telesign |
| `3305` | Missing template specific parameters | Add the parameters the template requires |
| `3306` | Missing message parameters for specified channel | `message` has no entry (and no `default`) for that channel |

Codes `3030` to `3051` mirror the carrier-level SMS outcomes (temporary or permanent phone error, cannot route, expired, carrier rejected, subscriber absent, suspected spam and so on); the full list is on the Messaging callback service page.

### Request errors

| Code | Meaning | Fix |
| --- | --- | --- |
| `3102` | Invalid `message_type` | Use `ARN`, `MKT` or `OTP` |
| `3103` | Unsupported `external_id` | At most 100 ASCII characters |
| `3104`, `3105`, `3106` | Invalid `account_lifecycle_event`, `originating_ip`, or empty `callback_url` | Correct the value |
| `3110` | Invalid request | Malformed JSON or payload; also returned for a wrong OTP template name on Viber or RCS |
| `3113` | Invalid `channels` | A channel is listed twice or the array is malformed |
| `3116` | Payload limit size exceeded | Keep the request under 10 KB |
| `3300` to `3304` | Missing `channels`, `channel`, `phone_number`, `message` or `message_type` | Add the parameter |
| `3203` | Callback URL parameter not enabled for Customer ID | Remove `callback_url` or have it enabled |
| `3204` | Rate limit exceeded | Slow down and retry |
| `3206` | Omnichannel product not enabled for Customer ID | Messaging (or the status feature) is not enabled |
| `3400` | Not authorized | Check credentials and permissions |
| `3311` | Invalid `reference_id` (status call) | Use the ID from the send response |
| `-10004` | ReferenceID expired (status call) | Status is only available for 12 hours |
| `3500` | System unavailable | Resubmit |

Template calls: `3802`, `3803`, `3815` (missing `name`, `type`, `content`), `3301` (missing `channel`), `3816` (invalid `category`), `3817` (invalid `language`), `3819` (`sample_text` missing or wrong count), `3856` (name missing, invalid or already in use), `3818` (template management not enabled).

## Callbacks for delivery, read receipts and templates

Telesign posts updates to your Transaction Callback Service URL, or to `callback_url` if you passed one and the feature is enabled.

- **Delivery status notifications** use the general callback schema plus `status.last_channel`, `external_id` and a `channel_status` array with the code, description, time and per-channel reference ID of each attempted channel. A typical cascade shows `3056` on the first channel and `3000` on the second.
- **Read notifications** carry status `3005` and are sent for WhatsApp, Viber and RCS.
- **Template management notifications** report the outcome of `templates_create` and `templates_delete`. Match them on `name` plus `channel`.

| Code | Template event |
| --- | --- |
| `3850` | Template successfully created and ready for use |
| `3851` | Template approved by provider and ready for use |
| `3852` | Template rejected by provider |
| `3853` | Template successfully removed |
| `3854` | Template flagged by provider due to misuse |
| `3855` | Template disabled by provider |
| `3857` | Removal unsuccessful - provider temporary problem |

- **Inbound (MO) notifications** are described in "Receiving inbound messages".

Payload schemas are in `reference/callbacks`.

## URL shortener for SMS links

Telesign can shorten the first `https://` URL in an SMS to a link of at most 22 characters starting with `https://tlsn.io/`. It is an account feature for full-service accounts, enabled by Customer Support, and applies to SMS and SMS Verify traffic. Each short link is unique to the recipient's phone number, so clicks can be tracked per user in the URL Shortener Reports in TelePortal (click-through rate and click response time, overall and per country). You choose a validity period of 1, 7 (default), 14, 21 or 30 days, after which the link leads to an expiry page. Only one URL per message is shortened, and `http://` links are ignored. The feature has no extra cost.

## Requirements and limits

- **Account:** full-service accounts only; Messaging and each channel are enabled by Telesign. Fallback, `callback_url`, capability checks, status retrieval, price and MCC/MNC reporting, MO callbacks, keyword handling and OTP auto-generation are separate enablements.
- **Availability:** telesign.com states the product is not available for purchase or use in the Chinese mainland.
- **Request size:** 10 KB maximum.
- **`fallback_time`:** 30 to 3600 seconds, default 300.
- **Status retention:** `messaging_get_message_status` works for 12 hours after the send. Telesign suggests waiting 3 to 5 minutes before polling.
- **Rate limits:** per-product defaults apply; exceeding them returns `3204`.
- **WhatsApp:** business-initiated conversations need an approved (`verified`) template and end-user opt-in; `standard` templates work only within 24 hours of the last user-initiated message.
- **MMS:** US sender IDs and short codes only.
- **Viber video:** `.3gp`, `.m4v`, `.mov` or `.mp4`, up to 200 MB, hosted on a server that lets Viber inspect the file headers. `text_video` and `url_action_video` do not support a fallback channel; use `video` if you need one. Viber does not allow links to Facebook, Instagram, Line, Signal, Telegram or WhatsApp. Telesign suggests `message_type` `MKT` for video messages.
- **Email:** permission-based sending only, with an unsubscribe link; country-specific content restrictions can apply.
- **Sender IDs:** must be allow-listed by Telesign and can be overridden.
- **Compliance:** you are responsible for consent, opt-out lists and local rules for each channel and message type.

## Related

- Guides: `messaging-sms` (standalone SMS, bulk SMS, inbound SMS), `verify-api` (purpose-built OTP verification), `error-codes`, `best-practices`, `overview`.
- Tool reference: `reference/messaging`, `reference/callbacks`.
- Telesign pages:
  - <https://developer.telesign.com/enterprise/docs/messaging-overview>
  - <https://developer.telesign.com/enterprise/docs/messaging-templates>
  - <https://developer.telesign.com/enterprise/docs/messaging-add-custom-template>
  - <https://developer.telesign.com/enterprise/docs/messaging-create-whatsapp-template>
  - <https://developer.telesign.com/enterprise/docs/messaging-create-sms-template>
  - <https://developer.telesign.com/enterprise/docs/messaging-supported-languages-for-whatsapp-templates>
  - <https://developer.telesign.com/enterprise/docs/messaging-callback-service>
  - <https://developer.telesign.com/enterprise/docs/messaging-receive-inbound-messages>
  - <https://developer.telesign.com/enterprise/docs/messaging-get-transaction-status-after-auto-generating-an-otp-code>
  - Channel setup: `messaging-set-up-rcs-for-your-account`, `messaging-set-up-whatsapp-for-your-account`, `messaging-set-up-viber-for-your-account`, `messaging-set-up-email-for-your-account` (same URL prefix)
  - Per-channel how-to pages: `messaging-send-<feature>-with-<channel>`, linked from the overview page
  - <https://developer.telesign.com/enterprise/docs/url-shortener>
  - <https://developer.telesign.com/enterprise/reference/sendadvancedmessage>
