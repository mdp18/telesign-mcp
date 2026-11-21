# Status and error codes

This is the lookup reference for the numeric codes Telesign returns in API responses and callbacks. Search this file by code number: every code in Telesign's published code lists has its own table row, grouped the way Telesign groups them (by product and code range). Telesign's guidance is to write your logic against these codes, not against the HTTP status of the response and not against the description text, which can change.

## HTTP status, status.code and errors[].code compared

A Telesign response carries up to three different kinds of code. They answer different questions.

| Kind | Where it is | What it tells you | Shape |
| --- | --- | --- | --- |
| HTTP status | The HTTP response line | Whether the web server accepted and processed the request at all | `200`, `201`, `400`, `401`, ... |
| Status code | `status.code` in the JSON body (with `status.description` and `status.updated_on`) | The state of the transaction: in progress, delivered, failed, blocked, verified | Usually three or four digits, tied to a product |
| Error code | `errors[].code` in the JSON body (with `errors[].description`) | Why a request was rejected or failed: bad parameter, bad credentials, product not enabled, rate limit | Usually five digits, positive or negative, shared across products |

Points to keep in mind:

- A request can return HTTP `200` and still carry a `status.code` that means failure or "not finished yet". Always read the body.
- Telesign can return status or error codes in the body for these HTTP responses: `200`, `201`, `400`, `401`, `402`, `404`, `405`, `500`, `503`. The API reference for each endpoint (see `docs_get_tool_reference("<tool>")`) lists which HTTP statuses carry which codes.
- A transaction with an **intermediate** status (for example `290`, `203`, `3001`, `3901`) may move to another status later. A transaction with a **final** status will not change again. To see a later status, poll the product's status tool with the `reference_id`, or receive callbacks (topic `callbacks`).
- Do not match on `status.description` or `errors[].description`. Match on the number.
- Several of the newer products (Messaging, Verify API, Accounts API, Phone ID identity add-ons) report request errors through `status.code` in the 3xxx, 39xx, 5xxx and 28xx ranges instead of through `errors[]`.

## Code ranges at a glance

| Range | Used by | Section in this file |
| --- | --- | --- |
| 1xx | Voice Verify API | Voice Verify API status codes (100-130) |
| 2xx | SMS, SMS Verify API, bulk SMS | SMS and SMS Verify API status codes (200-295) |
| 3xx | Phone ID, Intelligence | Phone ID and Intelligence status codes (300-301) |
| 5xx | Several products | Multi-product status codes (500-599) |
| 1900, 20xx | Completion (Get Status). Telesign also assigns 20xx and 24xx to the App Verify API; the published code list has no individual rows for those | Completion status code |
| 28xx | Phone ID identity add-ons | Phone ID identity add-on status codes (2800-2812) |
| 30xx | Messaging delivery | Messaging delivery status codes (3000-3073) |
| 31xx | Messaging request validation | Messaging invalid parameter status codes (3100-3115) |
| 32xx | Messaging enablement and limits | Messaging enablement and rate limit status codes (3200-3209) |
| 33xx | Messaging missing parameters | Messaging missing parameter status codes (3300-3306) |
| 34xx-36xx | Messaging authorization and system | Messaging authorization and system status codes (3400-3601) |
| 39xx | Verify API | Verify API verification processing status codes (3900-3952) |
| 45xx | Silent Verify API | Silent Verify API status codes (4501-4502) |
| 5000-5500 | Accounts API | Accounts API status codes (5000-5500) |
| 10000-12017 | SMS (also used as error codes by Phone ID, Intelligence, Silent Verify, Number Masking) | SMS five-digit status codes; Positive error codes |
| 40001-45010 | Silent Verify API | Positive error codes |
| 53200-53600 | Push Verify (mapped into Verify API codes) | Verify API Push Verify status mapping |
| Negative five-digit | SMS Verify API, Voice Verify API, Number Deactivation, bulk SMS, Completion, Phone ID | Negative error codes; Completion negative codes |

## HTTP response status codes

These are the HTTP statuses Telesign web servers most commonly return.

| HTTP status | HTTP description | Meaning |
| --- | --- | --- |
| 200 | OK | No error |
| 201 | The request has been fulfilled and has resulted in one or more new resources being created | No error |
| 400 | Bad Request | Invalid parameter passed |
| 401 | Unauthorized | CustomerID does not exist / account suspended |
| 403 | Invalid Token | Parameter doesn't match |
| 404 | Not Found | Invalid URI |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Invalid Transaction | Transaction not attempted |
| 503 | Service Unavailable | System unavailable; try again later |

## Voice Verify API status codes (100-130)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 100 | Call answered | The call was answered by the end user or voicemail. | Voice Verify API |
| 101 | Not answered | No one answered the call. | Voice Verify API |
| 103 | Call in progress | The call is in progress. You get back an immediate response from Telesign when you make a request, usually with this status. If you retrieve status info later, it will resolve to a different status code. | Voice Verify API |
| 105 | Call not handled yet | The verification call has not yet been attempted. | Voice Verify API |
| 106 | Call failed | The call did not go through. Typically this occurs when Telesign's upstream providers fail to complete the call. Sometimes retrying will work. | Voice Verify API |
| 107 | Line busy | The line was busy when the call tried to reach the end user's device. | Voice Verify API |
| 108 | Call canceled by Telesign | Call canceled by Telesign. | Voice Verify API |
| 129 | Call blocked by your request | Telesign blocked the call before it was placed. This is due to your prior submitted request to blocklist this phone number. | Voice Verify API |
| 130 | Call blocked by Telesign | Telesign blocks a message if it is being sent to a phone number that is on a global blocklist. | Voice Verify API |

`103` is the usual immediate response to a send; fetch the status later (`voiceverify_get_status`) to see how the call resolved. For `106`, Telesign notes that retrying sometimes works.

## SMS and SMS Verify API status codes (200-295)

These appear in the response to a send, in status lookups (`messaging_get_sms_status`, `smsverify_get_status`) and in delivery report callbacks.

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 200 | Delivered to handset | The SMS was delivered to the end user's phone. (Final) | SMS, SMS Verify API |
| 201 | Transaction successfully completed, suspicious activity detected | Telesign's internal anti-fraud mechanisms identified potentially suspicious activity related to the destination phone number. | SMS API, SMS Verify API |
| 203 | Delivered to gateway | The SMS was delivered to the gateway. If the gateway responds with further information (including successful delivery to handset or delivery failure), the status is updated. (Intermediate) | SMS, SMS Verify API |
| 207 | Error delivering SMS to handset (reason unknown) | The SMS could not be delivered to the end user's handset for an unknown reason. (Final) | SMS, SMS Verify API |
| 210 | Temporary phone error | The SMS could not be delivered to the handset due to a temporary error with the phone. Examples - phone is turned off, not enough memory to store the message. (Final) | SMS, SMS Verify API |
| 211 | Permanent phone error | The SMS could not be delivered to the handset due to a permanent error with the phone. For example, the phone is incompatible with SMS, or illegally registered on the network. This can happen when a phone number is blacklisted, or is incorrectly provisioned. (Final) | SMS, SMS Verify API |
| 220 | Gateway/network cannot route message | The network cannot route the message to the handset. (Final) | SMS, SMS Verify API |
| 221 | Message expired before delivery | The message was queued by the mobile provider and timed out before it could be delivered to the handset. (Final) | SMS, SMS Verify API |
| 222 | SMS not supported | SMS is not supported by this phone, carrier, plan, or user. | SMS, SMS Verify API |
| 229 | Message blocked by customer request | This code can happen because you requested a block or because Telesign blocked on your behalf. The block is custom, meaning it applies to you and not others. | SMS Verify API |
| 230 | Message blocked by Telesign | Telesign blocks a message if it is being sent to a phone number that is on a global blocklist. | SMS Verify API |
| 231 | Invalid/unsupported | Invalid/unsupported message content | SMS, SMS Verify API |
| 233 | Message blocked due to high risk score. | You requested that messages in a specific country be blocked, and the message was being sent to this country | SMS Verify API |
| 237 | Message blocked in requested country | You requested that messages in a specific country be blocked, and the message was being sent to this country. | SMS, SMS Verify API |
| 238 | Destination blocked by prefix | You requested that phone numbers with a particular prefix be blocked. | SMS |
| 250 | Final status unknown | The final status of the SMS cannot be determined. | SMS, SMS Verify API |
| 251 | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | Telesign successfully delivered the message through our gateway and it passed downstream. However, Telesign did not receive a delivery receipt within 12 hours of transmission. We cannot confirm delivery to the handset. The end user most likely did not receive the message. | SMS, SMS Verify API |
| 251 | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | Bulk SMS |
| 290 | Message in progress | The message is being sent to the SMS gateway. You get back an immediate response from Telesign when you make a request, usually with this status. If you retrieve status info later, it will resolve to a different status code. | SMS, SMS Verify API |
| 292 | Queued by gateway | The SMS gateway has queued the message. | SMS, SMS Verify API |
| 293 | Bulk request accepted | The bulk request was accepted by Telesign. | Bulk SMS |
| 295 | Status delayed | The status of the SMS is temporarily unavailable. | SMS, SMS Verify API |

Notes:

- `290` is the usual immediate response; `203` and `292` are also not final. Poll or use callbacks for the final result.
- `251` means no delivery receipt arrived within 12 hours; Telesign says the end user most likely did not receive the message. It is listed twice because bulk SMS has its own row.
- `233` is printed in Telesign's list with the same description as `237`; going by its text string it means the send was blocked because of a high risk score.

## Phone ID and Intelligence status codes (300-301)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 300 | Transaction successfully completed | The system was able to obtain all of the requested data for Intelligence or Phone ID. | Phone ID, Intelligence |
| 301 | Transaction partially completed | The system was able to obtain some of the data for Intelligence or Phone ID, but not all of it. | Phone ID, Intelligence |

## Multi-product status codes (500-599)

Mostly carrier and gateway outcomes for SMS and SMS Verify API. Where the meaning says the problem is temporary the message can be retried; where it says permanent, do not retry.

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 500 | Transaction not attempted | No call, message send, or other processing of the request was attempted. | All (Excluding SMS Verify API) |
| 501 | Not authorized | No permissions for this resource, or authorization failed. | SMS Verify API, SMS |
| 502 | Campaign error | This error can be generated if there is a problem with the short code used. | SMS, SMS Verify API |
| 503 | Carrier rejected - temporary problem | This error is generated if there is an error on the carrier or operator side that is temporary and the message can be retried. | SMS, SMS Verify API |
| 504 | Carrier rejected - permanent error | This error is generated if there is an error on the carrier or operator side that is permanent and the message should not be retried. | SMS, SMS Verify API |
| 505 | Error on gateway - temporary error | This error is generated if there is an error on Telesign's partner side that is considered temporary and the message can be retried. | SMS, SMS Verify API |
| 506 | Error on gateway - permanent error | This error is generated if there is an error on Telesign's partner side that is considered permanent and the message should not be retried. | SMS, SMS Verify API |
| 507 | Invalid destination address | There is a problem with the destination address used. Either the format is not valid, or the number is not associated with any carrier, or if MSC is used it does not know about this MSISDN. | SMS, SMS Verify API |
| 508 | Invalid source address | The message requires a source address. Verify that one is provided and correct. | SMS, SMS Verify API |
| 509 | Parameters problem | One or more parameters used in the request is not supported. | SMS, SMS Verify API |
| 510 | Message blocked by subscriber action or request | The end user has blocked receiving SMS with their carrier plan or by request or from the particular short code used. | SMS, SMS Verify API |
| 511 | Subscriber low on credit | The end user exceeded their spending limits and cannot receive SMS. | SMS, SMS Verify API |
| 512 | Roaming error | End user cannot receive SMS because their device that receives the messages is roaming. | SMS, SMS Verify API |
| 513 | Mobile number portability error | SMS failed because ported combinations are unreachable. | SMS, SMS Verify API |
| 514 | Subscriber absent | The operator/carrier is temporarily unable to reach the end user's device. | SMS, SMS Verify API |
| 515 | Suspected spam | This message is considered to be spam by carrier or operator. | SMS, SMS Verify API |
| 516 | Delivery channel not supported by the end user's device | The end user's device does not support the channel used for delivery. (Final) | Messaging |
| 517 | Selected DLT details for India not supported | The DLT template ID or entity ID in the request cannot be found by the end operator. | SMS, SMS Verify API |
| 518 | Message blocked due to high risk SIM swap indicator. | The service determined that the SIM swap risk indicator for the destination number is higher than the maximum value configured for your account. For that reason Telesign did not send the SMS. | SMS Verify API |
| 519 | Message not sent - requested SIM swap check could not be performed. | The service could not perform the SIM swap check. This is because either the number is out of SIM swap coverage or information about the potential SIM swap event is missing. | SMS Verify API |
| 520 | Content sent is not allowed | The content in this message is not permitted by the carrier. | SMS, SMS Verify API |
| 521 | Requested Sender ID is not allowed for destination | The sender ID submitted in request is not allowed in destination country/operator. | SMS Verify API |
| 521 | Requested Sender ID is not allowed for destination | The sender ID submitted in request is not allowed in destination country/operator. | SMS |
| 599 | Status not available | The system is unable to provide status at this time. | SMS, SMS Verify API |

## Completion status code (1900)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 1900 | Verify completion successfully recorded | The confirmation that the end-user has received the message has been successfully recorded. | Get Status |

## Phone ID identity add-on status codes (2800-2812)

Returned inside the add-on results of a Phone ID request (`phoneid_get_info` with `addons`). Where the text says `name of add-on`, the response names the actual add-on.

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 2800 | Request successfully completed | The request was successfully processed with valid parameters. | Phone ID (all identity attributes) |
| 2801 | Invalid request addons parameter: {parameter_name} | The specified `parameter_name` is not a valid parameter for this request and cannot be processed. Remove or replace it with a valid parameter. | Phone ID (all identity attributes) |
| 2802 | `name of add-on` add-on temporarily unavailable. | The requested add-on is currently unavailable and cannot be accessed at this time. | Phone ID (all identity attributes) |
| 2803 | Phone number out of `name of add-on` add-on coverage. | The specified phone number is not supported for the requested add-on service. | Phone ID (all identity attributes) |
| 2804 | Phone number not applicable in `name of add-on` add-on. | The provided phone number is not applicable for use with the requested add-on. | Phone ID (all identity attributes) |
| 2805 | No `name of add-on` add-on information for phone number. | No information could be retrieved for the provided phone number for the requested add-on. | Phone ID (all identity attributes) |
| 2806 | `Name of add-on` add-on is not enabled. | The requested add-on is not enabled for your account. | Phone ID (all identity attributes) |
| 2807 | Some parameters submitted in the request are not valid. | One or more parameters in the request are incorrect or do not conform to the expected format. | Phone ID (all identity attributes) |
| 2808 | Invalid Request: {parameter_name} parameter is missing or empty. | The required parameter `parameter_name` is missing or has no value. | Phone ID (all identity attributes) |
| 2809 | Billing Postal Code does not match `contact_plus` add-on information for phone number. | The Billing Postal Code provided does not match the information associated with the phone number in the `contact_plus` add-on. | Phone ID (Contact Plus add-on) |
| 2810 | Request process failed during data collection. | The request could not be completed due to an issue during the data collection phase. | Phone ID (all identity attributes) |
| 2811 | Request processing time out. | The request could not be processed within the allotted time and has timed out. | Phone ID (all identity attributes) |
| 2812 | `name of add-on` exceeded transaction hard cap. Request denied. | The transaction limit for the add-on has been exceeded, and the request was denied. | Phone ID (all identity attributes) |

## Messaging delivery status codes (3000-3073)

Used by Telesign Messaging (the omnichannel endpoint behind `messaging_send_message` and `messaging_get_message_status`) and by Verify API channels. Many of the 303x-305x codes are the Messaging equivalents of the 2xx and 5xx SMS codes above.

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 3000 | Delivered | The message was delivered to the end-user. (Final if the last channel used doesn't support Read status. Intermediate otherwise) | Messaging |
| 3001 | Message in progress | Telesign successfully received this message request and is processing it. (Intermediate) | Messaging |
| 3002 | Delivered to Gateway | The message is in the process of delivery. Once all delivery options are exhausted, the status will be updated again. (Intermediate) | Messaging |
| 3003 | Delivery error | The message could not be delivered to the end-user. (Final) | Messaging |
| 3004 | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received / MO successfully sent but final confirmation of delivery to handset was not received | The message was successfully delivered to the gateway, but we cannot confirm delivery to the handset because we do not receive the final handset delivery receipts in this region. NOTE: There is a high probability that this message was successfully delivered to the handset. | Messaging |
| 3005 | Message is read | The message has been read by the end-user. (Final) | Messaging |
| 3006 | None of the channels is enabled for the customer | The channels specified in this request are all either not enabled for this customer or are invalid values. (Final) | Messaging |
| 3011 | Provider Account registration error |  | Messaging |
| 3012 | Provider Account migration error | Provider Account migration error | Messaging |
| 3030 | Temporary phone error | The message could not be delivered to the handset due to a temporary error with the phone. Examples - phone is turned off, not enough memory to store the message. (Final) | Messaging |
| 3031 | Permanent phone error | The message could not be delivered to the handset due to a permanent error with the phone. For example, the phone is incompatible with SMS, or illegally registered on the network. This can happen when a phone number is blacklisted, or is incorrectly provisioned. (Final) | Messaging |
| 3032 | Gateway/network cannot route message | The network cannot route the message to the handset. (Final) | Messaging |
| 3033 | Message expired before delivery | The message was queued by the mobile provider and timed out before it could be delivered to the handset. (Final) | Messaging |
| 3034 | SMS not supported | SMS is not supported by this phone, carrier, plan, or user. | Messaging |
| 3035 | Invalid/unsupported | The content of the message is not supported. | Messaging |
| 3036 | Price threshold exceeded | Message not sent due to the price exceeding your set maximum price. | Messaging |
| 3037 | Message blocked in requested country | You requested that messages in a specific country be blocked, and the message was being sent to this country. | Messaging |
| 3038 | Destination blocked by prefix | You requested that phone numbers with a particular prefix be blocked. | Messaging |
| 3039 | Final status unknown | The final status of the SMS cannot be determined. | Messaging |
| 3040 | Queued by gateway | The SMS gateway has queued the message. | Messaging |
| 3041 | Carrier rejected - temporary problem | This error is generated if there is an error on the carrier or operator side that is temporary and the message can be retried. | Messaging |
| 3042 | Carrier rejected - permanent error | This error is generated if there is an error on the carrier or operator side that is permanent and the message should not be retried. | Messaging |
| 3043 | Error on gateway - temporary error | This error is generated if there is an error on Telesign's partner side that is considered temporary and the message can be retried. | Messaging |
| 3044 | Error on gateway - permanent error | This error is generated if there is an error on Telesign's partner side that is considered permanent and the message should not be retried. | Messaging |
| 3045 | Parameters problem | One or more parameters used in the request is not supported. | Messaging |
| 3046 | Message blocked by subscriber action or request | The end user has blocked receiving SMS with their carrier plan or by request or from the particular short code used. | Messaging |
| 3047 | Subscriber low on credit | The end user exceeded their spending limits and cannot receive SMS. | Messaging |
| 3048 | Roaming error | End user cannot receive SMS because their device that receives the messages is roaming. | Messaging |
| 3049 | Mobile number portability error | SMS failed because ported combinations are unreachable. | Messaging |
| 3050 | Subscriber absent | The operator/carrier is temporarily unable to reach the end user's device. | Messaging |
| 3051 | Suspected spam | This message is considered to be spam by carrier or operator. | Messaging |
| 3052 | Message blocked by your request | This code can happen because you requested a block or because Telesign blocked on your behalf. The block is custom, meaning it applies to you and not others. | Messaging |
| 3053 | Message blocked by Telesign | Telesign blocks a message if it is being sent to a phone number that is on a global blocklist. | Messaging |
| 3054 | Message cannot be sent to RBM provider - parsing error | Telesign's RBM (Rich Business Messaging) partner encountered a temporary problem while sending this message. Please try again. | Messaging |
| 3055 | Delivery channel not supported by the end user's device | The end user's device does not support the channel used for delivery. (Final) | Messaging |
| 3056 | Message failed to deliver in specified fallback time | Delivery could not be confirmed on this channel within the fallback window; triggers the next channel (if any) to send. (Intermediate) | Messaging |
| 3057 | Invalid source address | The message requires a source address. Verify that one is provided and correct. | Messaging |
| 3058 | The requested API host is not allowed for this `CustomerID` | The requested API host is not allowed for the account associated with this customer ID. | Messaging |
| 3059 | Exceeded number of elements for rich card | The number of elements (e.g., buttons, images) added exceeds the allowed number of elements for a rich card. | Messaging |
| 3060 | Delivery channel supported by the end user's device | The device associated with this phone number can use the selected channel. | Messaging |
| 3061 | Media size exceeds the limit | The media file size exceeds the maximum allowed limit and cannot be sent. | Messaging |
| 3062 | MMS not supported | MMS is not supported for this request and could not be processed. | Messaging |
| 3071 | Unverified phone_number requested for trial account. | The phone number must be verified before it can be used in requests on a trial account. | Messaging |
| 3072 | Message blocked due to high risk score. | It was determined that the risk score for the destination number is higher than configured maximum risk score. For that reason Telesign did not send the message. | Messaging |
| 3073 | Insufficient funds in prepaid wallet | The prepaid wallet balance is insufficient to complete the requested transaction. | Messaging |

Notes:

- `3001` and `3002` are intermediate. `3000` is final only when the last channel used cannot report a read receipt; otherwise `3005` may follow.
- `3056` is not a final failure of the transaction: it triggers the next channel in the fallback list, if there is one.
- `3041` and `3043` are temporary and can be retried; `3042` and `3044` are permanent and should not be.

## Messaging invalid parameter status codes (3100-3115)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 3100 | Unknown channel specified: {channel} | This channel specified in the request is not one of the supported values; triggers the next channel (if any) to send. (Intermediate) | Messaging |
| 3101 | Invalid value for parameter phone_number: {phone_number} | Phone number is too long, too short, or contains non-digit values. (Intermediate) | Messaging |
| 3102 | Invalid value for parameter message_type: {message_type} | The value of parameter message_type is not one of the supported values: `ARN`, `MKT`, `OTP`. (Final) | Messaging |
| 3103 | Unsupported value for parameter external_id: {external_id} | The value of parameter `external_id` is longer than 100 or contains non-ASCII characters. (Final) | Messaging |
| 3104 | Invalid value for parameter account_lifecycle_event: {account_lifecycle_event} | The value of parameter account_lifecycle_event is not one of the supported values: `create`, `sign-in`, `transact`, `update`, `delete`. (Final) | Messaging |
| 3105 | Invalid value for parameter originating_ip: {originating_ip} | Parameter originating_ip is improperly formatted. (Final) | Messaging |
| 3106 | Invalid value for parameter callback_url: {callback_url} | The value of parameter `callback_url` is empty. (Final) | Messaging |
| 3107 | Invalid value for parameter country_code | The provided country code is either in an incorrect format or not one of the expected values. | Messaging |
| 3108 | Invalid value for parameter message | The message parameter has an invalid format or contains unexpected content. | Messaging |
| 3109 | Invalid value for parameter sender_id: {sender_id} | The specified sender ID does not match the expected value or is in an incorrect format. Ensure the provided sender ID has been created and is valid for your account. | Messaging |
| 3110 | Invalid request | The API request or its JSON payload is improperly formatted. (Final) | Messaging |
| 3112 | Specified template does not exist for selected channel | The template specified in the request does not exist for the selected messaging channel. | Messaging |
| 3113 | Invalid value for parameter channel: {channels} | The value of the parameter channels contains the same channel more than once or is improperly formatted. (Final) | Messaging |
| 3114 | Specified message type not allowed outside of conversation window | The specified message type is not allowed to be sent outside of a conversation window. | Messaging |
| 3115 | Destination phone number not in coverage | The number you are trying to send a message to is not within the coverage area for message delivery. | Messaging |

## Messaging enablement and rate limit status codes (3200-3209)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 3200 | {channel} channel is not enabled for customer | This channel is not enabled for this customer. (Intermediate) | Messaging |
| 3202 | Fallback is not enabled for Customer ID | Multiple channels are specified in the request, but fallback is not enabled for this customer. (Intermediate) | Messaging |
| 3203 | Callback URL parameter not enabled for Customer ID | Using `callback_url` in the API request is not allowed for this customer. (Final) | Messaging |
| 3204 | Rate limit exceeded | Allowed number of requests per second on Omnichannel API has been exceeded. (Final) | Messaging |
| 3205 | Rate Limit Exceeded | Allowed number of SMS transactions per second has been exceeded. | Messaging |
| 3206 | Omnichannel Product not enabled for Customer ID | Omnichannel product is not enabled for this customer. (Final) | Messaging |
| 3207 | Product exceeded transaction hard cap. Request denied. | Product exceeded transaction hard cap limit. Request denied. | Messaging |
| 3208 | Provider Account ID not found | The Provider Account ID could not be found in the system. | Messaging |
| 3209 | End-user not registered for testing | The end user's phone number has not been registered for use in testing requests. | Messaging |

For `3200`, `3202`, `3203`, `3206` and `3209` the fix is on the account side: ask Telesign to enable the channel, fallback, per-request `callback_url`, the product, or to register the test number. For `3204` and `3205` slow down and retry.

## Messaging missing parameter status codes (3300-3306)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 3300 | Missing parameter channels | The API request does not contain mandatory parameter `channels`. (Final) | Messaging |
| 3301 | Missing parameter channel | The value of the parameter `channels` does not contain any instances of the mandatory sub-property `channel`. (Final) | Messaging |
| 3302 | Missing parameter phone_number | The API request does not contain the mandatory parameter `phone_number`. (Final) | Messaging |
| 3303 | Missing parameter message | The API request does not contain the mandatory parameter `message`. (Final) | Messaging |
| 3304 | Missing parameter message_type | The API request does not contain the mandatory parameter `message_type`. (Final) | Messaging |
| 3305 | Missing template specific parameters | The request is missing one or more required parameters specific to the selected template. | Messaging |
| 3306 | Missing message parameters for specified channel | Message object doesn't contain required info for sending message through selected channel. (Intermediate) | Messaging |

## Messaging authorization and system status codes (3400-3601)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 3400 | Not authorized | No permissions for this resource or authorization failed. (Final) | Messaging |
| 3405 | Missing required `Authorization` header | The request is missing the required `Authorization` header for authentication. | Messaging |
| 3406 | CustomerID Account Suspended. | The account associated with the provided Customer ID has been suspended. | Messaging |
| 3408 | CustomerID Account Not Found | The account associated with the provided Customer ID could not be found in the system. | Messaging |
| 3409 | Invalid source IP address. | The source IP address provided is not recognized or is invalid. | Messaging |
| 3410 | Invalid Customer ID. | The provided Customer ID is invalid or does not exist in the system. | Messaging |
| 3411 | Invalid API Key. | The API key provided is invalid or does not match the expected format. | Messaging |
| 3412 | Required 'Authorization' header is not in the correct format | The `Authorization` header is not in the correct format and cannot be processed. | Messaging |
| 3413 | Not Allowed Host | The host is not authorized to access the system. | Messaging |
| 3500 | System Unavailable | The system is currently unavailable. The request should be resubmitted. (Final) | Messaging |
| 3601 | Missing providers tracking data | The required tracking data from the provider is missing. | Messaging |

## Messaging codes that appear only on the callback and Verify API pages

These codes are not in Telesign's "All status and error codes" list but are documented on the Messaging callback service page, the Okta telephony page or in the Verify API tables below.

| Code | Text string | Meaning | Documented for |
| --- | --- | --- | --- |
| 3080 | The call is not delivered to end-user. | Voice channel delivery failure | Okta telephony (voice callback) |
| 3081 | There was an error delivering audio to handset. | Voice channel delivery failure | Okta telephony (voice callback) |
| 3111 | Invalid value for parameter max_price | | Okta telephony (SMS callback) |
| 3116 | Payload limit size exceeded | Allowed payload size is limited to 10KB | Verify API |
| 3117 | Invalid value for parameter fbmessager_id: { fbmessager_id} | fbmessager_id value is too long, too short, or not valid. (Intermediate) | Messaging callbacks |
| 3118 | Invalid value for parameter instagram_id: { instagram_id} | instagram_id value is too long, too short, or not valid. (Intermediate) | Messaging callbacks |
| 3119 | Invalid value for parameter email | Email is not valid. | Verify API |
| 3210 | Okta Inline Hook API is not enabled for the Customer. | Applicable only for no-code customers. | Okta telephony |
| 3309 | Missing parameter email | Email is in the verification policy but the recipient has no email | Verify API |
| 3401 | 'x-ts-nonce' header value has been used recently | | Okta telephony (SMS callback) |
| 3402 | 'Date' or 'x-ts-date' header is not within tolerable range | | Okta telephony (SMS callback) |
| 3403 | Missing required 'Date' or 'x-ts-date' header | | Okta telephony (SMS callback) |
| 3404 | Invalid Signature. | | Okta telephony (SMS callback) |
| 3407 | 'x-ts-nonce' header value is either too long or too short | | Okta telephony (SMS callback) |
| 3415 | Invalid 'x-ts-auth-method' header | | Okta telephony (SMS callback) |

The Messaging callback page also words two codes differently from the main list: `3413` as "Not Allowed IP Address" (main list: "Not Allowed Host") and `3601` as "CustomerID Account Not Found" (main list: "Missing providers tracking data"). Template management callbacks use codes `3850`-`3857` and inbound (MO) message callbacks use `1500`; see topic `callbacks`.

## Silent Verify API status codes (4501-4502)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 4501 | Success | Verification flow started in Silent Verify Initiate. | Silent Verify API |
| 4501 | Successfully verified | Device successfully verified on Silent Verify Finalize. | Silent Verify API |
| 4502 | The phone number does not match | Unable to verify the device because the phone number isn't associated with the device. | Silent Verify API |

`4501` is used both for "flow started" on initiate and "verified" on finalize; tell them apart by which tool you called (`silentverify_initiate` or `silentverify_finalize`). Silent Verify error codes (10000, 10004, 10011, 10019, 10039, 40001-45010) are in "Positive error codes" below.

## Accounts API status codes (5000-5500)

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 5000 | New key was successfully created. | A new REST API key was successfully created for your account. | Accounts API |
| 5001 | Key list was successfully retrieved. | A list of REST API key objects associated with your account was successfully returned. | Accounts API |
| 5002 | Key object was successfully retrieved. | The specified REST API key object associated with your account was successfully returned. | Accounts API |
| 5003 | Key was successfully updated. | The specified REST API key has been successfully updated and the key object with its new details has been returned. | Accounts API |
| 5004 | Key successfully expired. | The specified REST API key has been successfully expired and removed from the list of active keys for your account. | Accounts API |
| 5005 | New account was successfully created. | You have successfully cloned your account and created a new one. | Accounts API |
| 5101 | Invalid value for body parameter {param name} | The provided value for the body parameter `param name` is invalid or does not match the expected format. | Accounts API |
| 5103 | Invalid value for path parameter {param name} | The provided value for the path parameter `param name` is invalid or does not match the expected format. | Accounts API |
| 5110 | Request payload is improperly formatted. | The request payload is not properly structured or contains invalid data. Ensure that all required parameters are included and correct, and that the request format is valid. | Accounts API |
| 5111 | The limit of {max_no_keys} keys has been reached. | The maximum limit of keys has been reached and no additional keys can be added. | Accounts API |
| 5112 | Missing required parameter {param_name}. | The required parameter `param_name` is missing from the request and must be provided. | Accounts API |
| 5113 | {date-time-stamp} is not a valid future date. | The provided date-time stamp does not represent a future date or is invalid. | Accounts API |
| 5114 | Too many users included in the request. | The request includes more users than the allowed limit and cannot be processed. | Accounts API |
| 5204 | Rate limit exceeded. | Allowed number of requests per second on Accounts API has been exceeded. | Accounts API |
| 5400 | Authentication failed. | Authentication failed due to invalid credentials or missing required authentication details. | Accounts API |
| 5401 | No permissions for this resource. | The account does not have the necessary permissions to access the requested resource. | Accounts API |
| 5500 | System unavailable. Please try again later. | The system is currently unavailable. The request should be resubmitted. | Accounts API |

## SMS five-digit status codes (10000-12017)

Telesign lists these under status codes for the standalone SMS API (`messaging_send_sms`). They report authentication, account and parameter problems.

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| 10000 | System Unavailable, Please try again later. | The system is currently unavailable. The request should be resubmitted. | SMS |
| 10002 | 'x-ts-nonce' header value has been used recently | The `x-ts-nonce` header value cannot be reused in this request because it was used recently. | SMS |
| 10003 | 'x-ts-nonce' header value is either too long or too short | The `x-ts-nonce` header value is either too long or too short. Ensure that `x-ts-nonce` is within the acceptable length. | SMS |
| 10004 | 'Date' or 'x-ts-date' header is not within tolerable range | The `Date` or `x-ts-date` header value is outside the acceptable range. Ensure that it is within the acceptable range. | SMS |
| 10005 | 'Date' or 'x-ts-date' header is not RFC822 compliant | The `Date` or `x-ts-date` header value is not RFC822 compliant and cannot be processed. | SMS |
| 10006 | Invalid 'x-ts-auth-method' header. | The `x-ts-auth-method` header value is invalid and cannot be processed. | SMS |
| 10007 | Missing required 'Date' or 'x-ts-date' header | The required `Date` or `x-ts-date` header is missing and must be included in the request. | SMS |
| 10008 | Invalid Signature. | The signature provided is invalid and cannot be verified. | SMS |
| 10009 | Missing required `Authorization` header | The request is missing the required `Authorization` header for authentication. | SMS |
| 10010 | CustomerID Account Suspended | The account associated with the provided Customer ID has been suspended. | SMS |
| 10011 | This product is not enabled for this CustomerID. | SMS product is not enabled for this customer. | SMS |
| 10014 | Invalid source IP address. | The source IP address provided is not recognized or is invalid. | SMS |
| 10015 | Invalid Customer ID. | The provided Customer ID is invalid or does not exist in the system. | SMS |
| 10019 | Rate Limit Exceeded | Allowed number of requests per second on SMS has been exceeded. | SMS |
| 10020 | Generic messaging exceeded transaction hard cap. Request denied. | The transaction limit for generic messaging has been exceeded, and the request was denied. | SMS |
| 10022 | Invalid API Key. | The API key provided is invalid or does not match the expected format. | SMS |
| 10028 | Required 'Authorization' header is not in the correct format | The `Authorization` header is not in the correct format and cannot be processed. | SMS |
| 10030 | Insufficient funds in prepaid wallet. | The prepaid wallet balance is insufficient to complete the requested transaction. | SMS |
| 10031 | Not Allowed Host | The host is not authorized to access the system. | SMS |
| 10031 | Message blocked by customer request | This code can happen because you requested a block or because Telesign blocked on your behalf. The block is custom, meaning it applies to you and not others. | SMS (DLR Callback only) |
| 10032 | Message blocked by Telesign | Telesign blocks a message if it is being sent to a phone number that is on a global blocklist. | SMS |
| 10033 | {phone_number} has not been verified for this trial account. | The phone number must be verified before it can be used in requests on a trial account. | SMS |
| 10035 | The requested API host is not allowed for this CustomerID. | The requested API host is not allowed for the account associated with this customer ID. | SMS |
| 10036 | Reference ID expired | The provided reference ID has expired and is no longer valid. | SMS |
| 11000 | Invalid value for parameter phone_number. | Phone number is too long, too short, or contains non-digit values. | SMS |
| 11001 | Invalid country code for parameter phone_number. | The provided country code is either in an incorrect format or not one of the expected values. | SMS |
| 11003 | Invalid value for parameter account_lifecycle_event | The value of parameter `account_lifecycle_event` is not one of the supported values: `create`, `sign-in`, `transact`, `update`, `delete`. | SMS |
| 11004 | Invalid value for parameter callback_url | The value of parameter `callback_url` is empty. | SMS |
| 11009 | Invalid value for parameter message. | The message parameter has an invalid format or contains unexpected content. | SMS |
| 11010 | Invalid value for parameter originating_ip. | Parameter `originating_ip` is improperly formatted. | SMS |
| 11011 | Invalid value for parameter reference_id | The provided value for the `reference_id` parameter is invalid or does not match the expected format. | SMS |
| 11013 | Invalid value for parameter sender_id. | The specified sender ID does not match the expected value or is in an incorrect format. Ensure the provided sender ID has been created and is valid for your account. | SMS |
| 11016 | Invalid value for parameter external_id | The value of parameter `external_id` is longer than 100 or contains non-ASCII characters. | SMS |
| 11017 | Invalid value for parameter message_type. | The value of parameter message_type is not one of the supported values: ARN, MKT, OTP. | SMS |
| 11027 | Invalid value for parameter integration_name. | The provided value for the `integration_name` parameter is invalid or does not match the expected format. | SMS |
| 11034 | Invalid value for parameter dlt_template_id | The provided value for the `dlt_template_id` parameter is invalid or does not match the expected format. | SMS |
| 11035 | Invalid value for parameter dlt_entity_id | The provided value for the `dlt_entity_id` parameter is invalid or does not match the expected format. | SMS |
| 12000 | Missing Required Parameter phone_number | The required parameter `phone_number` is missing from the request and must be provided. | SMS |
| 12009 | Missing Required Parameter message | The required parameter `message` is missing from the request and must be provided. | SMS |
| 12017 | Missing Required Parameter message_type | The required parameter `message_type` is missing from the request and must be provided. | SMS |

Notes:

- `10031` has two meanings: "Not Allowed Host" in an API response, and "Message blocked by customer request" in a delivery report (DLR) callback.
- `10033` (and `-10033` for SMS Verify API) means the destination number has not been verified for a trial account; the number must be verified before a trial account can send to it.
- `10002`-`10008` and `10028` are Digest authentication header problems; see topic `authentication`.

## Completion negative codes listed as status codes

Telesign lists these negative codes in its status code table for the Completion operations (`smsverify_report_completion`, `voiceverify_report_completion`, `messaging_report_completion`).

| Code | Text string | Meaning | Product |
| --- | --- | --- | --- |
| -10001 | Invalid parameter passed | The parameter provided in the request is invalid or does not meet the required format. | Completion |
| -10001 | Customer ID / Reference ID not found | The Customer ID or the Reference ID could not be found in the system. | Completion |
| -30000 | Invalid customer ID | The provided Customer ID is invalid or does not exist in the system. | Completion |
| -30001 | Account suspended | The account has been suspended. | Completion |
| -30002 | Account not activated | The account has not been activated and cannot be used. | Completion |
| -30003 | Account limit reached | The account has reached its limit and can no longer process additional requests. | Completion |
| -30004 | Missing required Authorization header | The request is missing the required `Authorization` header for authentication. | Completion |
| -30005 | Required Authorization header is not in the correct format | The `Authorization` header is not in the correct format and cannot be processed. | Completion |
| -30006 | Invalid signature | The signature provided is invalid and cannot be verified. | Completion |
| -30007 | Missing required Date or X-TS-Date header | The required `Date` or `x-ts-date` header is missing and must be included in the request. | Completion |
| -30008 | Invalid X-TS-Auth-Method header | The `x-ts-auth-method` header value is invalid and cannot be processed. | Completion |
| -30009 | Date or X-TS-Date header is not RFC822 compliant | The `Date` or `x-ts-date` header value is not RFC822 compliant and cannot be processed. | Completion |
| -30010 | Date or X-TS-Date header is not within tolerable range | The `Date` or `x-ts-date` header value is outside the acceptable range. Ensure that it is within the acceptable range. | Completion |
| -30011 | X-TS-Nonce header value is either too long or too short | The `x-ts-nonce` header value is either too long or too short. Ensure that `x-ts-nonce` is within the acceptable length. | Completion |
| -30012 | X-TS-Nonce header value has been used recently | The `x-ts-nonce` header value cannot be reused in this request because it was used recently. | Completion |
| -30013 | Invalid ReferenceID for Verify Completion | The provided Reference ID is invalid or does not exist in the system. | Completion |

## Negative error codes (-10001 to -90001)

Returned in `errors[].code`, mainly by SMS Verify API, Voice Verify API, Number Deactivation and bulk SMS. The same number often appears on several rows because the description text differs by product; the meaning is the same.

| Error code | Description | Product |
| --- | --- | --- |
| -10001 | Invalid Request: ReferenceID Parameter: \<reference_id> | SMS Verify API |
| -10001 | Invalid Request: CustomerID Parameter: \<customer_id> | SMS Verify API |
| -10001 | Invalid Request: AuthenticationID | SMS Verify API |
| -10001 | Invalid Request: CustomerID/AuthenticationID Parameter: \<customer_id>/\<authentication_id> | SMS Verify API |
| -10001 | Invalid Request: customer_id Parameter: \<customer_id> | SMS Verify API |
| -10001 | Not Allowed Host | SMS Verify API, Voice Verify API |
| -10001 | CustomerID/ReferenceID not found Parameter: CustomerID/ReferenceID: \<customer_id>/\<reference_id> | SMS Verify API |
| -10001 | CustomerID/ReferenceID not found | SMS Verify API, Voice Verify API, Number Deactivation |
| -10001 | Invalid parameter passed | Voice Verify API, Number Deactivation |
| -10001 | Invalid Request: Missing parameter Parameter: Template | Bulk SMS |
| -10002 | Empty recipients list | Bulk SMS |
| -10003 | Max number of recipients exceeded | Bulk SMS |
| -10004 | Reference ID expired | Get Status |
| -10009 | Invalid source IP address | SMS Verify API, Voice Verify API, Number Deactivation, Bulk SMS |
| -10030 | Insufficient funds in prepaid wallet. | SMS Verify |
| -10033 | {phone_number} has not been verified for this trial account. | SMS Verify API |
| -20001 | Invalid request | Voice Verify API, Number Deactivation |
| -20001 | Invalid Request: CustomerID Parameter: \<customer_id> | SMS Verify API |
| -20002 | This product is not enabled for this CustomerID | Voice Verify API, Number Deactivation |
| -20002 | This product is not enabled for this Customer ID. | SMS Verify API, Bulk SMS |
| -20003 | This feature is not enabled for this Customer ID. | Voice Verify API, Number Deactivation |
| -20004 | This product is not enabled for this country. | Voice Verify API |
| -30000 | Invalid CustomerID | Voice Verify API, Number Deactivation |
| -30000 | Invalid Customer ID | SMS Verify API, Bulk SMS |
| -30001 | Account suspended | Voice Verify API, Number Deactivation |
| -30001 | Customer ID Account Suspended. | SMS Verify API, Bulk SMS |
| -30002 | Account not activated | Voice Verify API, Number Deactivation |
| -30002 | Customer ID Account Not Activated. | SMS Verify API |
| -30003 | Account limit reached | Voice Verify API, Number Deactivation |
| -30003 | Customer ID new account limit reached. | SMS Verify API |
| -30004 | Missing required 'Authorization' header | SMS Verify API, Voice Verify API, Number Deactivation |
| -30005 | Required Authorization header is not in the correct format | Voice Verify API, Number Deactivation |
| -30005 | Required 'Authorization' header is not in the correct format | SMS Verify API |
| -30006 | Invalid signature | SMS Verify API, Voice Verify API, Number Deactivation |
| -30007 | Missing required 'Date' or 'x-ts-date' header | SMS Verify API, Voice Verify API, Number Deactivation |
| -30008 | Invalid X-TS-Auth-Method header | Voice Verify API, Number Deactivation |
| -30008 | Invalid 'x-ts-auth-method' header. | SMS Verify API |
| -30009 | Date or X-TS-Date header is not RFC822 compliant | Voice Verify API, Number Deactivation |
| -30009 | 'Date' or 'x-ts-date' header is not RFC822 compliant | SMS Verify API |
| -30010 | 'Date' or 'x-ts-date' header is not within tolerable range | SMS Verify API, Voice Verify API, Number Deactivation |
| -30011 | X-TS-Nonce header value is either too long or too short | Voice Verify API, Number Deactivation |
| -30011 | 'x-ts-nonce' header value is either too long or too short | SMS Verify API |
| -30012 | 'x-ts-nonce' header value has been used recently | SMS Verify API, Voice Verify API, Number Deactivation |
| -30013 | Invalid ReferenceID for Verify Completion | Completion, Get Status |
| -30015 | Invalid API Key | SMS Verify API |
| -40001 | Status unavailable | Get Status |
| -40002 | Not authorized | Voice Verify API, Number Deactivation |
| -40004 | Resource not found | Voice Verify API, Number Deactivation |
| -40005 | Method not allowed | Voice Verify API, Number Deactivation |
| -40006 | Bad Request | Bulk SMS |
| -40007 | Rate limit exceeded | Voice Verify API, Number Deactivation, SMS Verify API |
| -40007 | Rate Limit Exceeded | SMS Verify API, Bulk SMS |
| -40008 | [Product method] exceed transaction hard cap; Request denied | SMS Verify API, Voice Verify API, Number Deactivation |
| -40008 | Verify SMS exceeded transaction hard cap. Request denied. | Bulk SMS |
| -40009 | Phone number not supported | SMS Verify API, Voice Verify API, Number Deactivation |
| -40023 |  | Number Deactivation |
| -40024 | Message blocked by customer request | Bulk SMS |
| -40025 | Message blocked by Telesign | Bulk SMS |
| -40032 | Blocked due to Legal Compliance | Phone ID Live |
| -50001 | Max retries limit reached | Voice Verify API, Number Deactivation |
| -50002 | Mobile 2FA registration error | Voice Verify API, Number Deactivation |
| -50003 | Mobile device stamp drift too large | Voice Verify API, Number Deactivation |
| -50051 | Invalid hashcash submitted | Voice Verify API, Number Deactivation |
| -50052 | Unmatched registration initiate request | Voice Verify API, Number Deactivation |
| -50054 | Invalid API key | Voice Verify API, Number Deactivation |
| -50055 | Inactive API key | Voice Verify API, Number Deactivation |
| -50056 | Inactive application | Voice Verify API, Number Deactivation |
| -50057 | Invalid verification code | Voice Verify API, Number Deactivation |
| -50058 | Application is not registered for push notification | Voice Verify API, Number Deactivation |
| -50059 | Status not available |  |
| -60001 | Phone ID Contact data not found | Phone ID |
| -60002 | Mobile 2FA registration warning | Voice Verify API, Number Deactivation |
| -90001 | System unavailable; please try again later | Voice Verify API, Number Deactivation |
| -90001 | System Unavailable, please try again later. | SMS Verify API, Bulk SMS |

What to do about the common ones:

| Codes | Action |
| --- | --- |
| `-10001`, `-20001` | Fix the request: a parameter is invalid or missing, or the `reference_id` does not exist for this Customer ID. |
| `-10004` | The `reference_id` is too old to query. |
| `-10009` | Invalid source IP address: the request came from an IP address the account does not accept. |
| `-10030` | Top up the prepaid wallet. |
| `-10033` | Trial account: verify the destination number first. |
| `-20002`, `-20003`, `-20004` | Ask Telesign to enable the product, feature or country for the account. |
| `-30000` to `-30003`, `-30015` | Check the Customer ID and API key, and the state of the account. |
| `-30004` to `-30012` | Authentication header problems (signature, date, nonce). See topic `authentication`. |
| `-40007` | Rate limit: slow down and retry. |
| `-40008` | The transaction hard cap for the product was exceeded and the request was denied. |
| `-40032` | Blocked for legal compliance (DROP). See "Reason codes 10041 and -40032 for DROP requests". |
| `-90001` | Telesign is temporarily unavailable; retry later. |

## Positive error codes (10000-45010)

Returned in `errors[].code` by Phone ID, Intelligence, Silent Verify API and Number Masking.

| Error code | Description | Product |
| --- | --- | --- |
| 10000 | System unavailable, please try again later. | Silent Verify API |
| 10004 | Bad request | Silent Verify API |
| 10008 | Invalid signature | Phone ID, Intelligence |
| 10009 | Invalid value for parameter message | Phone ID, Intelligence |
| 10010 | CustomerID Account Suspended | Phone ID, Intelligence |
| 10011 | Invalid value for parameter reference_id | Silent Verify API |
| 10012 | This feature is not enabled for this CustomerID | Phone ID, Intelligence |
| 10013 | Invalid Request. CustomerID Account Not Found | Phone ID, Intelligence |
| 10014 | Invalid source IP address | Phone ID, Intelligence |
| 10015 | Invalid Customer ID | Phone ID, Intelligence |
| 10017 | Customer ID / Reference ID not found | Phone ID, Intelligence |
| 10019 | Rate Limit Exceeded | Phone ID, Intelligence, Silent Verify |
| 10020 | Messaging exceeded transaction hard cap. Request denied. | Phone ID, Intelligence |
| 10032 | Request blocked due to this number appearing on a Telesign blocklist. | Phone ID, Intelligence |
| 10033 | Unverified phone_number requested for trial account. | Intelligence, Phone ID |
| 10039 | Internal server error | Silent Verify API |
| 10041 | Blocked due to legal compliance | Intelligence, Phone ID |
| 11000 | Invalid value for parameter phone_number | Phone ID, Intelligence, Silent Verify API |
| 11001 | Invalid country code for parameter phone_number | Phone ID, Intelligence |
| 11002 | Invalid value for parameter account_id | Intelligence |
| 11003 | Invalid value for parameter account_lifecycle_event | Phone ID, Intelligence |
| 11005 | Invalid value for parameter customer_id | Phone ID, Intelligence |
| 11006 | Invalid value for parameter device_id | Intelligence |
| 11007 | Invalid value for email_address | Intelligence |
| 11010 | Invalid value for parameter originating_ip | Phone ID, Intelligence |
| 11011 | Invalid value for parameter reference_id | Phone ID, Intelligence |
| 11024 | Invalid value for parameter phone_number_1 | Number Masking |
| 11025 | Invalid value for parameter phone_number_2 | Number Masking |
| 12000 | Missing required parameter phone_number | Phone ID, Intelligence |
| 12003 | Missing required parameter account_lifecycle_event | Intelligence |
| 40001 | Request timeout | Silent Verify API |
| 40002 | Not authorized | Silent Verify API |
| 40003 | No end client data found on records | Silent Verify API |
| 40004 | The required parameter 'verification' is missing from the request | Silent Verify API |
| 40010 | Not in coverage. The phone number being verified is not within the provider's network. | Silent Verify API |
| 45005 | Error on gateway - temporary error. This error is generated if there is an error on Telesign's partner side that is considered temporary. You can try to send the message again. | Silent Verify API |
| 45006 | Error on gateway - permanent error. This error is generated if there is an error on Telesign's partner side that is considered permanent. You should not try to send the message again. | Silent Verify API |
| 45010 | Provider not available to route the request. This error can occur when providers not are available in the geographical area to route the request or when all providers failed (with errors) to complete the requests. | Silent Verify API |

## Verify API request parameter status codes

The Verify API (`verifyapi_send_otp`, `verifyapi_get_status`, `verifyapi_update_process`, `verifyapi_check_code`) reports everything through `status.code`. Parameter problems on a POST:

| `status.code` | `status.description` | HTTP | Parameter | Meaning |
| --- | --- | --- | --- | --- |
| 3101 | Invalid value for parameter phone_number | 400 | `phone_number` | Phone number is too long, too short, or contains non-digit values |
| 3103 | Unsupported value for parameter external_id | 400 | `external_id` | Parameter external_id is longer than 100 or contains non-ASCII characters. |
| 3119 | Invalid value for parameter email | 400 | `email` | Email is not valid. |
| 3302 | Missing parameter phone_number | 400 | `phone_number` | Returned if phone based methods are specified in policy but recipient does not contain phone_number |
| 3309 | Missing parameter email | 400 | `email` | Returned if email is specified in policy but recipient does not contain email |

## Verify API other POST validation status codes

| `status.code` | `status.description` | HTTP | Meaning |
| --- | --- | --- | --- |
| 3001 | Message in progress | 200 | The message is being sent to selected channel, final status to be returned later, when available, via callback. (Intermediate) |
| 3110 | Invalid request | 400 | API request / JSON improperly formatted. |
| 3116 | Payload limit size exceeded | 400 | Allowed payload size is limited to 10KB. If payload size exceeded, HTTP 413 will be returned, without validation on API. |
| 3906 | Unified Verification Product not enabled for Customer ID | 401 | The Verify API is not enabled in your account. |
| 3400 | Not authorized | 401 | No permissions for this resource or authorization failed. |
| 3204 | Rate limit exceeded | 429 | Allowed number of requests per second has been exceeded. |
| 3500 | System Unavailable | 503 | System is unavailable, the request should be resubmitted. |
| 3041 | Carrier rejected - temporary problem | 503 | Try request again. |
| 3072 | Message blocked due to high risk score |  | Intelligence Score higher than set threshold. Telesign blocked the transaction. |

`3001` is the normal answer to a successful create: the message is on its way and the final status arrives later (callback or `verifyapi_get_status`). If the payload exceeds the size limit, HTTP 413 is returned without API validation.

## Verify API mobile backend status codes

Returned by the Verification mobile backend API used by the Verify SDK. Telesign asks you to contact support for codes not in this table.

| `status.code` | `status.description` | HTTP | Meaning |
| --- | --- | --- | --- |
| 3110 | Invalid request | 400 | API request / JSON improperly formatted. |
| 3116 | Payload limit size exceeded | 400 | Allowed payload size is limited to 10KB. if payload size exceeded, HTTP 413 will be returned, without validation on API. |
| 3906 | Unified Verification Product not enabled for Customer ID | 401 | The Verify API product is not enabled for your account. |
| 3400 | Not authorized | 401 | No permissions for this resource or authorization failed. |
| 3204 | Rate limit exceeded | 429 | Allowed number of requests per second on API has been exceed. |
| 3500 | System Unavailable | 503 | System is unavailable, the request should be resubmitted. |

## Verify API verification processing status codes (3900-3952)

These describe the verification process itself and the result of checking a code.

| `status.code` | `status.description` | HTTP | Meaning |
| --- | --- | --- | --- |
| 3900 | Verified | 200 | Any of the inner methods has successfully completed verification of end user |
| 3901 | Request in progress | 200 | The verification request was delivered to the gateway. If the gateway responds with further information (including successful delivery to handset or delivery failure), the status is updated. Verification is in ONGOING state |
| 3903 | Invalid reference_id | 400 |  |
| 3904 | Verification Failed | 400 | Inner method failed (mismatch). Verification is in FAILED state |
| 3905 | Method Failed | 400 | Next method in fallback order should be called as the previous one has failed. Verification is in ONGOING state |
| 3906 | Unified Verify Product not enabled for Customer ID | 401 | Product is not enabled in your account. |
| 3907 | No verification method enabled for Customer ID | 400 | None of the verification methods is enabled in your account. This is also returned when Countries is enabled for the Silent Verify feature but you are trying to verify a number which does not belong to the set of selected countries. |
| 3908 | Verification time expired | 400 | Time has expired for all chosen methods. Verification is in FAILED state. |
| 3909 | Invalid code entered | 400 | Invalid code entered. Verification is in ONGOING state. End user can try again. |
| 3911 | One or more verification methods not enabled | 400 |  |
| 3912 | Invalid verification policy | 400 | Is returned in case of improper formatting or ordering of verification policy through manual mode or in case SRE is enabled and returns an empty `verification_policy` parameter |
| 3913 | Invalid or missing recipient | 400 | If recipient is missing phone number and email or if the format is invalid. |
| 3922 | Missing parameter action | 400 |  |
| 3923 | Missing parameter method | 400 |  |
| 3924 | Invalid value for parameter method | 400 |  |
| 3925 | Invalid value for parameter action | 400 |  |
| 3927 | Too many START events without FINALIZE |  | Customer is not using FINALIZE for Verify API |
| 3931 | Invalid workflow request | 400 | Upon calling start - if the verification object isn't 'created' or 'ongoing' or method in 'created' state Upon calling finalize - if the verification object isn't 'ongoing' or method in 'ongoing' state |
| 3932 | Wrong verification method called | 400 | Returned if a method is not in policy. If another method is ongoing its state will be set to failed (method status will be 3905) |
| 3933 | Method expired | 400 |  |
| 3934 | Method skipped | 400 |  |
| 3935 | Code validity expired | 400 | The set code validity period has expired and code is no longer valid |
| 3936 | Invalid security_factor | 400 | String is over 10 characters |
| 3941 | Missing parameter X-TS-sdk-version | 400 |  |
| 3942 | Invalid or missing parameter push_app_token | 400 |  |
| 3943 | Invalid value for parameter push_registration | 400 |  |
| 3944 | Invalid, missing or mismatched supported_algorithm | 400 |  |
| 3945 | Invalid or missing parameter app_id | 400 |  |
| 3946 | Invalid or missing parameter public _key | 400 |  |
| 3947 | Timestamp expired, please register push device again | 400 |  |
| 3948 | public_key error | 400 |  |
| 3949 | User rejected verification | 400 |  |
| 3950 | Stamp error | 400 |  |
| 3951 | Envelope error | 400 |  |
| 3952 | Challenge error | 400 |  |

How to react to the main ones:

| Code | State of the verification | What to do |
| --- | --- | --- |
| 3900 | Verified | Done. Let the user through. |
| 3901 | ONGOING | Wait for the user to respond or for the next status. |
| 3904 | FAILED | Start a new verification process. |
| 3905 | ONGOING | The current method failed; the next method in the fallback order is used. |
| 3908 | FAILED | All methods timed out. Start a new verification process. |
| 3909 | ONGOING | Wrong code. The end user can try again. |
| 3935 | | The code's validity period ran out. Send a new code. |

## Verify API Silent Verify status and error mapping

When Silent Verify runs as a method inside the Verify API, its own codes are translated into Verify API codes.

| Silent Verify code | Description | HTTP | Name | Endpoint | Verify API code returned |
| --- | --- | --- | --- | --- | --- |
| 4501 | Success | 200 | `create_success_response` | initiate, finalize | 3901 |
| 4501 | Successfully verified | 200 | `successfully_verified` | initiate, finalize | 3900 |
| 4502 | The phone number does not match | 200 | `phone_number_not_verified` | finalize | 3904 |

| Silent Verify code | Description | HTTP | Name | Endpoints | Verify API mapping |
| --- | --- | --- | --- | --- | --- |
| 10001 | Invalid value for parameter reference_id | 400 | `invalid_reference_id` | initiate, finalize | Returns 3905 if another method is available in the fallback order; otherwise returns 3904. |
| 40010 | Not in coverage | 400 | `not_in_coverage` | initiate | Returns 3905 if another method is available in the fallback order; otherwise returns 3904. |
| 40002 | Not authorized | 401 | `not_authorized` | finalize | Returns 3400. |
| (none) | Invalid value for parameter reference_id | 404 | `not_found` |  | Returns 3905 if another method is available in the fallback order; otherwise returns 3904. |
| 10019 | Rate Limit Exceeded | 429 | `rate_limit_exceeded` | initiate, finalize | Returns 3204. |
| 10039 | Internal server error - An unexpected failure happened most likely in a dependent AWS managed service | 503 | `internal_server_error` | initiate, finalize | Returns 3905 if another method is available in the fallback order; otherwise returns 3500. |
| 10000 | System unavailable, please try again later | 503 | `system_unavailable` | initiate, finalize | Returns 3905 if another method is available in the fallback order; otherwise returns 3500. |
| 4505 | Error on gateway - temporary error | 503 | `gateway_error_temporary` | initiate, finalize | Returns 3905 if another method is available in the fallback order; otherwise returns 3500. |
| 4506 | Error on gateway - permanent error | 503 | `gateway_error_permanent` | initiate, finalize | Returns 3905 if another method is available in the fallback order; otherwise returns 3500. |

Telesign's two pages disagree on some Silent Verify numbers: the Verify API page (above) gives `10001` for an invalid `reference_id` and `4505` / `4506` for gateway errors, while the "All status and error codes" list gives `10011`, `45005` and `45006`. Handle both.

## Verify API Push Verify status mapping

Push Verify answers the Verify API over gRPC and then reports delivery results from Firebase. Both are translated into Verify API codes.

| Case | gRPC status | Response status_code | Response status_description | Verify API code returned |
| --- | --- | --- | --- | --- |
| No errors - Push Verify accepted the request | 0 | 0 | (empty) | 3901 |
| Invalid input | 0 | 1 | "Invalid input: Missing required parameter parent_reference_id", "... customer_id" or "... push_app_token" | 3045 |
| Internal error | 0 | 2 | "Issue processing request due to RabbitMQ." | 3500 |

| Push Verify code | Status | Details | Verify API code returned |
| --- | --- | --- | --- |
| 53200 | `MessageProcessed` | Firebase accepted message and sent to device. | 3901 |
| 53201 | `MissingRegistration` | Missing `push_app_token`. | 3942 |
| 53202 | `InvalidRegistration` | Invalid `push_app_token`. | 3942 |
| 53203 | `NotRegistered` | push_app_token may be expired or the client app may have been unregistered from Firebase Cloud Messaging. This token should no longer be used. | 3942 |
| 53204 | `InvalidPackageName` | This error should not occur, as Push Verify does not specify a package name. However, it indicates that the `push_app_token` does not match the expected app package. | 3942 |
| 53205 | `MismatchSenderId` | The `push_app_token` is associated with a group of senders. If your account credentials are not part of that sender group, this error will occur | 3400 |
| 53206 | `MessageTooBig` | The payload of template parameters is too large. Up to 4096 bytes (including both key and value) are allowed. This limit also includes the `mobile_app_token` being passed through. | 3116 |
| 53207 | `InvalidDataKey` | The template parameters include a key reserved by Firebase, such as `from` or `gcm`, which cannot be used. | 3904 |
| 53208 | `InvalidTtl` | This error should not occur, as Push Verify does not pass a TTL to Firebase. However, if it does, the TTL must be between 0 and 2,419,200 seconds (4 weeks). | 3904 |
| 53209 | `DeviceMessageRateExceeded` | Too many messages have been sent to the device in a short period. Push Verify has automatically retried sending the message. | 3204 |
| 53400 | `InvalidJson` | Push Verify formatted JSON incorrectly for Firebase to consume. | 3904 |
| 53401 | `AuthenticationError` | Your account credentials may be invalid, preventing authorization to send push messages through Firebase. | 3400 |
| 53402 | `InvalidParameters` | The payload was incorrectly formatted or contained invalid values, preventing Firebase from processing the request. | 3904 |
| 53500 | `FCMError` | Firebase returned a 500 status code due to an internal error. Push Verify automatically retried sending the message. | 3041 |
| 53501 | `Timeout` | Firebase was unable to process the request within the expected time window. Push Verify automatically retried sending the message. | 3041 |
| 53502 | `Unavailable` | Firebase returned an 'Unavailable' error, which should be treated the same as a timeout. Push Verify automatically retried sending the message. | 3041 |
| 53503 | `InternalServerError` | Firebase encountered an internal error and returned a structured error response instead of an HTTP 500. Push Verify automatically retried sending the message. | 3041 |
| 53600 | `Unknown` | Firebase returned an unrecognized error. Push Verify was unable to classify or process the response. | 3041 |
| 53420 | `MissingFirebaseCredential` | Your account is missing the Firebase credentials required to send push messages through Push Verify. | 3041 |
| 53520 | `InternalServerError` | Push Verify encountered a persistent error after five retry attempts. The message could not be delivered. | 3500 |

## Verify API voice status mapping

| Code | Status name | Description |
| --- | --- | --- |
| 0 | Call has been placed on media server | Delivered. |
| 3 | Invalid input | One or more required fields are missing or improperly formatted. |
| 13 | Internal server error | Something unexpected happened. |
| 129 | Call blocked by customer request | Call is blocked by subscriber action or request. |
| 130 | Call blocked by Telesign | Call is blocked by Telesign. |
| 1002 | Number on country blocklist | Line is busy. |
| 1003 | Generic error delivering voice call | Call failed to deliver to end user. |
| 1004 | Exhausted gateway hosts | Call is cancelled by end user. |

The descriptions for `1002`, `1003` and `1004` are reproduced as Telesign publishes them; they do not line up with the status names, so rely on the status name.

## Okta telephony status codes

When Telesign is used behind the Okta telephony inline hook, Okta expects one of three statuses in the hook response:

| Okta status | Meaning |
| --- | --- |
| SUCCESSFUL | External web service was able to deliver the OTP to the Requester |
| PENDING | External web service wasn't able to confirm delivery of the OTP to the Requester |
| FAILED | External web service was unable to deliver the OTP to the Requester |

Telesign does not use HTTP status codes to tell Okta about problems it found in the data (they are used only when Telesign cannot parse the request from Okta). The reason is in the `status.code` of the response payload, and for some problems the HTTP status is still 200. Codes returned directly:

| Status code | Text string | Notes |
| --- | --- | --- |
| 3101 | Invalid value for parameter phone_number: {phone_number} | Applicable only for no-code customers. |
| 3110 | Invalid request |  |
| 3113 | Invalid value for parameter channel: {channel} |  |
| 3200 | {channel} channel is not enabled for customer |  |
| 3210 | Okta Inline Hook API is not enabled for the Customer. | Applicable only for no-code customers. |
| 3302 | Missing parameter phone_number |  |
| 3204 | Rate limit exceeded |  |
| 3206 | Omnichannel Product not enabled for Customer ID |  |
| 3301 | Missing parameter channel |  |
| 3303 | Missing parameter message |  |
| 3500 | System Unavailable. |  |

## Okta telephony SMS callback status codes

Optionally, delivery results reach you through the Messaging callback service. Each row gives the status of the SMS channel and the overall status reported if SMS was the last channel tried. Only `3000`, `3001` and `3002` keep their own overall status; every other code is reported overall as `3003` Delivery error.

| Channel status code | Channel status description | Overall code if last channel | Overall description if last channel |
| --- | --- | --- | --- |
| 3000 | Delivered | 3000 | Delivered |
| 3001 | Message in progress | 3001 | Message in progress |
| 3002 | Delivered to gateway | 3002 | Delivered to gateway |
| 3003 | Delivery error | 3003 | Delivery error |
| 3004 | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | 3003 | Delivery error |
| 3030 | Temporary phone error | 3003 | Delivery error |
| 3031 | Permanent phone error | 3003 | Delivery error |
| 3032 | Gateway/network cannot route message | 3003 | Delivery error |
| 3033 | Message expired before delivery | 3003 | Delivery error |
| 3034 | SMS not supported | 3003 | Delivery error |
| 3035 | Invalid/unsupported message content | 3003 | Delivery error |
| 3036 | Price threshold exceeded | 3003 | Delivery error |
| 3037 | Message blocked in requested country | 3003 | Delivery error |
| 3038 | Destination blocked by prefix | 3003 | Delivery error |
| 3039 | Final status unknown | 3003 | Delivery error |
| 3040 | Queued by gateway | 3003 | Delivery error |
| 3041 | Carrier rejected - temporary problem | 3003 | Delivery error |
| 3042 | Carrier rejected - permanent error | 3003 | Delivery error |
| 3043 | Error on gateway - temporary error | 3003 | Delivery error |
| 3044 | Error on gateway - permanent error | 3003 | Delivery error |
| 3045 | Parameters problem | 3003 | Delivery error |
| 3046 | Message blocked by subscriber action or request | 3003 | Delivery error |
| 3047 | Subscriber low on credit | 3003 | Delivery error |
| 3048 | Roaming error | 3003 | Delivery error |
| 3049 | Mobile number portability error | 3003 | Delivery error |
| 3050 | Subscriber absent | 3003 | Delivery error |
| 3051 | Suspected spam | 3003 | Delivery error |
| 3052 | Message blocked by customer request | 3003 | Delivery error |
| 3053 | Message blocked by Telesign | 3003 | Delivery error |
| 3057 | Invalid source address | 3003 | Delivery error |
| 3058 | The requested API host is not allowed for this CustomerID | 3003 | Delivery error |
| 3071 | Unverified phone number requested for trial account | 3003 | Delivery error |
| 3072 | Message blocked due to high risk score. | 3003 | Delivery error |
| 3101 | Invalid value for parameter phone_number: {phone_number} | 3003 | Delivery error |
| 3102 | Invalid value for parameter message_type: {message_type} | 3003 | Delivery error |
| 3103 | Invalid value for parameter external_id | 3003 | Delivery error |
| 3104 | Invalid value for parameter account_lifecycle_event: {account_lifecycle_event} | 3003 | Delivery error |
| 3105 | Invalid value for parameter originating_ip: {originating_ip} | 3003 | Delivery error |
| 3106 | Invalid value for parameter callback_url: {callback_url} | 3003 | Delivery error |
| 3107 | Invalid value for parameter country_code | 3003 | Delivery error |
| 3108 | Invalid value for parameter message | 3003 | Delivery error |
| 3109 | Invalid value for parameter sender_id: {sender_id} | 3003 | Delivery error |
| 3111 | Invalid value for parameter max_price | 3003 | Delivery error |
| 3112 | Specified template does not exist for selected channel | 3003 | Delivery error |
| 3200 | {channel} channel is not enabled for customer | 3003 | Delivery error |
| 3205 | SMS Rate Limit Exceeded | 3003 | Delivery error |
| 3207 | Product exceeded transaction hard cap. Request denied. | 3003 | Delivery error |
| 3302 | Missing Required Parameter phone_number | 3003 | Delivery error |
| 3303 | Missing Required Parameter message | 3003 | Delivery error |
| 3304 | Missing Required Parameter message_type | 3003 | Delivery error |
| 3305 | Missing template specific parameters | 3003 | Delivery error |
| 3400 | Not authorized | 3003 | Delivery error |
| 3401 | 'x-ts-nonce' header value has been used recently | 3003 | Delivery error |
| 3402 | 'Date' or 'x-ts-date' header is not within tolerable range | 3003 | Delivery error |
| 3403 | Missing required 'Date' or 'x-ts-date' header | 3003 | Delivery error |
| 3404 | Invalid Signature. | 3003 | Delivery error |
| 3405 | Missing required 'Authorization' header | 3003 | Delivery error |
| 3406 | CusomterID Account Suspended. | 3003 | Delivery error |
| 3407 | x-ts-nonce' header value is either too long or too short | 3003 | Delivery error |
| 3408 | CustomerID Account Not Found | 3003 | Delivery error |
| 3409 | Invalid source IP address. | 3003 | Delivery error |
| 3410 | Invalid Customer ID. | 3003 | Delivery error |
| 3411 | Invalid API Key. | 3003 | Delivery error |
| 3412 | Required 'Authorization' header is not in the correct format | 3003 | Delivery error |
| 3413 | Not Allowed Host | 3003 | Delivery error |
| 3413 | Date' or 'x-ts-date' header is not RFC822 compliant | 3003 | Delivery error |
| 3415 | Invalid 'x-ts-auth-method' header | 3003 | Delivery error |
| 3500 | System Unavailable, Please try again later. | 3003 | Delivery error |

`3413` appears twice in Telesign's table with two different descriptions.

## Okta telephony voice callback status codes

| Channel status code | Channel status description | Overall code if last channel | Overall description if last channel |
| --- | --- | --- | --- |
| 3000 | Delivered. | 3000 | Delivered. |
| 3037 | Message blocked in requested country. | 3003 | Delivery error. |
| 3080 | The call is not delivered to end-user. | 3003 | Delivery error. |
| 3081 | There was an error delivering audio to handset. | 3003 | Delivery error. |
| 3052 | Message blocked by customer request. | 3003 | Delivery error. |
| 3053 | Message blocked by Telesign | 3003 | Delivery error. |
| 3110 | Invalid request. | 3003 | Delivery error. |
| 3500 | System Unavailable, Please try again later. | 3003 | Delivery error. |

## Reason codes 10041 and -40032 for DROP requests

DROP (Delete Request and Opt-Out Platform) is run by the California Privacy Protection Agency under California's Delete Act. It lets California residents send one request telling every registered data broker to delete their personal information. Telesign is a registered data broker and must process matching requests.

| Code | Product | Meaning |
| --- | --- | --- |
| 10041 | Phone ID, Intelligence | Blocked due to legal compliance |
| -40032 | Phone ID Live | Blocked due to Legal Compliance |

What this means for a caller:

- When either code is returned, Telesign does not provide the requested Phone ID or Intelligence output for that transaction.
- The blocked transaction is not billable and does not count towards API usage.
- Retrying will not help. Treat the code as a signal about the end user, not as an outage.
- Telesign's guidance is that you assess your own legal obligations for that end user's personal information (deletion, de-identification or other restrictions under the laws that apply to you) before continuing to use it.

An assistant that sees `10041` or `-40032` from `phoneid_get_info`, `phoneid_live_status`, `intelligence_assess_risk` or a related tool should report it to the user as a compliance block and should not try other tools to obtain the same data.

## Related

- Topics: `callbacks` (delivery reports carry these status codes), `authentication` (causes of signature, date and nonce errors), `best-practices`, `verify-api`, `accounts`, `reference/callbacks` (status code tables per callback type).
- `docs_get_tool_reference("<tool>")` lists the codes each endpoint can return, per HTTP status.
- Telesign pages used:
  - https://developer.telesign.com/enterprise/docs/all-status-and-error-codes
  - https://developer.telesign.com/enterprise/docs/understand-telesign-status-and-error-codes
  - https://developer.telesign.com/enterprise/docs/verify-api-status-codes
  - https://developer.telesign.com/enterprise/docs/okta-telephony-status-codes
  - https://developer.telesign.com/enterprise/docs/guidelines-for-a-new-reason-code-for-drop-requests
  - https://developer.telesign.com/enterprise/docs/messaging-callback-service
