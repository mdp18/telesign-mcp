# App Verify API - API reference

Android app verification by flash call: the caller ID of an auto-terminated voice call is the verification code.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `appverify_initiate`, `appverify_get_status`, `appverify_finalize_call`, `appverify_report_caller_id`, `appverify_report_timeout`._

## Send call with verification code

**MCP tool:** `appverify_initiate`

```http
POST https://rest-ww.telesign.com/v1/verify/auto/voice/initiate
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/sendappverifycode> (updated 2026-09-11)

Use this endpont to initiate verification of the specified phone number using the Telesign App Verify API.

To add this product to your account, [contact a Telesign expert](https://www.telesign.com/contact-sales?utm_campaign=contact%20sales%20form&utm_source=developer_portal&utm_medium=Referrer&utm_content=app_verify). This product is available for Full-service accounts only.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) and [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only UTF-8 encoded unicode characters as inputs
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string | yes | Your end user's phone number, including the country code. Example: `11234567890`. |
| `carrier` | string |  | The name of the company providing communication services for the device. This parameter takes the form of a string that can be up to 32 characters long. |
| `connection_type` | string |  | The type of connection the device uses, such as WiFi or cellular. This parameter is an integer up to 3 characters long. |
| `device_icc` | string |  | The international country code for the carrier for the device. This is an integer that is 3 characters long. |
| `device_phone_number` | string |  | The phone number associated with the device. This parameter is a string that can be up to 32 characters long. |
| `is_roaming` | string |  | Whether the device is considered to be roaming in the current network, for Global System for Mobile Communications (GSM) purposes. It is an integer that is 1 character long. |
| `is_voice_capable` | string |  | Whether the device is capable of sending and receiving voice calls and messages. It is an integer that is 1 character long. |
| `network_type` | string |  | The type of network the device is in. It is an integer that is 3 characters long. |
| `os_version` | string |  | The version of the operating system the device uses. Length: 8-8. |
| `platform_version` | string |  | The version of Android the device uses. Length: 8-8. |
| `verify_code` | string |  | If you choose to specify a code (it should be five digits long), then you would add it to your initiate request as a string as shown in the example. You must have this feature enabled, speak with our Customer Support Team for assistance. Example: `20085`. |
| `verification_timeout` | integer |  | The time in seconds that the handset is going to wait for the verification call to arrive, from the time it receives a successful initiate response. The call time is limited to 45 seconds. |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -10001 | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service) -or- Unsupported product name |
| -30002 | Account not activated |
| -30003 | Account limit reached |
| -30014 | Invalid App Verify API finalize |
| -40006 | Bad Request |
| -40007 | Rate limit exceeded |
| -40022 | App Verify API not supported |

**HTTP 401**

Unauthorized, the request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error codes | Description |
|-------------|-------------|
| -10009 | Invalid source IP address |
| -20002 | This product is not enabled for this customer ID |
| -20003 | This feature is not enabled for this CustomerID  |
| -30002 | CustomerID Account Not Activated |
| -30003 | CustomerID New Account Limit Reached |
| -40002 | Not Authorized |

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error codes | Description |
|-------------|-------------|
| -40004 | Resource not found |

**HTTP 405**

Indicates that the request method is known by the server but has been disabled and cannot be used.

| Error codes | Description |
|-------------|-------------|
| -40005 | Method not allowed |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -40008 | [Product method] exceed transaction hard cap; Request denied |

**HTTP 503**

Service Unavailable, system unavailable, try again. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|-----------|-------------|
| -90001 | System unavailable; please try again later |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The name of the subresource accessed. Example: `auto_verify_initiate`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A one to five-digit error code (possibly negative) that indicates the type of error that occurred. |
| `errors[].description` | string |  | A description of the type of error that occurred. |
| `status` | object |  | Contains details about the request status. |
| `status.code` | integer |  | A numeric code indicating the processing status of this request. \| Value \| Description \| \|-------\|-------------\| \| 2400 \| Pending \| \| 2401 \| Success \| \| 2402 \| Failure \| \| 2403 \| Not Attempted \| \| 2404 \| Invalid Phone Number \| \| 2405 \| Not Supported \| \| 2407 \| CallerID prefix did not match \| \| 2408 \| Unsupported phone type \| \| 2409 \| Verification call not received \| \| 2410 \| Please retry verification \| \| 2411 \| Verification call failed \| \| 2429 \| Call blocked by customer request \| \| 2430 \| Call blocked by Telesign \| Example: `2400`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Pending`. |
| `status.updated_on` | string |  | An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp indicating when the transaction status was updated. Example: `2025-03-05T21:47:07.962922Z`. |
| `resource_uri` | string |  | You should disregard this parameter, as it is not currently needed to use the API. |
| `verify_code` | string |  | The code you sent us for verification. Obtained from the last five digits of the caller ID. Example: `20085`. |
| `prefix` | string |  | The first digits included in the caller ID returned by Telesign. Remove these from the beginning of the caller ID to get the verify code. Example: `4478730`. |

### Example response (200)

```json
{
  "resource_uri": "/v1/auto/voice/finalize",
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "auto_verify_initiate",
  "errors": [],
  "status": {
    "updated_on": "2025-03-05T21:47:07.962922Z",
    "code": 2400,
    "description": "Pending"
  },
  "prefix": "4478730",
  "verify_code": "20085"
}
```


---

## Get transaction status

**MCP tool:** `appverify_get_status`

```http
GET https://rest-ww.telesign.com/v1/verify/auto/voice/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getappverifystatus> (updated 2026-09-11)

Use this endpoint to get the status of a Telesign App Verify API request that you initiated.

To add this product to your account, [contact a Telesign expert](https://www.telesign.com/contact-sales?utm_campaign=contact%20sales%20form&utm_source=developer_portal&utm_medium=Referrer&utm_content=app_verify). This product is available for full-service accounts only.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) and [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only UTF-8 encoded unicode characters as inputs
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The reference identifier that Telesign returned in the response to your request to the initiate endpoint. Use it here to determine the status of your voice call. |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -10001 | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service) -or- Unsupported product name |
| -50059 | Status not available |

**HTTP 401**

Unauthorized, the request requires user authentication. If
you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error codes | Description |
|-------------|-------------|
| -10009 | Invalid source IP address |
| -40002 | Not Authorized |

**HTTP 404**

Not found. The server has not found anything matching the request URI. Code against the Telesign status or error codes from the status.code and errors.code properties in the response payload, rather than the HTTP status code of the response.

| Error code | Description |
|------------|-------------|
| -10004     | Reference ID expired. |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -40008 | [Product method] exceed transaction hard cap; Request denied |

**HTTP 503**

Service Unavailable, system unavailable, try again. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -90001 | System unavailable; please try again later |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The name of the subresource accessed. Example: `app_verify_api`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A one to five-digit error code (possibly negative) that indicates the type of error that occurred. |
| `errors[].description` | string |  | A description of the type of error that occurred. |
| `status` | object |  | Contains details about the request status. |
| `status.code` | integer |  | A numeric code indicating the processing status of this request. \| Value \| Description \| \|-------\|-------------\| \| 2400 \| Pending \| \| 2401 \| Success \| \| 2402 \| Failure \| \| 2403 \| Not Attempted \| \| 2404 \| Invalid Phone Number \| \| 2405 \| Not Supported \| \| 2407 \| CallerID prefix did not match \| \| 2408 \| Unsupported phone type \| \| 2409 \| Verification call not received \| \| 2410 \| Please retry verification \| \| 2411 \| Verification call failed \| \| 2429 \| Call blocked by customer request \| \| 2430 \| Call blocked by Telesign \| Example: `2401`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Success`. |
| `status.updated_on` | string |  | An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp indicating when the transaction status was updated. Example: `2025-03-28T21:19:42.406000Z`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "app_verify_api",
  "errors": [],
  "status": {
    "updated_on": "2025-03-28T21:19:42.406000Z",
    "code": 2401,
    "description": "Success"
  }
}
```


---

## End call

**MCP tool:** `appverify_finalize_call`

```http
POST https://rest-ww.telesign.com/v1/verify/auto/voice/finalize
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/endappverifycall> (updated 2026-09-11)

Use this endpoint to terminate a call created using the Telesign App Verify API if the handset does not terminate the call in your application.

To add this product to your account, [contact a Telesign expert](https://www.telesign.com/contact-sales?utm_campaign=contact%20sales%20form&utm_source=developer_portal&utm_medium=Referrer&utm_content=app_verify). This product is available for full-service accounts only.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) and [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only UTF-8 encoded unicode characters as inputs
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The reference identifier that Telesign generates and returns in its response to your verify/call service request. This value uniquely identifies each Telesign web service request. [Example] `reference_id=ABCDEF0123456789ABCDEF0123456789` |
| `verify_code` | string |  | Caller ID parsed by app from the caller id displayed on the device. |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -10001 | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service) -or- Unsupported product name |
| -30002 | Account not activated |
| -30003 | Account limit reached |
| -30014 | Invalid App Verify API finalize |
| -40006 | Bad Request |
| -40007 | Rate limit exceeded |
| -40022 | App Verify API not supported |

**HTTP 401**

Unauthorized, the request requires user authentication. If
you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Codes | Description |
|-------------|-------------|
| -10009 | Invalid source IP address |
| -20002 | This product is not enabled for this customer ID |
| -20003 | This feature is not enabled for this CustomerID  |
| -30002 | CustomerID Account Not Activated |
| -30003 | CustomerID New Account Limit Reached |
| -40002 | Not Authorized |

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Codes | Description |
|-------------|-------------|
| -40004 | Resource not found |

**HTTP 405**

Indicates that the request method is known by the server but has been disabled and cannot be used.

| Error Codes | Description |
|-------------|-------------|
| -40005 | Method not allowed |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -40008 | [Product method] exceed transaction hard cap; Request denied |

**HTTP 503**

Service Unavailable, system unavailable, try again. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -90001 | System unavailable; please try again later |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The name of the subresource accessed. Example: `auto_verify_finalize`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A one to five-digit error code (possibly negative) that indicates the type of error that occurred. |
| `errors[].description` | string |  | A description of the type of error that occurred. |
| `status` | object |  | Contains details about the request status. |
| `status.code` | integer |  | A numeric code indicating the processing status of this request. \| Value \| Description \| \|-------\|-------------\| \| 2400 \| Pending \| \| 2401 \| Success \| \| 2402 \| Failure \| \| 2403 \| Not Attempted \| \| 2404 \| Invalid Phone Number \| \| 2405 \| Not Supported \| \| 2407 \| CallerID prefix did not match \| \| 2408 \| Unsupported phone type \| \| 2409 \| Verification call not received \| \| 2410 \| Please retry verification \| \| 2411 \| Verification call failed \| \| 2429 \| Call blocked by customer request \| \| 2430 \| Call blocked by Telesign \| Example: `2401`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Success`. |
| `status.updated_on` | string |  | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the request status was updated. Example: `2025-03-21T16:27:03.473939Z`. |
| `resource_uri` | string |  | You should disregard this parameter, as it is not currently needed to use the API. |
| `verify_code` | string |  | The code you sent us for verification. Obtained from the last five digits of the caller ID. Example: `69816`. |

### Example response (200)

```json
{
  "resource_uri": "/v1/verify/6656E61D9674045C91D417A1EC38210A",
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "auto_verify_finalize",
  "errors": [],
  "status": {
    "updated_on": "2025-03-21T16:27:03.473939Z",
    "code": 2401,
    "description": "Success"
  },
  "verify_code": "69816"
}
```


---

## Report unknown caller ID

**MCP tool:** `appverify_report_caller_id`

```http
POST https://rest-ww.telesign.com/v1/verify/auto/voice/finalize/callerid
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/reportappverifycallerid> (updated 2026-09-11)

If a Telesign App Verify API call is unsuccessful, the device will not receive the call. If there is a prefix sent by Telesign in the initiate request and it cannot be matched to the CLI of the verification call, you can use use this endpoint to report the issue to Telesign for troubleshooting.

To add this product to your account, [contact a Telesign expert](https://www.telesign.com/contact-sales?utm_campaign=contact%20sales%20form&utm_source=developer_portal&utm_medium=Referrer&utm_content=app_verify). This product is available for full-service accounts only.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) and [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only UTF-8 encoded unicode characters as inputs
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `customer_id` | string |  | Your customer ID, assigned to you by Telesign. |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies your web service request. Example: `DEF0123456789ABCDEF0123456789`. |
| `unknown_caller_id` | string | yes | The caller ID that was not recognized. |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -10001 | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service) -or- Unsupported product name |
| -30002 | Account not activated |
| -30003 | Account limit reached |
| -30014 | Invalid App Verify API finalize |
| -40006 | Bad Request |
| -40007 | Rate limit exceeded |
| -40022 | App Verify API not supported |

**HTTP 401**

Unauthorized, the request requires user authentication. If
you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error codes | Description |
|-------------|-------------|
| -10009 | Invalid source IP address |
| -20002 | This product is not enabled for this customer ID |
| -20003 | This feature is not enabled for this CustomerID  |
| -30002 | CustomerID Account Not Activated |
| -30003 | CustomerID New Account Limit Reached |
| -40002 | Not Authorized |

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error codes | Description |
|-------------|-------------|
| -40004 | Resource not found |

**HTTP 405**

Indicates that the request method is known by the server but has been disabled and cannot be used.

| Error codes | Description |
|-------------|-------------|
| -40005 | Method not allowed |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -40008 | [Product method] exceed transaction hard cap; Request denied |

**HTTP 503**

Service Unavailable, system unavailable, try again. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|-----------|-------------|
| -90001 | System unavailable; please try again later |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The name of the subresource accessed. Example: `auto_verify_finalize_unknown`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A one to five-digit error code (possibly negative) that indicates the type of error that occurred. |
| `errors[].description` | string |  | A description of the type of error that occurred. |
| `status` | object |  | Contains details about the request status. |
| `status.code` | integer |  | A numeric code indicating the processing status of this request. \| Value \| Description \| \|-------\|-------------\| \| 2400 \| Pending \| \| 2401 \| Success \| \| 2402 \| Failure \| \| 2403 \| Not Attempted \| \| 2404 \| Invalid Phone Number \| \| 2405 \| Not Supported \| \| 2407 \| CallerID prefix did not match \| \| 2408 \| Unsupported phone type \| \| 2409 \| Verification call not received \| \| 2410 \| Please retry verification \| \| 2411 \| Verification call failed \| \| 2429 \| Call blocked by customer request \| \| 2430 \| Call blocked by Telesign \| Example: `2407`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Caller ID prefix did not match`. |
| `status.updated_on` | string |  | An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp indicating when the transaction status was updated. Example: `2025-03-24T21:12:50.289628Z`. |
| `resource_uri` | string |  | You should disregard this parameter, as it is not currently needed to use the API. |

### Example response (200)

```json
{
  "resource_uri": "/v1/verify/665728003420025C91D5CDEF02F89BDF",
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "auto_verify_finalize_unknown",
  "errors": [],
  "status": {
    "updated_on": "2025-03-24T21:12:50.289628Z",
    "code": 2407,
    "description": "Caller ID prefix did not match"
  }
}
```


---

## Report timeout

**MCP tool:** `appverify_report_timeout`

```http
POST https://rest-ww.telesign.com/v1/verify/auto/voice/finalize/timeout
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/reportappverifytimeout> (updated 2026-09-11)

If a mobile device verification call does not make it to the designated handset within the specified amount of time, you can use the Finalize Timeout endpoint to report the issue to Telesign.

To add this product to your account, [contact a Telesign expert](https://www.telesign.com/contact-sales?utm_campaign=contact%20sales%20form&utm_source=developer_portal&utm_medium=Referrer&utm_content=app_verify). This product is available for full-service accounts only.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) and [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only UTF-8 encoded unicode characters as inputs
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -10001 | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service) -or- Unsupported product name |
| -30002 | Account not activated |
| -30003 | Account limit reached |
| -30014 | Invalid App Verify API finalize |
| -40006 | Bad Request |
| -40007 | Rate limit exceeded |
| -40022 | App Verify API not supported |

**HTTP 401**

Unauthorized, the request requires user authentication. If
you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error codes | Description |
|-------------|-------------|
| -10009 | Invalid source IP address |
| -20002 | This product is not enabled for this customer ID |
| -20003 | This feature is not enabled for this CustomerID  |
| -30002 | CustomerID Account Not Activated |
| -30003 | CustomerID New Account Limit Reached |
| -40002 | Not Authorized |

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error codes | Description |
|-------------|-------------|
| -40004 | Resource not found |

**HTTP 405**

Indicates that the request method is known by the server but has been disabled and cannot be used.

| Error codes | Description |
|-------------|-------------|
| -40005 | Method not allowed |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -40008 | [Product method] exceed transaction hard cap; Request denied |

**HTTP 503**

Service Unavailable, system unavailable, try again. Error codes are listed in the `error` parameter in the response.

| Error code | Description |
|------------|-------------|
| -90001 | System unavailable; please try again later |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The name of the subresource accessed. Example: `auto_verify_finalize_timeout`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A one to five-digit error code (possibly negative) that indicates the type of error that occurred. |
| `errors[].description` | string |  | A description of the type of error that occurred. |
| `status` | object |  | Contains details about the request status. |
| `status.code` | integer |  | A numeric code indicating the processing status of this request. \| **Value** \| **Description**                     \| \|-----------\|-------------------------------------\| \| 2400      \| Pending                             \| \| 2401      \| Success                             \| \| 2402      \| Failure                             \| \| 2403      \| Not Attempted                       \| \| 2404      \| Invalid Phone Number                \| \| 2405      \| Not Supported                       \| \| 2407      \| CallerID prefix did not match       \| \| 2408      \| Unsupported phone type              \| \| 2409      \| Verification call not received      \| \| 2410      \| Please retry verification           \| \| 2411      \| Verification call failed            \| \| 2429      \| Call blocked by customer request    \| \| 2430      \| Call blocked by Telesign            \| Example: `2409`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Verification call not received`. |
| `status.updated_on` | string |  | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the request status was updated. Example: `2025-03-24T20:06:01.454168Z`. |
| `resource_uri` | string |  | You should disregard this parameter, as it is not currently needed to use the API. |

### Example response (200)

```json
{
  "resource_uri": "/v1/verify/2657270BF1AC075C91D69D9A76E8600C",
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "auto_verify_finalize_timeout",
  "errors": [],
  "status": {
    "updated_on": "2025-03-24T20:06:01.454168Z",
    "code": 2409,
    "description": "Verification call not received"
  }
}
```

