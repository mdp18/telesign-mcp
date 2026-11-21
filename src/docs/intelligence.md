# Intelligence

Telesign Intelligence is a machine-learning risk scoring service. You submit a phone number or an email address (plus, optionally, the end user's IP address, device ID and account ID) and get back a risk score from 0 to 1000, a risk level, an `allow` / `flag` / `block` recommendation, and reason codes that explain how the score was reached. It is used to spot fake accounts, account takeover, International Revenue Share Fraud (IRSF) and similar abuse before you spend money or trust on a user.

Two cloud APIs are covered here: **Intelligence Cloud** for phone numbers and **Email Intelligence** for email addresses. The older on-prem Intelligence endpoint (`/v1/score`) is deprecated and documented only so existing integrations can be migrated. The **Intelligence Exceptions API** (allowlist / blocklist overrides) is documented at the end; it has no MCP tool.

## When to use it

- **Account registration**: score the phone number or email before creating the account, and before sending a one-time passcode.
- **Sign-in and account changes**: detect unusual activity on sign-in, profile updates or account deletion.
- **Transactions**: add a risk check before a purchase, payout or other valuable action.
- **IRSF and SMS pumping protection**: block verification messages to risky numbers and number ranges.
- **Explaining a decision**: use the reason codes to see why an identifier was rated risky or trustworthy.

Pick a different product when:

- You only need facts about a number (type, carrier, location, SIM swap, porting, deactivation) and not a risk verdict: use Phone ID (`phone-id`). Intelligence Cloud already returns the Phone ID style `phone_type`, `carrier`, `location` and `numbering` blocks, so you do not need both calls for those fields.
- You want risk screening built into OTP sending with no extra call: use Verify Plus on SMS Verify or Voice Verify (see "Verify Plus" below).
- You want to prove the user controls the number: use a verification product (`verify-api`).

## How it works

1. Your backend collects the identifier (phone number or email address) and whatever context it has: the end user's IP address, device ID, your account ID.
2. You call the service with the identifier and an `account_lifecycle_event` describing what the user is trying to do.
3. Telesign evaluates each identifier you sent:
   - **Static attributes**: phone type, carrier, account ID, device ID, VPN / proxy use, email domain.
   - **Behavior patterns**: anomalous traffic and usage velocity. Documented examples are passcode requests in five different languages from the same number in one week from IPs in several countries, and a range of consecutive numbers appearing repeatedly across web services.
   - **For email**: the structure of the username (repeated characters, random or machine-generated names, typos, homoglyphs), the behavior of the address over time (velocity, sudden spikes, automated-looking sequences) and the domain (disposable or temporary domains, domain age, type and legitimacy, bulk domain creation, high-risk top-level domains).
4. The response is synchronous. It contains `risk.score`, `risk.level`, `risk.recommendation` and, when Insights is in use for your account, reason codes.
5. You decide what to do. Telesign describes the recommendation as advice to combine with your own signals: proceed, proceed with caution (for example add a verification step), or do not proceed.

The model can also be customized with your own labels and traffic; that is arranged with Telesign sales, not through the API.

## Risk score scale and recommendations

`risk.score` measures the risk of doing business with this identifier right now. The scale runs from 0 to 1000 and a higher value means higher risk. The same scale is documented for Intelligence Cloud (phone) and Email Intelligence.

| `risk.score` | `risk.level` | `risk.recommendation` |
| --- | --- | --- |
| 0-200 | `low` | `allow` |
| 201-400 | `medium-low` | `allow` |
| 401-600 | `medium` | `flag` |
| 601-800 | `medium-high` | `block` |
| 801-1000 | `high` | `block` |

- `allow`: proceed with the transaction.
- `flag`: proceed with caution; a common response is an additional verification step or manual review.
- `block`: do not proceed.

The thresholds are Telesign's defaults. You are free to act on `risk.score` directly with your own cut-offs.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `intelligence_assess_risk` | Intelligence Cloud: risk score, recommendation, reason codes and phone details for a phone number. | `POST https://detect.telesign.com/intelligence/phone` |
| `intelligence_assess_email` | Email Intelligence: risk score, recommendation, reason codes and email cleansing / domain details for an email address. | `POST https://detect.telesign.com/intelligence/email` |
| `intelligence_score_legacy` | Deprecated on-prem Intelligence (Score). Use only for existing integrations that have not migrated. | `POST https://rest-ww.telesign.com/v1/score/{complete_phone_number}` |

All three use Basic (or Digest) authentication and send the arguments as an `application/x-www-form-urlencoded` body. All are read-only lookups, but each call is billed. Use `docs_get_tool_reference("<tool>")` for the complete parameter and response field list.

There is no MCP tool for the Intelligence Exceptions API.

## Quick start

Minimal phone check at registration. Returns `risk`, `risk_insights`, `phone_type`, `carrier`, `location` and `numbering`.

```json
{
  "phone_number": "15551234567",
  "account_lifecycle_event": "create"
}
```

Tool: `intelligence_assess_risk`.

Phone check with every optional signal. The extra identifiers are evaluated too and populate the `ip` and `email` reason-code arrays; `external_id` is echoed back.

```json
{
  "phone_number": "15551234567",
  "account_lifecycle_event": "sign-in",
  "originating_ip": "203.0.113.45",
  "email_address": "jdoe@example.com",
  "device_id": "device-7f3a9c",
  "account_id": "acct-102938",
  "external_id": "login-attempt-5521"
}
```

Tool: `intelligence_assess_risk`.

Minimal email check. Returns `email_address_details` (original, cleansed, cleansing and domain details) and `intelligence_details` (risk and insights).

```json
{
  "email_address": "jdoe@example.com",
  "account_lifecycle_event": "create"
}
```

Tool: `intelligence_assess_email`.

Email check with a linked phone number and IP address. The `phone_number` and `ip_address` insight groups are filled in as well.

```json
{
  "email_address": "jdoe@example.com",
  "account_lifecycle_event": "transact",
  "phone_number": "15551234567",
  "originating_ip": "203.0.113.45",
  "account_id": "acct-102938",
  "external_id": "order-88172"
}
```

Tool: `intelligence_assess_email`.

Legacy Score call (deprecated). The phone number is a path argument named `complete_phone_number` here, not `phone_number`.

```json
{
  "complete_phone_number": "15551234567",
  "account_lifecycle_event": "create",
  "originating_ip": "203.0.113.45"
}
```

Tool: `intelligence_score_legacy`.

## Key parameters

| Parameter | Tools | Required | Notes |
| --- | --- | --- | --- |
| `phone_number` | `intelligence_assess_risk` (required), `intelligence_assess_email` (optional) | see left | Digits with country code, no spaces or special characters. |
| `complete_phone_number` | `intelligence_score_legacy` | yes | Path parameter. Digits beginning with the country dialing code. |
| `email_address` | `intelligence_assess_email` (required), the two phone tools (optional) | see left | The end user's email address. Case sensitive. |
| `account_lifecycle_event` | all | yes | What the user is attempting. See the table below. |
| `originating_ip` | all | no | The end user's IP address, IPv4 or IPv6. Do not send your own server's IP address. |
| `device_id` | all | no | Your end user's device ID. Case sensitive. |
| `account_id` | all | no | Your end user's account ID. Case sensitive. |
| `external_id` | all | no | Your own ID for the transaction. It is not scored; the response simply echoes it (or returns `null` when you did not send one). |

### account_lifecycle_event values

| Value | Meaning |
| --- | --- |
| `create` | The creation of a new account. |
| `sign-in` | An end user signs in to their account. |
| `transact` | An end user completes a transaction within their account. |
| `update` | An update is performed, such as an update of account information or similar. |
| `delete` | An account is deleted. |

An empty or unknown value is rejected with status code `11003`; leaving the parameter out gives `12003`.

### Why the optional signals matter

The service evaluates each identifier you submit individually and then combines them into one recommendation. A phone number on its own can only be judged on its type, carrier, range and traffic history. Adding the other signals lets the model also use:

- `originating_ip`: IP velocity, anonymous proxy / VPN / hosting provider / Tor exit node detection, and whether the IP country matches the phone number's country (reason codes 50005-50021).
- `email_address`: email velocity, machine-generated or invalid addresses and disposable domains (reason codes 60005-60015 on the phone API).
- `device_id` and `account_id`: Telesign lists the device ID and account ID among the static attributes it evaluates for the transaction.
- `phone_number` on an email request: the phone activity, recency, range and number-type signals (20xxx, 21xxx, 22xxx, 40xxx codes).

The `ip` and `email` reason-code arrays describe the IP address and email address you provided, so when you send neither, the score rests on the phone signals alone. `external_id` does not affect the score; send it so you can match the response to your own records.

## Responses and status codes

Code against `status.code` in the response body, not the HTTP status. Individual packages in the response can carry their own status as well (`risk_insights.status`).

### Phone response structure (Intelligence Cloud and legacy Score)

| Field | Meaning |
| --- | --- |
| `reference_id` | 32-digit hex ID Telesign assigns to the request. Keep it for support cases. |
| `external_id` | Your `external_id` echoed back, or `null`. |
| `status.code`, `status.description`, `status.updated_on` | Transaction status (see the status table below) and an RFC 3339 timestamp. |
| `risk.score` | 0 to 1000, higher is riskier. |
| `risk.level` | `low`, `medium-low`, `medium`, `medium-high` or `high` (see the scale above). |
| `risk.recommendation` | `allow`, `flag` or `block`. |
| `risk_insights.status` | Processing status of the insights package: `800` success, all fields available; `801` partial success, no value for `category` but other data is available; `803` error, no insights data returned. |
| `risk_insights.category` | Array of reason codes giving the overall risk category of the transaction. |
| `risk_insights.a2p` | Array of reason codes about application-to-person traffic (automated messages to a human such as verification codes): activity, range, machine-like behavior, recency. |
| `risk_insights.p2p` | Array of reason codes about person-to-person communication (two humans, such as one friend texting another). |
| `risk_insights.number_type` | Array of reason codes about the number's type (static attributes). |
| `risk_insights.ip` | Array of reason codes about the IP address you submitted. Empty when no `originating_ip` was sent. |
| `risk_insights.email` | Array of reason codes about the email address you submitted. Empty when no `email_address` was sent. |
| `phone_type.code`, `phone_type.description` | Phone type, as in Phone ID. Documented codes: `1` Fixed line, `2` Mobile, `3` PrePaid Mobile, `4` Toll Free, `5` VOIP, `6` Pager, `7` Payphone, `9` Restricted/Premium Rate, `10` Personal, `11` Voicemail, `20` Other, `30` Email, or `null`. |
| `phone_type.override_reason`, `phone_type.override_reason_id` | Phone type override status. Only returned when the "Phone Type Overrides Enabled" feature is on for your account. |
| `carrier.name` | Carrier associated with the number by prefix. It may be wrong in countries with mobile number portability, because it is derived from the prefix and not from the carrier. |
| `carrier.carrier_id` | Carrier ID. Only returned when the "Carrier ID Enabled" feature is on for your account. |
| `location` | Location of the number's rate center when the device was activated: `city`, `county`, `state`, `zip`, `metro_code`, `country` (`iso2`, `iso3`, `name`), `time_zone` (`name`, `utc_offset_min`, `utc_offset_max`), `coordinates` (`latitude`, `longitude`). Fields are `null` when data is not available for the market. |
| `numbering.original` | The number as submitted: `phone_number`, `complete_phone_number`, `country_code`. |
| `numbering.cleansing.call`, `numbering.cleansing.sms` | The cleansed number for voice and SMS: `phone_number`, `country_code`, `min_length`, `max_length`, `cleansed_code`. |
| `blocklisting` | `blocked` (boolean), `block_code` and `block_description`. Only returned when Telesign support enables this package for your account. |

`numbering.cleansing.*.cleansed_code` values: `100` exact match using the original number, `101` match found by applying changes to the original number, `102` restricted number, `103` no match found, `104` country code and/or phone number invalid, `105` no change but the match was either too long or too short.

`blocklisting.block_code` values: `0` not blocked, `1` blocked by Telesign, `2` block requested by your organization, `3` block requested by your account or set by Telesign on behalf of your account, `4` block state unknown.

Insights are an account option: the reason-code arrays are meaningful only if Insights is used for your account.

### Email response structure (Email Intelligence)

The email response has a different shape from the phone response. Risk and reason codes sit under `intelligence_details`, not at the top level.

| Field | Meaning |
| --- | --- |
| `reference_id`, `external_id`, `status` | Same meaning as in the phone response. |
| `email_address_details.original` | `email_address` exactly as submitted and `is_valid` (whether it is syntactically valid). |
| `email_address_details.cleansed` | The normalized address: `email_address`, `is_valid`, `username` (local part) and `domain`. |
| `email_address_details.cleansing_details` | `is_modified` (whether cleansing changed the address), `gibberish_probability` (how likely the username is machine-generated or nonsensical, for example `0.29`) and `tag` (a plus-tag extracted from the address, if any). |
| `email_address_details.domain_details.general_info` | `registered_domain`, `tld`, `tld_type` (for example `general`) and `is_disposable`. |
| `intelligence_details.risk` | `score`, `level` and `recommendation`, on the same scale as the phone API. |
| `intelligence_details.insights.category` | Array of reason codes for the overall risk category. |
| `intelligence_details.insights.email_address` | Reason codes for the address itself, in three arrays: `activity`, `static` and `domain`. |
| `intelligence_details.insights.phone_number` | Reason codes for the phone number linked to the email, in two arrays: `activity` and `static`. |
| `intelligence_details.insights.ip_address` | Reason codes for the IP address linked to the email, in two arrays: `activity` and `static`. |

Cleansing example from the Telesign docs: `u.s.e.rr1+telesign@gmail.comm!` is reported as an invalid original address and cleansed to `userr1@gmail.com` with `tag` set to `telesign`.

### Email Intelligence extended response

The extended response is the same `POST https://detect.telesign.com/intelligence/email` request (the same `intelligence_assess_email` tool and arguments) with extra blocks in the response. It is not enabled by default: ask your Telesign account manager to enable it. When enabled, the response adds:

| Block | Contents |
| --- | --- |
| `phone_number_details` | Phone ID style details for the linked phone number: `location`, `numbering`, `phone_type`, `carrier` and `blocklisting`, with the same fields as the phone response above. |
| `email_address_details.domain_details.domain_tenure` | `months_since_creation`, `months_since_update`, `months_until_expiration`. |
| `email_address_details.domain_details.registrant_info` | Domain registrant attributes: `organization`, `email`, `is_email_address_valid`, `is_domain_disposable`, `is_phone_valid`, `phone_type`, `phone_country_iso2`, `street_address`, `city`, `state`, `postal_code`, `country`, `address_country_iso2`. |
| `email_address_details.domain_details.registrar_info` | `registrar`, `is_accredited`, `is_in_top20_registrars`. |

### Status and error codes

| HTTP | `status.code` | Meaning | What to do |
| --- | --- | --- | --- |
| 200 | 300 | Transaction successfully completed. All requested data was obtained. | Use the result. |
| 200 | 301 | Transaction partially completed. Some data was obtained, but not all. | Use what is present; check `risk_insights.status`. |
| 400 | 10032 | Request blocked due to this number appearing on a Telesign blocklist. | Treat the number as blocked. |
| 400 | 10033 | Unverified phone_number requested for trial account. | Trial accounts can only query verified numbers; verify the number or upgrade. |
| 400 | 11000 | Invalid value for parameter phone_number (the email API returns `11000` with "Invalid value for parameter email_address." for an empty or bad address). | Fix the identifier. |
| 400 | 11001 | Invalid country code for parameter phone_number. | Include a valid country dialing code. |
| 400 | 11002 | Invalid value for parameter account_id. | Fix the value. |
| 400 | 11003 | Invalid value for parameter account_lifecycle_event. | Use one of the five allowed values. |
| 400 | 11005 | Invalid value for parameter customer_id. | Check credentials. |
| 400 | 11006 | Invalid value for parameter device_id. | Fix the value. |
| 400 | 11007 | Invalid value for email_address. | Fix the value. |
| 400 | 11010 | Invalid value for parameter originating_ip. | Send a valid IPv4 or IPv6 address. |
| 400 | 11011 | Invalid value for parameter reference_id. | Fix the value. |
| 400 | 12000 | Missing required parameter phone_number. | Add the parameter. |
| 400 | 12003 | Missing required parameter account_lifecycle_event. | Add the parameter. |
| 401 | 10008 | Invalid signature. | Check the API key and authentication. |
| 401 | 10009, 10010, 10011 | Invalid value for parameter message / originating_ip / reference_id. | Fix the value. |
| 401 | 10012 | This feature is not enabled for this CustomerID. | Ask Telesign to enable Intelligence (or Email Intelligence) on the account. |
| 401 | 10013 | Invalid Request. CustomerID Account Not Found. | Check the Customer ID. |
| 401 | 10014 | Invalid source IP address. | Call from an allowed IP address. |
| 401 | 10015 | Invalid customer ID. | Check the Customer ID. |
| 402 | 10030 | Insufficient funds in prepaid wallet. | Add funds. |
| 404 | 10017 | Customer ID / Reference ID not found. | Check credentials and URL. |
| 429 | 10019 | Rate Limit Exceeded. | Slow down and retry later. |
| 429 | 10020 | PhoneId Standard exceeded transaction hard cap. Request denied. | Contact Telesign about the cap. |
| 451 | 10041 | Blocked due to legal compliance. (Documented for the two cloud endpoints, not for legacy Score.) | Do not retry. |
| 500 | - | Invalid transaction; transaction not attempted. | Retry later. |
| 503 | - | Service unavailable. | Retry. |

A failed request returns only `reference_id`, `status` and (on the email API) `external_id`.

## Reason codes

Reason codes ("insights") explain how the recommendation was reached. Codes in the `category` package give the overall conclusion; codes in the other packages are the factors behind it. Each factor is a **risk** signal (pushes the score up), a **trust** signal (pushes it down), both (Telesign marks the code as a risk signal and a trust signal) or neither (`-`).

"Range" means a series of consecutive numbers that the submitted number belongs to. A number with no risky history of its own can still be rated risky because most other numbers in its range (for example 131055xx) show risky activity.

Phone reason codes are returned by `intelligence_assess_risk` and `intelligence_score_legacy` in `risk_insights`. Email reason codes are returned by `intelligence_assess_email` in `intelligence_details.insights`.

### Phone reason codes: category

Returned in `risk_insights.category`.

| Code | Name | Meaning |
| --- | --- | --- |
| 10010 | low activity | Not enough activity or attributes to classify the transaction as either risky or trustworthy. |
| 10020 | low regular activity | Trustworthy category, based on past behavior. |
| 10021 | regular activity | Most trustworthy category, based on past behavior. |
| 10030 | low-risk irregular activity | Risky category, based on past behavior. |
| 10031 | medium-risk irregular activity | High-risk category, based on past behavior. |
| 10032 | high-risk irregular activity | Highest-risk category, based on past behavior. |
| 10040 | irregular number type | This number has risky static attributes (like VOIP phone type or being on a blocklist). |

### Phone reason codes: a2p activity

Returned in `risk_insights.a2p`. How much activity was observed for the number compared with a good user (transactions to or from the number, unique numbers and accounts communicated with).

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 20002 | high long-term activity | More than expected activity for this number over the past 90 days. | Risk |
| 20003 | high short-term activity | More than expected activity for this number over the last 24 hours. | Risk |
| 20006 | sparse long-term activity | Sparse, regular volume of verification traffic on this number over the past 90 days. | Trust |
| 20007 | continuous long-term activity | Continuous, regular volume of verification traffic on this number over the past 90 days. | Trust |
| 20008 | very high long-term activity | Very high volume of verification traffic on this number over the past 90 days. | Risk |
| 20009 | very high short-term activity | Very high volume of verification traffic on this number over the past 24 hours. | Risk |
| 20010 | no activity | Very low volume of verification traffic, or none at all, was ever observed on this number. | - |
| 20011 | low long-term activity | Low volume of verification traffic on this phone number over the past 90 days. | - |
| 20012 | low short-term activity | Low volume of verification traffic on this phone number over the past 24 hours. Very low volume, or none at all, over the past 90 days. | - |
| 20014 | continuous successful long-term activity | Continuous successful regular volume of verification traffic on this number over the past 90 days. | Trust |
| 20015 | high unsuccessful long-term activity | Significant volume of unsuccessfully verified traffic from this number over the past 90 days. | Risk |

### Phone reason codes: a2p range

Returned in `risk_insights.a2p`. Activity of a risky range the number belongs to.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 20101 | no range activity | Very little activity, or none at all, for a risky range that this number belongs to over the past 90 days. Also returned if the number does not belong to a risky range. | Trust |
| 20105 | high short-term range activity | Very significant activity for a risky range that this number belongs to over the last 24 hours. | Risk |
| 20106 | high long-term range activity | Very significant activity for a risky range that this number belongs to over the past 90 days. | Risk |
| 20107 | very high long-term range activity | Extremely significant activity for a risky range that this number belongs to over the past 90 days. | Risk |
| 20108 | very high short-term range activity | Extremely significant activity for a risky range that this number belongs to over the last 24 hours. | Risk |
| 20109 | continuous successful long-term range activity | Continuous successful regular volume of verification traffic from a range this number belongs to over the past 90 days. | Trust |
| 20110 | high unsuccessful long-term range activity | Significant volume of unsuccessfully verified traffic from a range this number belongs to over the past 90 days. | Risk |

### Phone reason codes: a2p other

Returned in `risk_insights.a2p`.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 21003 | machine-like activity | Behavior pattern that suggests this number is being used by a bot. A number in A2P traffic is expected to talk to automated systems, but its user is not expected to be one. | Risk |
| 21016 | machine-like range activity | Extremely high volume of verification traffic in a very short period (less than 1 hour) on the range this number belongs to. | Risk |

### Phone reason codes: a2p recency

Returned in `risk_insights.a2p`. How recently the number was active. These codes are neutral.

| Code | Name | Meaning |
| --- | --- | --- |
| 22001 | seen in the last 1 day | This number was seen in verification traffic in the last 1 day. |
| 22007 | seen in the last 7 days | This number was seen in verification traffic in the last 7 days. |
| 22015 | seen in the last 15 days | This number was seen in verification traffic in the last 15 days. |
| 22101 | seen in the last 1 month | This number was seen in verification traffic in the last 1 month. |
| 22102 | seen in the last 2 months | This number was seen in verification traffic in the last 2 months. |
| 22103 | seen in the last 3 months | This number was seen in verification traffic in the last 3 months. |
| 22203 | not seen in the last 3 months | No activity observed for this phone number in Telesign's global traffic within the last 3 months. |

### Phone reason codes: number_type

Returned in `risk_insights.number_type`. Static attributes of the number, not measurements of behavior.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 40001 | premium number | This is a premium number. | Risk |
| 40002 | VOIP number | This is a VOIP number. | Risk |
| 40003 | toll-free number | This is a toll-free number. | Risk |
| 40004 | invalid number | This is an invalid number. | Risk |
| 40005 | payphone number | This number is associated with a payphone. | Risk |
| 40006 | voicemail number | This is a voicemail number. | Risk |
| 40007 | pager number | This number is associated with a pager. | Risk |
| 40008 | high-risk phone type | This number has another phone type that is risky and is not covered by the other number_type reason codes. | Risk |
| 40009 | high-risk carrier | This number is associated with a very risky carrier. | Risk |
| 40010 | medium-risk carrier | This number is associated with a risky carrier. | Risk |
| 40011 | high-risk prefix | This number has a risky prefix. | Risk |
| 40012 | phone too long | This number is invalid because it is too long, even after the application of cleansing rules. | Risk |
| 40013 | blacklisted number | This number has been flagged as a source of fraud. | Risk |
| 40014 | high-risk country | The country code of this number is for a risky country, one that originates a disproportionate share of fraud attacks. | Risk |
| 40017 | number whitelisted by customer | The number has been flagged as safe. | Trust |
| 40018 | phone too short | This number is too short to be a valid phone number. | Risk |
| 40019 | prepaid number | This is a prepaid number. | Risk and trust |
| 40020 | fixed line number | This is a fixed line number. | Risk and trust |
| 40021 | personal number | Phone type is personal. | Risk and trust |

### Phone reason codes: ip

Returned in `risk_insights.ip`. Activity and attributes of the IP address you submitted, compared with a good user.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 50005 | high short-term activity | More than expected activity for this IP address over the last 24 hours. | Risk |
| 50006 | high long-term activity | More than expected activity for this IP address over the past 90 days. | Risk |
| 50009 | very high short-term activity | Very frequent changes of IP address attributes in verification traffic on this number over the past 24 hours. | Risk |
| 50010 | very high long-term activity | Very frequent changes of IP address attributes in verification traffic on this number over the past 90 days. | Risk |
| 50015 | anonymous proxy | This IP address is associated with anonymous proxies, which can help conceal the true origins of online traffic. | Risk |
| 50016 | VPN | This IP address is associated with virtual private networks (VPNs), which can help conceal the true origins of online traffic. | Risk |
| 50017 | hosting provider | This IP address is associated with web hosting servers, which have a pattern of activity different from genuine end users. | Risk |
| 50018 | TOR exit node | This IP address is associated with Tor anonymous browsers, which can help conceal the true origins of online traffic. | Risk |
| 50019 | whitelisted ip | The IP has been flagged as safe. | Trust |
| 50020 | blacklisted ip | The IP has been flagged as a source of fraud. | Risk |
| 50021 | ip-phone registered country mismatch | The country inferred from the submitted IP address does not match the country associated with the submitted phone number. | Risk |

### Phone reason codes: email

Returned in `risk_insights.email`. Activity and attributes of the email address you submitted with the phone number.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 60005 | high short-term activity | More than expected activity for this email address over the last 24 hours. | Risk |
| 60006 | high long-term activity | More than expected activity for this email address over the past 90 days. | Risk |
| 60009 | very high short-term activity | Very high volume of verification traffic on this email address over the past 24 hours. | Risk |
| 60010 | very high long-term activity | Very high volume of verification traffic on this email address over the past 90 days. | Risk |
| 60011 | machine-generated email | Behavior pattern that suggests this email address is being used by a software program. | Risk |
| 60012 | invalid email | This email address is invalid and could not have been used by a genuine end user. | Risk |
| 60013 | disposable email domain | This email address may have originated from a service providing temporary email addresses, which can be used to conceal the identity of the end user. | Risk |
| 60014 | whitelisted email | The email has been flagged as safe. | Trust |
| 60015 | blacklisted email | The email has been flagged as a source of fraud. | Risk |

The phone mapping page has no table for the `p2p` array, and it refers to the general Telesign code lists for phone type codes and phone type override reason codes (`phone_type.code`, `phone_type.override_reason_id`).

### Email reason codes: category

Returned in `intelligence_details.insights.category`.

| Code | Name | Meaning |
| --- | --- | --- |
| 10010 | low activity | Not enough activity or attributes to classify the transaction as either risky or trustworthy. |
| 10020 | low regular activity | Trustworthy category, based on past activity and available information. |
| 10021 | regular activity | Most trustworthy category, based on past activity and available information. |
| 10030 | low-risk irregular activity | Risky category, based on past activity and available information. |
| 10031 | medium-risk irregular activity | High-risk category, based on past activity and available information. |
| 10032 | high-risk irregular activity | Highest-risk category, based on past activity and available information. |

### Email reason codes: email_address activity

Returned in `intelligence_details.insights.email_address.activity`. How much activity was observed for the address, compared with normal email address behavior.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 60005 | high short-term activity | More than expected activity for this email address over the last 24 hours. | Risk |
| 60006 | high long-term activity | More than expected activity for this email address over the past 90 days. | Risk |
| 60009 | very high short-term activity | Very high volume of verification traffic on this email address over the past 24 hours. | Risk |
| 60010 | very high long-term activity | Very high volume of verification traffic on this email address over the past 90 days. | Risk |
| 60016 | sparse long-term activity | Sparse, regular volume of traffic on this email address over the past 90 days. | Trust |
| 60017 | continuous long-term activity | Continuous, regular volume of traffic on this email address over the past 90 days. | Trust |
| 60018 | low long-term activity | Low volume of traffic on this email address over the past 90 days. | - |
| 60019 | low short-term activity | Low volume of traffic on this email address over the past 24 hours. Very low volume, or none at all, over the past 90 days. | - |
| 60301 | high short-term username variation activity | More than expected activity for variations of this email address over the last 24 hours. | Risk |
| 60302 | high long-term username variation activity | More than expected activity for variations of this email address over the past 90 days. | Risk |
| 60303 | very high short-term username variation activity | Very high volume of traffic on variations of this email address over the past 24 hours. | Risk |
| 60304 | very high long-term username variation activity | Very high volume of traffic on variations of this email address over the past 90 days. | Risk |

### Email reason codes: email_address static

Returned in `intelligence_details.insights.email_address.static`. Fixed properties of the address that do not depend on recent volume or frequency.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 60011 | machine-generated email | Behavior pattern that suggests this email address is being used by a software program. | Risk |
| 60012 | invalid email | This email address is invalid and could not have been used by a genuine end user. | Risk |
| 60014 | whitelisted email | The email has been flagged as safe. | Trust |
| 60015 | blacklisted email | The email has been flagged as a source of fraud. | Risk |

### Email reason codes: email_address domain

Returned in `intelligence_details.insights.email_address.domain`. Codes about the address's domain, such as `gmail.com`.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 60013 | disposable email domain | This email address may have originated from a service providing temporary email addresses, which can be used to conceal the identity of the end user. | Risk |
| 60101 | very low risk domain | Domain shows strong trust signals based on registration and usage patterns. | Trust |
| 60102 | low risk domain | Domain shows low-risk characteristics based on registration and usage patterns. | Trust |
| 60103 | medium risk domain | Domain shows moderate risk characteristics based on registration and usage patterns. | Risk |
| 60104 | high risk domain | Domain shows high-risk characteristics based on registration and usage patterns. | Risk |
| 60105 | very high risk domain | Domain shows very high-risk characteristics based on registration and usage patterns. | Risk |

### Email reason codes: phone_number activity

Returned in `intelligence_details.insights.phone_number.activity`. This array carries the general activity codes, the recency codes and the range codes for the provided or related phone number.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 20002 | high long-term activity | More activity than expected on this number over the past 90 days. | Risk |
| 20003 | high short-term activity | More activity than expected on this number over the last 24 hours. | Risk |
| 20006 | sparse long-term activity | Low but regular verification traffic over the past 90 days. | Trust |
| 20007 | continuous long-term activity | Continuous, regular verification traffic over the past 90 days. | Trust |
| 20008 | very high long-term activity | Very high volume of verification traffic over the past 90 days. | Risk |
| 20009 | very high short-term activity | Very high volume of verification traffic over the past 24 hours. | Risk |
| 20010 | no activity | Very low or no verification traffic has ever been observed. | - |
| 20011 | low long-term activity | Low volume of verification traffic over the past 90 days. | - |
| 20012 | low short-term activity | Low activity in the last 24 hours and very low or none over 90 days. | - |
| 21003 | machine-like activity | Behavior suggests the number is being used by a bot or automated system. | Risk |
| 22001 | seen in the last 1 day | This number was seen in verification traffic in the last day. | - |
| 22007 | seen in the last 7 days | This number was seen in verification traffic in the last 7 days. | - |
| 22015 | seen in the last 15 days | This number was seen in verification traffic in the last 15 days. | - |
| 22101 | seen in the last 1 month | This number was seen in verification traffic in the last month. | - |
| 22102 | seen in the last 2 months | This number was seen in verification traffic in the last 2 months. | - |
| 22103 | seen in the last 3 months | This number was seen in verification traffic in the last 3 months. | - |
| 22203 | not seen in the last 3 months | This number was not seen in verification traffic in the last 3 months. | - |
| 20101 | no range activity | Very little activity, or none at all, for a risky range this number belongs to over the past 90 days. Also returned if the number does not belong to a risky range. | Trust |
| 20105 | high short-term range activity | Very significant activity for a risky range this number belongs to over the last 24 hours. | Risk |
| 20106 | high long-term range activity | Very significant activity for a risky range this number belongs to over the past 90 days. | Risk |
| 20107 | very high long-term range activity | Extremely significant activity for a risky range this number belongs to over the past 90 days. | Risk |
| 20108 | very high short-term range activity | Extremely significant activity for a risky range this number belongs to over the last 24 hours. | Risk |
| 21016 | machine-like range activity | Extremely high volume of verification traffic in a very short period (less than 1 hour) on the range this number belongs to. | Risk |

### Email reason codes: phone_number static

Returned in `intelligence_details.insights.phone_number.static`. Fixed properties of the phone number.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 40001 | premium number | This is a premium number. | Risk |
| 40002 | VOIP number | This is a VOIP number. | Risk |
| 40003 | toll-free number | This is a toll-free number. | Risk |
| 40004 | invalid number | This is an invalid number. | Risk |
| 40005 | payphone number | This number is associated with a payphone. | Risk |
| 40006 | voicemail number | This is a voicemail number. | Risk |
| 40007 | pager number | This number is associated with a pager. | Risk |
| 40008 | high-risk phone type | This number has another phone type that is risky and not covered by other number_type reason codes. | Risk |
| 40009 | high-risk carrier | This number is associated with a very risky carrier. | Risk |
| 40010 | medium-risk carrier | This number is associated with a risky carrier. | Risk |
| 40011 | high-risk prefix | This number has a risky prefix. | Risk |
| 40012 | phone too long | This number is invalid because it is too long, even after applying cleansing rules. | Risk |
| 40013 | blacklisted number | This number has been flagged as a source of fraud. | Risk |
| 40014 | high-risk country | The country code belongs to a risky country that originates a disproportionate share of fraud attacks. | Risk |
| 40015 | technical number | This number is used for special technical purposes by telecom companies, such as roaming. | - |
| 40016 | number used by application | Telesign reserved this number for customer application use, but it appears to be used for a different purpose. | Risk |
| 40017 | number whitelisted by customer | The number has been flagged as safe. | Trust |
| 40018 | phone too short | This number is too short to be a valid phone number. | Risk |
| 40019 | prepaid number | This is a prepaid number. | Risk and trust |
| 40020 | fixed line number | This is a fixed line number. | Risk and trust |
| 40021 | personal number | Phone type is personal. | Risk and trust |

### Email reason codes: ip_address activity

Returned in `intelligence_details.insights.ip_address.activity`.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 50005 | high short-term activity | More than expected activity for this IP address over the last 24 hours. | Risk |
| 50006 | high long-term activity | More than expected activity for this IP address over the past 90 days. | Risk |
| 50009 | very high short-term activity | Very frequent changes of IP address attributes in verification traffic over the past 24 hours. | Risk |
| 50010 | very high long-term activity | Very frequent changes of IP address attributes in verification traffic over the past 90 days. | Risk |

### Email reason codes: ip_address static

Returned in `intelligence_details.insights.ip_address.static`.

| Code | Name | Meaning | Signal |
| --- | --- | --- | --- |
| 50015 | anonymous proxy | This IP address is associated with anonymous proxies, which can help conceal the true origins of online traffic. | Risk |
| 50016 | VPN | This IP address is associated with virtual private networks (VPNs), which can help conceal the true origins of online traffic. | Risk |
| 50017 | hosting provider | This IP address is associated with web hosting servers, which have a pattern of activity different from genuine end users. | Risk |
| 50018 | TOR exit node | This IP address is associated with Tor anonymous browsers, which can help conceal the true origins of online traffic. | Risk |
| 50019 | whitelisted IP | The IP address has been flagged as safe. | Trust |
| 50020 | blacklisted IP | The IP address has been flagged as a source of fraud. | Risk |
| 50021 | ip-phone registered country mismatch | The country inferred from the submitted IP address does not match the country associated with the submitted phone number. | Risk |

## Verify Plus: risk screening before sending an OTP

Verify Plus is an add-on to SMS Verify and Voice Verify that is powered by Intelligence. Once it is active on the account, every verification request to a phone number in your configured countries is scored by Intelligence first, and the message or call is only sent when the risk is acceptable. You send nothing extra in the request, and you do not call the Intelligence API yourself; Telesign describes this as more efficient than a separate Intelligence call followed by a verify call.

How it behaves:

1. You send the usual verification request (`POST /v1/verify/sms` or `POST /v1/verify/call`).
2. The recipient's `phone_number` is passed to Intelligence, which calculates a risk recommendation.
3. The result is compared with your risk threshold. If the number is too risky the SMS or call is not sent, and the transaction gets `status.code` `233` ("Message blocked due to high risk score"). Otherwise the OTP is generated and sent as normal.
4. A blocked SMS is not charged as an SMS, but the Intelligence check is still charged. A blocked verification ends the flow; there is no code to check.

Where the risk result appears:

- **SMS Verify**: in the delivery callback, inside a `score_status` object with the packages `risk` (`score`, `level`, `recommendation`), `risk_insights` (`status`, `category`, `a2p`, `p2p`, `number_type`, `ip`, `email`), `phone_type` and `numbering`. The reason codes are the phone reason codes listed above. Telesign suggests reporting on the share of blocked versus allowed callbacks, optionally by country.
- **Voice Verify**: in the response body of the verify request itself, as the extra packages `phone_type`, `risk` and `numbering`.

Configuration:

- **Threshold**: the default risk threshold for self-service accounts is 601, which matches the start of the `block` range on the scale above. It can be customized, and you can set country-specific thresholds that override the default.
- **Countries**: you can exclude countries from Verify Plus checks or apply it to all traffic.
- **Activation**: for SMS Verify, Verify Plus is available for all account types including trial accounts and is activated as an add-on. For Voice Verify, ask Telesign Customer Support to enable it and agree a threshold with Telesign; that page states the product is for full-service accounts only.

Call Intelligence directly (and not Verify Plus) when you need the score for something other than sending an OTP, when you want to send IP, email, device or account signals with the check, or when you want to apply your own logic to the reason codes before deciding.

## Legacy on-prem Intelligence (Score) and migration

`intelligence_score_legacy` calls `POST https://rest-ww.telesign.com/v1/score/{complete_phone_number}`, the on-prem version of Intelligence. Telesign has deprecated it and states that migration to the Intelligence Cloud API is mandatory. Do not build new integrations on it.

Differences to handle when migrating to `intelligence_assess_risk`:

| | Legacy Score | Intelligence Cloud |
| --- | --- | --- |
| Host and path | `rest-ww.telesign.com/v1/score/{complete_phone_number}` | `detect.telesign.com/intelligence/phone` |
| Phone number | Path parameter `complete_phone_number` | Body parameter `phone_number` |
| Other parameters | `account_lifecycle_event` (required), `originating_ip`, `device_id`, `account_id`, `email_address`, `external_id` | The same names |
| Response | `risk`, `risk_insights`, `phone_type`, `carrier`, `location`, `numbering`, `blocklisting` | The same packages |

The request parameters, the response packages and the documented status codes are otherwise the same, so migration is mostly a change of URL and of where the phone number is passed.

## Intelligence Exceptions API (no MCP tool)

The Intelligence Exceptions API manages static exceptions for your account. An exception overrides the risk treatment for a matching phone number, IP address and/or email address: a whitelist exception applies a score value of `1`, a blacklist exception applies `1000`. All requests are scoped to your own account. This server has no tool for it; the endpoints are listed so you know what exists and can call them from your own code.

Base URLs (the region is chosen by the host you call, not by a request field; exceptions are stored in the region where they were created, are only reachable through that regional endpoint and are not replicated):

| Region | Scope | Base URL |
| --- | --- | --- |
| ALL | Global, no data-residency restriction (default) | `https://static-exceptions.telesign.com/v1` |
| EU | Data stored and processed within the European Union | `https://static-exceptions-eu.telesign.com/v1` |
| US | Data stored and processed within the United States | `https://static-exceptions-us.telesign.com/v1` |

Telesign notes that production base URLs for each region are provided separately and that the exact authentication scheme (the docs show Basic in the `Authorization` header) is confirmed during onboarding. Requests and responses are `application/json`.

| Operation | Endpoint | Notes |
| --- | --- | --- |
| List exceptions | `GET /v1/intelligence-exceptions` | Paginated. Query: `page` (min 1, default 1), `size` (1-100, default 50). Returns `items`, `total`, `page`, `page_size`. |
| List by phone number | `GET /v1/intelligence-exceptions?phone_number=...` | Returns only exceptions for that number (max 30 characters). The number is normalized, so spaces and a leading `+` are ignored. No match returns `200` with an empty `items` array; an unusable number returns `422`. |
| Create an exception | `POST /v1/intelligence-exceptions` | Only `exception_type` is required. |
| Retrieve an exception | `GET /v1/intelligence-exceptions/{exception_id}` | `exception_id` is a UUID. |
| Update an exception | `PUT /v1/intelligence-exceptions/{exception_id}` | Full update; same body as create. |
| Change exception status | `PATCH /v1/intelligence-exceptions/{exception_id}` | Body `{"active": true}` or `{"active": false}` to activate or deactivate. |

Body fields for create and update:

| Field | Required | Description |
| --- | --- | --- |
| `exception_type` | yes | `1` = whitelisted by customer, `2` = blacklisted by customer. |
| `phone_number` | no | Phone number to match (max 30 characters). |
| `phone_country_iso2` | no | ISO 3166-1 alpha-2 country code for the phone number. |
| `phone_number_prefix` | no | Phone number prefix to match (max 30 characters). |
| `ip_address` | no | IPv4 or IPv6 address to match. |
| `ip_country_iso2` | no | ISO 3166-1 alpha-2 country code for the IP address. |
| `email_address` | no | Email address to match. |
| `email_domain` | no | Email domain to match. |
| `comment` | no | Free-text note. |
| `active` | no | Whether the exception is active on creation. Default `true`. |
| `valid_from` | no | Format `YYYY-MM-DDTHH:MMZ`. When null it is set to the creation time. |
| `valid_until` | no | Format `YYYY-MM-DDTHH:MMZ`. When null it is set automatically: 2 years when the exception contains PII such as a phone number or email address, 5 years when it does not. |

The exception object returned by every endpoint also contains the service-set fields `exception_id`, `org_name`, `sub_org_name`, `intelligence_score_value` (`"1"` or `"1000"`, derived from `exception_type`), `created_by`, `created_on_utc` and `updated_on_utc` (empty string if never updated).

Response codes: `200` success, `401` authentication failed or missing, `404` exception not found or not available to your account, `422` validation error (the body names the offending fields), `429` rate limit exceeded, `500` unexpected server error, `503` temporarily unavailable.

The reason-code tables above include codes for identifiers flagged as safe or as a source of fraud (`40017` / `40013` for numbers, `50019` / `50020` for IPs, `60014` / `60015` for emails).

## Callbacks

Intelligence Cloud, Email Intelligence and legacy Score are synchronous: the full result is in the response and no callback is sent. The only callback that carries Intelligence data is the SMS Verify delivery callback when Verify Plus is active (the `score_status` object described above; schema in `reference/callbacks`).

## Requirements and limits

- **Enablement**: Intelligence and Email Intelligence must be enabled for your account; without it you get `10012`. The Email Intelligence extended response, the `blocklisting` package, `carrier.carrier_id` and the phone type override fields are each enabled separately by Telesign.
- **Billing**: every request is charged, including test requests made with your credentials. With Verify Plus the Intelligence check is charged even when the SMS is blocked.
- **Trial accounts**: an unverified phone number is rejected with `10033`.
- **Encoding**: only UTF-8 input is accepted. Requests are form-encoded; the server handles this for you.
- **Rate limits**: Telesign's default rate limits by product apply; exceeding them returns `10019` (HTTP 429).
- **IP address**: send the end user's IP in `originating_ip`, never your own server's.
- **Insights**: reason codes are an option on the account. If the arrays are empty or `risk_insights.status` is `803`, rely on `risk.score` alone.
- **Customization**: custom labels, custom models and Verify Plus thresholds are arranged with Telesign, not set per request.
- **Migration**: the on-prem `/v1/score` endpoint is deprecated; moving to `detect.telesign.com/intelligence/phone` is mandatory.

## Related

- Guides: `phone-id` (number facts without a risk score), `verify-api` (verification flows), `deactivated-numbers` (bulk deactivated number files), `best-practices`, `error-codes`.
- Tool reference: `docs_get_tool_reference("intelligence_assess_risk")`, `docs_get_tool_reference("intelligence_assess_email")`, `docs_get_tool_reference("intelligence_score_legacy")`.
- Telesign pages:
  - https://developer.telesign.com/enterprise/docs/intelligence-cloud-overview
  - https://developer.telesign.com/enterprise/docs/intelligence-cloud-get-started
  - https://developer.telesign.com/enterprise/docs/intelligence-cloud-insights-reason-code-mappings
  - https://developer.telesign.com/enterprise/docs/email-intelligence-overview
  - https://developer.telesign.com/enterprise/docs/email-intelligence-get-started
  - https://developer.telesign.com/enterprise/docs/email-intelligence-insights-reason-code-mappings
  - https://developer.telesign.com/enterprise/docs/intelligence-exceptions-api
  - https://developer.telesign.com/enterprise/docs/sms-verify-api-screen-recipients-using-verify-plus
  - https://developer.telesign.com/enterprise/docs/voice-verify-api-screen-recipients-using-verify-plus
  - https://developer.telesign.com/enterprise/reference/submitphonenumberforintelligencecloud
  - https://developer.telesign.com/enterprise/reference/submitemailaddressforemailintelligence
  - https://developer.telesign.com/enterprise/reference/submitemailaddressforemailintelligenceextendedresponse
  - https://developer.telesign.com/enterprise/reference/submitphonenumberforintelligence
