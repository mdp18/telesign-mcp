# SMS Verify API - API reference

Standalone SMS one-time passcode verification with Telesign- or self-generated codes.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `smsverify_send_code`, `smsverify_get_status`, `smsverify_report_completion`._

## Send SMS verification code

**MCP tool:** `smsverify_send_code`

```http
POST https://rest-ww.telesign.com/v1/verify/sms
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/sendsmsverifycode> (updated 2026-09-11)

Use this action to send an SMS with a verification code to a recipient phone number.

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
| `phone_number` | string | yes | The end user's phone number you want to send a message to, as digits without spaces or special characters, beginning with the country dialing code. Example: `15558675309`. |
| `ucid` | string |  | A code specifying the use case you are making the request for. Choices include: * `ATCK` - For use in a 2FA situation like updating an account or logging in. * `BACF` - For creating an account where the service may be vulnerable to bulk attacks and fraudsters. * `BACS` - For creating an account where the service may be vulnerable to bulk attacks or individual spammers. * `CHBK` - For use when someone is trying to buy something expensive or unusual and you want to verify it is really them. * `CLDR` - Calendar event. * `LEAD` - For use in a situation where you require a person to enter personal details to request information about a potential purchase (like a loan, real estate, or attending a school), and you want to check if they are legitimate. * `OTHR` - For a situation not addressed by other tags. * `PWRT` - For use in a situation where a password reset is required. * `RESV` - For use when you have end users making reservations, and you want to confirm they will show up. * `RXPF` - For use when you are trying to prevent prescription fraud. * `SHIP` - For use when you are sending a shipping notification. * `THEF` - For use when you are trying to prevent an end user from deactivating or redirecting a phone number for identity theft purposes. * `TRVF` - For use when you are transferring money and want to check if the transfer is approved by sending a text message to your end user. This is similar to `CHBK`, but is specifically for a money transaction. * `UNKN` - For a situation not addressed by other tags (same as `OTHR`). |
| `originating_ip` | string |  | Your end user's IP address (do not send your own IP address). This is used to help Telesign improve our services. IPv4 and IPv6 are supported. For IPv4, the value must be in the format defined by the Internet Engineering Task Force (IETF) in the Internet-Draft document titled <a href="https://tools.ietf.org/html/rfc791">Internet Protocol</a>. For IPv6, the value must be in the format defined by the IETF in the Internet-Draft document titled <a href="https://tools.ietf.org/html/rfc4291#section-2.2">IP Version 6 Addressing Architecture</a>. |
| `language` | string |  | A code specifying the language of the predefined template you wish to use. For a complete list of codes, see [SMS Verify API - Supported languages](https://developer.telesign.com/enterprise/docs/sms-verify-api-supported-languages). If you provide overriding message text in the `template` parameter, this field is not used. |
| `verify_code` | string |  | The verification code used for the code challenge. By defauls, Telesign randomly generates a seven-digit numeric value for you. You can override the default behavior by including your own numeric code for this parameter, with a value between `000` and `9999999`. Only numeric characters are supported. Either way, the verification code replaces the variable `$$CODE$$` in the message template. Length: 3-7. Example: `57244`. |
| `template` | string |  | Text that overrides the contents of the predefined message templates. Include the `$$CODE$$` variable to have the verification code automatically inserted. For payment transactions, include the `$$AMOUNT$$` and `$$PAYEE$$` variables to have those payment details from your other params automatically inserted. By default, the maximum length of this field is 160 characters. Telesign recommends that you keep your messages brief if possible, but if you want to send longer messages contact our Customer Support Team to have the maximum increased. A long message may be up to 1600 characters. Example: `Your code is $$CODE$$`. |
| `sender_id` | string |  | Specifies the sender ID to be displayed to the end user on the SMS message. Before using this, give any sender IDs you might want to use to our Customer Support Team, so we can add them to our allow list. If the sender ID in this field is not on this list, it is not used. We do not guarantee that the sender ID you specify will be used; Telesign may override this value to improve delivery quality or to follow the SMS regulations of particular countries. We recommend limiting values to 0-9 and A-Z, as support for other ASCII characters varies by carrier. Length: 0-20. |
| `is_primary` | string |  | Whether you are using this service as your primary provider to send this message (`”true”`) or"as a backup after your primary provider failed (`”false”`). We use this data to optimize message routing. Default: `"true"`. |
| `dlt_template_id` | string |  | **(India-local traffic only)**. The ID of the DLT template used for this message. See [India DLT Update](https://support.telesign.com/s/article/India-DLT-Update) for more details on the relevant regulations. Length: 0-40. |
| `dlt_entity_id` | string |  | **(India-local traffic only)**. The ID of the entity sending this message. See [India DLT Update](https://support.telesign.com/s/article/India-DLT-Update) for more details on the relevant regulations. Length: 0-40. |
| `transaction_amount` | string |  | **(Payment-transactions only)**  Replaces the `$$AMOUNT$$` variable in the message template. Specifies the currency and amount for the payment that the end user is approving. This parameter is required if `transaction_payee` is included in the request. Length: 0-40. |
| `transaction_payee` | string |  | **(Payment-transactions only)** Replaces the `$$PAYEE$$` variable in the message template. Specifies the entity that the end user is approving a payment to. This parameter is required if `transaction_amount` is included in the request. Length: 0-40. |
| `sim_swap_check` | string |  | Set a value of `"true"` to screen this transaction using a Telesign SIM Swap check. This only has an effect if we have enabled SIM Swap for your account and configured it to be toggled using this parameter. If your account is configured to perform the check on every transaction, set a value of `"false"` to suppress the check. Contact our [Customer Support Team](mailto:support@telesign.com) to turn on this feature. Length: 0-40. |
| `callback_url` | string |  | A URL where you want delivery reports to be sent related to your request. This overrides any default callback URL that you’ve previously set. The override only lasts for this request. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a message being sent. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

 | Status code | Associated text string | Description                                      |
 |-------------|------------------------|--------------------------------------------------|
 | 290         | Message in progress    | The message is being sent to the SMS gateway.    |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Status description   | Error code | Description   |
|------------|--------------------------|------------|--------------------------|
| 500 | Transaction not attempted | -10001     | Invalid Request: {parameter name} Parameter: {parameter value} |
| 500 | Transaction not attempted | -10001     | Invalid Request: Missing Parameter: {parameter name} |
| 500 | Transaction not attempted | -10001     | Invalid Request: {parameter name} Parameter                 |
| 500 | Transaction not attempted | -10001     | Not Allowed Host: IP/Hostname Parameter: {host_ip_address}/{host_name} |
| 500 | Transaction not attempted | -40006     | Bad request              |

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Status description   | Error code | Description   |
|------------|--------------------------|------------|--------------------------|
| 500 | Transaction not attempted | -10009     | Invalid source IP address |
| 500 | Transaction not attempted | -10033     | {phone_number} has not been verified for this trial account. |
| 501 | Not authorized            | -20002     | This product is not enabled for this Customer ID.  |
| 501 | Not authorized            | -30000     | Invalid Customer ID. |
| 501 | Not authorized            | -30001     | Customer ID Account Suspended. |
| 501 | Not authorized            | -30004     | Missing required 'Authorization' header |
| 501 | Not authorized            | -30005     | Required 'Authorization' header is not in the correct format|
| 501 | Not authorized            | -30006     | Invalid Signature |
| 501 | Not authorized            | -30007     | Missing required 'Date' or 'x-ts-date' header    |
| 500 | Transaction not attempted | -30008     | Invalid 'x-ts-auth-method' header.|
| 501 | Not authorized            | -30009     | 'Date' or 'x-ts-date' header is not RFC822 compliant  |
| 501 | Not authorized            | -30010     | 'Date' or 'x-ts-date' header is not within tolerable range |
| 501 | Not authorized            | -30011     | 'x-ts-nonce' header value is either too long or too short |
| 501 | Not authorized            | -30012     | 'x-ts-nonce' header value has been used recently |
| 501 | Not authorized            | -30015     | Invalid API Key.  |

**HTTP 429**

**Too many requests.** The user sent too many requests in a given amount of time. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Status description   | Error code | Description   |
|------------|--------------------------|------------|--------------------------|
| 500 | Transaction not attempted | -40007     | Rate Limit Exceeded   |
| 500 | Transaction not attempted | -40008     | Verify SMS exceeded transaction hard cap. Request denied.         |

**HTTP 500**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Status description   | Error code | Description   |
|------------|--------------------------|------------|--------------------------|
| 500 | Transaction not attempted | -90001  | System Unavailable, please try again later.  |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The subresource in the URL accessed by this request. Example: `sms`. |
| `errors` | array of object |  | Contains an object specifying each error that occurred. If no errors occurred, the array is empty. |
| `errors[].code` | integer |  | A numeric code specifying which error occurred. Example: `-10001`. |
| `errors[].description` | string |  | Text describing the error that occurred. Example: `Invalid Request: PhoneNumber Parameter`. |
| `status` | object |  | Contains properties describing the preliminary delivery status of the SMS you sent. |
| `status.updated_on` | string | yes | An RFC 3339 timestamp indicating when the delivery status was last updated. Example: `2020-08-27T17:28:49.559307Z`. |
| `status.code` | integer | yes | A numeric code indicating the delivery status of the SMS. Example: `290`. |
| `status.description` | string | yes | Text describing the delivery status of the SMS. Example: `Message in progress`. |
| `verify` | object |  | Contains properties related to the verification status. |
| `verify.code_state` | string enum |  | Indicates whether the verification code you provided in your request matches that sent by Telesign to the end-user. At this point in the verification process, the status is always `UNKNOWN`. Allowed: `UNKNOWN`. Example: `UNKNOWN`. |
| `verify.code_entered` | string |  | Always set to an empty string. There is no code entered by the end user at this point in the verification process. |
| `phone_type` | object |  | This object is only included if enabled by the [Telesign Customer Support Team](mailto:support@telesign.com). |
| `phone_type.code` | string |  | One of the [phone type codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-codes). Example: `2`. |
| `phone_type.description` | string |  | Text describing the phone type. Example: `MOBILE`. |
| `numbering` | object |  | Contains properties related to the numbering attributes of the specified phone number. This object is only included if enabled by the [Telesign Customer Support Team](mailto:support@telesign.com). |
| `numbering.original` | object |  | Contains details about the original phone number included in the request. |
| `numbering.original.phone_number` | string |  | The base phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `7833012348`. |
| `numbering.original.complete_phone_number` | string |  | The base phone number prefixed with the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `17833012348`. |
| `numbering.original.country_code` | string |  | The 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for the United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing` | object |  | Contains details about how the phone number was cleansed. Phone cleansing corrects common formatting issues in submitted phone numbers. |
| `numbering.cleansing.call` | object |  | Contains cleansing details for the phone number if it is enabled to receive voice calls. |
| `numbering.cleansing.call.cleansed_code` | integer |  | One of the [phone number cleansing codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes) specifying the cleansing operation performed on the phone number. Example: `100`. |
| `numbering.cleansing.call.country_code` | string |  | The 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing.call.max_length` | integer |  | The maximum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `numbering.cleansing.call.min_length` | integer |  | The minimum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `numbering.cleansing.call.phone_number` | string |  | The base phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `7833012348`. |
| `numbering.cleansing.sms` | object |  | Contains cleansing details for the phone number if it is enabled to receive SMS. |
| `numbering.cleansing.sms.cleansed_code` | integer |  | One of the [phone number cleansing codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes) specifying the cleansing operation performed on the phone number. Example: `100`. |
| `numbering.cleansing.sms.country_code` | string |  | The 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing.sms.max_length` | integer |  | The maximum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `numbering.cleansing.sms.min_length` | integer |  | The minimum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `numbering.cleansing.sms.phone_number` | string |  | The base phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `7833012348`. |
| `risk` | object |  | Contains properties related to the risk score for the specified phone number. Only returned when this feature has been enabled by the [Telesign Customer Support Team](mailto:support@telesign.com). |
| `risk.level` | string |  | The severity of the risk. [Score Scales](https://developer.telesign.com/enterprise/docs/intelligence-get-started#score-scales) provides a table with risk levels. Example: `low`. |
| `risk.recommendation` | string enum |  | The action that Telesign recommends that you take based on the risk score. Allowed: `allow`, `flag`, `block`. Example: `allow`. |
| `risk.score` | integer |  | The risk score for this phone number. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "sms",
  "errors": [],
  "status": {
    "updated_on": "2020-08-27T17:28:49.559307Z",
    "code": 290,
    "description": "Message in progress"
  },
  "verify": {
    "code_state": "UNKNOWN",
    "code_entered": ""
  }
}
```


---

## Get transaction status

**MCP tool:** `smsverify_get_status`

```http
GET https://rest-ww.telesign.com/v1/verify/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getsmsverifystatus> (updated 2026-09-11)

Get delivery status and other details for a Telesign SMS Verify API transaction that you have created. Use this endpoint also to complete verification, if Telesign generated your code.

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
| `verify_code` | string |  | If Telesign generated the code sent to your end user, include the asserted verification code from your end user here. Example: `57244`. |

### Responses

**HTTP 200**

Success. Your request was fulfilled and resulted in data being retrieved. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

 | Status code | Associated text string | Description                                      |
 |-------------|------------------------|--------------------------------------------------|
 | 200         | Delivered to handset   | The SMS was delivered to the end user's phone. (Final)   |
 | 201         | Transaction successfully completed, suspicious activity detected   | Telesign's internal anti-fraud mechanisms identified potentially suspicious activity related to the destination phone number.   |
 | 203         | Delivered to gateway   | The SMS was delivered to the gateway. If the gateway responds with further information (including successful delivery to handset or delivery failure), the status is updated.    (Intermediate)  |
 | 207         | Error delivering SMS to handset (reason unknown)  | The SMS could not be delivered to the end user's handset for an unknown reason. (Final) |
 | 210         | Temporary phone error  | The SMS could not be delivered to the handset due to a temporary error with the phone. Examples - phone is turned off, not enough memory to store the message. (Final)   |
 | 211         | Permanent phone error  | The SMS could not be delivered to the handset due to a permanent error with the phone. For example, the phone is incompatible with SMS, or illegally registered on the network. This can happen when a phone number is blacklisted, or is incorrectly provisioned. (Final)    |
 | 220         | Gateway/network cannot route message | The network cannot route the message to the handset. (Final)   |
 | 221         | Message expired before delivery | The message was queued by the mobile provider and timed out before it could be delivered to the handset. (Final)  |
 | 222         | SMS not supported      | SMS is not supported by this phone, carrier, plan, or user.  |
 | 229         | Message blocked by customer request  | Telesign blocked the SMS before it was sent. This is due to your prior submitted request to blocklist this phone number. |
 | 230         | Message blocked by Telesign    | Telesign blocks a message if it is being sent to a phone number that is on a global blocklist.    |
 | 231         | Invalid/unsupported    | Invalid/unsupported message content.      |
 | 233         | Message blocked due to high risk score. | It was determined that the risk score for the destination number is higher than configured Maximum Risk Score. For that reason Telesign did not send the SMS.  |
 | 237         | Message blocked in requested country|You requested that messages in a specific country be blocked, and the message was being sent to this country.|
 | 250         | Final status unknown   | The final status of the SMS cannot be determined.|
 | 251         | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | Telesign successfully delivered the message through our gateway and it passed downstream. However, Telesign did not receive a delivery receipt within 12 hours of transmission. We cannot confirm delivery to the handset. The end user most likely did not receive the message. |
 | 290         | Message in progress    | The message is being sent to the SMS gateway.    |
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

Bad request. The request could not be understood by the server due to malformed syntax. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -10001     | Invalid Request: ReferenceID Parameter: <reference_id> |
| -10001     | Invalid Request: CustomerID Parameter: <customer_id>   |
| -10001     | Invalid Request: AuthenticationID                      |
| -10001     | Invalid Request: CustomerID/AuthenticationID Parameter: <customer_id>/<authentication_id> |
| -10001     | Invalid Request: customer_id Parameter: <customer_id> |

Associated text string for -10001 will change depending on the parameter.

**HTTP 401**

Unauthorized. The request requires user authentication. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -10001     | Not Allowed Host: Hostname Parameter: \<parameter> |
| -10001     | Not Allowed Host: IP Parameter: \<parameter> |
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
| -30008     | Invalid 'x-ts-auth-method' header. |
| -30009     | 'Date' or 'x-ts-date' header is not RFC822 compliant |
| -30010     | 'Date' or 'x-ts-date' header is not within tolerable range |
| -30011     | 'x-ts-nonce' header value is either too long or too short |
| -30012     | 'x-ts-nonce' header value has been used recently |
| -30015     | Invalid API Key. |

**HTTP 404**

Not found. The server has not found anything matching the request URI. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -10001     | CustomerID/ReferenceID not found |
| -10001     | CustomerID/ReferenceID not found: CustomerID/ReferenceID Parameter: \<parameter> |
| -10004     | Reference ID expired.     |

Associated text string for -10001 will change depending on the parameter.

**HTTP 429**

Too many requests. The user sent too many requests in a given amount of time. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -40007     | Rate Limit Exceeded  |
| -40008     | \<product> exceeded transaction hard cap. Request denied.  |

**HTTP 503**

Service unavailable. The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Error Code | Associated text string   |
|------------|--------------------------|
| -90001     | System Unavailable, please try again later.  |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies your web service request. |
| `sub_resource` | string | yes | The subresource accessed for the request. This is always `sms` for the SMS Verify API. |
| `errors` | array of object | yes | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A numeric code specifying which error occurred. Example: `-10001`. |
| `errors[].description` | string |  | Text describing the error that occurred. Example: `Invalid Request: PhoneNumber Parameter`. |
| `status` | object | yes | Contains details about the request status. |
| `status.code` | integer | yes | A numeric code indicating the processing status of this request. |
| `status.description` | string | yes | Text describing the transaction status. |
| `status.updated_on` | string | yes | An <a href="http://www.ietf.org/rfc/rfc3339.txt">RFC 3339</a> timestamp indicating when the transaction status was updated. |
| `verify` | object |  | Contains properties about the status of the verification attempt by the end user (if any). |
| `verify.code_state` | string enum |  | Indicates whether the verification code you provided in your request matches that sent by Telesign to the end-user. Possible values are: * `VALID` - The codes match. * `INVALID` - The codes do not match. * `EXPIRED` - The match was attempted after the end of the validity period for the code. * `MAX_ATTEMPTS_EXCEEDED` - The match was attempted after the end user already had made the maximum allowed number of attempts for the code. * `UNKNOWN` - Any other state. Allowed: `VALID`, `INVALID`, `UNKNOWN`, `EXPIRED`, `MAX_ATTEMPTS_EXCEEDED`. Example: `VALID`. |
| `verify.code_entered` | string |  | If the end user entered a code, what they entered is provided here. Example: `45558`. |
| `additional_info` | object |  | Contains properties relevant when the message sent with this transaction is one of several parts of a longer message that was split. This object only appears if this feature is enabled for your account. Contact our [Customer Support Team](mailto:support@telesign.com) to request this feature. |
| `additional_info.message_part_sequence_number` | integer |  | Indicates this message's position in the series of split parts. Example: `1`. |
| `additional_info.message_parts_count` | integer |  | The total number of split parts for the longer message. If the message is not split, this value is `1`. Example: `2`. |
| `additional_info.message_parts_reference_ids` | string |  | The reference IDs for each part of the longer message, separated by commas. Example: `35E63E88CB000E049196AD1CFCFFB89C,35E63E88CC7C050491613443467F3F12`. |
| `sim_swap` | object |  | Properties related to the SIM Swap check for this transaction. This is only included if enabled by our [Customer Support Team](mailto:support@telesign.com). |
| `sim_swap.swap_date` | string |  | The date of the SIM swap, if one is detected. Example: `2018-09-05`. |
| `sim_swap.swap_time` | string |  | The time of the SIM swap, if one is detected. Example: `22:00:00`. |
| `sim_swap.risk_indicator` | integer |  | Indicates the likelihood that a SIM swap occured for this number. The response ranges between `1` and `4`. * `1` - **(very low)** Swap did not occur or it occurred 15+ days ago. * `2` - **(low)** Swap occurred between 3 and 14 days ago. * `3` - **(medium)** Swap occurred in the last 72 hours. * `4` - **(high)** Swap occurred in the last 24 hours. Example: `1`. |
| `sim_swap.status` | object |  | Contains properties related to the status of the SIM Swap check. |
| `sim_swap.status.code` | integer |  | A code indicating the status of your request. Example: `2800`. |
| `sim_swap.status.description` | string |  | Description of the status of your request. Example: `Request successfully completed`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "sms",
  "errors": [],
  "status": {
    "description": "Delivered to handset",
    "updated_on": "2022-31-03T14:51:28.709526Z",
    "code": 200
  },
  "verify": {
    "code_state": "VALID",
    "code_entered": "45558"
  },
  "additional_info": {
    "message_part_sequence_number": 1,
    "message_parts_count": 1,
    "message_parts_reference_ids": "35E63E88CB000E049196AD1CFCFFB89C,35E63E88CC7C050491613443467F3F12"
  }
}
```


---

## Report completion

**MCP tool:** `smsverify_report_completion`

```http
PUT https://rest-ww.telesign.com/v1/verify/completion/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/reportsmsverifycompletion> (updated 2026-09-11)

Use this action to notify Telesign that you have completed verification with the SMS Verify API for an end-user. This is for a verification transaction where you generated the verification code yourself.

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

| Status code | Associated text string |
|--|--|
| -10001 | Invalid parameter passed |

**HTTP 401**

Unauthorized. The request requires user authentication. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

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

Not found. The server has not found anything matching the request URI. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

| Status code | Associated text string |
|-------------|------------------------|
| -10001       | Customer ID / Reference ID not found           |

**HTTP 503**

Service unavailable. The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` and `errors.code` properties in the response payload, rather than the HTTP status code of the response.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Length: 32-32. |
| `subresource` | string |  | The subresource in the URI path from your original request to initiate this transaction. Indicates which form of verification you used. Example: `sms`. |
| `errors` | array of object |  | Contains an object for each error condition that resulted from the request. |
| `errors[].code` | integer |  | A numeric code specifying which error occurred. Example: `-10001`. |
| `errors[].description` | string |  | Text describing the error that occurred. Example: `Invalid Request: PhoneNumber Parameter`. |
| `status` | object |  | Contains details about the request status. |
| `status.code` | string | yes | A numeric code indicating the processing status of this request. |
| `status.description` | string | yes | A text description of the status code. |
| `status.updated_on` | string | yes | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the request status was updated. |

