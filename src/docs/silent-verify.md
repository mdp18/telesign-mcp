# Silent Verification

Silent Verification (the Telesign Silent Verify API) confirms that a user really holds a mobile number
without asking them to do anything: no code to read, no code to type. The user's own device makes a
request over its mobile data connection, the mobile carrier recognizes the subscriber behind that
connection, and Telesign tells your server whether it matches the phone number the user claimed.
Telesign positions it as a premium verification experience with zero interaction from the customer.

## When to use it

- Sign-up, login and other verification steps inside a **mobile app or mobile web client** where you
  want no friction and nothing a user could be tricked into sharing.
- As the first method in a verification flow, with a one-time passcode as fallback.

Use something else when:

- The device cannot use a mobile network (Wi-Fi-only tablet, desktop browser, no SIM). Silent Verify
  cannot work; fall back to an SMS one-time passcode (`sms-verify`) or another channel.
- You want fallback handled for you. Use the omnichannel `verify-api` with `silent` as the first
  method in the verification policy and `sms` (or another method) behind it.
- You have no client application at all, for example an AI assistant or a back-office tool verifying a
  number during a conversation. Use `verify-api`, `sms-verify` or `voice-verify`, where the user reads
  a code back.
- You only want to know about a number (type, carrier, risk) rather than prove possession: see `phone-id`
  and `intelligence`.

## How it works

Three parties make requests, and the middle one cannot be made by a server:

| Party | Role |
| --- | --- |
| SERVER (your backend) | Holds the Telesign credentials. Calls `initiate`, then `finalize`. |
| CLIENT (your app or site on the user's device) | Calls the carrier's verification URL directly over **mobile data** and returns the carrier's answer to your server. |
| CARRIER | Identifies the subscriber from the mobile data connection (automatic header enrichment) and answers the client. |

Step by step:

1. **User starts.** The user signs in on your client.
2. **Client checks its network.** If the device is on Wi-Fi, the client switches the request path to
   the mobile network, remembering the original connection settings. If no mobile connection can be
   established, Silent Verify cannot be used - go to your fallback method.
3. **Initiate (server).** The client asks your server to start. Your server calls
   `silentverify_initiate` with the user's phone number. Telesign answers with a `reference_id` for the
   whole flow and a `verification` object describing the call the client must make to the carrier.
4. **Pass the carrier call details to the device.** Your server sends the client the contents of
   `verification`:
   - `verification_url` - the carrier URL to request.
   - `method` - the HTTP method to use (for example `POST`).
   - `post_body` - the request body to send, or `null` if none is needed.
   - `query_string_params` - query parameters to add, or `null` if none are needed.
   - `expected_response_code` - the HTTP status the client should expect on success (for example `200`).

   Keep `reference_id` on the server.
5. **Establish session (device to carrier).** The client makes exactly that request, directly to the
   carrier, over the mobile data connection. The carrier uses header enrichment to see which
   subscriber the connection belongs to, and responds to the client.
6. **Return the carrier response.** Whatever the outcome - success or failure - the client takes the
   JSON payload of the carrier's response and sends it to your server as the "verification object".
7. **Finalize (server).** Your server calls `silentverify_finalize` with `initiate_reference_id` (the
   `reference_id` from step 3) and `verification` (the client's object, passed through exactly as received).
8. **Result.** Telesign checks with the carrier and returns `status.code`: `4501` means the number was
   verified, `4502` means the phone number does not match.
9. **Finish.** Your server signs the user in or reports an error; the client restores the original
   Wi-Fi connection settings if it changed them.

### Why an AI assistant cannot complete it alone

`silentverify_initiate` and `silentverify_finalize` cover only the two server-side calls. The proof of
possession is step 5: an HTTP request that must leave the **end user's handset over the carrier's
mobile data network**, because the carrier identifies the subscriber from that connection. An
assistant, an MCP server or any backend calling `verification_url` would be on the wrong network and
would not be recognized as that subscriber. So:

- An assistant can call `silentverify_initiate`, but the returned `verification` details are useless
  until a client application on the user's device executes them.
- An assistant can call `silentverify_finalize` only if it is handed the genuine carrier response
  captured by that client. Never fabricate or hand-edit the `verification` object.
- Without a client app, do not start this flow at all: pick an OTP method (`verify-api`, `sms-verify`,
  `voice-verify`) instead.

The tools are still useful for building and testing an integration: generating the server-side calls,
inspecting real responses, and diagnosing error codes.

### Silent Verify inside the omnichannel Verify API

Silent Verify is also available as the `silent` method of the Verify API (`verify.telesign.com/verification`),
which is the easier route for mobile apps because the Telesign Verify SDKs (Android and iOS) perform
the device-side steps and fallback is built in:

1. Your server creates a verification process with `verifyapi_send_otp`, listing `silent` first and a
   fallback such as `sms` second.
2. The response contains a `reference_id` and a `mobile_app_token`. The token expires after five
   minutes. Your server maps them to a session and sends the token to the app.
3. The app passes the token to the Telesign SDK (`TsVerify.activate()`), which runs the silent
   verification with the carrier and finalizes it with Telesign. On Android the app needs the
   `android.permission.CHANGE_NETWORK_STATE` permission so the SDK can use the mobile connection even
   when the device prefers Wi-Fi.
4. If silent verification fails or no mobile connection is available, the SDK fails over to the next
   method in the policy; for SMS the app collects the code from the user and passes it to the SDK
   (`TsVerify.finalizeWithOTP()`).
5. When the policy has been fully processed the SDK emits a completed event. That event does **not**
   say whether verification succeeded: the app asks your server, and your server calls
   `verifyapi_get_status` and checks that `state` is `VERIFIED`.

The same limitation applies: an assistant can create the process and read its state, but the device
side needs the SDK inside the customer's app. See `verify-api`.

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `silentverify_initiate` | Starts a silent verification for a phone number and returns the carrier request the device must make. | `POST https://verify.telesign.com/silent/initiate` |
| `silentverify_finalize` | Submits the carrier response collected by the device and returns the final verification status. | `POST https://verify.telesign.com/silent/finalize` |

Related tools from the Verify API toolset: `verifyapi_send_otp` (create a process with method `silent`)
and `verifyapi_get_status`. Use `docs_get_tool_reference("silentverify_initiate")` for the full reference.

## Quick start

Initiate (`silentverify_initiate`). Returns `reference_id`, a `status` object and the `verification`
details to forward to the device.

```json
{
  "phone_number": "15551234567",
  "external_id": "login-7f3a91"
}
```

What the server forwards to the client after initiate (values come from the response; shown here for illustration):

```json
{
  "verification_url": "https://carrier.example.com/verify",
  "method": "POST",
  "expected_response_code": 200,
  "post_body": null,
  "query_string_params": { "cache_buster": "53g350" }
}
```

Finalize (`silentverify_finalize`) with the carrier's JSON response exactly as the device received it.
Returns `status.code` 4501 (verified) or 4502 (number does not match).

```json
{
  "initiate_reference_id": "630d7b76-fee1-4036-9c87-411af82af44c",
  "verification": {
    "...": "carrier response payload, passed through unchanged"
  }
}
```

Omnichannel alternative (`verifyapi_send_otp`): silent first, SMS after 30 seconds. Returns a
`reference_id` and a `mobile_app_token` for the Telesign SDK.

```json
{
  "recipient": { "phone_number": "15551234567" },
  "verification_policy": [
    { "method": "silent", "fallback_time": 30 },
    { "method": "sms" }
  ]
}
```

## Key parameters

| Tool | Parameter | Notes |
| --- | --- | --- |
| `silentverify_initiate` | `phone_number` (required) | The number the user claims, digits only starting with the country dialing code. |
| `silentverify_initiate` | `external_id` | Your own identifier for the request; echoed back in the response. Useful to tie the flow to a login attempt. |
| `silentverify_finalize` | `initiate_reference_id` (required) | The `reference_id` returned by initiate. Keep it server-side; do not trust a value supplied by the client. |
| `silentverify_finalize` | `verification` (required) | The JSON payload of the carrier's response, as received by the client. Include it exactly as-is, whether the carrier call succeeded or failed. |
| `verifyapi_send_otp` | `verification_policy[].method` = `silent`, `fallback_time` | `fallback_time` is the number of seconds (minimum 30) to wait before moving to the next method; failover can happen sooner on certain failures. |

## Responses and status codes

Initiate response fields:

| Field | Meaning |
| --- | --- |
| `reference_id` | Identifies this verification flow. Needed for finalize. |
| `verification.verification_url` | Carrier URL the client must request directly. |
| `verification.method` | HTTP method for that request. |
| `verification.expected_response_code` | HTTP status the client should expect from the carrier on success. |
| `verification.post_body` | Body for the carrier request, or `null`. |
| `verification.query_string_params` | Query parameters for the carrier request, or `null`. |
| `status.code`, `status.description`, `status.updated_on` | Transaction status. |

Finalize returns `reference_id` and the same `status` object.

| Code | HTTP | Returned by | Meaning | What to do |
| --- | --- | --- | --- | --- |
| 4501 | 200 | initiate, finalize | Initiate: flow started. Finalize: successfully verified. | Continue / sign the user in. |
| 4502 | 200 | finalize | The phone number does not match. | Treat as not verified. Offer a fallback method or reject. |
| 10004 | 400 | both | Bad request. | Check the request body. |
| 11000 | 400 | initiate | Invalid value for parameter `phone_number`. | Fix the number format. |
| 40003 | 400 | both | No end client data found on records. | Not retryable as-is; contact Telesign if it persists. |
| 40004 | 400 | finalize | The required parameter `verification` is missing. | Send the carrier payload. |
| 40010 | 400 | finalize | Not in coverage: the number is not within the provider's network. | Use a fallback verification method. |
| 40002 | 401 | both | Not authorized. | Check credentials and product enablement. |
| 10011 | 404 | finalize | Invalid value for parameter `reference_id`. | Pass the `reference_id` from initiate as `initiate_reference_id`. |
| 40001 | 408 | both | Request timeout. | Retry or fall back. |
| 10019 | 429 | both | Rate limit exceeded. | Slow down and retry later. |
| 10039 | 500 | both | Internal server error. | Retry; fall back if it persists. |
| 45010 | 500 | initiate | No provider found to route the request; a permanent error, probably configuration. | Do not retry; contact Telesign. |
| 10000 | 503 | both | System unavailable. | Try again later. |
| 45005 | 503 | both | Gateway error, temporary. | Retry. |
| 45006 | 503 | both | Gateway error, permanent. | Do not retry; fall back. |

Only `4501` from **finalize** proves possession. A successful initiate, or a successful carrier
response seen by the client, is not a verification result. Always have a fallback path, because
coverage, network state and carrier errors routinely prevent a silent result.

In the omnichannel route, the result is the Verify API process `state`: `CREATED`, `ONGOING`,
`REJECTED`, `FAILED`, `VERIFIED` or `CANCELED`.

## Requirements and limits

- The product must be added to the account by Telesign and is available to full-service accounts only.
  Contact Telesign Customer Support before first use; they walk you through onboarding. Availability
  varies by region - ask Telesign sales about your markets.
- The end user's device must have a mobile carrier data connection. Wi-Fi alone does not work; the
  client must route the carrier request over the mobile network.
- A client-side component is mandatory: your own code implementing the carrier request, or the
  Telesign Verify SDK for Android or iOS when using the Verify API route.
- Telesign credentials stay on the server. The client only ever receives the carrier request details
  (or the `mobile_app_token`).
- Requests are `application/json`, UTF-8; authentication is Basic or Digest. Default per-product rate
  limits apply (code `10019` when exceeded).
- This API has no callbacks: the result is returned synchronously by finalize.

## Related

Guides: `verify-api`, `sms-verify`, `voice-verify`, `app-verify`, `phone-id`, `authentication`, `error-codes`.

Telesign pages:

- https://developer.telesign.com/enterprise/docs/silent-verify-api-overview
- https://developer.telesign.com/enterprise/docs/verify-api-get-started-with-silent-verify
- https://developer.telesign.com/enterprise/reference/createsilentverifyrequest
- https://developer.telesign.com/enterprise/reference/getsilentverifystatus
