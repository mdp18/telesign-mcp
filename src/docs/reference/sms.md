# SMS - API reference

Text messaging for alerts, notifications and account security: single SMS, bulk SMS, delivery status and completion reporting.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `messaging_send_sms`, `messaging_get_sms_status`, `messaging_report_completion`, `messaging_send_bulk_sms`._

## Send an SMS message

**MCP tool:** `messaging_send_sms`

```http
POST https://rest-ww.telesign.com/v1/messaging
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/sendsms> (updated 2026-09-11)

Send an SMS message. Use request parameters to specify the type of message, what phase of the account lifecycle the message is being sent in, and additional details about the transaction.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string | yes | The end user's phone number with country code included. Avoid use of special characters and spaces. Example: `15558675309`. |
| `message` | string | yes | Text of the message to be sent to the end user. You are limited to 1600 characters. If you send a very long message, Telesign splits your message into separate parts. Telesign recommends against sending messages that require multiple SMSes when possible. |
| `message_type` | string | yes | This parameter specifies the traffic type being sent in the message. You can provide one of the following values - * OTP (One time passwords) * ARN (Alerts, reminders, and notifications) * MKT (Marketing traffic) |
| `account_lifecycle_event` | string |  | This parameter allows you to indicate what phase of the lifecycle you are in when you send a transaction. The options for this parameter are - * create - For the creation of a new account) * sign-in For when an end user signs in to their account. * transact - For when an end user completes a transaction within their account * update - For when an update is performed, such as an update of account information or similar. * delete - For when an account is deleted. |
| `sender_id` | string |  | This parameter allows you to set a specific sender ID to be used on an SMS message sent to the end user. In order to use a specific sender ID, Telesign must whitelist your selected sender ID values. Be aware that 100% preservation of a sender ID value is not guaranteed. Telesign may override the sender ID value that your end user will receive in order to improve delivery quality or follow SMS regulations in particular countries. In order to use this feature, you must contact Telesign Support and have them enable it for you. We recommend limiting values to 0-9 and A-Z, as support for other ASCII characters varies by carrier. Length: 0-20. |
| `external_id` | string |  | A customer-generated ID for this transaction. The response simply echoes the value provided for this parameter. |
| `originating_ip` | string |  | Your end user's IP address (do not send your own IP address). This is used to help Telesign improve our services. IPv4 and IPv6 are supported. For IPv4, the value must be in the format defined by the Internet Engineering Task Force (IETF) in the Internet-Draft document titled [Internet Protocol](https://tools.ietf.org/html/rfc791). For IPv6, the value must be in the format defined by the IETF in the Internet-Draft document titled [IP Version 6 Addressing Architecture](https://tools.ietf.org/html/rfc4291#section-2.2). |
| `callback_url` | string |  | A URL where you want delivery reports to be sent related to your request. This overrides any default callback URL that you’ve previously set. The override only lasts for this request. |
| `is_primary` | string |  | Whether you are using this service as your primary provider to send this message (`”true”`) or as a backup after your primary provider failed (`”false”`). We use this data to optimize message routing. Default: `"true"`. |
| `dlt_template_id` | string |  | **(India-local traffic only)**. The ID of the DLT template used for this message. See *[India DLT Update](https://support.telesign.com/s/article/India-DLT-Update)* for more details on the relevant regulations. Length: 0-40. |
| `dlt_entity_id` | string |  | **(India-local traffic only)**. The ID of the entity sending this message. See *[India DLT Update](https://support.telesign.com/s/article/India-DLT-Update)* for more details on the relevant regulations. Length: 0-40. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status code and use that rather than the HTTP status response.

| Status code | Associated text string | Description |
|-------------|------------------------|-------------|
| 290         | Message in progress    | The message is being sent to the SMS gateway.    |

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

 Status code | Associated text string
 ------------|------------------------
 11000 | Invalid value for parameter phone_number.
 11001 | Invalid country code for parameter phone_number.
 11003 | Invalid value for parameter account_lifecycle_event
 11004 | Invalid value for parameter callback_url
 11009 | Invalid value for parameter message.
 11010 | Invalid value for parameter originating_ip.
 11013 | Invalid value for parameter sender_id.
 11016 | Invalid value for parameter external_id
 11017 | Invalid value for parameter message_type.
 11027 | Invalid value for parameter integration_name.
 11034 | Invalid value for parameter dlt_template_id
 11035 | Invalid value for parameter dlt_entity_id
 12000 | Missing Required Parameter phone_number
 12009 | Missing Required Parameter message
 12017 | Missing Required Parameter message_type

**HTTP 401**

Unauthorized, the request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

  Status code | Associated Text String
 -------------|------------------------
 10002 | 'x-ts-nonce' header value has been used recently
 10003 | 'x-ts-nonce' header value is either too long or too short
 10004 | 'Date' or 'x-ts-date' header is not within tolerable range
 10005 | 'Date' or 'x-ts-date' header is not RFC822 compliant
 10006 | Invalid 'x-ts-auth-method' header.
 10007 | Missing required 'Date' or 'x-ts-date' header
 10008 | Invalid Signature.
 10009 | Missing required 'Authorization' header
 10010 | CustomerID Account Suspended
 10011 | This product is not enabled for this CustomerID.
 10014 | Invalid source IP address.
 10015 | Invalid Customer ID.
 10022 | Invalid API Key.
 10028 | Required 'Authorization' header is not in the correct format
 10031 | Not Allowed Host
 10033 | {phone_number} has not been verified for this trial account.
 10035 | The requested API host is not allowed for this CustomerID.

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

 Status code | Associated text string
-------------|-----------------------
 10019       | Rate Limit Exceeded
 10020       | Generic messaging exceeded transaction hard cap. Request denied.

**HTTP 500**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Associated text string |
|-------------|------------------------|
| 10000       |  System Unavailable, Please try again later. |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object | yes |  |
| `status.code` | integer | yes | A numeric code that indicates the status of your transaction. Example: `290`. |
| `status.description` | string | yes | Text describing the status of your transaction. Example: `Message in progress`. |
| `phone_number_modified` | string |  | Indicates whether the end user's phone number provided in the request was modified before processing by Telesign to increase message deliverability. Contact our [Customer Support Team](mailto:support@telesign.com) to enable this feature. Possible values are `"True"` and `"False"`. |
| `external_id` | string |  | The customer-generated ID for this transaction that was provided in the request. If the `external_id` parameter was not included in the request, the value here is `null`. Example: `CustomExternalID7349`. |
| `cleansed_phone_number` | string |  | The corrected version of the submitted phone number returned in the response after common formatting issues are fixed to improve deliverability. If there are no changes, the original phone number from the request is returned. Contact our [Customer Support Team](support@telesign.com) to enable this feature. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 290,
    "description": "Message in progress",
    "updated_on": "2022-31-03T14:51:28.709526Z"
  }
}
```


---

## Get transaction status

**MCP tool:** `messaging_get_sms_status`

```http
GET https://rest-ww.telesign.com/v1/messaging/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getsmsstatus> (updated 2026-09-11)

Get delivery status and other details for an SMS transaction that you have created.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique identifier you can use to query the Messaging API and find out the status of your transaction. |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

 | Status Code | Associated Text String | Description                                      |
 |-------------|------------------------|--------------------------------------------------|
 | 200         | Delivered to handset   | The SMS was delivered to the end user's phone. (Final)                                          |
 | 201         | Transaction successfully completed, suspicious activity detected   | Telesign's internal anti-fraud mechanisms identified potentially suspicious activity related to the destination phone number.   |
 | 203         | Delivered to gateway   | The SMS was delivered to the gateway. If the gateway responds with further information (including successful delivery to handset or delivery failure), the status is updated. (Intermediate)                                   |
 | 207         | Error delivering SMS to handset (reason unknown)   | The SMS could not be delivered to the end user's handset for an unknown reason. (Final)           |
 | 210         | Temporary phone error  | The SMS could not be delivered to the handset due to a temporary error with the phone. Examples - phone is turned off, not enough memory to store the message. (Final)                             |
 | 211         | Permanent phone error  | The SMS could not be delivered to the handset due to a permanent error with the phone. For example, the phone is incompatible with SMS, or illegally registered on the network. This can happen when a phone number is blacklisted, or is incorrectly provisioned. (Final)                             |
 | 220         | Gateway/network cannot route message | The network cannot route the message to the handset. (Final)                                 |
 | 221         | Message expired before delivery | The message was queued by the mobile provider and timed out before it could be delivered to the handset. (Final)                             |
 | 222         | SMS not supported      | SMS is not supported by this phone, carrier,    plan, or user.                                   |
 | 231         | Invalid/unsupported    | Invalid/unsupported message content  |
 | 237         | Message blocked in requested country    | You requested that messages in a specific country be blocked, and the message was being sent to this country                                    |
 | 238         | Destination blocked by prefix | You requested that phone numbers with a   particular prefix be blocked.                    |
 | 250         | Final status unknown   | The final status of the SMS cannot be determined.|
 | 251         | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | Telesign successfully delivered the message through our gateway and it passed downstream. However, Telesign did not receive a delivery receipt within 12 hours of transmission. We cannot confirm delivery to the handset. The end user most likely did not receive the message. |
 | 290         | Message in progress    | The message is being sent to the SMS gateway.    |
 | 292         | Queued by gateway      | The SMS gateway has queued the message.          |
 | 295         | Status delayed         | The status of the SMS is temporarily unavailable.|
 | 502         | Campaign error         | This error can be generated if there is a problem with the short code used.                        |
 | 503         | Carrier rejected - temporary problem    | This error is generated if there is an error on the carrier or operator side that is temporary and the message can be retried.                  |
 | 504         | Carrier rejected - permanent error    | This error is generated if there is an error on the carrier or operator side that is permanent and the message should not be retried.           |
 | 505         | Error on gateway - temporary error   | This error is generated if there is an error on Telesign's partner side that is considered temporary and the message can be retried.        |
 | 506         | Error on gateway - permanent error    | This error is generated if there is an error on Telesign's partner side that is considered permanent and the message should not be retried. |
 | 507         | Invalid destination address   | There is a problem with the destination address used. Either the format is not valid, or the number is not associated with any carrier, or if MSC is used it does not know about this MSISDN.  |
 | 508         | Invalid source address | The message requires a source address. Verify    that one is provided and correct.                |
 | 509         | Parameters problem | One or more parameters used in the request is not supported.|
 | 510         | Message blocked by subscriber action or  request     | The end user has blocked receiving SMS with their carrier plan or by request or from the particular short code used.                                 |
 | 511         | Subscriber low on credit    | The end user exceeded their spending limits and cannot receive SMS.                              |
 | 512         | Roaming error          | End user cannot receive SMS because their device that receives the messages is roaming.           |
 | 513         | Mobile number portability error         | SMS failed because ported combinations are unreachable.                                     |
 | 514         | Subscriber absent      | The operator/carrier is temporarily unable to reach the end user.       |
 | 515         | Suspected spam         | This message is considered to be spam by carrier or operator.                                     |
 | 517         | Selected DLT details for India not supported | The DLT template ID or entity ID in the request cannot be found by the end operator.|
 | 520         | Content sent is not allowed | The content in this message is not permitted by the carrier.|
 | 521         | Requested Sender ID is not allowed for destination  | The sender ID submitted in request is not allowed in destination country/operator. |

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

 | Status Code | Associated Text String |
 |-------------|------------------------|
 | 11011       | Invalid value for parameter reference_id |

**HTTP 401**

Unauthorized, the request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

  Status code | Associated Text String
 -------------|------------------------
 10002 | 'x-ts-nonce' header value has been used recently
 10003 |'x-ts-nonce' header value is either too long or too short
 10004 | 'Date' or 'x-ts-date' header is not within tolerable range
 10005 | Date' or 'x-ts-date' header is not RFC822 compliant
 10006 | Invalid 'x-ts-auth-method' header.
 10007 | Missing required 'Date' or 'x-ts-date' header
 10008 | Invalid Signature.
 10009 | Missing required 'Authorization' header
 10010 | CustomerID Account Suspended.
 10011 | This product is not enabled for this CustomerID.
 10013 | CustomerID Account Not Found
 10014 | Invalid source IP address.
 10015 | Invalid Customer ID.
 10022 | Invalid API Key.
 10028 | Required 'Authorization' header is not in the correct format
 10031 | Not Allowed Host
 10035 | The requested API host is not allowed for this CustomerID.

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status code | Description |
|-------------|------------------------|
| 10017       | Customer ID / Reference ID not found           |
| 10036       |	Reference ID expired |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

 Status code | Associated text string
-------------|-----------------------
 10019       | Rate Limit Exceeded

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Associated text string |
|-------------|------------------------|
| 10000       |  System Unavailable, Please try again later. |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object | yes |  |
| `status.updated_on` | string |  | A timestamp showing when your transaction status was updated last. Example: `2022-31-03T14:51:28.709526Z`. |
| `additional_info` | object |  | Contains properties relevant when the message sent with this transaction is one of several parts of a longer message that was split. Only appears if message-splitting is enabled for your account. Contact our [Customer Support Team](mailto:support@telesign.com) to request this feature. |
| `additional_info.message_part_sequence_number` | integer |  | Indicates this message's position in the series of split parts. Example: `1`. |
| `additional_info.message_parts_count` | integer |  | The total number of split parts for the longer message. If the message is not split, this value is `1`. Example: `2`. |
| `additional_info.message_parts_reference_ids` | string |  | The reference IDs for each part of the longer message, separated by commas. Example: `35E63E88CB000E049196AD1CFCFFB89C,35E63E88CC7C050491613443467F3F12`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 290,
    "description": "Message in progress",
    "updated_on": "2022-31-03T14:51:28.709526Z"
  },
  "additional_info": {
    "message_part_sequence_number": 1,
    "message_parts_count": 2,
    "message_parts_reference_ids": "35E63E88CB000E049196AD1CFCFFB89C,35E63E88CC7C050491613443467F3F12"
  }
}
```


---

## Report completion

**MCP tool:** `messaging_report_completion`

```http
PUT https://rest-ww.telesign.com/v1/verify/completion/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/reportsmscompletion> (updated 2026-09-11)

Use this action to notify Telesign that an end-user has received your SMS.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The reference ID for the transaction you want to provide completion data about. |

### Responses

**HTTP 200**

Success. Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status code | Description                                      |
|-------------|--------------------------------------------------|
| 1900        | Verify completion successfully recorded  |

**HTTP 400**

Bad request. The request could not be understood by the server due to malformed syntax. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status Code | Associated text string |
|--|--|
| -10001 | Invalid parameter passed |

**HTTP 401**

Unauthorized. The request requires user authentication. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

 | Status Code | Associated text string |
 |-------------|------------------------|
 | -30000 | Invalid customer ID |
 | -30001 | Account suspended |
 | -30002 | Account not activated |
 | -30003 | Account limit reached |
 | -30004 | Missing required Authorization header |
 | -30005 | Required Authorization header is not in the correct format |
 | -30006 | Invalid signature |
 | -30007 | Missing required Date or X-TS-Date header |
 | -30008 | Invalid X-TS-Auth-Method header |
 | -30009 | Date or X-TS-Date header is not [RFC822 compliant](https://www.w3.org/Protocols/rfc822/) |
 | -30010 | Date or X-TS-Date header is not within tolerable range |
 | -30011 | X-TS-Nonce header value is either too long or too short |
 | -30012 | X-TS-Nonce header value has been used recently |
 | -30013 | Invalid ReferenceID for Verify Completion |

**HTTP 404**

Not found. The server has not found anything matching the request URI. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status Code | Associated text string |
|-------------|------------------------|
| -10001       | Customer ID / Reference ID not found           |

**HTTP 503**

Service unavailable. The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A 32-digit hex value used to identify the web service request. The value is unique to each web service request, is randomly generated by Telesign, and is returned in the response message immediately following the web service request. |
| `subresource` | string |  | The subresource in the URI path from your original request to initiate this transaction. Indicates which form of verification you used. Example: `sms`. |
| `errors` | array of object |  | Contains an object for each error that resulted from the request. |
| `errors[].code` | integer |  | A numeric code specifying which error occurred. Example: `-10001`. |
| `errors[].description` | string |  | Text describing the error that occurred. Example: `Invalid Request: PhoneNumber Parameter`. |
| `status` | object |  |  |
| `status.code` | string | yes | A numeric code describing the processing status of your transaction. See [All status and error codes](https://developer.telesign.com/enterprise/docs/all-status-and-error-codes) |
| `status.description` | string | yes | A text description of the status code. |
| `status.updated_on` | string | yes | This is a timestamp showing when your transaction status was updated last. |


---

## Send bulk SMS

**MCP tool:** `messaging_send_bulk_sms`

```http
POST https://rest-ww.telesign.com/v1/verify/bulk_sms
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/sendbulksms> (updated 2026-09-11)

Use this endpoint to send the same SMS message to multiple recipients.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `recipients` | string | yes | Comma separated list of recipient phone numbers (maximum of 1000). Optionally append a session ID to each phone number separated by a colon. |
| `template` | string | yes | The text of the message to your recipients. Example: `Your message here.`. |
| `ucid` | string |  | A string specifying a use case code. Choices include - * ATCK - for use in a 2FA situation like updating an account or logging in * BACF - for creating an account where the service may be vulnerable to bulk attacks and fraudsters * BACS - for creating an account where the service may be vulnerable to bulk attacks or individual spammers * CHBK - for use when someone is trying to buy something expensive or unusual and you want to verify it is really them * CLDR - calendar event * LEAD - for use in a situation where you require a person to enter personal information in order to obtain information about something like a loan or realty or school, and you want to check if the person is bogus or not * OTHR - if you have a situation not addressed by other tags * PWRT - for use in a situation where a password reset is required * RESV - for use when you have end users making reservations and not showing up, and you want to be able to include phone verification in the loop * RXPF - for use when you are trying to prevent prescription fraud * SHIP - for use when you are sending a shipping notification * THEF - for use when you are trying to prevent an end user from deactivating or redirecting a phone number in order to take over someone else's identity * TRVF - for use when you are transferring money and you want to check to see if it is approved by sending a text message or phone call to your end user. This is similar to CHBK, but is specifically for a money transaction * UNKN - if you have a situation not addressed by other tags (same as OTHR) |
| `sender_id` | string |  | The phone number from which to send these SMS messages. |
| `session_id` | string |  | Your own ID for this bulk transaction. It is returned in delivery callbacks for recipients that have no ID of their own in recipients. Example: `CustomExternalID7349`. |

### Responses

**HTTP 200**

**Success.** Your request to the service was created.

| Status Code | Associated text string | Description|
|-------------|------------------------|------------|
| 293 | Bulk request accepted | The bulk request was accepted by Telesign. |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

|Status Code | Status Description     | Error Code |Error Description |
|------------|------------------------|------------|------------------|
|500|Transaction not attempted|-10001|Invalid Request: Missing parameter Parameter: Template|
|500|Transaction not attempted|-10002|Empty recipients list|
|500|Transaction not attempted|-10003|Max number of recipients exceeded|
|500|Transaction not attempted|-40006|Bad Request|

**HTTP 401**

**Unauthorized.** The request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

|Status Code | Status Description     | Error Code |Error Description |
|------------|------------------------|------------|------------------|
|500|Transaction not attempted|-10009|Invalid source IP address|
|501|Not authorized|-20002|This product is not enabled for this Customer ID.|
|501|Not authorized|-30000|Invalid Customer ID.|
|501|Not authorized|-30001|Customer ID Account Suspended.|
|501|Not authorized|-30006| Invalid Signature.|

**HTTP 429**

**Too Many Requests.** The user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

|Status Code | Status Description     | Error Code |Error Description |
|------------|------------------------|------------|------------------|
|500|Transaction not attempted|-40007|Rate Limit Exceeded|
|500|Transaction not attempted|-40008|Verify SMS exceeded transaction hard cap. Request denied.|

**HTTP 500**

**Service Unavailable.** System unavailable, try again.

|Status Code | Status Description     | Error Code |Error Description |
|------------|------------------------|------------|------------------|
|500|Transaction not attempted|-90001|System Unavailable, please try again later.|

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The service's unique identifier for this transaction. Length: 32-32. Example: `B562A981D0E0010488434B07861B1862`. |
| `sub_resource` | string |  | The Telesign service you made this request to. Example: `bulk_sms`. |
| `status` | object |  | Contains properties related to the processing status of the transaction. |
| `status.code` | integer |  | One of the status codes or error codes. Example: `293`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Bulk request accepted`. |
| `status.updated_on` | string |  | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the transaction status was updated. Example: `2022-06-14T23:36:56.164428Z`. |
| `errors` | array of object |  | Each object in this array describes an error that occurred during the processing of this request. |
| `errors[].code` | integer | yes | A 1 to 5-digit error code (possibly negative) that indicates the type of error that occurred. Example: `-10002`. |
| `errors[].description` | string | yes | Text describing the error that occurred. Example: `Empty recipients list`. |

### Example response (200)

```json
{
  "reference_id": "B562A981D0E0010488434B07861B1862",
  "sub_resource": "bulk_sms",
  "status": {
    "code": 293,
    "description": "Bulk request accepted",
    "updated_on": "2022-06-14T23:36:56.164428Z"
  },
  "errors": []
}
```

