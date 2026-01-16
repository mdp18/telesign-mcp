# Phone ID API Documentation

## Overview

Phone ID returns detailed information about a phone number including type, carrier, and location. Use it to validate phone numbers, detect fraud risks, and optimize message delivery.

## Endpoint

```
POST https://rest-ww.telesign.com/v1/phoneid/{complete_phone_number}
```

Alternative (phone number in request body):

```
POST https://rest-ww.telesign.com/v1/phoneid
```

## Use Cases

- Validate phone numbers during user registration
- Detect VoIP/virtual numbers that may indicate fraud
- Route messages appropriately (SMS vs voice)
- Enrich customer data with carrier/location info
- Filter out invalid or unreachable numbers
- Block high-risk phone types (VoIP, prepaid)

## Request Parameters

| Parameter               | Required | Type   | Description                                              |
| ----------------------- | -------- | ------ | -------------------------------------------------------- |
| phone_number            | Yes      | string | E.164 format phone number (in URL or body)               |
| account_lifecycle_event | No       | string | Event type: create, sign-in, transact, update, delete    |
| originating_ip          | No       | string | User's IP address for additional context                 |
| addons                  | No       | object | Identity attributes to request (contact, sim_swap, etc.) |

## Phone Type Codes

| Code | Type       | Description       | Can Receive SMS |
| ---- | ---------- | ----------------- | --------------- |
| 1    | FIXED_LINE | Landline phone    | No              |
| 2    | MOBILE     | Mobile phone      | Yes             |
| 3    | PREPAID    | Prepaid mobile    | Yes             |
| 4    | TOLL_FREE  | Toll-free number  | No              |
| 5    | VOIP       | Voice over IP     | Maybe\*         |
| 6    | PAGER      | Pager device      | No              |
| 7    | PAYPHONE   | Public payphone   | No              |
| 8    | INVALID    | Invalid number    | No              |
| 9    | RESTRICTED | Restricted number | Unknown         |
| 10   | PERSONAL   | Personal number   | Yes             |
| 11   | VOICEMAIL  | Voicemail service | No              |
| 12   | OTHER      | Other type        | Unknown         |

\*VoIP numbers may or may not receive SMS depending on the provider. Code "5" is commonly used to identify potentially fraudulent numbers.

## Example Request

```bash
POST /v1/phoneid/15555551212 HTTP/1.1
Host: rest-ww.telesign.com
Authorization: TSA {customer_id}:{signature}
Date: Tue, 31 Jan 2024 14:51:26 GMT
Content-Type: application/json
X-TS-Auth-Method: HMAC-SHA256

{
  "account_lifecycle_event": "create",
  "originating_ip": "203.0.113.45"
}
```

## Example Response

```json
{
  "reference_id": "F0123456789ABCDEF0123456789ABCDE",
  "status": {
    "updated_on": "2024-01-15T14:51:28.709526Z",
    "code": 300,
    "description": "Transaction successfully completed"
  },
  "phone_type": {
    "code": "2",
    "description": "MOBILE"
  },
  "carrier": {
    "name": "Verizon Wireless"
  },
  "location": {
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90001",
    "metro_code": "12345",
    "county": "Los Angeles",
    "country": {
      "name": "United States",
      "iso2": "US",
      "iso3": "USA"
    },
    "coordinates": {
      "latitude": 34.0522,
      "longitude": -118.2437
    },
    "time_zone": {
      "name": "America/Los_Angeles",
      "utc_offset_min": "-8",
      "utc_offset_max": "-8"
    }
  },
  "numbering": {
    "original": {
      "complete_phone_number": "15555551212",
      "country_code": "1",
      "phone_number": "5555551212"
    },
    "cleansing": {
      "call": {
        "country_code": "1",
        "phone_number": "5555551212",
        "cleansed_code": 100,
        "min_length": 10,
        "max_length": 10
      },
      "sms": {
        "country_code": "1",
        "phone_number": "5555551212",
        "cleansed_code": 100,
        "min_length": 10,
        "max_length": 10
      }
    }
  }
}
```

## Identity Attributes (Add-ons)

Additional attributes can be requested via the `addons` parameter:

| Attribute           | Description                                 |
| ------------------- | ------------------------------------------- |
| contact             | Name and address associated with the number |
| contact_match       | Match score for provided contact info       |
| subscriber_status   | Active/inactive status                      |
| number_deactivation | Deactivation date if applicable             |
| sim_swap            | SIM swap detection                          |
| porting_status      | Number porting information                  |
| porting_history     | Historical porting data                     |
| call_forwarding     | Call forwarding detection                   |
| active_call_status  | Whether phone is on a call                  |

### Example with Add-ons

```json
{
  "account_lifecycle_event": "create",
  "addons": {
    "contact": {},
    "sim_swap": {}
  }
}
```

## Status Codes

| Code | Description                        | Action                       |
| ---- | ---------------------------------- | ---------------------------- |
| 300  | Transaction successfully completed | Success - use the data       |
| 301  | Transaction partially completed    | Some data available          |
| 500  | Transaction not attempted          | Retry with backoff           |
| 501  | Not authorized                     | Check credentials            |
| 502  | Invalid parameter                  | Fix request parameters       |
| 503  | Invalid phone number               | Validate phone number format |
| 599  | System error                       | Contact TeleSign support     |

## Cleansing Codes

| Code | Description                                        |
| ---- | -------------------------------------------------- |
| 100  | Number is valid and dialable                       |
| 101  | Number is valid but formatting was corrected       |
| 102  | Number is valid for the country but format unknown |
| 103  | Number is possibly valid but unconfirmed           |
| 104  | Number is not valid                                |
| 105  | Number prefix is not valid                         |

## Best Practices

1. **Always validate before sending SMS** - Check phone_type to avoid sending to landlines (code 1)
2. **Cache results** - Phone information changes infrequently; cache for 24-48 hours
3. **Block VoIP for sensitive operations** - phone_type code "5" indicates VoIP
4. **Use cleansed numbers** - The cleansing.sms.phone_number is formatted for optimal delivery
5. **Handle partial results** - Status 301 means some data is available
6. **Check for prepaid** - phone_type code "3" may indicate higher fraud risk
