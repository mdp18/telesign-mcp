# Verify API - API reference

Omnichannel verification: one-time passcodes over SMS, WhatsApp, Viber, RCS, email and voice with automatic fallback, plus Silent Verify and Push.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `verifyapi_send_otp`, `verifyapi_get_status`, `verifyapi_update_process`._

## Create a verification process

**MCP tool:** `verifyapi_send_otp`

```http
POST https://verify.telesign.com/verification
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/createverificationprocess> (updated 2026-03-25)

> 🚧 CAUTION:
>
> As part of our ongoing platform improvements and the migration to a new supporting platform, **the Push Verify functionality is temporarily unavailable**. This notice will be removed once Push Verify becomes available again.
>
>
> Other Verify API SDK capabilities, including QR Verify and Silent Verify, are not impacted.

Use this action to create a [verification process](https://developer.telesign.com/enterprise/docs/verify-api-get-started#key-terms) for the specified phone number.

> 📘 NOTE:
>
> Updating a verification process using the procedure explained in each channel's **Complete verification and get delivery status** section on its [Get Started page](https://developer.telesign.com/enterprise/docs/verify-api-get-started#usage-instructions) is a mandatory step when using Verify API. This step allows Telesign to know the real state of your verification as well as control all the features related to a verification process such as fallback, callback, and pricing. If your end user has verified themselves but the verification process is not updated, these features might not work as intended which can lead to extra costs or incorrect billing.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `recipient` | object | yes | Contains properties with the recipient identifier for a [verification process](https://developer.telesign.com/enterprise/docs/verify-api-get-started#key-terms). |
| `recipient.phone_number` | string |  | The recipient's phone number, as digits without spaces or special characters, beginning with the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `11234567890`. |
| `recipient.push_app_token` | string |  | Identifies the instance of your mobile application installed on the user's mobile device. This is also called a "registration token" in Firebase Cloud Messaging or a "device token" in iOS. This is required when using the Push Verify verification method. |
| `recipient.email` | string |  | The recipient's email address. Example: `ncarolina@vero-finto.com`. |
| `security_factor` | string |  | A one-time passcode (OTP) to use for this verification process, for all OTP methods. By default, Telesign randomly generates a six-digit numeric OTP for you and inserts it into messages to your end users. You can override the default behavior by including your own OTP here. Only numeric characters are supported. Contact [Telesign Customer Support](mailto:support@telesign.com) to change the required OTP length configured for your account. Length: 3-10. Example: `5724433`. |
| `verification_policy` | array of object |  | An ordered set of verification methods and their fallback times that the Verify API uses for this verification process. See [verification policy](https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time) for more details. |
| `verification_policy[].method` | string enum |  | One of the [verification methods](https://developer.telesign.com/enterprise/docs/verify-api-get-started#supported-verification-methods) included in a verification policy. Each method employs a Telesign service, such as Silent Verify or Push Verify. Allowed: `silent`, `sms`, `push`, `rcs`, `whatsapp`, `email`, `voice`, `viber`. Example: `sms`. |
| `verification_policy[].fallback_time` | integer |  | The time window in seconds that the service waits before abandoning the current verification method and then initiating verification using the next method specified in the active [verification policy](https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time). It is possible for the failover to happen earlier if certain failure conditions occur. Range: 30 to ∞. Example: `30`. |
| `device_registration` | string |  | This verification process is for the purpose of registering a device for Push Verify. See [Verify API - Register a new device with Push Verify](https://developer.telesign.com/enterprise/docs/verify-api-register-a-new-device-with-push-verify) for further context on when to use this. When used with Push Verify, the value of this parameter is `stamp`. Example: `stamp`. |
| `external_id` | string |  | A customer-generated ID for this transaction. The response simply echoes the value provided for this parameter. Length: 0-100. |
| `message_template` | object |  | Contains properties related to the template set up for use with Verify API. |
| `message_template.name` | string |  | The name of this template. Use only lowercase alpha characters and underscores. If you do not declare a template, Verify API will use Verify API will use a default template. The same template name must be used for each active channel when utilizing fallback channels because the template name is declared once and then it is available on all of the active channels for the entire verification process. Example: `verification_template`. |
| `voice_lang` | string |  | A [supported language code](https://developer.telesign.com/enterprise/docs/voice-supported-languages-for-text-to-speech) specifying the language the service will use when delivering the OTP message. If a code isn't provided, the default language, English (`en-US`), is used to deliver the OTP message. Example: `en-GB`. |

### Example requests

**SMS OTP**

```json
{
  "recipient": {
    "phone_number": "11234567890"
  },
  "verification_policy": [
    {
      "method": "sms"
    }
  ]
}
```

**Silent Verify**

```json
{
  "recipient": {
    "phone_number": "11234567890"
  },
  "verification_policy": [
    {
      "method": "silent",
      "fallback_time": 30
    },
    {
      "method": "sms"
    }
  ]
}
```

**Push Verify**

```json
{
  "recipient": {
    "phone_number": "11234567890",
    "push_app_token": "23324n2b42i:fbo234cu2435n53ng_f4i2bdf2o4i6n53bh_234ol5436b735v462g3c42gc34b24j6b345"
  },
  "verification_policy": [
    {
      "method": "silent",
      "fallback_time": 30
    },
    {
      "method": "sms"
    }
  ],
  "push_registration": true
}
```

**Specify template**

```json
{
  "recipient": {
    "phone_number": "11234567890"
  },
  "message_template": {
    "name": "verification_template"
  },
  "security_factor": "123456",
  "verification_policy": [
    {
      "method": "rcs",
      "fallback_time": 30
    },
    {
      "method": "sms",
      "fallback_time": 60
    }
  ]
}
```

**Voice**

```json
{
  "recipient": {
    "phone_number": "447975777666"
  },
  "verification_policy": [
    {
      "method": "voice"
    }
  ],
  "voice_lang": "en-GB"
}
```

### Responses

**HTTP 200**

**Success.** Your verification request has been accepted and the verification process with this end user has been created accordingly.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3901 | Request in progress | Telesign has created this verification process and it is ready to use. (Intermediate)

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3101   | Invalid value for parameter phone_number: {phone_number} | Phone number is too long, too short, or contains non-digit values.
 3103   |   Unsupported value for parameter external_id |   External ID is longer than 100 characters or contains non-ASCII characters.
 3110   |   Invalid request |   The API request or its JSON payload is improperly formatted.
 3302   |   Missing parameter phone_number  |   The API request does not contain the mandatory parameter `phone_number`.

**HTTP 401**

**Unauthorized.** You are not permitted to perform this action. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3203	|	Callback URL parameter not enabled for Customer ID	|	Using callback_url in the API request is not allowed for this account.
 3400	|	Not authorized	|	No permissions for this resource or authorization failed.
 3906	|	Unified Verification Product not enabled for Customer ID	|	This product is not enabled for this account.

**HTTP 413**

**Content too large.** Your request failed because the payload is too large. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3116   |   Payload limit size exceeded |   The payload of this request exceeds the 10KB limit.

**HTTP 429**

**Too Many Requests.** Your account has sent too many requests in a given amount of time. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
-------------|-----------------------
 3204       | Rate Limit Exceeded   |   You have exceeded the allowed number of requests per second on this API.

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3500   |   System Unavailable  |   The system is currently unavailable. You should resubmit this request.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies this verification process. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object | yes |  |
| `status.code` | integer | yes | A numeric code that indicates the status of your transaction. Example: `3901`. |
| `status.description` | string | yes | Text describing the status of your transaction. Example: `Request in progress`. |
| `mobile_app_token` | string |  | An access token that the Telesign Android SDK must include to interact with this verification process via Telesign REST API. Your mobile app sends this token to your instance of the Telesign Android SDK. The token expires after five minutes. Example: `1555GFRWG7E9Q67D7FFEHQQWERKWJPFWRFRWF867530943565`. |
| `recipient` | object | yes | Contains properties with the recipient identifier for a [verification process](https://developer.telesign.com/enterprise/docs/verify-api-get-started#key-terms). |
| `recipient.phone_number` | string |  | The recipient's phone number, as digits without spaces or special characters, beginning with the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `11234567890`. |
| `recipient.push_app_token` | string |  | Identifies the instance of your mobile application installed on the user's mobile device. This is also called a "registration token" in Firebase Cloud Messaging or a "device token" in iOS. This is required when using the Push Verify verification method. |
| `recipient.email` | string |  | The recipient's email address. Example: `ncarolina@vero-finto.com`. |
| `state` | string enum | yes | The current state of this verification process. Allowed: `CREATED`, `ONGOING`, `REJECTED`, `FAILED`, `VERIFIED`, `CANCELED`. Example: `ONGOING`. |
| `verification_policy` | array of object |  | An ordered set of verification methods and their fallback times that the Verify API uses for this verification process. See [verification policy](https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time) for more details. |
| `verification_policy[].method` | string enum |  | One of the [verification methods](https://developer.telesign.com/enterprise/docs/verify-api-get-started#supported-verification-methods) included in a verification policy. Each method employs a Telesign service, such as Silent Verify or Push Verify. Allowed: `silent`, `sms`, `push`, `rcs`, `whatsapp`, `email`, `voice`. Example: `sms`. |
| `verification_policy[].fallback_time` | integer |  | The time window in seconds that the service waits before abandoning the current verification method and then initiating verification using the next method specified in the active [verification policy](https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time). It is possible for the failover to happen earlier if certain failure conditions occur. Range: 30 to ∞. Example: `30`. |
| `device_registration` | string |  | This verification process is for the purpose of registering a device for Push Verify. See [Verify API - Register a new device with Push Verify](https://developer.telesign.com/enterprise/docs/verify-api-register-a-new-device-with-push-verify) for further context on when to use this. When used with Push Verify, the value of this parameter is `stamp`. Example: `stamp`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "mobile_app_token": "1555GFRWG7E9Q67D7FFEHQQWERKWJPFWRFRWF867530943565",
  "recipient": {
    "phone_number": "11234567890"
  },
  "state": "CREATED",
  "verification_policy": [
    {
      "method": "silent",
      "fallback_time": 30
    },
    {
      "method": "sms"
    }
  ],
  "status": {
    "code": 3901,
    "description": "Request in progress"
  }
}
```


---

## Retrieve a verification process

**MCP tool:** `verifyapi_get_status`

```http
GET https://verify.telesign.com/verification/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getverificationprocess> (updated 2026-03-25)

Use this action to retrieve details about the specified [verification process](https://developer.telesign.com/enterprise/docs/verify-api-get-started#key-terms) in progress.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The identifier of the verification process you wish to retrieve. This was returned to you in the response when you initiated verification. |

### Responses

**HTTP 200**

**Success.** Your verification request has been accepted and the current status of the verification process is included in this response.

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3101   | Invalid value for parameter phone_number: {phone_number} | Phone number is too long, too short, or contains non-digit values.
 3103   |   Unsupported value for parameter external_id |   External ID is longer than 100 characters or contains non-ASCII characters.
 3110   |   Invalid request |   The API request or its JSON payload is improperly formatted.
 3302   |   Missing parameter phone_number  |   The API request does not contain the mandatory parameter `phone_number`.

**HTTP 401**

**Unauthorized.** You are not permitted to perform this action. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3203	|	Callback URL parameter not enabled for Customer ID	|	Using callback_url in the API request is not allowed for this account.
 3400	|	Not authorized	|	No permissions for this resource or authorization failed.
 3906	|	Unified Verification Product not enabled for Customer ID	|	This product is not enabled for this account.

**HTTP 429**

**Too Many Requests.** Your account has sent too many requests in a given amount of time. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
-------------|-----------------------
 3204       | Rate Limit Exceeded   |   You have exceeded the allowed number of requests per second on this API.

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3500   |   System Unavailable  |   The system is currently unavailable. You should resubmit this request.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies your verification service request. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `recipient` | object | yes | Contains properties with the recipient identifier for a [verification process](https://developer.telesign.com/enterprise/docs/verify-api-get-started#key-terms). |
| `recipient.phone_number` | string |  | The recipient's phone number, as digits without spaces or special characters, beginning with the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `11234567890`. |
| `recipient.push_app_token` | string |  | Identifies the instance of your mobile application installed on the user's mobile device. This is also called a "registration token" in Firebase Cloud Messaging or a "device token" in iOS. This is required when using the Push Verify verification method. |
| `recipient.email` | string |  | The recipient's email address. Example: `ncarolina@vero-finto.com`. |
| `state` | string enum | yes | The current state of this verification process. Allowed: `CREATED`, `ONGOING`, `REJECTED`, `FAILED`, `VERIFIED`, `CANCELED`. Example: `ONGOING`. |
| `verification_policy` | array of object | yes | An ordered set of verification methods and their fallback times that the Verify API uses for this verification process. See [verification policy](https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time) for more details. |
| `verification_policy[].method` | string enum |  | One of the [verification methods](https://developer.telesign.com/enterprise/docs/verify-api-get-started#supported-verification-methods) included in a verification policy. Each method employs a Telesign service, such as Silent Verify or Push Verify. Allowed: `silent`, `sms`, `push`, `rcs`, `whatsapp`, `email`, `voice`. Example: `sms`. |
| `verification_policy[].fallback_time` | integer |  | The time window in seconds that the service waits before abandoning the current verification method and then initiating verification using the next method specified in the active [verification policy](https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time). It is possible for the failover to happen earlier if certain failure conditions occur. Range: 30 to ∞. Example: `30`. |
| `inner_methods` | array of object |  |  |
| `inner_methods[].method` | string enum |  | One of the [verification methods](https://developer.telesign.com/enterprise/docs/verify-api-get-started#supported-verification-methods) included in a verification policy. Each method employs a Telesign service, such as Silent Verify or Push Verify. Allowed: `silent`, `sms`, `push`, `rcs`, `whatsapp`, `email`, `voice`. Example: `sms`. |
| `inner_methods[].state` | string enum |  | Text describing the processing status of the specified verification method. This is not the same as the overall status of the verification process. Allowed: `CREATED`, `ONGOING`, `SKIPPED`, `REJECTED`, `FAILED`, `VERIFIED`, `CANCELED`. Example: `ONGOING`. |
| `inner_methods[].err_code` | integer |  | A numeric code indicating which error occured while attempting to use this verification method. Example: `3000`. |
| `inner_methods[].err_msg` | string |  | Text describing the error that occurred while attempting to use this verification method. Example: `Delivered`. |
| `inner_methods[].tried_on` | string |  | A timestamp that indicates when this verification method was attempted. Example: `2022-31-03T14:51:28.709526Z`. |
| `inner_methods[].updated_on` | string |  | An [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) timestamp that indicates when the state of attempting verification with this method was last updated. Example: `2022-31-03T14:51:28.709526Z`. |
| `device_registration` | string |  | This verification process is for the purpose of registering a device for Push Verify. See [Verify API - Register a new device with Push Verify](https://developer.telesign.com/enterprise/docs/verify-api-register-a-new-device-with-push-verify) for further context on when to use this. When used with Push Verify, the value of this parameter is `stamp`. Example: `stamp`. |
| `external_id` | string |  | A customer-generated ID for this transaction. The response simply echoes the value provided for this parameter. |
| `updated_on` | string | yes | An [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) timestamp indicating when the status of this verification process was last updated. Example: `2022-31-03T14:51:28.709526Z`. |
| `created_on` | string | yes | A timestamp that indicates when Telesign created this verification process. Example: `2022-31-03T14:51:28.709526Z`. |

### Example response (200)

```json
{
  "created_on": "2025-05-28T14:32:27.563000Z",
  "inner_methods": [
    {
      "err_code": 3901,
      "err_msg": "Request in progress",
      "expires_on": "2025-05-28T14:33:28.906000Z",
      "method": "silent",
      "state": "ONGOING",
      "tried_on": "2025-05-28T14:32:28.906000Z",
      "updated_on": "2025-05-28T14:32:28.906000Z"
    },
    {
      "method": "sms",
      "state": "CREATED"
    }
  ],
  "recipient": {
    "phone_number": "11234567890"
  },
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "state": "ONGOING",
  "updated_on": "2025-05-28T14:32:28.906000Z",
  "verification_policy": [
    {
      "fallback_time": 60,
      "method": "silent"
    },
    {
      "fallback_time": 240,
      "method": "sms"
    }
  ]
}
```


---

## Update a verification process

**MCP tool:** `verifyapi_update_process`

```http
PATCH https://verify.telesign.com/verification/{reference_id}/state
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/updateverificationprocess> (updated 2026-03-25)

Use this action to change the state of an active [verification process](https://developer.telesign.com/enterprise/docs/verify-api-get-started#key-terms). This is typically used to finalize a verification process managed solely via interactions with this REST API.

> 📘 NOTE:
>
> Updating a verification process using the procedure explained in each channel's **Complete verification and get delivery status** section on its [Get Started page](https://developer.telesign.com/enterprise/docs/verify-api-get-started#usage-instructions) is a mandatory step when using Verify API. This step allows Telesign to know the real state of your verification as well as control all the features related to a verification process such as fallback, callback, and pricing. If your end user has verified themselves but the verification process is not updated, these features might not work as intended which can lead to extra costs or incorrect billing.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | Identifier of the verification to be altered. The value has been returned upon requesting verification via POST method. |

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | string | yes | Specifies how you want to change the verification state for this verification process. Use one of these values: * "finalize" - Finalize this verification process. Telesign either verifies or rejects at this stage. Example: `finalize`. |
| `security_factor` | string | yes | If Telesign has sent a one-time passcode (OTP) to your end user as part of this verification process, include the asserted OTP from your end user here. If Telesign generated the code, this is necessary to determine if the OTPs match. If you generated the code, this is necessary to end the verification process and avoid added costs due to additional sends to the end user. Length: 3-10. Example: `5724433`. |

### Example request

```json
{
  "action": "finalize",
  "security_factor": "5724433"
}
```

### Responses

**HTTP 200**

**Success.** Your update request has been accepted and the current status of the verification process is included in this response.

Status code | Associated text string | Description
--|--|--
3900|Verified|The asserted OTP and the OTP generated by Telesign match. Verification process completed successfully.
3904|Verification Failed|The asserted OTP and the OTP generated by Telesign do not match. Verification process continues if retries are still available.
3909|Invalid code entered|The asserted OTP and the OTP generated by Telesign do not match, and also did not match in two previous attempts. Verification process completed unsuccessfully.

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3101   | Invalid value for parameter phone_number: {phone_number} | Phone number is too long, too short, or contains non-digit values.
 3103   |   Unsupported value for parameter external_id |   External ID is longer than 100 characters or contains non-ASCII characters.
 3110   |   Invalid request |   The API request or its JSON payload is improperly formatted.
 3302   |   Missing parameter phone_number  |   The API request does not contain the mandatory parameter `phone_number`.

**HTTP 401**

**Unauthorized.** You are not permitted to perform this action. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3203	|	Callback URL parameter not enabled for Customer ID	|	Using callback_url in the API request is not allowed for this account.
 3400	|	Not authorized	|	No permissions for this resource or authorization failed.
 3906	|	Unified Verification Product not enabled for Customer ID	|	This product is not enabled for this account.

**HTTP 413**

**Content too large.** Your request failed because the payload is too large. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3116   |   Payload limit size exceeded |   The payload of this request exceeds the 10KB limit.

**HTTP 429**

**Too Many Requests.** Your account has sent too many requests in a given amount of time. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
-------------|-----------------------
 3204       | Rate Limit Exceeded   |   You have exceeded the allowed number of requests per second on this API.

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status code in the response payload rather than the HTTP status of the response.

 Status.code | Status.Description  | Additional details
 ------------|---------------------|------------------------------
 3500   |   System Unavailable  |   The system is currently unavailable. You should resubmit this request.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `status` | object |  |  |
| `status.code` | integer | yes | Example: `3900`. |
| `status.description` | string | yes | Example: `Verified`. |

### Example response (200)

```json
{
  "status": {
    "code": 3900,
    "description": "Verified"
  }
}
```

