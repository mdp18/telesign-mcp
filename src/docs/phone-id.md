# Phone ID

Telesign Phone ID turns a phone number into structured intelligence about the number and its
subscriber. A basic request cleans and reformats the number and returns its phone type (mobile,
fixed line, non-fixed VoIP, toll-free and so on), the carrier, and the location where the number
is registered. Optional identity attributes ("add-ons") layer subscriber-level data on top of
that in the same call: SIM swap, porting, number deactivation, call forwarding, contact details,
name/address match scores, breach exposure, age checks and more. A sibling product, Phone ID Live
Status, reports whether a line is in service, whether the device is reachable and whether it is
roaming. Telesign positions the product as global phone number and subscriber intelligence for
strengthening authentication, evaluating fraud risk and improving the user experience.

## When to use it

- **Screen numbers at sign-up.** Read `phone_type` to block non-fixed VoIP, toll-free, pager,
  payphone, invalid and restricted numbers before you create an account.
- **Cleanse numbers before sending.** Use `numbering.cleansing` to get a dialable number and to
  reject malformed input before you pay for an SMS or a voice call.
- **Pick the channel.** Phone type tells you whether SMS or voice is the better choice for a number.
- **Protect one-time passcodes and transactions.** `sim_swap`, `porting_status`, `porting_history`,
  `call_forward_detection` and `active_call_status` expose account-takeover and scam signals before
  you send an OTP or approve a payment.
- **Keep a stored number trustworthy.** `number_deactivation` tells you whether a number was
  deactivated or recycled since you last verified its owner.
- **Verify identity with little user friction.** `contact`, `contact_match`, `age_verify` and
  `subscriber_status` compare or return carrier-held subscriber data.
- **Check that a line is alive.** Phone ID Live Status (`phoneid_live_status`) for in-service,
  reachability and roaming checks, for example to weed out dead leads.

Pick a different product when:

- You want a single fraud risk score and recommendation rather than raw attributes: see `intelligence`.
- You want to prove the user holds the phone (send and check a code): see `verify-api`.
- You just want to send a message: see `messaging-sms`.

## How it works

1. Call `phoneid_get_info` with the number in `complete_phone_number` (digits only, with country
   code). With no other arguments you get the base response: `numbering`, `phone_type`, `carrier`,
   `location`, `status`, and `blocklisting` if that package is enabled for your account.
2. To request identity attributes, add an `addons` object. Each key in `addons` switches on one
   attribute; most take an empty object `{}` as their value, a few take inputs.
3. Some attributes need a `consent` object recording how and when you collected the end user's
   consent (see "The consent object").
4. The response is synchronous. Each requested attribute comes back as a top-level object named
   after its key (for example `sim_swap`), with its own `status.code`. `2800` means that attribute
   succeeded; anything else means that attribute has no usable data, even though the HTTP status is
   200 and the base data is present.
5. The top-level `status.code` is `300` when everything requested was obtained and `301` when only
   part of it was (typically: base data fine, one add-on failed).

There are no callbacks or polling: one request, one response.

Key terms:

- **Identity attribute / add-on / identity signal**: the same thing. Telesign's pages use all three names.
- **Cleansing**: correcting common formatting problems in a submitted number.
- **MCC / MNC**: mobile country code and mobile network code; together they identify a carrier.
- **Full-service vs self-service account**: most add-ons are available to full-service accounts only.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `phoneid_get_info` | Base Phone ID data plus any requested add-ons; number in the URL path | `POST https://rest-ww.telesign.com/v1/phoneid/{complete_phone_number}` |
| `phoneid_get_info_private` | Same request and response, but the number travels in the request body | `POST https://rest-ww.telesign.com/v1/phoneid` |
| `phoneid_live_status` | Phone ID Live Status: in service, reachable, roaming (plus base data) | `GET https://rest-ww.telesign.com/v1/phoneid/live/{complete_phone_number}` |
| `phoneid_legacy_contact` | Legacy standalone contact lookup. Prefer the `contact` add-on | `GET https://rest-ww.telesign.com/v1/phoneid/contact/{complete_phone_number}` |
| `phoneid_legacy_number_deactivation` | Legacy standalone deactivation lookup. Prefer the `number_deactivation` add-on | `GET https://rest-ww.telesign.com/v1/phoneid/number_deactivation/{complete_phone_number}` |

Use `docs_get_tool_reference("<tool>")` for the complete parameter and response field tables.

## Quick start

Basic lookup. Returns phone type, carrier, location and cleansing data.

```json
{ "complete_phone_number": "15551234567" }
```

Lookup with fraud context. Same response; `external_id` is echoed back so you can correlate it.

```json
{
  "complete_phone_number": "15551234567",
  "account_lifecycle_event": "create",
  "originating_ip": "203.0.113.45",
  "external_id": "signup-7349"
}
```

One add-on. Adds a `contact` object (name, address, email) to the response.

```json
{
  "complete_phone_number": "15551234567",
  "addons": { "contact": {} }
}
```

Several add-ons in one call. Adds `sim_swap`, `porting_status` and `number_deactivation` objects,
each with its own `status`.

```json
{
  "complete_phone_number": "15551234567",
  "addons": {
    "sim_swap": {},
    "porting_status": {},
    "number_deactivation": { "last_verified": "2026-01-15T00:00:00Z" }
  }
}
```

Add-on that needs a consent record. Adds a `call_forward_detection` object.

```json
{
  "complete_phone_number": "15551234567",
  "addons": { "call_forward_detection": {} },
  "consent": { "method": 1, "timestamp": "2026-01-15T00:30:30Z" }
}
```

Number kept out of the URL. `phoneid_get_info_private` takes `phone_number` instead of
`complete_phone_number`; everything else is identical.

```json
{
  "phone_number": "15551234567",
  "addons": { "contact_match": { "first_name": "Jane", "last_name": "Doe", "address": "123 Main St", "city": "Springfield", "postal_code": "12345", "state": "IL", "country": "US" } }
}
```

Live Status. `phoneid_live_status` returns base data plus a `live` object.

```json
{ "complete_phone_number": "15551234567", "ucid": "BACF" }
```

## Key parameters

| Parameter | Tools | Notes |
| --- | --- | --- |
| `complete_phone_number` | `phoneid_get_info`, `phoneid_live_status`, legacy tools | Required. Full number with country code, no spaces or special characters. |
| `phone_number` | `phoneid_get_info_private` | Required. Same format; sent in the body instead of the path. |
| `account_lifecycle_event` | both `phoneid_get_info*` | Stage of the end user's journey: `create`, `sign-in`, `transact`, `update`, `delete`. |
| `originating_ip` | both `phoneid_get_info*` | The end user's IP (IPv4 or IPv6), never your own server's. |
| `external_id` | both `phoneid_get_info*` | Your own transaction ID; echoed in the response (`null` if not sent). |
| `addons` | both `phoneid_get_info*` | Object whose keys select identity attributes. See the add-ons section. |
| `consent` | both `phoneid_get_info*` | `method` and `timestamp` of the end user's consent. Required for some add-ons. |
| `ucid` | `phoneid_live_status`, legacy tools | Optional use case code. See "Phone ID Live Status". |

## Choosing phoneid_get_info or phoneid_get_info_private

Both tools hit the same service, accept the same body fields (`account_lifecycle_event`,
`external_id`, `originating_ip`, `addons`, `consent`) and return the same response. The only
difference is where the number goes:

- `phoneid_get_info`: the number is the path parameter `complete_phone_number`
  (`POST /v1/phoneid/{complete_phone_number}`).
- `phoneid_get_info_private`: the number is the body field `phone_number` (`POST /v1/phoneid`).

Use the private variant when you do not want phone numbers to appear in request URLs, which tend
to end up in access logs and proxies. Otherwise either works.

## Base response fields

| Field | Meaning |
| --- | --- |
| `reference_id` | 32-digit hex ID for this request. |
| `external_id` | Your `external_id`, echoed. |
| `status.code`, `status.description`, `status.updated_on` | Transaction status (`300` / `301`), text, RFC 3339 timestamp. |
| `numbering.original` | The number as submitted: `complete_phone_number`, `country_code`, `phone_number`. |
| `numbering.cleansing.call` / `.sms` | Cleansed number for voice and for SMS: `country_code`, `phone_number`, `cleansed_code`, `min_length`, `max_length`. |
| `phone_type.code`, `phone_type.description` | Phone type code (a string, for example `"2"`) and text (`MOBILE`). |
| `phone_type.override_reason`, `phone_type.override_reason_id` | Why Telesign overrode the phone type. Only returned if support enables it for your account. |
| `carrier.name` | Carrier name. Behaviour for ported numbers varies by country. |
| `carrier.carrier_id`, `carrier.mcc`, `carrier.mnc` | Only returned if support enables them for your account. |
| `location` | Where the number was registered (rate center at activation), not where the device is now. |
| `blocklisting` | Whether the number is blocked and by whom. Only returned if support enables the package. |

### Number cleansing codes

`numbering.cleansing.call.cleansed_code` and `numbering.cleansing.sms.cleansed_code`:

| Code | Text | Meaning |
| --- | --- | --- |
| 100 | No Changes / Exact | Number was already well formed; nothing changed. |
| 101 | Changed | Number was altered so it can be dialed (extra digits such as `011` removed, or digits added). |
| 102 | Restricted Number | Premium rate, short code (for example emergency services), satellite and similar. |
| 103 | No Match | Looks well formed but cannot be matched to any area. |
| 104 | Invalid | Not correctly formatted. |
| 105 | Partial Match | Too long or too short. |

`min_length` and `max_length` are the allowed digit counts for numbers under that country dialing code.

### Phone type codes

`phone_type.code` with Telesign's stated risk level and recommended action:

| Code | Description | Risk | Recommended action | Notes |
| --- | --- | --- | --- | --- |
| 1 | `FIXED_LINE` | Low | Allow | Landlines and VoIP lines traceable to an address. |
| 2 | `MOBILE` | Medium-Low | Allow | Contract mobile. Some prepaid phones are reported as mobile. |
| 3 | `PREPAID` | Medium-High | Flag | Prepaid mobile; can be bought anonymously. Not every prepaid phone is identified as prepaid. |
| 4 | `TOLL_FREE` | High | Block | Toll-free numbers always forward somewhere else. |
| 5 | `VOIP` | High | Block | Non-fixed VoIP: obtainable from anywhere, untraceable, disposable. |
| 6 | `PAGER` | High | Block | Cannot receive verification calls. |
| 7 | `PAYPHONE` | High | Block | Not traceable to a person. |
| 8 | `INVALID` | High | Block | Not a valid number. |
| 9 | `RESTRICTED_PREMIUM` | High | Block | Restricted numbers: premium rate, shared cost, satellite, short codes and similar. |
| 10 | `PERSONAL` | Medium-Low | Allow | Forwards to another number chosen by the subscriber. |
| 11 | `VOICEMAIL` | Medium-High | Block | Rings straight to voicemail. |
| 20 | `OTHER` | Medium-High | Block | Non-US special types (global title address, inbound routing code, videotext, VPN). |

Note that the code is returned as a string, and that `OTHER` is `20`, not `12`.

Phone type override reason codes (`phone_type.override_reason_id`, when enabled):

| Code | Text |
| --- | --- |
| 1 | Value Added Services (VAS) Number |
| 2 | Reported Fraud - High-Risk Number |
| 5 | Premium Rate Number |
| 6 | Publicly Available Number |
| 8 | Carrier Prefix Analysis |
| 10 | SMS-enabled Carrier (an SMS-enabled fixed line overridden to Mobile) |
| 11 | Non SMS-enabled Phone Number |

### Location fields

`location` has `city`, `county` (US only), `state` (North America only), `zip` (US only),
`metro_code` (US only), `country.name` / `iso2` / `iso3`, `coordinates.latitude` / `longitude`,
and `time_zone.name` (US only) / `utc_offset_min` / `utc_offset_max`. Fields that are not
available for a market come back as `null`. For non-US numbers the two UTC offsets span the whole
country; for US numbers they are equal.

### Blocklisting fields

| Field | Meaning |
| --- | --- |
| `blocklisting.blocked` | `true` if the number is blocked. |
| `blocklisting.block_code` | `0` not blocked; `1` blocked by Telesign; `2` block requested by your organization; `3` block requested by your account or set by Telesign on its behalf; `4` block state unknown. |
| `blocklisting.block_description` | Text for the code, for example `Not blocked`. |

## Identity attributes (add-ons)

Contact Plus, an older add-on that still appears in Telesign's OpenAPI definition, is deprecated and no
longer supported, so this server does not offer it. Use Contact or Contact Match instead.

General rules for all add-ons:

- Put the key in `addons` on `phoneid_get_info` or `phoneid_get_info_private`. Several keys can be combined.
- Every attribute except Contact must be enabled for your account by Telesign first; an attribute
  that is not enabled returns `2806` in its own `status`.
- Read `<key>.status.code` before using the data. `2800` is success. See "Add-on status codes".
- Add-on lookups are billed transactions.

| Attribute | `addons` key | Inputs |
| --- | --- | --- |
| Active Call Status | `active_call_status` | none (`{}`) |
| Age Verify | `age_verify` | optional `age_threshold` |
| Breached Data | `breached_number_check` | none (`{}`) |
| Call Forwarding | `call_forward_detection` | none (`{}`), plus top-level `consent` |
| Contact | `contact` | optional `email` (Email ID feature) |
| Contact Match | `contact_match` | name and address fields, optional `date_of_birth`, `email` |
| Number Deactivation | `number_deactivation` | optional `last_verified` |
| Porting History | `porting_history` | optional `past_x_days` |
| Porting Status | `porting_status` | none (`{}`) |
| SIM Swap | `sim_swap` | none (`{}`) |
| Subscriber Status | `subscriber_status` | none (`{}`) |

### active_call_status - Active Call Status

Tells you whether the end user is on a phone call right now, who started it and how long it has
lasted. Intended for authorized push payment fraud: if a customer starts a transfer while on an
incoming call, they may be being coached by a scammer.

- Request: `"addons": { "active_call_status": {} }`
- Response `active_call_status`:
  - `is_call_active` (boolean): `true` if a call is in progress.
  - `call_direction`: `called` or `calling`, depending on who initiated the call; null when no call is active.
  - `call_duration`: seconds so far; null when no call is active.
  - `status.code` / `status.description`.
- Availability: must be enabled by Telesign; offered for end users in select countries only.
- Codes you may see: `2802` unexpected error, `2804` number is invalid, restricted, toll-free or a
  payphone, `2805` the provider returned empty values, `2806` not enabled, `2810` provider returned
  an unrecognized response, `2811` timeout.

### age_verify - Age Verify

Tests whether the subscriber meets an age threshold without returning the age itself.

- Request: `"addons": { "age_verify": {} }` uses the minimum legal age of the number's country.
  `"addons": { "age_verify": { "age_threshold": 21 } }` sets a custom threshold.
- Response `age_verify`:
  - `age_verified` (boolean): `true` if the subscriber's age is equal to or greater than the
    threshold. Only present when the attribute processed successfully.
  - `status.code` / `status.description`.
- Availability: full-service accounts only. Before going live, confirm with Telesign support which
  countries you will check; your account has to be configured for them.
- Warning from Telesign: do not send `age_threshold` for a country unless support has confirmed it
  is supported there. An unsupported country can return incorrect results rather than an error.
- A number outside coverage returns `2803` in `age_verify.status` and top-level `status.code` `301`.

### breached_number_check - Breached Data

Flags numbers, and personal data linked to them, that appeared in a recent data breach. Use it to
trigger a password reset, a step-up check or a temporary lock on exposed accounts.

- Request: `"addons": { "breached_number_check": {} }`. The key is `breached_number_check`; one
  table on Telesign's identity attributes page lists it as `breached_data`, but the attribute page,
  the curl sample and the API reference all use `breached_number_check`.
- Response `breached_number_check`:
  - `phone_number_breached` (boolean).
  - `breach_date`: date of the breach from the data provider; `null` if none found.
  - `breached_data`: array naming the categories of data exposed; `null` if none found. Only the
    category names are returned, never the data.
  - `status.code` / `status.description`.
- Possible `breached_data` values (varies by region and regulation): `name`, `address`, `state`,
  `city`, `county`, `country`, `device_model`, `device_name`, `dob`, `age`, `ip_addresses`,
  `national_id`, `social_security_number`, `email`, `password`, `password_plaintext`, `username`.
- Availability: full-service accounts only.
- Codes: `2802` unexpected error, `2804` invalid, restricted, toll-free or payphone number,
  `2805` no information, `2806` not enabled, `2810` unrecognized provider response, `2811` timeout.

### call_forward_detection - Call Forwarding

Reports whether call forwarding is switched on for the number and under what conditions. Forwarding
can be used to divert voice OTPs to an attacker.

- Request: `"addons": { "call_forward_detection": {} }` plus a top-level `consent` object, which
  Telesign's page marks as required. In a live test on one US account the add-on returned `2800`
  without it, so enforcement may vary by account or market; send `consent` anyway, since the
  documentation requires it.
- Response `call_forward_detection`:
  - `call_forward_enabled`: the string `"true"` or `"false"` (a string, not a boolean).
  - `call_forward_type`: `conditional`, `unconditional` or `None`. Conditional means calls are
    forwarded only when the original number cannot be reached.
  - `call_forward_condition`: `busy`, `unanswered`, `unreachable`, or `None` when forwarding is
    unconditional or off.
  - `status.code` / `status.description`.
- Availability: full-service accounts only.

### contact - Contact

Returns the subscriber's name and address held for the number.

- Request: `"addons": { "contact": {} }`.
- Response `contact`: `first_name`, `last_name`, `address1` (street), `address2` (unit or suite),
  `address3`, `address4`, `city`, `state_province`, `zip_postal_code`, `country`, `email_address`,
  and `status`. Empty strings are returned for parts that are not known.
- Optional fields that are off by default and limited to certain markets (ask support):
  `date_of_birth` and `id` (government-issued ID).
- Email ID feature: pass the email the user gave you as `"contact": { "email": "user@example.com" }`.
  Telesign then draws on email as well as phone identity data, and the response adds `input_used`:
  `phone_number`, `email`, or `phone_number and email`. Email ID is full-service only and limited to
  certain markets.
- Availability: the only add-on open to both full-service and self-service accounts.
- Spec quirk: Telesign's OpenAPI definition lists `addons.contact.email` only for the body-number
  endpoint (`phoneid_get_info_private`), while the docs show it on the path endpoint too. This
  server accepts it on both tools.

### contact_match - Contact Match

Scores how closely a name and address you supply match what the carrier has on file, without
returning the carrier's data.

- Request fields inside `addons.contact_match`:
  - `first_name`, `last_name`
  - `address` (the street line), `city`, `state`, `postal_code` (first five digits only), `country`
  - `date_of_birth` (optional, ISO 8601 such as `1954-01-06T00:00:00Z`, certain markets only)
  - `email` (optional, Email ID feature)
- Response `contact_match`:
  - `first_name_score`, `last_name_score`, `address_score`: integers from 0 to 100.
  - `date_of_birth_score`: only meaningful if you sent `date_of_birth` and the market supports it.
  - `input_used`: only with Email ID enabled.
  - `status.code` / `status.description`.
- Reading scores: Telesign recommends treating 80 or higher as a pass. A score that is unavailable
  is described as `-1` in the schema tables and as None/`null` in the prose and examples; treat
  both as "no comparison possible", not as a mismatch.
- Consent: you must obtain implicit consent from end users, by telling them at sign-up that their
  name, address, email and mobile number may be disclosed to third parties for identity
  verification and fraud detection, and covering this in your terms and privacy policy.
- Availability: full-service accounts only.
- Codes shown in the docs: `2803` out of coverage, `2805` no match information, `2806` not enabled.
- Spec quirk: `date_of_birth` and `email` are documented on Telesign's Contact Match page but are
  missing from its OpenAPI definition. This server's tool schema includes both.

### number_deactivation - Number Deactivation

Tells you whether a number has been deactivated, when, and by which carrier, based on carrier data
and Telesign's own analysis. With a `last_verified` date it also tells you whether the number was
recycled (handed to a new subscriber) since then.

- Request: `"addons": { "number_deactivation": {} }` for deactivation data only, or
  `"addons": { "number_deactivation": { "last_verified": "2026-01-15T00:00:00Z" } }` where
  `last_verified` is the last time you successfully verified this user's identity, in ISO 8601.
- Response `number_deactivation`:
  - `carrier_name`: the carrier associated with the number (the one that deactivated it most recently).
  - `last_deactivated`: when the number was last deactivated, if it was.
  - `tracking_since`: when Telesign began tracking this number for deactivation events. A
    deactivation before this date would not be visible.
  - `recycled_since_last_verification`: `recycled`, `not_recycled` or `cannot_be_determined`.
    Only present when you sent `last_verified`.
  - `status.code` / `status.description`.
- Availability: full-service accounts only.
- Spec quirk: Telesign's OpenAPI definition lists response-style fields under the request object
  `addons.number_deactivation` (`carrier_name`, `last_deactivated`, `tracking_since`, `status`,
  `recycled_since_last_verification`) and omits `last_verified`. This server's tool schema follows
  the documentation page instead: the only input is `last_verified`. Do not send the other fields.
- Docs quirk: the failure example on the Number Deactivation page shows code `2603` with an
  "out of ... coverage" description, while the status code table uses `2803` for that condition.
  Treat any code other than `2800` as "no data".

### porting_history - Porting History

Shows when a number moved between carriers and from whom to whom. A very recent port can indicate a
port-out takeover.

- Request: `"addons": { "porting_history": {} }`, or
  `"addons": { "porting_history": { "past_x_days": 10 } }` to set how many days back to look.
- Response `porting_history`:
  - `carrier_current`, `carrier_previous`
  - `mcc_carrier_current`, `mcc_carrier_previous`, `mnc_carrier_current`, `mnc_carrier_previous`
    (each may hold several values)
  - `phone_type_current`, `phone_type_previous` (text such as `MOBILE`)
  - `port_date`: when the number was ported to the new carrier.
  - `number_of_portings`: ports inside the `past_x_days` window (returned as a string).
  - `status.code` / `status.description`.
- Coverage: US phone numbers ported in the last 90 days. A number that was not ported in that
  period returns `2805`, which here means "no recent port", not a failure.
- Availability: full-service accounts only.

### porting_status - Porting Status

Tells you whether the number has been ported and which network holds it now.

- Request: `"addons": { "porting_status": {} }`.
- Response `porting_status`: `ported` (boolean), `mcc_current`, `mnc_current` (the MCC and MNC of
  the current carrier), and `status`.
- Availability: full-service accounts only.
- Codes shown in the docs: `2803` out of coverage, `2811` timeout.

### sim_swap - SIM Swap

Tells you whether the SIM behind the number was changed and when, with Telesign's assessment of how
likely the swap is to be fraudulent. The main defence against SIM swap takeover of SMS OTPs.

- Request: `"addons": { "sim_swap": {} }`.
- Response `sim_swap`:
  - `swap_date`: date of the swap, if any.
  - `swap_time`: time of the swap, if available.
  - `risk_indicator`: 1 to 4, see below.
  - `status.code` / `status.description`.

| `risk_indicator` | Risk | Meaning |
| --- | --- | --- |
| 1 | Very low | No swap, or the swap was 15 or more days ago. |
| 2 | Low | Swap between 3 and 14 days ago. |
| 3 | Medium | Swap within the last 72 hours. |
| 4 | High | Swap the same day. |

- Coverage: an out-of-coverage result (`2803`) means the number belongs to a carrier or country
  for which SIM swap data is not available. `2805` means no information was found; `2811` is a timeout.
  None of these mean "no swap": treat them as unknown.
- A successful result (`2800`) can still have `swap_date` and `swap_time` set to `null`. US carriers
  provide only the risk indicator, not the date or time of a swap, so for US numbers gate on
  `risk_indicator` alone. A live lookup of a US mobile number returned
  `{"swap_date": null, "swap_time": null, "risk_indicator": 1}` with status `2800`. (Observed
  behaviour; Telesign's docs only say the date and time are returned "if applicable" / "if available".)
- Availability: full-service accounts only.
- Type note: the docs page shows `risk_indicator` as an integer; the generated reference types it
  as a string. Compare loosely.

### subscriber_status - Subscriber Status

Returns the carrier's view of the subscriber account, useful for judging value or risk.

- Request: `"addons": { "subscriber_status": {} }`.
- Response `subscriber_status`:
  - `account_status`: `active`, `suspended` or `deactivated`.
  - `contract_type`: `postpaid` or `prepaid`.
  - `account_type`: whether the account belongs to an individual, an organization or a government
    (the docs example shows `business`, the reference example `individual`).
  - `primary_account_holder` (boolean): whether this is the primary number on the account. Mobile only.
  - `account_tenure_min`, `account_tenure_max`: tenure in months as a range, because carriers
    often report a range. May be `null`.
  - `account_activation_date`: when the account first became active. Not in every response.
  - `status.code` / `status.description`.
- Coverage: what comes back varies by carrier and market; ask Telesign support for specifics.
- Availability: full-service accounts only.

## The consent object

`consent` is a top-level argument (a sibling of `addons`, not inside it) recording how and when the
end user agreed to this lookup.

| Field | Type | Values |
| --- | --- | --- |
| `consent.method` | integer | `1` Terms and conditions (TCO), `2` Mobile app (MA), `3` SMS, `4` OTHER. Defaults to `1` if omitted. |
| `consent.timestamp` | string, date-time | When consent was collected, for example `2018-05-01T00:30:30Z`. |

When it is needed:

- **Call Forwarding (`call_forward_detection`)**: required according to Telesign's page, which marks
  `consent` and `consent.timestamp` as required and `consent.method` as optional. (A live test on one
  US account succeeded without it, so it is not always enforced.)
- The API reference says only that consent "is required for some add-ons". The other attribute
  pages do not ask for a `consent` object.
- **Contact Match** needs the end user's implicit consent collected in your own product (terms and
  privacy policy wording); its page does not ask you to send a `consent` object.

Record real values: the timestamp should be when that user actually consented.

## Phone ID Live Status

A separate product, driven by `phoneid_live_status`, that asks the network about the line's
current state. The response contains the base Phone ID data (`numbering`, `phone_type`, `carrier`,
`location`, `status`), `sub_resource` set to `live`, an `errors` array, and a `live` object:

| Field | Values |
| --- | --- |
| `live.subscriber_status` | `ACTIVE` (in service) or `DISCONNECTED` (not in service). |
| `live.device_status` | `REACHABLE` (online and able to make or receive calls), `UNREACHABLE` (switched off or out of coverage), `UNAVAILABLE` (status not available for this number). |
| `live.roaming` | `YES`, `NO`, or `UNAVAILABLE` (cannot be determined right now). |
| `live.roaming_country` | Name of the country the device is roaming in, or `null`. |
| `live.roaming_country_iso2` | Two-letter code for that country, or `null`. |

The `ucid` parameter is an optional use case code describing why you are checking the number:

| `ucid` | Use case |
| --- | --- |
| `ATCK` | 2FA situations such as logging in or updating an account |
| `BACF` | Account creation where the service is vulnerable to bulk attacks or individual fraudsters |
| `BACS` | Account creation where the service is vulnerable to bulk attacks or individual spammers |
| `CHBK` | Verifying the buyer on an expensive or unusual purchase |
| `CLDR` | Calendar event |
| `LEAD` | Checking whether a person submitting details for a loan, property or school enquiry is genuine |
| `OTHR` | Other; anything not covered by another code |
| `PWRT` | Password reset |
| `RESV` | Reservations, to reduce no-shows |
| `RXPF` | Preventing prescription fraud |
| `SHIP` | Shipping notifications |
| `THEF` | Preventing identity takeover by deactivating or redirecting a phone number |
| `TRVF` | Approving a money transfer; like `CHBK` but specifically for money transactions |
| `UNKN` | Same as `OTHR` |

Coverage and limits:

- Available for mobile numbers in most countries, and for landlines in certain markets. Ask
  Telesign support about the markets you care about.
- Full-service accounts only, and the product must be added to your account.
- Repeated requests for the same number in a short period can fail with error `-60001`
  ("PhoneID Live Data Not Found") even when data exists. Space out or cache checks for the same number.
- Live Status does not take `addons`.

## Legacy standalone endpoints

Two older GET endpoints remain available as tools. Telesign's API definition titles them "Legacy
Phone ID API" and describes that API as deprecated: no longer fully supported, but not yet at end
of life. Use the add-on equivalents for new work.

| Legacy tool | Modern equivalent | What differs |
| --- | --- | --- |
| `phoneid_legacy_contact` | `phoneid_get_info` with `"addons": { "contact": {} }` | Legacy response uses `contact.firstname` and `contact.lastname` (no underscore) and has no email, Email ID or per-add-on status. A business name is returned whole in `firstname` with `lastname` null. |
| `phoneid_legacy_number_deactivation` | `phoneid_get_info` with `"addons": { "number_deactivation": { "last_verified": "..." } }` | Legacy response returns `number_deactivation.number`, `tracking_since`, `last_deactivated`, `mcc` and `mnc` (several MNCs separated by semicolons) instead of a carrier name, and has no `last_verified` input or recycled flag. |

Both take `complete_phone_number` and an optional `ucid` (same codes as Live Status), return
`sub_resource` (`contact` or `number_deactivation`), and report problems with negative error codes
in an `errors` array rather than the add-on `28xx` codes. The legacy contact response also
includes the base `numbering`, `phone_type`, `carrier` and `location` data; the legacy deactivation
response does not.

```json
{ "complete_phone_number": "15551234567", "ucid": "THEF" }
```

## Practical recipes

### Block VoIP numbers at sign-up

1. Call `phoneid_get_info` with `{"complete_phone_number": "15551234567", "account_lifecycle_event": "create"}`.
2. Check `status.code` is `300`.
3. Read `phone_type.code` (a string). `"5"` is non-fixed VoIP: reject, or ask for another number.
4. To follow Telesign's full recommendation, also block `"4"`, `"6"`, `"7"`, `"8"`, `"9"`, `"11"`
   and `"20"`, flag `"3"` (prepaid) for extra checks, and allow `"1"`, `"2"` and `"10"`.

Fixed VoIP lines tied to an address are reported as `FIXED_LINE` (`"1"`), so this rule only
catches the disposable, non-fixed kind.

### Cleanse a number before sending

1. Call `phoneid_get_info` with the number as the user typed it (digits and country code).
2. For an SMS, read `numbering.cleansing.sms`; for a voice call, `numbering.cleansing.call`.
3. If `cleansed_code` is `100` or `101`, build the number to send to as `country_code` followed by
   `phone_number` from that object. With `101` this differs from what the user entered.
4. If `cleansed_code` is `102`, `103`, `104` or `105`, do not send; ask the user to correct the number.
5. Optionally check `phone_type` as well: a fixed line is a poor SMS target, so offer voice instead.

### Detect a recent SIM swap before sending an OTP

1. Call `phoneid_get_info` with
   `{"complete_phone_number": "15551234567", "account_lifecycle_event": "sign-in", "addons": {"sim_swap": {}}}`.
2. Check `sim_swap.status.code`. If it is not `2800` (for example `2803` out of coverage, `2805`
   no information, `2811` timeout) you have no SIM swap signal; decide by your own policy and do
   not read it as "safe".
3. If `sim_swap.risk_indicator` is `3` or `4` (swap in the last 72 hours or the same day), do not
   send the OTP to this number; use another factor or a manual review. `2` is a swap 3 to 14 days
   ago; `1` means no swap or an old one.
4. For a broader takeover check in the same call, add `porting_status` or `porting_history`
   (recent port-out) and `call_forward_detection` (with `consent`) for voice OTPs.

### Check for number deactivation or recycling

1. Store the date each time you successfully verify a user on their number.
2. Before trusting the number again (login OTP, account recovery, marketing), call `phoneid_get_info` with
   `{"complete_phone_number": "15551234567", "addons": {"number_deactivation": {"last_verified": "2026-01-15T00:00:00Z"}}}`.
3. Check `number_deactivation.status.code` is `2800`.
4. Read `recycled_since_last_verification`: `recycled` means the number has probably changed hands,
   so re-verify the user by another route before sending anything to it; `not_recycled` is fine;
   `cannot_be_determined` should be treated with caution.
5. `last_deactivated` later than your last verification is the underlying signal. Compare
   `tracking_since` with your date: if tracking began after it, earlier deactivations are not visible.

## Responses and status codes

### Transaction status codes

Returned in the top-level `status.code` with HTTP 200:

| Code | Text | Meaning |
| --- | --- | --- |
| 300 | Transaction successfully completed | All requested data was obtained. |
| 301 | Transaction partially completed | Some data was obtained, some was not. Check each add-on's `status`. |

Telesign advises coding against these status and error codes rather than the HTTP status.

### Add-on status codes

Returned in `<addon>.status.code`. The description names the add-on concerned.

| Code | Meaning | What to do |
| --- | --- | --- |
| 2800 | Request successfully completed | Use the data. |
| 2801 | Invalid request add-ons parameter: {parameter_name} | Fix the named input inside `addons`. |
| 2802 | Add-on temporarily unavailable | Retry later. |
| 2803 | Phone number out of add-on coverage | No data for this carrier or country; fall back. |
| 2804 | Phone number not applicable in add-on | Wrong kind of number (invalid, restricted, toll-free, payphone). |
| 2805 | No add-on information for phone number | Nothing on file. For `porting_history` this means no port in the window. |
| 2806 | Add-on is not enabled | Ask Telesign to enable the attribute on your account. |
| 2807 | Some parameters submitted in the request are not valid | Check add-on inputs. |
| 2808 | Invalid Request: {parameter_name} parameter is missing or empty | Supply the named parameter. |
| 2810 | Request process failed during data collection | Provider problem; retry. |
| 2811 | Request processing timeout | Retry. |
| 2812 | Add-on exceeded transaction hard cap. Request denied | Your cap for that add-on is reached; contact Telesign. |

### Errors on phoneid_get_info and phoneid_get_info_private

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | 10032 | Request blocked: the number is on a Telesign blocklist. |
| 400 | 10033 | Unverified phone number requested for a trial account. |
| 400 | 10041 | Blocked due to legal compliance. |
| 400 | 11000 | Invalid value for parameter `phone_number`. |
| 400 | 11001 | Invalid country code for parameter `phone_number`. |
| 400 | 11003 | Invalid value for parameter `account_lifecycle_event`. |
| 400 | 11010 | Invalid value for parameter `originating_ip`. |
| 400 | 12000 | Missing required parameter `phone_number`. |
| 401 | 10008 | Invalid signature. |
| 401 | 10012 | This feature is not enabled for this Customer ID. |
| 401 | 10014 | Invalid source IP address. |
| 401 | 10015 | Invalid customer ID. |
| 402 | 10030 | Insufficient funds in prepaid wallet. |
| 429 | 10019 | Rate limit exceeded. |
| 429 | 10020 | Phone ID exceeded transaction hard cap. Request denied. |
| 503 | - | System unavailable; try again. |

### Errors on Live Status and the legacy endpoints

These use negative codes, listed in the response's error information:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 200 | -60001 | No live data (or, on legacy contact, no contact data) for this number on this request. |
| 400 | -10001 | Source IP not authorized to use the service, or unsupported product name. |
| 400 / 429 | -40007 | Rate limit exceeded. |
| 400 | -40032 | Blocked due to legal compliance (Live Status). |
| 401 | -10009 | Invalid source IP address. |
| 401 | -20002 | Product not enabled for this Customer ID. |
| 401 | -20003 | Feature not enabled for this Customer ID. |
| 401 | -30002 | Customer ID account not activated. |
| 401 | -30003 | Customer ID new account limit reached. |
| 401 | -40002 | Not authorized. |
| 404 | -40001 | Status unavailable. |
| 404 | -40004 | Resource not found. |
| 405 | -40005 | Method not allowed. |
| 429 | -40008 | Transaction hard cap exceeded; request denied. |
| 503 | -90001 | System unavailable; try again later. |

See `error-codes` for the full cross-product list.

## Requirements and limits

- **Enablement.** Basic Phone ID and the Contact add-on work on full-service and self-service
  accounts. Every other add-on must be enabled by Telesign, and Age Verify, Breached Data, Call
  Forwarding, Contact Match, Number Deactivation, Porting History, Porting Status, SIM Swap,
  Subscriber Status and Phone ID Live Status are for full-service accounts only. Active Call Status
  is offered in select countries. Some add-ons are purchased separately.
- **Optional response fields.** `blocklisting`, `carrier.carrier_id`, `carrier.mcc`, `carrier.mnc`,
  `phone_type.override_reason*`, and `contact.date_of_birth` / `contact.id` appear only after
  Telesign support turns them on.
- **Coverage varies by attribute.** Porting History: US numbers, last 90 days. Email ID, date of
  birth matching and custom age thresholds: limited markets. SIM Swap and Subscriber Status depend
  on carrier and country. Check with Telesign for the markets you serve.
- **Billing.** Every request is a charged transaction, including ones made while testing.
  Trial accounts can only query verified numbers (`10033`).
- **Rate limits.** Telesign's default per-product rate limits apply (`10019` / `-40007`), and
  accounts can have a transaction hard cap (`10020`, `2812`, `-40008`).
- **Consent and compliance.** Send `consent` where an add-on requires it, collect implicit consent
  for Contact Match, and follow the compliance rules for your markets. Contact data is personal
  data: request it only when you need it.
- **Input format.** UTF-8 only. Numbers are full international numbers without spaces or special
  characters. The Phone ID POST endpoints accept `application/json`; requests that carry `addons`
  must be JSON.

## Related

Guide topics: `intelligence`, `verify-api`, `messaging-sms`, `error-codes`, `authentication`,
`best-practices`, `overview`.

Telesign pages used:

- https://developer.telesign.com/enterprise/docs/phone-id-overview
- https://developer.telesign.com/enterprise/docs/phone-id-get-started
- https://developer.telesign.com/enterprise/docs/phone-id-get-started-with-identity-attributes
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-active-call-status
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-age-verify
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-breached-data
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-call-forwarding
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-contact
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-contact-match
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-number-deactivation
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-porting-history
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-porting-status
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-sim-swap
- https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-subscriber-status
- https://developer.telesign.com/enterprise/docs/phone-id-tutorial-use-identity-attributes
- https://developer.telesign.com/enterprise/docs/phone-id-try-it-without-code
- https://developer.telesign.com/enterprise/docs/phone-id-live-status-overview
- https://developer.telesign.com/enterprise/docs/phone-id-live-status-get-started
- https://developer.telesign.com/enterprise/docs/phone-id-live-status-try-it-without-code
- https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones
- https://developer.telesign.com/enterprise/reference/submitphonenumberforidentity
- https://developer.telesign.com/enterprise/reference/submitphonenumberforidentityalt
- https://developer.telesign.com/enterprise/reference/submitphonenumberforlivestatus
- https://developer.telesign.com/enterprise/reference/getcontactdetailsforphonenumber
- https://developer.telesign.com/enterprise/reference/getphonenumberdeactstatus
