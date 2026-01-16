# TeleSign API Overview

TeleSign provides APIs for phone number verification, fraud prevention, and programmable communications. This documentation covers the core products available through the TeleSign MCP server.

## Core Products

### Phone ID

Get detailed information about any phone number:

- Phone type (mobile, landline, VoIP, prepaid, etc.)
- Carrier/operator information
- Location data (city, state, country, time zone)
- Number validation and cleansing
- Identity attributes (contact info, SIM swap, porting status)

**Endpoint:** `POST https://rest-ww.telesign.com/v1/phoneid/{phone_number}`

### Intelligence Cloud

Real-time fraud risk scoring for phone numbers:

- Risk scores from 0-1000 (higher = riskier)
- Risk levels: low, medium, medium-high, high, very high
- Recommendations: allow, flag, block
- Insights reason codes explaining risk factors
- Supports phone number, IP address, and email evaluation

**Endpoint:** `POST https://detect.telesign.com/intelligence/phone`

### Verify API

Multi-channel one-time passcode (OTP) verification:

- Channels: SMS, Voice, WhatsApp, Viber, RCS, Email
- Automatic failover between channels
- Code generation and validation
- Silent Verify and Push Verify (via mobile SDKs)

**Endpoint:** `POST https://verify.telesign.com/verification`

### Messaging (SMS)

Send text messages globally:

- Transactional messages (OTP, alerts, notifications)
- Marketing messages
- Support for MMS, RCS, WhatsApp, Viber

**Endpoint:** `POST https://rest-ww.telesign.com/v1/messaging`

## Authentication

TeleSign APIs support two authentication methods:

### Basic Authentication

Simple base64 encoding of credentials. Easier to implement but less secure.
Authorization: Basic {base64(customer_id:api_key)}

### Digest Authentication (HMAC-SHA256)

More secure, recommended for production. Requires:

- `Authorization: TSA {customer_id}:{signature}`
- `Date` or `x-ts-date`: RFC 2822 formatted timestamp (within ±15 minutes)
- `x-ts-auth-method: HMAC-SHA256`
- `Content-Type`: application/json or application/x-www-form-urlencoded

The signature is created by HMAC-SHA256 signing a string containing the HTTP method, content type, date, and request body.

### Credentials

- **Customer ID**: UUID format (e.g., FFFFFFFF-EEEE-DDDD-1234-AB1234567890)
- **API Key**: Base64-encoded secret key

Find your credentials at: [TeleSign Portal](https://portal.telesign.com) for Self-Service customers or [Enterprise TeleSign Portal](https://teleportal.telesign.com/auth/login/?next=) for Enterprise Customers see support article "How do I find my Customer ID and API Key?"

## Phone Number Format

Always use **E.164 format**: country code + number, no spaces, dashes, or parentheses.

| Country   | Format        | Example       |
| --------- | ------------- | ------------- |
| US/Canada | 1 + 10 digits | 15551234567   |
| UK        | 44 + number   | 447911123456  |
| Germany   | 49 + number   | 4915123456789 |
| Australia | 61 + number   | 61412345678   |
| India     | 91 + number   | 919876543210  |

## API Base URLs

| Service            | Base URL                     |
| ------------------ | ---------------------------- |
| Phone ID           | https://rest-ww.telesign.com |
| SMS/Messaging      | https://rest-ww.telesign.com |
| Verify API         | https://verify.telesign.com  |
| Intelligence Cloud | https://detect.telesign.com  |

## SDKs

Official SDKs available for:

- Python: [github.com/TeleSign/python_telesign](https://github.com/TeleSign/python_telesign)
- Node.js: [github.com/TeleSign/node_telesign](https://github.com/TeleSign/node_telesign)
- Java: [github.com/TeleSign/java_telesign](https://github.com/TeleSign/java_telesign)
- C#: [github.com/TeleSign/csharp_telesign](https://github.com/TeleSign/csharp_telesign)
- PHP: [github.com/TeleSign/php_telesign](https://github.com/TeleSign/php_telesign)
- Ruby: [github.com/TeleSign/ruby_telesign](https://github.com/TeleSign/ruby_telesign)

## Resources

- Developer Documentation: https://developer.telesign.com/enterprise
- API Reference: https://developer.telesign.com/enterprise/reference
- Support: https://support.telesign.com
- Status Page: https://status.telesign.com
