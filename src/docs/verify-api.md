# Verify API Documentation

## Overview

The TeleSign Verify API provides multi-channel one-time passcode (OTP) verification for multi-factor authentication (MFA). Send verification codes via SMS, Voice, WhatsApp, Viber, RCS, or Email with automatic fallback support.

## Endpoints

| Action      | Method | Endpoint                                                      |
| ----------- | ------ | ------------------------------------------------------------- |
| Send OTP    | POST   | https://verify.telesign.com/verification                      |
| Verify Code | PATCH  | https://verify.telesign.com/verification/{reference_id}/state |
| Get Status  | GET    | https://verify.telesign.com/verification/{reference_id}       |

## Supported Channels

| Channel  | verify_method | Best For                               |
| -------- | ------------- | -------------------------------------- |
| SMS      | sms           | Most users, fastest delivery           |
| Voice    | voice         | Accessibility, landlines, backup       |
| WhatsApp | whatsapp      | International users, rich messaging    |
| Viber    | viber         | Eastern Europe, Asia                   |
| RCS      | rcs           | Android users with RCS support         |
| Email    | email         | Backup channel, non-phone verification |

## Send OTP Request

### Parameters

| Parameter              | Required | Type   | Description                                          |
| ---------------------- | -------- | ------ | ---------------------------------------------------- |
| recipient              | Yes      | object | Recipient contact information                        |
| recipient.phone_number | Yes      | string | E.164 format phone number                            |
| recipient.email        | No       | string | Email address (required if using email channel)      |
| verification_policy    | Yes      | array  | Array of verification methods with optional fallback |

### Verification Policy Object

| Field         | Required | Type   | Description                                      |
| ------------- | -------- | ------ | ------------------------------------------------ |
| method        | Yes      | string | Channel: sms, voice, whatsapp, viber, rcs, email |
| fallback_time | No       | number | Seconds to wait before trying next channel       |

### Example Request

```bash
POST /verification HTTP/1.1
Host: verify.telesign.com
Authorization: Basic {base64(customer_id:api_key)}
Accept: application/json
Content-Type: application/json

{
  "recipient": {
    "phone_number": "15555551212",
    "email": "user@example.com"
  },
  "verification_policy": [
    { "method": "sms", "fallback_time": 30 },
    { "method": "rcs", "fallback_time": 60 },
    { "method": "whatsapp", "fallback_time": 50 },
    { "method": "email" },
    { "method": "voice" }
  ]
}
```

### Example Response

```json
{
  "reference_id": "VERIFY123ABC456DEF789",
  "status": {
    "code": 1900,
    "description": "Verification request was successfully sent"
  }
}
```

## Verify Code Request

### Parameters

| Parameter       | Required | Type   | Description              |
| --------------- | -------- | ------ | ------------------------ |
| action          | Yes      | string | Must be "finalize"       |
| security_factor | Yes      | string | OTP code entered by user |

### Example Request

```bash
PATCH /verification/VERIFY123ABC456DEF789/state HTTP/1.1
Host: verify.telesign.com
Authorization: Basic {base64(customer_id:api_key)}
Accept: application/json
Content-Type: application/json

{
  "action": "finalize",
  "security_factor": "123456"
}
```

### Successful Verification Response

```json
{
  "reference_id": "VERIFY123ABC456DEF789",
  "status": {
    "code": 3900,
    "description": "Verified"
  }
}
```

### Failed Verification Response - Retries Available

```json
{
  "reference_id": "VERIFY123ABC456DEF789",
  "status": {
    "code": 3904,
    "description": "Verification Failed"
  }
}
```

### Failed Verification Response - No Retries Available

```json
{
  "reference_id": "VERIFY123ABC456DEF789",
  "status": {
    "code": 3909,
    "description": "Invalid code entered"
  }
}
```

## Get Verification Status

Retrieve details about a verification process in progress, including channel-by-channel delivery status.

### Path Parameters

| Parameter    | Required | Type   | Description                                      |
| ------------ | -------- | ------ | ------------------------------------------------ |
| reference_id | Yes      | string | Reference ID returned when verification started  |

### Example Request

```bash
GET /verification/VERIFY123ABC456DEF789 HTTP/1.1
Host: verify.telesign.com
Authorization: Basic {base64(customer_id:api_key)}
Accept: application/json
```

### Example Response (Verification in Progress)

```json
{
  "reference_id": "566ADDD5E29C01509333C9A480E51085",
  "state": "ONGOING",
  "created_on": "2025-11-24T20:02:00.493000Z",
  "updated_on": "2025-11-24T20:02:03.247000Z",
  "recipient": {
    "email": "testuser@gmail.com",
    "phone_number": "12065559191"
  },
  "inner_methods": [
    {
      "method": "rcs",
      "state": "ONGOING",
      "err_code": 3000,
      "err_msg": "Delivered",
      "tried_on": "2025-11-24T20:02:00.513000Z",
      "updated_on": "2025-11-24T20:02:03.247000Z"
    },
    {
      "method": "sms",
      "state": "CREATED"
    },
    {
      "method": "email",
      "state": "CREATED"
    }
  ],
  "verification_policy": [
    { "method": "rcs", "fallback_time": 30 },
    { "method": "sms", "fallback_time": 30 },
    { "method": "email", "fallback_time": 300 }
  ]
}
```

### Channel States

| State    | Description                                                |
| -------- | ---------------------------------------------------------- |
| CREATED  | Initial status, channel not yet attempted                  |
| ONGOING  | Message sent to gateway, awaiting delivery confirmation    |
| REJECTED | Carrier or gateway rejected the message                    |
| FAILED   | Channel failed, moving to next fallback (if available)     |
| VERIFIED | Verification completed successfully via this channel       |
| CANCELED | Verification was canceled                                  |

### Channel Error Codes

| Code | Description                                          |
| ---- | ---------------------------------------------------- |
| 3000 | Delivered                                            |
| 3001 | Message in progress                                  |
| 3003 | Delivery error                                       |
| 3055 | Delivery channel not supported by end user's device  |
| 3056 | Message failed to deliver in specified fallback time |
| 3901 | Request in progress                                  |

### Error Responses

| Code | Description                                      |
| ---- | ------------------------------------------------ |
| 3101 | Invalid value for parameter phone_number         |
| 3110 | Invalid request - malformed JSON or request      |
| 3400 | Not authorized                                   |
| 3204 | Rate Limit Exceeded                              |
| 3500 | System Unavailable - retry the request           |
| 3906 | Unified Verification Product not enabled         |

## Status Codes

### Send OTP Status Codes

| Code | Description                            |
| ---- | -------------------------------------- |
| 1900 | Verification request successfully sent |
| 1901 | Invalid request                        |
| 1902 | Phone number not provided              |
| 1903 | Invalid phone number                   |

### Verify Code Status Codes

| Code | Description          | User Action                                           |
| ---- | -------------------- | ----------------------------------------------------- |
| 3900 | Verified             | Success - proceed with authentication                 |
| 3904 | Verification Failed  | OTP doesn't match, retries available - re-enter code  |
| 3909 | Invalid code entered | OTP doesn't match after 3 attempts - request new code |

## Verification Flow

```
┌─────────────────┐
│ User enters     │
│ phone number    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ POST            │────▶│ TeleSign sends  │
│ /verification   │     │ OTP via channel │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Store           │
│ reference_id    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User receives   │
│ and enters OTP  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐     ┌─────────────────┐
│ PATCH                   │────▶│ TeleSign        │
│ /verification/          │     │ verifies code   │
│ {reference_id}/state    │     └────────┬────────┘
└────────┬────────────────┘              │
         │                               ▼
         │                      ┌─────────────────┐
         └─────────────────────▶│ Check status    │
                                │ code: 3900 = OK │
                                └─────────────────┘
```

## Fallback Configuration

Configure automatic fallback in the `verification_policy` array. Each channel can specify `fallback_time` in seconds before trying the next channel.

Example sequence:

```json
{
  "verification_policy": [
    { "method": "sms", "fallback_time": 30 },
    { "method": "voice", "fallback_time": 45 },
    { "method": "whatsapp" }
  ]
}
```

1. Try SMS (primary)
2. If no delivery after 30 seconds → try Voice
3. If voice fails after 45 seconds → try WhatsApp (final)

## Supported Languages

| Code  | Language             |
| ----- | -------------------- |
| en-US | English (US)         |
| en-GB | English (UK)         |
| es-ES | Spanish (Spain)      |
| es-MX | Spanish (Mexico)     |
| fr-FR | French               |
| de-DE | German               |
| pt-BR | Portuguese (Brazil)  |
| zh-CN | Chinese (Simplified) |
| ja-JP | Japanese             |
| ko-KR | Korean               |
| it-IT | Italian              |
| ru-RU | Russian              |
| ar-SA | Arabic               |
| hi-IN | Hindi                |

## Best Practices

1. **Validate with Phone ID first** - Ensure number can receive messages
2. **Implement rate limiting** - Prevent OTP flooding/abuse
3. **Use generic error messages** - Don't reveal if number exists
4. **Log reference IDs** - Essential for troubleshooting
5. **Set appropriate timeouts** - Balance security vs convenience
6. **Use failover** - Improve delivery success rates
7. **Monitor by carrier/region** - Track delivery performance

## Additional Verification Methods

### Silent Verify

Verify users seamlessly in the background without OTP entry. Available via TeleSign mobile SDKs for Android and iOS.

### Push Verify

Send push notifications to registered mobile apps. Requires TeleSign Verify SDK integration.

Contact TeleSign for SDK access and documentation.
