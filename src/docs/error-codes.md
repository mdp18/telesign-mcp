# TeleSign Error and Status Codes Reference

## Overview

TeleSign APIs return status and error codes in the response body. Always code against these codes rather than HTTP status codes or description strings (which may change).

- **Status codes:** 3-4 digits, product-specific
- **Error codes:** 5 digits, cross-product

## HTTP Status Codes

| Code | Meaning               | Action                                    |
| ---- | --------------------- | ----------------------------------------- |
| 200  | Success               | Request processed, check body for details |
| 400  | Bad Request           | Check request parameters                  |
| 401  | Unauthorized          | Check authentication credentials          |
| 402  | Payment Required      | Check account balance                     |
| 403  | Forbidden             | Feature not enabled for account           |
| 404  | Not Found             | Resource doesn't exist                    |
| 429  | Too Many Requests     | Rate limit exceeded, retry later          |
| 500  | Internal Server Error | TeleSign server issue, retry              |
| 503  | Service Unavailable   | Temporary outage, retry later             |

## General API Status Codes

### Success Codes (1xx-3xx)

| Code | Description                        | Meaning                  |
| ---- | ---------------------------------- | ------------------------ |
| 100  | Call answered                      | Voice call connected     |
| 101  | Call not answered                  | Voice call not picked up |
| 103  | Call in progress                   | Voice call ongoing       |
| 105  | Call ringing                       | Voice call ringing       |
| 106  | Call busy                          | Recipient line busy      |
| 200  | Delivered to handset               | SMS received by phone    |
| 203  | Delivered to gateway               | Handed off to carrier    |
| 207  | Error delivering to handset        | Delivery failed          |
| 230  | Message blocked - spam detected    | Carrier filtered         |
| 231  | Message blocked - content          | Carrier rejected         |
| 233  | Message blocked - high risk score  | Intelligence blocked     |
| 250  | Final status unknown               | No receipt received      |
| 290  | Message in progress                | Still delivering         |
| 291  | Callback received                  | Status update received   |
| 300  | Transaction successfully completed | API call successful      |
| 301  | Transaction partially completed    | Some data returned       |

### Error Codes (5xx)

| Code | Description               | Cause                 | Solution                      |
| ---- | ------------------------- | --------------------- | ----------------------------- |
| 500  | Transaction not attempted | Server error          | Retry with backoff            |
| 501  | Not authorized            | Invalid credentials   | Check Customer ID and API Key |
| 502  | Invalid parameter         | Bad request data      | Validate input parameters     |
| 503  | Invalid phone number      | Format incorrect      | Use E.164 format              |
| 504  | Unable to deliver         | Delivery not possible | Try different channel         |
| 505  | Service unavailable       | Temporary outage      | Retry later                   |
| 506  | Transaction was blocked   | Blocked by policy     | Check compliance              |
| 510  | Feature not enabled       | Account limitation    | Contact TeleSign              |
| 511  | Account suspended         | Billing or compliance | Contact TeleSign              |
| 599  | System error              | Internal error        | Contact support               |

## SMS Verify API Status Codes

| Code | Description           | Intermediate/Final |
| ---- | --------------------- | ------------------ |
| 200  | Delivered to handset  | Final              |
| 203  | Delivered to gateway  | Intermediate       |
| 207  | Error delivering      | Final              |
| 210  | Temporary phone error | Intermediate       |
| 211  | Permanent phone error | Final              |
| 220  | Gateway error         | Intermediate       |
| 221  | Message expired       | Final              |
| 222  | Message cancelled     | Final              |
| 230  | Spam detected         | Final              |
| 231  | Content blocked       | Final              |
| 233  | Blocked - high risk   | Final              |
| 250  | Status unknown        | Final              |
| 286  | Not attempted         | Final              |
| 290  | In progress           | Intermediate       |

## Verify API Status Codes

| Code | Description                     |
| ---- | ------------------------------- |
| 1900 | Request/verification successful |
| 1901 | Invalid verification code       |
| 1902 | Code expired                    |
| 1903 | Max attempts exceeded           |
| 1904 | Already completed               |
| 1905 | Verification not found          |

## Phone ID Identity Attribute Status Codes

| Code | Description                       |
| ---- | --------------------------------- |
| 2800 | Request successfully completed    |
| 2801 | Attribute temporarily unavailable |
| 2802 | Attribute timed out               |
| 2803 | Phone number out of coverage      |
| 2804 | No data available for number      |
| 2805 | No match found                    |
| 2806 | Attribute not enabled for account |

## Messaging Status Codes

| Code | Description                         |
| ---- | ----------------------------------- |
| 3000 | Delivered                           |
| 3001 | Delivery pending                    |
| 3003 | Sent to carrier                     |
| 3005 | Message read (WhatsApp, Viber, RCS) |
| 3050 | Delivery failed                     |
| 3056 | Failed to deliver in fallback time  |

## Intelligence Risk Levels

| Level       | Score Range | Recommendation |
| ----------- | ----------- | -------------- |
| very low    | 0-250       | allow          |
| low         | 251-500     | allow          |
| medium      | 501-650     | flag           |
| medium-high | 651-800     | flag           |
| high        | 801-900     | block          |
| very high   | 901-1000    | block          |

## Cleansing Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 100  | Number is valid and dialable         |
| 101  | Valid but formatting corrected       |
| 102  | Valid for country but format unknown |
| 103  | Possibly valid but unconfirmed       |
| 104  | Number is not valid                  |
| 105  | Number prefix not valid              |

## Best Practices for Error Handling

1. **Always check status codes** - Don't rely solely on HTTP status
2. **Code against numbers** - Description text may change
3. **Handle intermediate states** - Some codes indicate pending status
4. **Implement retry logic** - For 500-level errors, retry with exponential backoff
5. **Log reference IDs** - Include in support requests
6. **Monitor error rates** - Alert on unusual patterns
7. **Use callbacks** - Get final delivery status asynchronously

## Common Issues and Solutions

### "Invalid phone number" (503)

- Ensure E.164 format (country code + number)
- Remove spaces, dashes, parentheses
- US: 11 digits starting with 1 (e.g., 15551234567)

### "Not authorized" (501)

- Verify Customer ID format (UUID)
- Check API Key hasn't expired
- Verify HMAC signature generation
- Ensure Date header is within ±15 minutes

### "Rate limit exceeded" (429)

- Implement exponential backoff
- Cache Phone ID results
- Contact TeleSign to increase limits

### "Feature not enabled" (510)

- Contact TeleSign to enable the feature
- Verify correct endpoint for your account type
