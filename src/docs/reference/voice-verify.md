# Voice Verify API - API reference

One-time passcode verification delivered by voice call (text-to-speech).

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `voiceverify_send_code`, `voiceverify_get_status`, `voiceverify_report_completion`._

## Send a voice verification code

**MCP tool:** `voiceverify_send_code`

```http
POST https://rest-ww.telesign.com/v1/verify/call
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/sendvoiceverifycode> (updated 2026-09-11)

Use this action to send a voice message with a one-time passcode (OTP) to a recipient phone number.

To add this product to your account, [contact a Telesign expert](https://www.telesign.com/contact-sales?utm_campaign=contact%20sales%20form&utm_source=developer_portal&utm_medium=Referrer&utm_content=voice_verify). This product is available for full-service accounts only.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) and [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only UTF-8 encoded unicode characters as inputs
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string | yes | The end user's phone number, as a string of digits without spaces or punctuation, beginning with the country dialing code (for example, "1" for North America). |
| `ucid` | string |  | A string specifying a use case code. Choices include - * ATCK - for use in a 2FA situation like updating an account or logging in * BACF - for creating an account where the service may be vulnerable to bulk attacks and fraudsters * BACS - for creating an account where the service may be vulnerable to bulk attacks or individual spammers * CHBK - for use when someone is trying to buy something expensive or unusual and you want to verify it is really them * CLDR - calendar event * LEAD - for use in a situation where you require a person to enter personal information in order to obtain information about something like a loan or realty or school, and you want to check if the person is bogus or not * OTHR - if you have a situation not addressed by other tags * PWRT - for use in a situation where a password reset is required * RESV - for use when you have end users making reservations and not showing up, and you want to be able to include phone verification in the loop * RXPF - for use when you are trying to prevent prescription fraud * SHIP - for use when you are sending a shipping notification * THEF - for use when you are trying to prevent an end user from deactivating or redirecting a phone number in order to take over someone else's identity * TRVF - for use when you are transferring money and you want to check to see if it is approved by sending a text message or phone call to your end user. This is similar to CHBK, but is specifically for a money transaction * UNKN - if you have a situation not addressed by other tags (same as OTHR) |
| `originating_ip` | string |  | Your end user's IP address (do not send your own IP address). IPv4 and IPv6 are supported. For IPv4, the value must be in the format defined by the Internet Engineering Task Force (IETF) in the Internet-Draft document titled <a href="https://tools.ietf.org/html/rfc791">Internet Protocol</a>. For IPv6, the value must be in the format defined by the IETF in the Internet-Draft document titled <a href="https://tools.ietf.org/html/rfc4291#section-2.2">IP Version 6 Addressing Architecture</a>. |
| `language` | string |  | A code specifying the language of the predefined template you wish to use. For a complete list of codes, see [Voice Verify API - Supported languages for audio templates](https://developer.telesign.com/enterprise/docs/voice-verify-api-supported-languages-for-audio-templates). If you also include the `tts_message` parameter in this request, a different set of language codes is supported by the service; for a complete list of those codes, see [Voice - Supported languages for text-to-speech](https://developer.telesign.com/enterprise/docs/voice-supported-languages-for-text-to-speech). If the language you want to use is not supported, you may be able to add a custom audio template to your account, contact our [Customer Support Team](mailto:support@telesign.com) for more details. Default: `"en-US"`. Example: `en-GB`. |
| `verify_code` | string |  | By default, the verification code used for the code challenge is a randomly generated five-digit number assigned by Telesign. If you prefer to use your own verification code, you can override the default behavior by including a three- to five-digit numeric value between 100 and 99999 as the value for this parameter. |
| `prompt_message` | string |  | This message is to be used in conjunction with `prompt_digit`. You provide a message to play, it is converted to text-to-speech and sent in a call and played for the end user. You are limited to 2000 code points. The message should contain the digit you want to press. For example, you might have the message - Press 7 to continue. Make sure the digit in your message matches the digit you send for `prompt_digit`. If the end user presses the correct digit, then the message you have for the `message` parameter plays. If the end user does not press the correct digit, the follow up message does not play, they hear the regular message repeated again. This can happen up to three times. If an end user presses incorrect digits on the third play through, the call hangs up. If the end user does not press any digits in the allotted time, the message repeats. If the end user does not press any digits a second time in a row, the call hangs up. All messages use the same `language` tag if you choose to include one. |
| `prompt_digit` | string |  | This digit is to be used in conjunction with `prompt_message`. Provide a single digit 0-9 that you want the end user to press. After playing the prompt message, the system will wait and give the end user two chances to press the correct digit. If they do, the message in the `message` parameter plays. All messages use the same `language` tag if you choose to include one. |
| `caller_id` | string |  | This parameter allows you to set a phone number as caller ID for a Voice Verify API call sent to your end users. In order to use a specific caller ID, you must purchase a phone number from Telesign. This can be done by contacting our Customer Support Team and asking to buy one or more numbers. Be aware that 100% preservation of a caller ID value is not guaranteed. Telesign or a terminating operator may override the caller ID value that your end user will receive in order to improve delivery quality or follow local Telecom regulations in particular countries. |
| `tts_message` | string |  | Provides a custom text-to-speech (TTS) message containing the verification one-time passcode (OTP) to play to the end user; this overrides the default template for the specified language. You must specify the message's language in the `language` parameter and the variable `$$CODE$$` in the message text. See [Voice Verify API - Text-to-speech tips](https://developer.telesign.com/enterprise/docs/voice-verify-api-text-to-speech-tips) for more details about this feature. |
| `pressx` | string |  | PressX is a feature that allows you to send an end user a message that asks them to press a digit in order to hear their verification code. The message is in English, and as follows: Hello. Thank you for using the phone verification system. Please press *digit* to hear your code. The *digit* is randomly selected by Telesign, and the end user gets two tries to get the correct digit. If the end user presses the correct digit, they will receive a message containing their verification code. Please note that this feature is only available in English, so you cannot use a language tag for other languages with it. To use this feature, you would put `pressx=1` in the body of your request. You cannot use this feature with TTS. |
| `extension_type` | string |  | It is not an issue when a user’s phone number belongs to a modern Private Branch Exchange (PBX) because outside numbers are usually assigned to individual extensions. Older PBX systems on the other hand, require extra call processing because incoming calls require either a live switchboard operator or an automated attendant to request the number of the user’s extension before completing the call. By default, Telesign does not support older PBX systems, but you can enable support for either live or automated switchboard scenarios by including the extension_type parameter. When you use this parameter, you must also use extension_template. |
| `extension_template` | string |  | A numerical string that specifies the extension used in the call, as described above. If the user must be reached at an extension, then use this parameter to specify the extension number. The extension string is composed of digits. You may use a maximum of 28 characters to specify your extension. For the extension_type=1 (DTMF digits are dialed), you can include commas in the extension number string, where each comma represents a one second pause in the dialing sequence. |
| `callback_url` | string |  | A URL where you want delivery reports to be sent related to your request. This overrides any default callback URL that you've previously set. The override only lasts for this request. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                           |
|-------------|------------------------|-------------------------------------------------------|
| 100         | Call answered          | The call was answered.                                |
| 101         | Not answered           | The call was not answered.                            |
| 103         | Call in progress       | Telesign is either making the call or playing the voice message.                                        |
| 105         | Call not handled yet   | The verification call has not yet been attempted.     |
| 106         | Call failed            | An error occurred. No further attempt to call will be made.                                                 |
| 107         | Line busy              | The line is busy.                                     |
| 108         | Call canceled by Telesign      | Call canceled by Telesign.              |
| 129         | Call blocked by your request  | Telesign blocked the call before it was placed. This is due to your prior submitted request to blocklist this phone number.                                    |
| 130         | Call blocked by Telesign       | Telesign blocked the phone call. This can happen if the message contains inappropriate material, or if Telesign believes the client is abusing the service.  |
| 500         | Transaction not attempted   | No request was attempted with this product.       |
| 501         | Not authorized         | No permissions for this resource, or authorization failed.                                               |
| 599         | Status not available   | The system is unable to provide status at this time.  |

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Error Code | Associated Text String   |
|------------|--------------------------|
| -10001     | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service)                 |
| -40006     | Bad Request              |
| -40007     | No Data Submitted        |

**HTTP 401**

**Unauthorized.** The request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Error Code | Description   |
|------------|--------------------------|
| -10009     | Invalid source IP address|
| -20002     | This product is not enabled for this Customer ID.                      |
| -20003     | This feature is not enabled for this Customer ID.                      |
|-20,004|This product is not enabled for this country.|
| -30000     | Invalid Customer ID.     |
| -30001     | Customer ID Account Suspended.               |
| -30002     | Customer ID Account Not Activated.               |
| -30003     | Customer ID new account limit reached.           |
| -40002     | Not Authorized           |

**HTTP 404**

**Not Found.** The server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Error Code | Associated Text String   |
|------------|--------------------------|
| -10001     | CustomerID/ReferenceID not found (returned when the reference ID given does not exist)          |
| -10004     | Reference ID expired     |
| -40004     | Resource Not Found       |

**HTTP 405**

**Method not allowed.** The request method is known by the server but has been disabled and cannot be used.

| Error Code | Associated Text String   |
|------------|--------------------------|
| -40005     | Method Not Allowed       |

**HTTP 429**

**Too Many Requests.**

| Error Code | Associated Text String   |
|------------|--------------------------|
| -40008     | {product} exceeded transaction hard cap. Request denied.          |

**HTTP 503**

**Service Unavailable.** The system is unavailable, try again.

| Error Code | Associated Text String   |
|------------|--------------------------|
| -90001     | System Unavailable, please try again later.  |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The sub-resource in the URI path from your original request to initiate this transaction. Indicates which form of verification you used. Example: `call`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A numeric code specifying which error occurred. Example: `-10001`. |
| `errors[].description` | string |  | Text describing the error that occurred. Example: `Invalid Request: PhoneNumber Parameter`. |
| `status` | object |  | Contains details about the request status. |
| `status.code` | integer | yes | A numeric code indicating the processing status of this request. Example: `103`. |
| `status.description` | string | yes | A text description of the status code. Example: `Call in progress`. |
| `status.updated_on` | string | yes | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the request status was updated. Example: `2024-03-11T21:09:19.378673Z`. |
| `verify` | object |  | Contains properties about the status of the verification attempt by the end user (if any). |
| `verify.code_state` | string enum | yes | Indicates whether the verification code you provided in your request matches that sent by Telesign to the end-user. Possible values are: * `VALID` - The codes match. * `INVALID` - The codes do not match. * `EXPIRED` - The match was attempted after the end of the validity period for the code. * `MAX_ATTEMPTS_EXCEEDED` - The match was attempted after the end user already had made the maximum allowed number of attempts for the code. * `UNKNOWN` - Any other state. Allowed: `VALID`, `INVALID`, `UNKNOWN`, `EXPIRED`, `MAX_ATTEMPTS_EXCEEDED`. Example: `UNKNOWN`. |
| `verify.code_entered` | string | yes | If the end user entered a code, what they entered is provided here. Example: `12345`. |
| `voice` | object |  |  |
| `voice.caller_id` | string |  | The [sender ID](https://support.telesign.com/s/article/What-is-a-Sender-ID) used for the call. Example: `+11234567890`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "call",
  "errors": [],
  "status": {
    "code": 103,
    "description": "Call in progress",
    "updated_on": "2024-03-11T21:09:19.378673Z"
  },
  "verify": {
    "code_state": "UNKNOWN",
    "code_entered": ""
  },
  "voice": {
    "caller_id": "+11234567891"
  }
}
```


---

## Get transaction status

**MCP tool:** `voiceverify_get_status`

```http
GET https://rest-ww.telesign.com/v1/verify/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getvoiceverifystatus> (updated 2026-09-11)

Get delivery status and other details for a Telesign Voice Verify API transaction that you have created. Use this endpoint also to complete verification, if Telesign generated your code.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The reference_id Telesign returned when the transaction was created. |

### Query parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `verify_code` | string |  | If Telesign generated the code sent to your end user, include the asserted verification code from your end user here. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in data being retrieved. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

 | Status code | Associated text string | Description                                      |
 |-------------|------------------------|--------------------------------------------------|
 | 100         | Call answered    | The call was answered by the end user or voicemail. |
 | 101         | Not answered     | No one answered the call. |
 | 103         | Call in progress | The call is in progress. You get back an immediate response from Telesign when you make a request, usually with this status. If you retrieve status info later, it will resolve to a different status code. |
 | 105         | Call not handled yet | The verification call has not yet been attempted. |
 | 106         | Call failed | The call did not go through. Typically this occurs when Telesign’s upstream providers fail to complete the call. Sometimes retrying will work.|
 | 107         | Line busy | The line was busy when the call tried to reach the end user’s device. |
 | 108         | Call canceled by Telesign | Call canceled by Telesign |
 | 129         | Call blocked by your request |	Telesign blocked the call before it was placed. This is due to your prior submitted request to blocklist this phone number. |
 | 130         | Call blocked by Telesign |	Telesign blocks a message if it is being sent to a phone number that is on a global blocklist. |
 | 200         | Delivered to handset   | The SMS was delivered to the end user's phone. (Final)   |
 | 203         | Delivered to gateway   | The SMS was delivered to the gateway. If the gateway responds with further information (including successful delivery to handset or delivery failure), the status is updated.    (Intermediate)  |
 | 207         | Error delivering SMS to handset (reason unknown)  | The SMS could not be delivered to the end user's handset for an unknown reason. (Final) |
 | 210         | Temporary phone error  | The SMS could not be delivered to the handset due to a temporary error with the phone. Examples - phone is turned off, not enough memory to store the message. (Final)   |
 | 211         | Permanent phone error  | The SMS could not be delivered to the handset due to a permanent error with the phone. For example, the phone is incompatible with SMS, or illegally registered on the network. This can happen when a phone number is blacklisted, or is incorrectly provisioned. (Final)    |
 | 220         | Gateway/network cannot route message | The network cannot route the message to the handset. (Final)   |
 | 221         | Message expired before delivery | The message was queued by the mobile provider and timed out before it could be delivered to the handset. (Final)  |
 | 222         | SMS not supported      | SMS is not supported by this phone, carrier, plan, or user.  |
 | 229         | Message blocked by your request  | Telesign blocked the SMS before it was sent. This is due to your prior submitted request to blocklist this phone number. |
 | 230         | Message blocked by Telesign    | Telesign blocks a message if it is being sent to a phone number that is on a global blocklist.    |
 | 231         | Invalid/unsupported    | Invalid/unsupported message content.      |
 | 233         | Message blocked due to high risk score. | It was determined that the risk recommendation for the destination number is higher than the configured maximum risk recommendation. For that reason Telesign did not send the SMS.  |
 | 237         | Message blocked in requested country|You requested that messages in a specific country be blocked, and the message was being sent to this country.|
 | 238         | Destination blocked by prefix|You requested that phone numbers with a particular prefix be blocked.|
 | 250         | Final status unknown   | The final status of the SMS cannot be determined.|
 | 251         | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | This message was successfully delivered to the gateway, but Telesign cannot confirm delivery to the handset because Telesign does not receive the final handset DLR in this region.  NOTE: There is a high probability that this message was successfully delivered to the handset.  |
 | 290         | Message in progress    | The message is being sent to the SMS gateway.    |
 | 291         | Queued by Telesign     | Telesign is experiencing unusually high volume and has queued the SMS message.   |
 | 292         | Queued by gateway      | The SMS gateway has queued the message.          |
 | 295         | Status delayed         | The status of the SMS is temporarily unavailable.|
 | 500         | Transaction not attempted   | No SMS request was attempted. |
 | 501         | Not authorized         | No permissions for this resource, or authorization failed.                            |
 | 502         | Campaign error         | This error can be generated if there is a problem with the short code used.                        |
 | 503         | Carrier rejected - temporary problem | This error is generated if there is an error on the carrier or operator side that is temporary and the message can be retried.      |
 | 504         | Carrier rejected - permanent error | This error is generated if there is an error on the carrier or operator side that is permanent and the message should not be retried.      |
 | 505         | Error on gateway - temporary error | This error is generated if there is an error on Telesign's partner side that is considered temporary and the message can be retried.      |
 | 506         | Error on gateway - permanent error    | This error is generated if there is an error on Telesign's partner side that is considered permanent and the message should not be retried. |
 | 507         | Invalid destination address   | There is a problem with the destination address used. Either the format is not valid, or the number is not associated with any carrier, or if MSC is used it does not know about this MSISDN.  |
 | 508         | Invalid source address | The message requires a source address. Verify that one is provided and correct.   |
 | 509         | Parameters problem     | One or more parameters used in the request is not supported.   |
 | 510         | Message blocked by subscriber action or  request   | The end user has blocked receiving SMS with their carrier plan or by request or from the particular short code used.  |
 | 511         | Subscriber low on credit     | The end user exceeded their spending limits and cannot receive SMS.   |
 | 512         | Roaming error          | End user cannot receive SMS because their device that receives the messages is roaming.  |
 | 513         | Mobile number portability error  | SMS failed because ported combinations are unreachable. |
 | 514         | Subscriber absent      | The operator/carrier is temporarily unable to reach the end user.   |
 | 515         | Suspected spam         | This message is considered to be spam by carrier or operator.    |
 | 517         | Selected DLT details for India not supported|The DLT template ID or entity ID in the request cannot be found by the end operator.|
 | 518         | Message blocked due to high risk SIM SWAP indicator|The service determined that the SIM swap risk indicator for the destination number is higher than the maximum value configured for your account. For that reason Telesign did not send the SMS. |
 | 519         | Message not sent - requested SIM SWAP check could not be performed|The service could not perform the SIM swap check. This is because either the number is out of SIM swap coverage or information about the potential SIM swap event is missing. |
 | 520 | Content sent is not allowed|The content in this message is not permitted by the carrier. |
 | 521         | Requested Sender ID is not allowed for destination |The sender ID submitted in request is not allowed in destination country/operator. |
 | 599         | Status not available | The system is unable to provide status at this time.  |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -10001     | Invalid Request: ReferenceID Parameter: <reference_id> |
| -10001     | Invalid Request: CustomerID Parameter: <customer_id>   |
| -10001     | Invalid Request: AuthenticationID                      |
| -10001     | Invalid Request: CustomerID/AuthenticationID Parameter: <customer_id>/<authentication_id> |
| -10001     | Invalid Request: customer_id Parameter: <customer_id> |

Associated text string for -10001 will change depending on the parameter.

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -10001     | Not Allowed Host |
| -10009     | Invalid source IP address. |
| -20001     | Invalid Request: CustomerID Parameter: <customer_id> |
| -20002     | This product is not enabled for this Customer ID.  |
| -30000     | Invalid Customer ID.     |
| -30001     | Customer ID Account Suspended.                     |
| -30002     | Customer ID Account Not Activated.                 |
| -30003     | Customer ID new account limit reached.             |
| -30004     | Missing required 'Authorization' header |
| -30005     | Required 'Authorization' header is not in the correct format |
| -30006     | Invalid Signature |
| -30007     | Missing required 'Date' or 'x-ts-date' header    |
| -30009     | 'Date' or 'x-ts-date' header is not RFC822 compliant |
| -30010     | 'Date' or 'x-ts-date' header is not within tolerable range |
| -30011     | x-ts-nonce' header value is either too long or too short |
| -30012     | 'x-ts-nonce' header value has been used recently |
| -30015     | Invalid API Key. |

**HTTP 404**

**Not found.** The server has not found anything matching the request URI. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -10001     | CustomerID/ReferenceID not found |
| -10001     | CustomerID/ReferenceID not found Parameter: CustomerID/ReferenceID: <customer_id>/<reference_id> |
| -10004     | Reference ID expired     |

Associated text string for -10001 will change depending on the parameter.

**HTTP 429**

**Too many requests.** The user sent too many requests in a given amount of time. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -40007     | Rate Limit Exceeded  |
| -40008     | {product} exceeded transaction hard cap. Request denied.  |

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -90001     | System Unavailable, please try again later.  |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The sub-resource in the URI path from your original request to initiate this transaction. Indicates which form of verification you used. Example: `call`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A numeric code specifying which error occurred. Example: `-10001`. |
| `errors[].description` | string |  | Text describing the error that occurred. Example: `Invalid Request: PhoneNumber Parameter`. |
| `status` | object |  |  |
| `status.code` | integer |  | Example: `100`. |
| `status.description` | string |  | Example: `Call answered`. |
| `verify` | object |  |  |
| `verify.code_state` | string |  | Example: `VALID`. |
| `verify.code_entered` | string |  | Example: `57244`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "call",
  "errors": [],
  "status": {
    "code": 100,
    "description": "Call answered",
    "updated_on": "2024-03-11T21:09:19.378673Z"
  },
  "verify": {
    "code_state": "VALID",
    "code_entered": "12345"
  }
}
```


---

## Report completion

**MCP tool:** `voiceverify_report_completion`

```http
PUT https://rest-ww.telesign.com/v1/verify/completion/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/reportvoiceverifycompletion> (updated 2026-09-11)

Use this action to notify Telesign that you have completed verification with the Telesign Voice Verify API for an end-user. This is for a verification transaction where you generated the verification code yourself.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The reference_id Telesign returned when the transaction was created. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status code | Description                                      |
|-------------|--------------------------------------------------|
| 1900        | Verify completion successfully recorded  |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Associated text string |
|--|--|
| -10001 | Invalid parameter passed |

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

 | Status code | Associated text string |
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

**Not found.** The server has not found anything matching the request URI. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Associated text string |
|-------------|------------------------|
| -10001       | Customer ID / Reference ID not found           |

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | Example: `voice`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A numeric code specifying which error occurred. Example: `-10001`. |
| `errors[].description` | string |  | Text describing the error that occurred. Example: `Invalid Request: PhoneNumber Parameter`. |
| `status` | object |  |  |
| `status.code` | integer |  | Example: `1900`. |
| `status.description` | string |  | Example: `Verify completion successfully recorded`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "voice",
  "errors": [],
  "status": {
    "code": 1900,
    "description": "Verify completion successfully recorded",
    "updated_on": "2024-03-11T21:09:19.378673Z"
  }
}
```

