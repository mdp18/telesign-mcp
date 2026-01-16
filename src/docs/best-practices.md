# TeleSign Integration Best Practices

## Security

### Credential Management

1. **Never expose API keys in client code** - Use environment variables or secrets management
2. **Rotate API keys periodically** - Use TeleSign Accounts API to manage keys
3. **Use Digest (HMAC-SHA256) auth** - More secure than Basic auth for production
4. **Validate webhook signatures** - Authenticate TeleSign callbacks

### Request Security

1. **Use HTTPS only** - All TeleSign endpoints require TLS
2. **Validate all inputs** - Sanitize phone numbers before API calls
3. **Implement rate limiting** - Protect against abuse on your end
4. **Log reference IDs** - Essential for debugging and support requests

## Phone Number Handling

### Validation

1. **Always normalize to E.164** - Country code + number, no formatting
2. **Validate with Phone ID first** - Before sending messages
3. **Check phone_type** - Don't send SMS to landlines (type 1)
4. **Use cleansed numbers** - From the `numbering.cleansing` response

### Fraud Prevention

1. **Block VoIP for sensitive operations** - phone_type code "5"
2. **Flag prepaid numbers** - phone_type code "3" may indicate risk
3. **Check Intelligence scores** - For high-value transactions
4. **Monitor for velocity** - Unusual volume from same number/IP

## Verification Flows

### Registration Flow

```
1. User enters phone number
2. Phone ID → validate number, get type
3. Intelligence → assess fraud risk
4. If risk acceptable → Verify API → send OTP
5. User enters OTP → verify code
6. Complete registration
```

### Login Flow (Step-up Authentication)

```
1. User attempts login
2. Intelligence → assess risk for "sign-in" event
3. If risk elevated → require verification
4. Verify API → send OTP
5. User enters OTP → verify code
6. Grant access
```

### High-Value Transaction Flow

```
1. User initiates transaction
2. Intelligence → assess risk for "transact" event
3. If risk score > threshold → block or require verification
4. Verify API → send OTP via preferred channel
5. User verifies → complete transaction
```

## Error Handling

### Retry Logic

```javascript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (error.status >= 500) {
        // Exponential backoff for server errors
        await sleep(Math.pow(2, i) * 1000);
      } else {
        throw error; // Don't retry client errors
      }
    }
  }
}
```

### Fallback Channels

1. Primary: SMS
2. Secondary: Voice (if SMS fails after 30s)
3. Tertiary: Email (if voice fails)

### Status Monitoring

- Track delivery rates by carrier and region
- Alert on sudden drops in delivery
- Monitor for unusual error patterns

## Cost Optimization

### Caching

1. **Cache Phone ID results** - Phone info rarely changes (24-48 hour TTL)
2. **Don't re-verify known users** - Use session tokens
3. **Batch operations** - Where API supports it

### Smart Routing

1. **Use Intelligence to avoid wasted verification** - Block before sending OTP
2. **Route by phone type** - Voice for landlines, SMS for mobile
3. **Choose appropriate message types** - OTP vs ARN vs MKT pricing differs

### Message Efficiency

1. **Keep messages concise** - Stay in single SMS segment
2. **Avoid Unicode when possible** - 160 vs 70 char limit
3. **Use templates** - Consistent, optimized content

## Compliance

### US Requirements (TCPA)

- Get prior express consent before messaging
- Honor STOP/opt-out immediately
- Include business identification
- Respect quiet hours (8am-9pm local)
- Maintain consent records

### EU Requirements (GDPR)

- Explicit consent for marketing
- Clear opt-out mechanism
- Data retention policies
- Right to deletion
- Privacy policy disclosure

### General Best Practices

- Maintain suppression/blocklists
- Don't send to Do Not Call lists
- Include opt-out in marketing messages
- Process unsubscribes within 24 hours
- Document consent acquisition

## Monitoring and Alerting

### Key Metrics to Track

- API response times
- Delivery success rates
- Error rates by type
- Verification completion rates
- Intelligence risk score distribution

### Alert Thresholds

- Delivery rate drops below 95%
- Error rate exceeds 5%
- Average response time > 2 seconds
- Unusual spike in high-risk scores

### Logging Requirements

- Log all reference_ids
- Log request/response for debugging
- Mask sensitive data (full phone numbers)
- Retain logs per compliance requirements

## Testing

### Test Environment

1. Use test phone numbers when available
2. Start with your own numbers
3. Test all error scenarios
4. Verify callback handling

### Pre-Production Checklist

- [ ] Authentication working (both Basic and Digest)
- [ ] Phone number validation
- [ ] Error handling for all status codes
- [ ] Callback endpoint secured and tested
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Monitoring/alerting set up
- [ ] Compliance requirements reviewed
