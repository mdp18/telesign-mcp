# Intelligence Cloud API Documentation

## Overview

TeleSign Intelligence provides real-time fraud risk scoring for phone numbers. Submit a phone number (and optionally IP address and email) to receive a risk recommendation.

**Note:** This is the Intelligence Cloud API. The legacy on-prem Intelligence API is deprecated.

## Endpoint

```
POST https://detect.telesign.com/intelligence/phone
```

## Use Cases

- Screen new account registrations
- Assess login attempts for suspicious activity
- Evaluate high-value transactions
- Detect account takeover attempts
- Identify synthetic identities
- Prevent International Revenue Share Fraud (IRSF)

## Request Parameters

| Parameter               | Required | Type   | Description                        |
| ----------------------- | -------- | ------ | ---------------------------------- |
| phone_number            | Yes      | string | E.164 format phone number          |
| account_lifecycle_event | Yes      | string | Type of event being evaluated      |
| originating_ip          | No       | string | User's IP address                  |
| email_address           | No       | string | User's email for cross-referencing |
| device_id               | No       | string | Device identifier                  |
| account_id              | No       | string | Your internal account ID           |

### account_lifecycle_event Values

| Value    | When to Use                |
| -------- | -------------------------- |
| create   | New account registration   |
| sign-in  | User login attempt         |
| transact | Financial transaction      |
| update   | Account information change |
| delete   | Account deletion request   |

## Risk Score Interpretation

| Score Range | Risk Level  | Typical Action               |
| ----------- | ----------- | ---------------------------- |
| 0-250       | Very Low    | Allow                        |
| 251-500     | Low         | Allow                        |
| 501-650     | Medium      | Flag for review              |
| 651-800     | Medium-High | Additional verification      |
| 801-900     | High        | Block or strong verification |
| 901-1000    | Very High   | Block                        |

## Risk Recommendations

| Recommendation | Description               | Suggested Action                     |
| -------------- | ------------------------- | ------------------------------------ |
| allow          | Low risk transaction      | Proceed normally                     |
| flag           | Medium risk, needs review | Proceed but monitor, add friction    |
| block          | High risk transaction     | Do not proceed, require verification |

## Example Request

```bash
POST /intelligence/phone HTTP/1.1
Host: detect.telesign.com
Authorization: TSA {customer_id}:{signature}
Date: Wed, 15 Jan 2024 10:30:00 GMT
Content-Type: application/json
X-TS-Auth-Method: HMAC-SHA256

{
  "phone_number": "15555551212",
  "account_lifecycle_event": "create",
  "originating_ip": "203.0.113.45",
  "email_address": "user@example.com"
}
```

## Example Response

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "updated_on": "2024-01-15T10:30:34.860418Z",
    "code": 300,
    "description": "Transaction successfully completed"
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
        "cleansed_code": 100
      },
      "sms": {
        "country_code": "1",
        "phone_number": "5555551212",
        "cleansed_code": 100
      }
    }
  },
  "phone_type": {
    "code": "5",
    "description": "VOIP"
  },
  "carrier": {
    "name": "Google Voice"
  },
  "location": {
    "city": "Countrywide",
    "country": {
      "name": "United States",
      "iso2": "US",
      "iso3": "USA"
    }
  },
  "risk": {
    "level": "high",
    "recommendation": "block",
    "score": 820
  }
}
```

## Insights Reason Codes

When Insights is enabled, responses include reason codes explaining risk factors:

### Category Codes (Overall Risk)

These provide the overall risk conclusion:

- Category codes place the transaction in a risk category
- Based on weighting risk and trust signals from other codes

### Phone Type Codes

Reason codes related to phone number type:

- Fixed line, mobile, prepaid
- VoIP indicators
- Invalid number detection

### A2P (Application-to-Person) Codes

Related to automated messaging patterns:

- Verification code activity
- Appointment reminders
- Alert patterns

### Velocity Codes

Related to activity volume:

- High recent activity
- Risky range activity
- Unusual patterns

### Risky Services Codes

Contact with known risky services:

- Numbers flagged by fraud detection services
- Blocklist matches

## Integration Patterns

### Registration Flow

```
1. User submits phone number
2. Call Intelligence API with account_lifecycle_event: "create"
3. If recommendation is "allow" → proceed to verification
4. If recommendation is "flag" → proceed with enhanced verification
5. If recommendation is "block" → reject registration
```

### Transaction Flow

```
1. User initiates high-value transaction
2. Call Intelligence API with account_lifecycle_event: "transact"
3. Include originating_ip for better accuracy
4. Apply step-up authentication based on risk level
```

## Best Practices

1. **Always include IP address** - Significantly improves accuracy
2. **Use appropriate lifecycle event** - Different events have different risk models
3. **Don't expose risk scores to users** - Reveals your fraud detection logic
4. **Combine with Phone ID** - Get complete picture of the number
5. **Log reference IDs** - Essential for support and disputes
6. **Set appropriate thresholds** - Adjust based on your risk tolerance
7. **Monitor false positives** - Tune your acceptance criteria over time
8. **Include email when available** - Cross-referencing improves accuracy
