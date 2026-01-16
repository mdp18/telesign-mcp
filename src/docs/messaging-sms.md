# Messaging (SMS) API Documentation

## Overview

The TeleSign Messaging API allows you to send SMS messages globally. It supports transactional messages (OTP, alerts) and marketing messages, with options for MMS, RCS, WhatsApp, and Viber.

## Endpoint

```
POST https://rest-ww.telesign.com/v1/messaging
```

## Request Parameters

| Parameter    | Required | Type   | Description                      |
| ------------ | -------- | ------ | -------------------------------- |
| phone_number | Yes      | string | E.164 format phone number        |
| message      | Yes      | string | Message content (max 1600 chars) |
| message_type | Yes      | string | OTP, ARN, or MKT                 |
| sender_id    | No       | string | Custom sender ID (if enabled)    |
| callback_url | No       | string | Webhook URL for delivery status  |
| external_id  | No       | string | Your internal reference ID       |

## Message Types

| Type | Name                             | Use Case               | Consent Required |
| ---- | -------------------------------- | ---------------------- | ---------------- |
| OTP  | One-Time Passcode                | Verification codes     | No               |
| ARN  | Alerts, Reminders, Notifications | Transactional messages | Implied\*        |
| MKT  | Marketing                        | Promotional content    | Yes (explicit)   |

\*ARN messages should have implied consent from an existing business relationship.

## Example Request

```bash
POST /v1/messaging HTTP/1.1
Host: rest-ww.telesign.com
Authorization: TSA {customer_id}:{signature}
Date: Mon, 15 Jan 2024 10:30:00 GMT
Content-Type: application/json

{
  "phone_number": "15555551212",
  "message": "Your verification code is 123456. Valid for 5 minutes.",
  "message_type": "OTP"
}
```

## Example Response

```json
{
  "reference_id": "MSG123ABC456DEF789012345678",
  "status": {
    "code": 290,
    "description": "Message in progress",
    "updated_on": "2024-01-15T10:30:00.000000Z"
  }
}
```

## Character Limits & Encoding

### GSM-7 Encoding (Standard Characters)

- **Single segment:** 160 characters
- **Multi-segment:** 153 characters per segment (7 chars for header)
- **Supported:** A-Z, a-z, 0-9, common punctuation, spaces

### Unicode Encoding (Emojis, Special Characters)

- **Single segment:** 70 characters
- **Multi-segment:** 67 characters per segment
- **Required for:** emojis, Chinese, Arabic, Cyrillic, etc.

### Segment Calculation Examples

| Message Length (GSM-7) | Segments |
| ---------------------- | -------- |
| 1-160 chars            | 1        |
| 161-306 chars          | 2        |
| 307-459 chars          | 3        |

| Message Length (Unicode) | Segments |
| ------------------------ | -------- |
| 1-70 chars               | 1        |
| 71-134 chars             | 2        |
| 135-201 chars            | 3        |

## Delivery Status Codes

### Successful Delivery

| Code | Description                  |
| ---- | ---------------------------- |
| 200  | Delivered to handset         |
| 203  | Delivered to gateway         |
| 290  | Message in progress          |
| 291  | Callback received            |
| 292  | Transaction callback timeout |

### Delivery Failures

| Code | Description                            | Typical Cause                    |
| ---- | -------------------------------------- | -------------------------------- |
| 207  | Error delivering to handset            | Phone off, no signal             |
| 210  | Temporary phone error                  | Retry may succeed                |
| 211  | Permanent phone error                  | Invalid number                   |
| 220  | Gateway/network error                  | Carrier issue                    |
| 221  | Message expired                        | Not delivered in validity period |
| 222  | Message cancelled                      | Cancelled by request             |
| 230  | Spam detected                          | Content filtered by carrier      |
| 231  | Content blocked                        | Carrier rejected content         |
| 233  | Message blocked due to high risk score | Verify Plus blocked              |
| 250  | Final status unknown                   | No delivery receipt              |
| 286  | Transaction not attempted              | Internal error                   |
| 290  | Message in progress                    | Still being delivered            |

## Callback Service

Receive delivery status updates via webhook:

### Enable Callbacks

Include `callback_url` in your request:

```json
{
  "phone_number": "15555551212",
  "message": "Your code is 123456",
  "message_type": "OTP",
  "callback_url": "https://yoursite.com/sms-callback"
}
```

### Callback Payload

```json
{
  "reference_id": "MSG123ABC456DEF789012345678",
  "status": {
    "code": 200,
    "description": "Delivered to handset",
    "updated_on": "2024-01-15T10:30:05.000000Z"
  },
  "submit_timestamp": "2024-01-15T10:30:00.000000Z",
  "errors": [],
  "additional_info": {
    "message_parts_count": 1,
    "price": "0.0075",
    "currency": "USD",
    "mcc": "310",
    "mnc": "004"
  }
}
```

## Sender ID

Custom sender IDs display your brand name instead of a phone number.

| Region    | Support | Requirements                |
| --------- | ------- | --------------------------- |
| US/Canada | Limited | 10DLC registration required |
| UK        | Yes     | Pre-registration            |
| EU        | Yes     | Pre-registration            |
| India     | Yes     | DLT registration            |
| Australia | Yes     | Pre-registration            |

Contact TeleSign to set up a sender ID.

## Compliance Requirements

### US (TCPA)

- Obtain prior express consent
- Honor opt-out requests immediately (STOP)
- Include business identification
- Respect quiet hours (before 8am / after 9pm local)

### EU (GDPR)

- Explicit consent for marketing
- Clear opt-out mechanism
- Data retention limits
- Right to be forgotten

### General

- Include opt-out instructions for marketing (MKT)
- Process STOP/UNSUBSCRIBE immediately
- Maintain suppression lists
- Don't send to Do Not Call lists

## Best Practices

1. **Choose correct message type**

   - OTP: verification codes only
   - ARN: order updates, alerts, appointment reminders
   - MKT: promotional content only

2. **Keep messages concise**

   - Stay within single segment when possible
   - Reduces cost and improves delivery

3. **Test before production**

   - Send to your own number first
   - Verify character encoding

4. **Monitor delivery rates**

   - Track by carrier and region
   - Investigate sudden drops

5. **Handle failures gracefully**

   - Implement retry for temporary failures
   - Have fallback channels

6. **Respect user preferences**
   - Honor opt-outs immediately
   - Don't over-message
