# Silent Verify API - API reference

Zero-interaction verification that confirms possession of a mobile number over the carrier data network.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `silentverify_initiate`, `silentverify_finalize`._

## Create verification request

**MCP tool:** `silentverify_initiate`

```http
POST https://verify.telesign.com/silent/initiate
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/createsilentverifyrequest> (updated 2026-09-11)

Use this action to initiate silent verification of a user via the Telesign Silent Verify API.

**Note:** Before using the sample code on this page, contact the [Telesign Customer Support Team](mailto:support@telesign.com). We will walk you through the necessary onboarding steps before you use the service. This product is for full-service accounts only. **Your request must come from a device with a mobile carrier connection.**

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string | yes | The phone number for the user you want to verify, as digits without spaces or special characters, beginning with the country dialing code. Example: `15558675309`. |
| `external_id` | string |  | Your unique identifier for this request. The response simply echoes the value provided for this parameter. Example: `34g62234`. |

### Responses

**HTTP 200**

**Success.** Verification flow initiated.

Code|Description
--|--
4501|Success

**HTTP 400**

**Bad Request**

Code | Description
--|--
10004|Bad request
11000|Invalid value for parameter phone_number
40003|No end client data found on records

**HTTP 401**

**Unauthorized**

Code | Description
--|--
40002|Not authorized

**HTTP 408**

**Request Timeout**

Code | Description
--|--
40001 | Request timeout

**HTTP 429**

**Too Many Requests**

Code | Description
--|--
10019|Rate limit exceeded

**HTTP 500**

**Internal Server Error**

Code | Description
--|--
10039	|Internal Server Error
45010   |Provider not found to route the request. This is a permanent error probably due to configuration issues.

**HTTP 503**

**Service Unavailable**

Code | Description
--|--
10000 | System unavailable, please try again later
45005 |Error on gateway - temporary error
45006 |Error on gateway - permanent error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `verification` | object |  | Contains properties to pass to the client, instructing them on how to make their request directly to the carrier. |
| `verification.verification_url` | string |  | A URL for the carrier that you should pass to the client. The client will then hit this URL directly. Example: `https://verification-url.hei-partner.com`. |
| `verification.method` | string |  | The HTTP method to pass to the client, for them to use when making their call to the carrier. Example: `POST`. |
| `verification.expected_response_code` | integer |  | An HTTP status code to pass to the client, which they should expect in a successful response after making their call to the carrier. Example: `200`. |
| `verification.post_body` | object |  | A schema to pass to the client, for them to use in the request body when they make their call directly to the carrier. If no request body is needed, this value is `null`. |
| `verification.query_string_params` | object |  | Contains an object to pass to the client, which contains properties and values for each query param that the client should include in the request they make directly to the carrier. If no query parameters are needed, this value is null. |
| `verification.query_string_params.{param1_name}` | string |  | The first query param and its value. Example: `param1 value`. |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  |  |
| `status.code` | integer |  | A numeric code that indicates the status of your transaction. |
| `status.description` | string |  | Text describing the status of your transaction. |
| `status.updated_on` | string |  | A timestamp showing when your transaction status was updated last. Example: `2020-08-27T17:28:49.559307Z`. |

### Example response (200)

```json
{
  "verification_url": "https://verification-url.hei-partner.com",
  "method": "POST",
  "expected_response_code": 200,
  "post_body": {
    "phone_number": "15558675309",
    "external_id": "34g62234"
  },
  "query_string_params": {
    "cache_buster": "53g350"
  },
  "reference_id": "630d7b76-fee1-4036-9c87-411af82af44c",
  "status": {
    "code": 200,
    "description": "Success",
    "updated_on": "2020-08-27T17:28:49.559307"
  }
}
```


---

## Get final verification status

**MCP tool:** `silentverify_finalize`

```http
POST https://verify.telesign.com/silent/finalize
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getsilentverifystatus> (updated 2026-09-11)

Use this action to check for final verification status, after the client receives a response from the carrier.

**Note:** Before using the sample code on this page, contact the [Telesign Customer Support Team](mailto:support@telesign.com). We will walk you through the necessary onboarding steps before you use the service. This product is for full-service accounts only. **Your request must come from a device with a mobile carrier connection.**

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `initiate_reference_id` | string | yes | The reference ID Telesign returned to you in response to your previous call to initiate verification. Example: `630d7b76-fee1-4036-9c87-411af82af44c`. |
| `verification` | object | yes | The request payload sent to you from the CLIENT. Include this object exactly as-is. |

### Responses

**HTTP 200**

**Success.** The service processed your request.

|Code|Description|
|--|--|
|4501|Successfully verified|
|4502|The phone number does not match|

**HTTP 400**

**Bad Request**

Code | Description
--|--
10004|Bad request
40003|No end client data found on records
40004|The required parameter ‘verification’ is missing from the request
40010|Not in coverage. The phone number being verified is not within the provider's network.

**HTTP 401**

**Unauthorized**

Code | Description
--|--
40002|Not authorized

**HTTP 404**

**Not Found**

Code | Description
--|--
10011|Invalid value for parameter reference_id

**HTTP 408**

**Request Timeout**

Code | Description
--|--
40001 | Request timeout

**HTTP 429**

**Too Many Requests**

Code | Description
--|--
10019|Rate limit exceeded

**HTTP 500**

**Internal Server Error**

Code | Description
--|--
10039	|Internal Server Error

**HTTP 503**

**Service Unavailable**

Code | Description
--|--
10000 |System unavailable, please try again later
45005 |Error on gateway - temporary error
45006 |Error on gateway - permanent error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  |  |
| `status.code` | integer |  | A numeric code that indicates the status of your transaction. |
| `status.description` | string |  | Text describing the status of your transaction. |
| `status.updated_on` | string |  | A timestamp showing when your transaction status was updated last. Example: `2020-08-27T17:28:49.559307Z`. |

### Example response (200)

```json
{
  "reference_id": "630d7b76-fee1-4036-9c87-411af82af44c",
  "status": {
    "code": 2401,
    "description": "Success",
    "updated_on": "2020-08-27T17:28:49.559307"
  }
}
```

