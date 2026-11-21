# Callbacks (webhooks) - API reference

Telesign posts these payloads to callback URLs that you host. They are not MCP tools; use this page to build or debug your callback handler.

## Receive Verify API Delivery Reports

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/unifiedverifycallbacks>

This is a web service created by you, to receive delivery reports (DLRs) from the Telesign Verify API. You can receive callbacks, including DLRs, from multiple Telesign services at the same endpoint.

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `created_on` | string |  | A timestamp that indicates when Telesign created this verification process. Example: `2022-31-03T14:51:28.709526Z`. |
| `inner_methods` | array of object |  |  |
| `inner_methods[].method` | string enum | yes | One of the [verification methods](https://developer.telesign.com/enterprise/docs/verify-api-get-started#supported-verification-methods) included in a verification policy. Each method employs a Telesign service, such as Silent Verify or Push Verify. Allowed: `silent`, `sms`, `push`, `rcs`, `whatsapp`, `email`. Example: `sms`. |
| `inner_methods[].state` | string enum |  | Text describing the processing status of the specified verification method. This is not the same as the overall status of the verification process. Allowed: `CREATED`, `ONGOING`, `SKIPPED`, `REJECTED`, `FAILED`, `VERIFIED`, `CANCELED`. Example: `ONGOING`. |
| `inner_methods[].err_code` | integer |  | A numeric code indicating which error occured while attempting to use this verification method. Example: `2`. |
| `inner_methods[].err_msg` | string |  | Text describing the error that occured while attempting to use this verification method. Example: `MSG_NOT_DELIVERED`. |
| `inner_methods[].tried_on` | string |  | A timestamp that indicates when this verification method was attempted. Example: `2022-31-03T14:51:28.709526Z`. |
| `inner_methods[].updated_on` | string |  | An [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) timestamp that indicates when the state of attempting verification with this method was last updated. Example: `2022-31-03T14:51:28.709526Z`. |
| `recipient` | object |  | Contains properties with the recipient identifier for a [verification process](https://developer.telesign.com/enterprise/docs/verify-api-get-started#key-terms). |
| `recipient.phone_number` | string |  | The recipient's phone number, as digits without spaces or special characters, beginning with the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `11234567890`. |
| `recipient.push_app_token` | string |  | Identifies the instance of your mobile application installed on the user's mobile device. This is also called a "registration token" in Firebase Cloud Messaging or a "device token" in iOS. This is required when using the Push Verify verification method. |
| `recipient.email` | string |  | The recipient's email address. Example: `ncarolina@vero-finto.com`. |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies this verification process. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `state` | string enum | yes | The current state of this verification process. Allowed: `CREATED`, `ONGOING`, `REJECTED`, `FAILED`, `VERIFIED`, `CANCELED`. Example: `ONGOING`. |
| `updated_on` | string |  | An [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) timestamp indicating when the status of this verification process was last updated. Example: `2022-31-03T14:51:28.709526Z`. |
| `verification_policy` | array of object |  | An ordered set of verification methods and their fallback times that the Verify API uses for this verification process. See [verification policy](https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time) for more details. |
| `verification_policy[].method` | string enum |  | One of the [verification methods](https://developer.telesign.com/enterprise/docs/verify-api-get-started#supported-verification-methods) included in a verification policy. Each method employs a Telesign service, such as Silent Verify or Push Verify. Allowed: `silent`, `sms`, `push`, `rcs`, `whatsapp`, `email`. Example: `sms`. |
| `verification_policy[].fallback_time` | integer |  | The time window in seconds that the service waits before abandoning the current verification method and then initiating verification using the next method specified in the active [verification policy](https://developer.telesign.com/enterprise/docs/verify-api-verification-policy-and-fallback-time). It is possible for the failover to happen earlier if certain failure conditions occur. Example: `10`. |

### Example payload

```json
{
  "created_on": "2022-31-03T14:51:28.709526Z",
  "inner_methods": [
    {
      "method": "whatsapp",
      "state": "FAILED",
      "err_code": 3209,
      "err_msg": "Unknown status",
      "tried_on": "2022-31-03T14:51:28.709526Z",
      "updated_on": "2022-31-03T14:51:28.709526Z"
    },
    {
      "err_code": 3900,
      "err_msg": "Verified",
      "expires_on": "2022-31-03T14:51:28.709526Z",
      "method": "sms",
      "state": "VERIFIED",
      "tried_on": "2022-31-03T14:51:28.709526Z",
      "updated_on": "2022-31-03T14:51:28.709526Z"
    }
  ],
  "recipient": {
    "phone_number": "11234567890"
  },
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "state": "VERIFIED",
  "updated_on": "2022-31-03T14:51:28.709526Z",
  "verification_policy": [
    {
      "method": "whatsapp",
      "fallback_time": 30
    },
    {
      "method": "sms",
      "fallback_time": 30
    }
  ]
}
```


---

## Receive SMS Verify API Delivery Reports

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/smsverifycallbacks>

This is a web service created by you, to receive delivery reports (DLRs) from the Telesign SMS Verify API. You can receive callbacks, including DLRs, from multiple Telesign services at the same endpoint.

#### Status codes

 | Status code | Associated text string | Description                                      |
 |-------------|------------------------|--------------------------------------------------|
 | 200         | Delivered to handset   | The SMS was delivered to the end user's phone. (Final)     |
 | 201         | Transaction successfully completed, suspicious activity detected   | Telesign's internal anti-fraud mechanisms identified potentially suspicious activity related to the destination phone number.   |
 | 203         | Delivered to gateway   | The SMS was delivered to the gateway. If the gateway responds with further information (including successful delivery to handset or delivery failure), the status is updated.    (Intermediate)                                   |
 | 207         | Error delivering SMS to handset (reason unknown)  | The SMS could not be delivered to the end user's  handset for an unknown reason. (Final) |
 | 210         | Temporary phone error  | The SMS could not be delivered to the handset due to a temporary error with the phone. Examples - phone is turned off, not enough memory to store the message. (Final)                             |
 | 211         | Permanent phone error  | The SMS could not be delivered to the handset due to a permanent error with the phone. For example, the phone is incompatible with SMS, or illegally registered on the network. This can happen when a phone number is blacklisted, or is incorrectly provisioned. (Final)                             |
 | 220         | Gateway/network cannot route message | The network cannot route the message to the handset. (Final)                                 |
 | 221         | Message expired before delivery | The message was queued by the mobile provider and timed out before it could be delivered to the handset. (Final)                             |
 | 222         | SMS not supported      | SMS is not supported by this phone, carrier, plan, or user.                                   |
 | 229         | Message blocked by customer request   | Telesign blocked the SMS before it was sent. This is due to your prior submitted request to blocklist this phone number. *Not returned here for customers pinned to the [old version](https://developer.telesign.com/enterprise/changelog/sms-verify-new-version-includes-intelligence) of SMS Verify.*  |
 | 230         | Message blocked by Telesign    | Telesign blocks a message if it is being sent to a phone number that is on a global blocklist. *Not returned here for customers pinned to the [old version](https://developer.telesign.com/enterprise/changelog/sms-verify-new-version-includes-intelligence) of the SMS Verify API.*  |
  | 231         | Invalid/unsupported    | The content of the message is not supported.      |
 | 233         | Message blocked due to high risk score. | It was determined that the risk recommendation for the destination number is higher than the configured maximum risk recommendation. For that reason Telesign did not send the SMS. *Not returned here for customers pinned to the [old version](https://developer.telesign.com/enterprise/changelog/sms-verify-new-version-includes-intelligence) of the SMS Verify API.* |
 | 237         | Message blocked in requested country   | You requested that messages in a specific country be blocked, and the message was being sent to this country.         |
 | 250         | Final status unknown   | The final status of the SMS cannot be determined.|
 | 251         | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | Telesign successfully delivered the message through our gateway and it passed downstream. However, Telesign did not receive a delivery receipt within 12 hours of transmission. We cannot confirm delivery to the handset. The end user most likely did not receive the message. |
 | 292         | Queued by gateway      | The SMS gateway has queued the message.          |
 | 295         | Status delayed         | The status of the SMS is temporarily unavailable.|
 | 500 | Transaction not attempted. | No SMS request was attempted. |
 | 501         | Not authorized         | No permissions for this resource, or authorization failed.                            |
 | 502         | Campaign error         | This error can be generated if there is a problem with the short code used.                        |
 | 503 | System Unavailable, Please try again later. | Internal system error|
 | 504         | Carrier rejected - permanent error     | This error is generated if there is an error on the carrier or operator side that is permanent and the message should not be retried.           |
 | 505         | Error on gateway - temporary error         | This error is generated if there is an error on Telesign's partner side that is considered temporary and the message can be retried.        |
 | 506         | Error on gateway - permanent error    | This error is generated if there is an error on Telesign's partner side that is considered permanent and the message should not be retried. |
 | 507         | Invalid destination address   | There is a problem with the destination address used. Either the format is not valid, or the number is not associated with any carrier, or if MSC is used it does not know about this MSISDN.  |
 | 508         | Invalid source address | The message requires a source address. Verify that one is provided and correct.                |
 | 509         | Parameters problem     | One or more parameters used in the request is not supported.                                       |
 | 510         | Message blocked by subscriber action or  request   | The end user has blocked receiving SMS with their carrier plan or by request or from the particular short code used.                                 |
 | 511         | Subscriber low on credit     | The end user exceeded their spending limits and cannot receive SMS.                              |
 | 512         | Roaming error          | End user cannot receive SMS because their device that receives the messages is roaming.           |
 | 513         | Mobile number portability error         | SMS failed because ported combinations are unreachable.      |
 | 514         | Subscriber absent      | The operator/carrier is temporarily unable to reach the end user.       |
 | 515         | Suspected spam         | This message is considered to be spam by carrier or operator.   |
 | 517         | Selected DLT details for India not supported   | The DLT template ID or entity ID in the request cannot be found by the end operator.|
  | 518         | Message blocked due to high risk SIM swap indicator. |The service determined that the SIM swap risk indicator for the destination number is higher than the maximum value configured for your account. For that reason Telesign did not send the SMS.|
 | 519         | Message not sent - requested SIM swap check could not be performed. |The service could not perform the SIM swap check. This is because either the number is out of SIM swap coverage or information about the potential SIM swap event is missing. |
  | 520         | Content sent is not allowed   | The content in this message is not permitted by the carrier. |
  | 521  | Requested Sender ID is not allowed for destination  | The Sender ID included in this request cannot be used to send messages to this destination phone number. The Sender ID may either be blocklisted for this country or needs to be added to a whitelist for this country. |
  | 599 | Status not available | The system is unable to provide status at this time.|

#### Error codes

 | Error code | Associated text string | Description
 |-|-|-|
  | -10030 | Insufficient funds in prepaid wallet. | A top-up of prepaid wallet is needed.|

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `status` | object | yes | Contains properties related to the processing status of this transaction or send. |
| `status.code` | integer | yes | Numeric code that indicates the processing status of this transaction or send. Example: `200`. |
| `status.description` | string | yes | Text that describes the processing status of this transaction or send. Example: `Delivered to handset`. |
| `status.updated_on` | string | yes | Timestamp that indicates when the status of this transaction or send was last updated. Example: `2016-10-21T14:05:36.181346Z`. |
| `submit_timestamp` | string |  | An ISO 8601 UTC timestamp indicating when the request was received. Example: `2016-01-01T01:01:01.010101Z`. |
| `errors` | array of object |  | Contains an object for each error that occurred. |
| `errors[].code` | integer |  | Numeric code that indicates which error occurred. Example: `-90001`. |
| `errors[].description` | string |  | Text that describes this error. Example: `System Unavailable, Please try again later.`. |
| `reference_id` | string |  | The service's unique identifier for the original transaction this notification is related to. Length: 32-32. Example: `B56259E45884010488343BAA15FB0002`. |
| `verify` | object |  | Contains properties related to the status of a verification transaction. |
| `verify.code_state` | string |  | Indicates whether the verification code you provided in your request matches that sent by Telesign to the end-user. Example: `UNKNOWN`. |
| `verify.code_entered` | string |  | In some cases, this is the code entered by the end user. Usually the end user's code is not returned, and the value is empty string or `null`. |
| `sub_resource` | string | yes | Indicates which Telesign service processed the original transaction. Example: `sms`. |
| `additional_info` | object |  | An optional package containing properties with further details about the messaging transaction. The `message_parts_count` and `message_parts_reference_ids` properties only appear if the Message Split feature is enabled for your account. Contact our [Customer Support Team](mailto:support@telesign.com) to request this feature. |
| `additional_info.message_parts_count` | integer |  | The total number of split parts for the longer message. If the message is not split, this value is `1`. Example: `2`. |
| `additional_info.price` | string |  | The price from the operator for this transaction. Example: `0.5112`. |
| `additional_info.mnc` | string |  | The mobile network code of the destination operator. See https://en.wikipedia.org/wiki/Mobile_country_code. Example: `004`. |
| `additional_info.mcc` | string |  | The mobile country code of the destination operator. See https://en.wikipedia.org/wiki/Mobile_country_code. Example: `310`. |
| `additional_info.currency` | string |  | The currency type that applies to `price`. Example: `USD`. |
| `additional_info.message_parts_reference_ids` | string |  | The reference IDs for each part of the longer message, separated by commas. Example: `35E63E88CB000E049196AD1CFCFFB89C,35E63E88CC7C050491613443467F3F12`. |
| `additional_info.sender_id ` | string |  | The [sender ID](https://support.telesign.com/s/article/What-is-a-Sender-ID) that Telesign used while sending the message. To receive this parameter, ask our [Customer Support Team](mailto:support@telesign.com) to turn on the appropriate feature. Example: `15558675310`. |
| `score_status` | object |  | Contains the Intelligence package properties that are returned if Verify Plus and `Send risk recommendation details in transaction response` features are enabled. |
| `score_status.phone_type` | object |  | Contains properties related to phone type. |
| `score_status.phone_type.code` | string |  | One of the [phone type codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-codes). Example: `2`. |
| `score_status.phone_type.description` | string |  | Text describing the phone type. Example: `MOBILE`. |
| `score_status.risk` | object |  | Contains properties related to the risk recommendation for the specified phone number. |
| `score_status.risk.recommendation` | string |  | The action that Telesign recommends that you take based on the risk recommendation. Risk Recommendation Scales provides a [table](https://developer.telesign.com/enterprise/docs/intelligence-get-started#risk-recommendation-scales) with risk levels. Example: `allow`. |
| `score_status.risk.score` | integer |  | The risk recommendation for the current transaction. The risk recommendation will be between 1 and 1000. Example: `80`. |
| `score_status.risk.level` | string |  | The severity of the risk. Risk Recommendation Scales provides a [table](https://developer.telesign.com/enterprise/docs/intelligence-get-started#risk-recommendation-scales) with risk levels. Example: `low`. |
| `score_status.risk_insights` | object |  | Contains reason code properties with additional information related to the risk recommendation. |
| `score_status.risk_insights.status` | integer |  | The processing status of the risk insights package for the request. Example: `800`. |
| `score_status.risk_insights.category` | array of integer |  | Reason codes related to the category of the phone number, as described in [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings). |
| `score_status.risk_insights.a2p` | array of integer |  | Reason codes specific to application-to-person communication (A2P), as described in [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings). These are automated communications sent to a human, like verification codes, appointment reminders, etc. |
| `score_status.risk_insights.p2p` | array of integer |  | Reason codes specific to person-to-person communication (P2P), as described in [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings). This is two-way communication between two humans, like one friend texting another. |
| `score_status.risk_insights.number_type` | array of integer |  | Reason codes related to the phone number’s type, as described in [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings). |
| `score_status.risk_insights.ip` | array of integer |  | Reason codes related to activity of the IP you provided for the phone number, as described in [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings). |
| `score_status.risk_insights.email` | array of integer |  | Reason codes related to activity of the email address you provided for the phone number, as described in [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings). |
| `score_status.numbering` | object |  | Contains properties related to the numbering attributes of the specified phone number. |
| `score_status.numbering.phone_number` | string |  | The base phone number. This is the phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `1234567890`. |
| `score_status.numbering.min_length` | integer |  | The minimum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `score_status.numbering.max_length` | integer |  | The maximum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `score_status.numbering.country_code` | string |  | A 1, 2, or 3-digit number representing the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for United Kingdom is `44`. Example: `1`. |
| `score_status.location` | object |  | Contains geographical location information associated with the rate center of the phone number when the device was activated. Null is returned when data for a field isn't available for a specific market or country. |
| `score_status.location.city` | string |  | The city associated with the rate center of the phone number when the device was activated. Example: `Los Angeles`. |
| `score_status.location.county` | string |  | The county (or parish) associated with the rate center of the phone number when the device was activated (U.S. only). Example: `Los Angeles County`. |
| `score_status.location.state` | string |  | The two-letter [state abbreviation code](http://pe.usps.com/text/pub28/28apb.htm) of the state (province, district, or territory) associated with the rate center of the phone number when the device was activated (North America only). Example: `CA`. |
| `score_status.location.zip` | string |  | The five-digit United States Postal Service [ZIP Code](https://www.usps.com/nationalpremieraccounts/findzipcodes.htm) associated with the rate center of the phone number when the device was activated (U.S. only). Example: `90066`. |
| `score_status.location.country` | object |  | Contains properties related to the country associated with the rate center of the phone number when the device was activated. |
| `score_status.location.country.iso2` | string |  | The ISO 3166-1 2-letter [country code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the rate center of the phone number when the device was activated. Example: `US`. |
| `score_status.location.country.iso3` | string |  | The ISO 3166-1 3-letter country code associated with the rate center of the phone number when the device was activated. Example: `USA`. |
| `score_status.location.country.name` | string |  | The [country name](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the rate center of the phone number when the device was activated. Example: `United States`. |
| `score_status.location.timezone` | object |  | Contains properties related to the time zone associated with the rate center of the phone number when the device was activated. For maximum and minimum UTC offsets, they are specified in units of hours, and range from -12 to +14. For positive numbers, the plus sign (+) may not be returned. Additional offsets due to Daylight Savings Time or Summer Time are not considered. For example, Russia, which spans 11 time zones, has a minimum UTC offset of +2, and a maximum of +12. |
| `score_status.location.timezone.name` | string |  | The time zone associated with the rate center of the phone number when the device was activated (U.S. only). Example: `America/Los Angeles`. |
| `score_status.location.timezone.utc_offset_max` | string |  | For international phone numbers, this parameter returns the maximum UTC offset for the country associated with the rate center of the phone number when the device was activated. For U.S. phone numbers, this parameter returns the same result as utc_offset_min. Example: `-8`. |
| `score_status.location.timezone.utc_offset_min` | string |  | For international phone numbers, this parameter returns the minimum UTC offset for the country associated with the rate center of the phone number when the device was activated. For U.S. phone numbers, this parameter returns the UTC offset associated with the rate center of the phone number when the device was activated. Example: `-8`. |
| `score_status.location.coordinates` | object |  | Contains properties with details about the geographical coordinates of the location where the phone number is registered. |
| `score_status.location.coordinates.latitude` | number |  | Latitude specifies the North-South position of a point on the Earth’s surface. It is an angular measurement that ranges from 0° at the Equator, to 90° at the North Pole (and -90° at the South Pole). It is returned here as a value indicating the number of degrees of latitude of the location associated with the phone number, expressed in seven decimal digits, with five decimal places. Example: `33.99791`. |
| `score_status.location.coordinates.longitude` | number |  | Longitude specifies the East-West position of a point on the Earth’s surface. It is an angle measured East or West from the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) —ranging from 0° at the prime meridian, to +180° Eastward and -180° Westward. It is returned here as a value indicating the number of degrees of longitude of the location associated with the phone number, expressed in eight decimal digits, with five decimal places. Example: `-118.42302`. |
| `score_status.location.metro_code` | string |  | A 4-digit string indicating the Primary Metropolitan Statistical Area (PMSA) code for the location associated with the rate center of the phone number when the device was activated (U.S. only). PMSA Codes are governed by the [US Census Bureau](http://www.census.gov/). This information is useful for large metropolitan areas that comprise several smaller cities. For example, the PMSA for Long Beach, California is Los Angeles County, which gives Long Beach the PMSA Code 4480. Example: `4480`. |
| `score_status.blocklisting` | object |  | Contains details about whether the number was blocked and who requested the block. |
| `score_status.blocklisting.block_code` | integer |  | A code indicating whether the number is blocked, and who blocked it. `0` for not blocked, `1` for blocked by TeleSign, `2` for block requested by your organization, `3` for block requested by your account or set by TeleSign on behalf of your account, and `4` if the block state is unknown. Example: `0`. |
| `score_status.blocklisting.block_description` | string |  | Text explaining the block status. Example: `Not blocked`. |
| `score_status.blocklisting.blocked` | boolean |  | If `true`, this number is blocked. If `false`, this number is not blocked. |
| `score_status.carrier` | object |  | Contains details about the company that provides telecommunications services for this phone number. Behavior of this property, including information returned for ported phone numbers, can vary depending on the country of the phone number. See [How does carrier data vary by country?](https://support.telesign.com/s/article/How-does-carrier-data-vary-by-country) for more details. |
| `score_status.carrier.carrier_id` | integer |  | An ID specifying this carrier. Example: `309`. |
| `score_status.carrier.name` | string |  | The name of this carrier. Example: `AT&T Wireless`. |
| `sim_swap` | object |  | Properties related to the SIM Swap check for this transaction. This is only included if enabled by our [Customer Support Team](mailto:support@telesign.com). |
| `sim_swap.swap_date` | string |  | The date of the SIM swap, if one is detected. Example: `2018-09-05`. |
| `sim_swap.swap_time` | string |  | The time of the SIM swap, if one is detected. Example: `22:00:00`. |
| `sim_swap.risk_indicator` | string |  | Indicates the likelihood that a SIM swap occured for this number. The response ranges between `1` and `4`. * `1` - **(very low)** Swap did not occur or it occurred 15+ days ago. * `2` - **(low)** Swap occurred between 3 and 14 days ago. * `3` - **(medium)** Swap occurred in the last 72 hours. * `4` - **(high)** Swap occurred in the last 24 hours. Example: `1`. |
| `sim_swap.status` | object |  | Contains properties related to the status of the SIM Swap check. |
| `sim_swap.status.code` | integer |  | A numeric code indicating the processing status for the SIM Swap check. Example: `2800`. |
| `sim_swap.status.description` | string |  | A short description of the processing status for the SIM Swap check. Example: `Request successfully completed`. |

### Example payload

```json
{
  "status": {
    "code": 200,
    "description": "Delivered to handset",
    "updated_on": "2016-10-21T14:05:36.181346Z"
  },
  "submit_timestamp": "2016-01-01T01:01:01.010101Z",
  "errors": [],
  "reference_id": "B56259E45884010488343BAA15FB0002",
  "verify": {
    "code_state": "UNKNOWN",
    "code_entered": null
  },
  "sub_resource": "sms",
  "additional_info": {
    "message_parts_count": 1,
    "price": "0.5112",
    "mnc": "004",
    "mcc": "310",
    "currency": "USD",
    "message_parts_reference_ids": "35E63E88CB000E049196AD1CFCFFB89C,35E63E88CC7C050491613443467F3F12",
    "sender_id ": "15558675310"
  },
  "score_status": {
    "phone_type": {
      "code": "2",
      "description": "MOBILE"
    },
    "risk": {
      "recommendation": "allow",
      "score": 80,
      "level": "low"
    },
    "risk_insights": {
      "status": 800,
      "category": [
        10010
      ],
      "a2p": [
        22103
      ],
      "p2p": [
        30201
      ],
      "number_type": [
        0
      ],
      "ip": [
        0
      ],
      "email": [
        0
      ]
    },
    "numbering": {
      "phone_number": "1234567890",
      "min_length": 10,
      "max_length": 10,
      "country_code": "1"
    },
    "location": {
      "city": "Los Angeles",
      "county": "Los Angeles County",
      "state": "CA",
      "zip": "90066",
      "country": {
        "iso2": "US",
        "iso3": "USA",
        "name": "United States"
      },
      "time_zone": {
        "name": "America/Los_Angeles",
        "utc_offset_max": "-8",
        "utc_offset_min": "-8"
      },
      "coordinates": {
        "latitude": 33.99791,
        "longitude": -118.42302
      },
      "metro_code": "4480"
    },
    "blocklisting": {
      "block_code": 0,
      "block_description": "Not blocked",
      "blocked": false
    },
    "carrier": {
      "carrier_id": 309,
      "name": "AT&T Wireless"
    }
  },
  "sim_swap": {
    "swap_date": "2018-09-05",
    "swap_time": "22:00:00",
    "risk_indicator": "1",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  }
}
```


---

## Receive SMS delivery reports

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/smsdeliveryreports>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Engage for delivery reports for SMS requests (excluding bulk requests). You can receive notifications from multiple Telesign services at the same endpoint.

> Looking for the high-level guide page to learn how to set up and use a Transaction Callback Service? Go to [Transaction Callback Service](https://developer.telesign.com/enterprise/docs/transaction-callback-service). See [Authenticate Callbacks](https://developer.telesign.com/enterprise/docs/authenticate-callbacks) to learn more about the version of authentication used for callbacks.

#### Status codes

| Status code | Associated text string | Description |
|-------------|------------------------|-------------|
| 200| Delivered to handset   | The SMS was delivered to the end user's phone. (Final) |
| 201         | Transaction successfully completed, suspicious activity detected   | Telesign's internal anti-fraud mechanisms identified potentially suspicious activity related to the destination phone number.   |
| 203| Delivered to gateway   | The SMS was delivered to the gateway. If the gateway responds with further information (including successful delivery to handset or delivery failure), the status is updated. (Intermediate)  |
| 207| Error delivering SMS to handset (reason unknown)   | The SMS could not be delivered to the end user's handset for an unknown reason. (Final)           |
| 210 | Temporary phone error  | The SMS could not be delivered to the handset due to a temporary error with the phone. Examples - phone is turned off, not enough memory to store the message. (Final)                             |
| 211 | Permanent phone error  | The SMS could not be delivered to the handset due to a permanent error with the phone. For example, the phone is incompatible with SMS, or illegally registered on the network. This can happen when a phone number is blacklisted, or is incorrectly provisioned. (Final)                             |
| 220 | Gateway/network cannot route message   | The network cannot route the message to the handset. (Final)                                 |
 | 221 | Message expired before delivery | The message was queued by the mobile provider and timed out before it could be delivered tothe handset. (Final) |
| 222 | SMS not supported      | SMS is not supported by this phone, carrier, plan, or user.                                   |
| 231         | Invalid/unsupported    | The content of the message is not supported.     |
| 233         | Message blocked due to high risk score.	|It was determined that the risk recommendation for the destination number is higher than the configured maximum risk recommendation. For that reason Telesign did not send the SMS.	|
| 237         | Message blocked in requested country  | You requested that messages in a specific country be blocked, and the message was being sent to this country.                                    |
| 238         | Destination blocked by prefix  | You requested that phone numbers with a particular prefix be blocked.                    |
| 250         | Final status unknown   | The final status of the SMS cannot be determined.|
| 251         | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | Telesign successfully delivered the message through our gateway and it passed downstream. However, Telesign did not receive a delivery receipt within 12 hours of transmission. We cannot confirm delivery to the handset. The end user most likely did not receive the message.|
| 292         | Queued by gateway | The SMS gateway has queued the message.          |
| 295         | Status delayed | The status of the SMS is temporarily unavailable.|
|500|Transaction not attempted|No SMS request was attempted.|
|501|Not authorized|No permissions for this resource, or authorization failed.|
|502|Campaign error|This error can be generated if there is a problem with the short code used.|
|503|Carrier rejected - temporary problem|This error is generated if there is an error on the carrier or operator side that is temporary and the message can be retried.|
|504|Carrier rejected - permanent error|This error is generated if there is an error on the carrier or operator side that is permanent and the message should not be retried.|
|505|Error on gateway - temporary error|This error is generated if there is an error on Telesign's partner side that is considered temporary and the message can be retried.|
|506|Error on gateway - permanent error|This error is generated if there is an error on Telesign's partner side that is considered permanent and the message should not be retried.|
|508|Invalid source address|The message requires a source address. Verify that one is provided and correct.|
|509|Parameters problem|One or more parameters used in the request is not supported.|
|510|Message blocked by subscriber action or request|The end user has blocked receiving SMS with their carrier plan or by request or from the particular short code used.|
|511|Subscriber low on credit|The end user exceeded their spending limits and cannot receive SMS.|
|512|Roaming error|The end user cannot receive SMS because their device that receives the messages is roaming.|
|513|Mobile number portability error|SMS failed because ported combinations are unreachable.||
|514|Subscriber absent|The operator/carrier is temporarily unable to reach the end user.|
|515|Suspected spam|This message is considered to be spam by carrier or operator.|
|517|Selected DLT details for India not supported|The DLT template ID or entity ID in the request cannot be found by the end operator.|
|518|Message blocked due to high risk SIM SWAP indicator|The service determined that the SIM swap risk indicator for the destination number is higher than the maximum value configured for your account. For that reason Telesign did not send the SMS.|
|519|Message not sent - requested SIM SWAP check could not be performed|The service could not perform the SIM swap check. This is because either the number is out of SIM swap coverage or information about the potential SIM swap event is missing.|
|520|Content sent is not allowed|The content in this message is not permitted by the carrier.|
|521| Requested Sender ID is not allowed for destination  | The sender ID included in this request cannot be used to send messages to this destination phone number. The sender ID may either be blocklisted for this country or needs to be added to a whitelist for this country. |
|599| Status not available | The system is unable to provide status at this time. |
|10000|System Unavailable, Please try again later.|Internal system error|
|10030|Insufficient funds in prepaid wallet.|A top-up of prepaid wallet is needed.|
|10031|Message blocked by customer request |This code can happen because you requested a block or because Telesign blocked on your behalf. The block is custom, meaning it applies to you and not others.|
|10032|Message blocked by Telesign |Telesign blocks a message if it is being sent to a phone number that is on a global blocklist.|
|11000|Invalid value for parameter phone_number.|There is a problem with the destination address used. Either the format is not valid, or the number is not associated with any carrier, or if MSC is used it does not know about this MSISDN.|

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | The service's unique identifier for the original transaction this notification is related to. Length: 32-32. Example: `B56259E45884010488343BAA15FB0002`. |
| `status` | object | yes | Contains properties related to the processing status of this transaction or send. |
| `status.code` | integer | yes | Numeric code that indicates the processing status of this transaction or send. Example: `200`. |
| `status.description` | string | yes | Text that describes the processing status of this transaction or send. Example: `Delivered to handset`. |
| `status.updated_on` | string | yes | Timestamp that indicates when the status of this transaction or send was last updated. Example: `2016-10-21T14:05:36.181346Z`. |
| `submit_timestamp` | string |  | An ISO 8601 UTC timestamp indicating when the request was received. Example: `2016-01-01T01:01:01.010101Z`. |
| `additional_info` | object |  | Contains properties related to optional product features. Only included if at least one of those features is enabled. |
| `additional_info.mcc` | string |  | Mobile country code (MCC) of the destination number. Only included if this feature is enabled. Example: `310`. |
| `additional_info.mnc` | string |  | Mobile network code (MNC) of the destination number. Only included if this feature is enabled. Example: `004`. |
| `additional_info.price` | string |  | The price of the message sent. Example: `0.01`. |
| `additional_info.currency` | string |  | The currency of the price of the message sent. Example: `USD`. |
| `additional_info.message_parts_count` | integer |  | The total number of split parts for the longer message. If the message is not split, this value is `1`. Example: `2`. |
| `additional_info.message_parts_reference_ids` | string |  | The reference IDs for each part of the longer message, separated by commas. Example: `35E63E88CB000E049196AD1CFCFFB89C,35E63E88CC7C050491613443467F3F12`. |
| `additional_info.sender_id` | string |  | The [sender ID](https://support.telesign.com/s/article/What-is-a-Sender-ID) that Telesign used while sending the message. To receive this parameter, ask our [Customer Support Team](mailto:support@telesign.com) to turn on the appropriate feature. Example: `15558675310`. |
| `additional_info.cleansed_phone_number` | string |  | The corrected version of the submitted phone number returned in the callback after common formatting issues are fixed to improve deliverability. If there are no changes, the original phone number from the SMS API request is returned. Contact our [Customer Support Team](mailto:support@telesign.com) to enable this feature. |
| `external_id` | string |  | The customer-generated ID for this transaction that was provided in the original request. If the `external_id` parameter was not included in the request, the value here is `null`. Example: `CustomExternalID7349`. |

### Example payload

```json
{
  "reference_id": "B56259E45884010488343BAA15FB0002",
  "status": {
    "code": 200,
    "description": "Delivered to handset",
    "updated_on": "2016-10-21T14:05:36.181346Z"
  },
  "additional_info": {
    "mcc": "310",
    "mnc": "004",
    "price": "0.01",
    "currency": "USD",
    "message_parts_count": 2,
    "message_parts_reference_ids": "35E63E88CB000E049196AD1CFCFFB89C,35E63E88CC7C050491613443467F3F12"
  },
  "external_id": "CustomExternalID7349"
}
```


---

## Receive inbound SMS callbacks

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/msgsmscallbacks>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Messaging regarding Mobile Originated (MO) messages from end users sent using its SMS channel. You can receive notifications from multiple Telesign services at the same endpoint. Reference details for delivery status callbacks are located in [Receive SMS delivery reports](https://developer.telesign.com/enterprise/reference/smsdeliveryreports).

Confirm with our [Customer Support Team](mailto:support@telesign.com) that the channels you want to use for receiving inbound messages from end-users have been enabled. MO keyword handling feature is available for RCS, WhatsApp, and SMS channels, please contact our [Customer Support Team](mailto:support@telesign.com) to enable it for you.

> Looking for the high-level guide page with examples related to this action? Go to [Messaging - Receive inbound messages](https://developer.telesign.com/enterprise/docs/messaging-receive-inbound-messages).

#### Status codes

| Status code | Associated text string | Description       |
|-------------|------------------------|-------------------|
| 1500        | Delivered              | Delivered to you. |

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The service's unique identifier for the original transaction this notification is related to. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  | Contains properties related to the processing status of this transaction or send. |
| `status.updated_on` | string | yes | Timestamp indicating when the status was last updated. Example: `2023-10-31T14:47:10.490130Z`. |
| `status.description` | string | yes | The description of the specific status code. Example: `Delivered to customer`. |
| `status.code` | integer | yes | The 4-digit status code associated with the mobile originated (MO) message. Example: `1500`. |
| `user_response` | object |  |  |
| `user_response.sender_id` | string | yes | Short or long code over which an end user response was received. This is the short or long code to which the end user is sending their MO message. Example: `4442`. |
| `user_response.iso_country_code` | string | yes | A two letter country code representing the country the phone number is associated with. You can see a complete list in [Country Codes and Dialing Codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `US`. |
| `user_response.action` | string enum | yes | The action that was triggered in response to specific keywords in a MO message. Some keywords will trigger automatic responses. Can be "start", "stop", "help", or generic. Refer to [Inbound SMS - Action-to-keyword mapping](https://developer.telesign.com/enterprise/docs/inbound-sms-action-to-keyword-mapping) for a complete list of actions and the associated keywords. Allowed: `start`, `stop`, `help`, `generic`. Example: `start`. |
| `user_response.keyword` | string | yes | Specific words in an MO message from an end user that triggers certain actions. Each keyword can have different response template so the keyword "STOP" can use a response template that's in English while the keyword "ARREST" can use a response template that's in French. Example: `start`. |
| `user_response.phone_number` | string | yes | The end user's phone number, including the country code. Example: `11234567890`. |
| `user_response.mo_message` | string | yes | Content of the message sent by end user. Example: `Start`. |
| `user_response.price` | string | yes | Returns the price of the MO message you sent. This feature must be enabled by our [Customer Support Team](mailto:support@telesign.com). |
| `sub_resource` | string | yes | Returns value identifying the inbound channel used by the end user. Helpful when multiple channels are used with the same Mobile Originated (MO) Callback URL. Example: `mo_sms`. |
| `errors` | object | yes | A JSON object that contains information on error conditions that might have happened. For now, this field will always be empty. If you receive a callback, there is no error. |
| `submit_timestamp` | string | yes | An ISO 8601 UTC timestamp indicating when the request was received. Example: `2023-10-31T14:47:10.154000Z`. |


---

## Receive Bulk SMS callbacks

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/bulksmscallbacks>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Engage for bulk SMS requests. You can receive notifications from multiple Telesign services at the same endpoint.

#### Status codes

| Status code | Associated text string | Description |
|-------------|------------------------|-------------|
| 200         | Delivered to handset   | The SMS was delivered to the end user's phone. (Final) |
| 203         | Delivered to gateway   | The SMS was delivered to the gateway. If the gateway responds with further information (including successful delivery to handset or delivery failure), the status is updated. (Intermediate)  |
| 207         | Error delivering SMS to handset (reason unknown)   | The SMS could not be delivered to the end user's handset for an unknown reason. (Final)           |
| 210         | Temporary phone error  | The SMS could not be delivered to the handset due to a temporary error with the phone. Examples - phone is turned off, not enough memory to store the message. (Final)                             |
| 211         | Permanent phone error  | The SMS could not be delivered to the handset due to a permanent error with the phone. For example, the phone is incompatible with SMS, or illegally registered on the network. This can happen when a phone number is blacklisted, or is incorrectly provisioned. (Final)                             |
| 220         | Gateway/network cannot route message   | The network cannot route the message to the handset. (Final)                                 |
 | 221         | Message expired before delivery | The message was queued by the mobile provider and timed out before it could be delivered tothe handset. (Final)                             |
| 222         | SMS not supported      | SMS is not supported by this phone, carrier, plan, or user.                                   |
| 230         | Message blocked by Telesign      | Telesign blocks a message if it is being sent to a phone number that is on a global blocklist.    |
| 231         | Invalid/unsupported    | The content of the message is not supported.     |
| 237         | Message blocked in requested country  | You requested that messages in a specific country be blocked, and the message was being sent to this country.                                    |
| 238         | Destination blocked by prefix  | You requested that phone numbers with a particular prefix be blocked.                    |
| 250         | Final status unknown   | The final status of the SMS cannot be determined.|
| 251         | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received.        | Message successfully sent out for delivery, however final confirmation of delivery to handset was not received. | This message was successfully delivered to the gateway, but Telesign cannot confirm delivery to the handset because Telesign does not receive the final handset DLR in this region.  NOTE: There is a high probability that this message was successfully delivered to the handset.       |
| 286         | Transaction not attempted         | The SMS is blocked from being sent due to the phone type not being one of the following - mobile, prepaid, personal, or pager.             |
| 290         | Message in progress    | The message is being sent to the SMS gateway.    |
 | 292         | Queued by gateway      | The SMS gateway has queued the message.          |
| 295         | Status delayed         | The status of the SMS is temporarily unavailable.|
| 500         | Transaction not attempted       | No SMS request was attempted.                    |
| 502         | Campaign error         | This error can be generated if there is a problem with the short code used.                        |
 | 503         | Carrier rejected - temporary problem     | This error is generated if there is an error on the carrier or operator side that is temporary and the message can be retried.                  |
| 504         | Carrier rejected - permanent error      | This error is generated if there is an error on  the carrier or operator side that is permanent and the message should not be retried.           |
| 505         | Error on gateway - temporary error    | This error is generated if there is an error on Telesign's partner side that is considered temporary and the message can be retried.        |
| 506         | Error on gateway - permanent error    | This error is generated if there is an error on  Telesign's partner side that is considered permanent and the message should not be retried. |
| 507         | Invalid destination address   | There is a problem with the destination address used. Either the format is not valid, or the number is not associated with any carrier, or if MSC is used it does not know about this MSISDN.  |
| 508         | Invalid source address | The message requires a source address. Verify that one is provided and correct.                |
| 510         | Message blocked by subscriber action or request     | The end user has blocked receiving SMS with their carrier plan or by request or from the particular short code used.                                 |
| 511         | Subscriber low on credit      | The end user exceeded their spending limits and cannot receive SMS.                              |
| 512         | Roaming error          | End user cannot receive SMS because their device that receives the messages is roaming.           |
 | 513         | Mobile number portability error         | SMS failed because ported  combinations are unreachable.                                     |
| 514         | Subscriber absent      | The operator/carrier is temporarily unable to reach the end user.       |
| 515         | Suspected spam         | This message is considered to be spam by carrier or operator.                                     |
| 521  | Requested Sender ID is not allowed for destination  | The Sender ID included in this request cannot be used to send messages to this destination phone number. The Sender ID may either be blocklisted for this country or needs to be added to a whitelist for this country. |
| 599         | Status not available   | The system is unable to provide status at this time.                                            |

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | The service's unique identifier for the original transaction this notification is related to. Length: 32-32. Example: `B56259E45884010488343BAA15FB0002`. |
| `status` | object | yes | Contains properties related to the processing status of this transaction or send. |
| `status.code` | integer | yes | Numeric code that indicates the processing status of this transaction or send. Example: `200`. |
| `status.description` | string | yes | Text that describes the processing status of this transaction or send. Example: `Delivered to handset`. |
| `status.updated_on` | string | yes | Timestamp that indicates when the status of this transaction or send was last updated. Example: `2016-10-21T14:05:36.181346Z`. |
| `submit_timestamp` | string |  | An ISO 8601 UTC timestamp indicating when the request was received. Example: `2016-01-01T01:01:01.010101Z`. |
| `session_id` | string |  | Your unique identifier for the message recipient this notification relates to. Length: 0-64. Example: `255E3E34382C0E049046BF14FF7F3435`. |
| `errors` | array of object |  | Contains an object for each error that occurred. |
| `errors[].code` | integer | yes | Numeric code that indicates which error occurred. Example: `-90001`. |
| `errors[].description` | string | yes | Text that describes this error. Example: `System Unavailable, Please try again later.`. |
| `sub_resource` | string |  | Indicates which Telesign service processed the original transaction. Example: `sms`. |

### Example payload

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 200,
    "description": "Delivered to handset",
    "updated_on": "2016-10-21T14:05:36.181346Z"
  },
  "errors": [],
  "sub_resource": "bulk_sms",
  "session_id": "255E3E34382C0E049046BF14FF7F3435"
}
```


---

## Receive MMS callbacks

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/mmscallbacks>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Messaging regarding Mobile Originated (MO) messages from end users sent using its MMS channel. You can receive notifications from multiple Telesign services at the same endpoint. Confirm with our [Customer Support Team](mailto:support@telesign.com) that the channels you want to use for receiving inbound messages from end-users have been enabled.

> Looking for the high-level guide page with examples related to this action? Go to [Messaging - Receive inbound messages](https://developer.telesign.com/enterprise/docs/messaging-receive-inbound-messages).

#### Status codes

| Status code | Associated text string | Description       |
|-------------|------------------------|-------------------|
| 1500        | Delivered              | Delivered to you. |

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The service's unique identifier for the original transaction this notification is related to. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  | Contains properties related to the processing status of this transaction or send. |
| `status.updated_on` | string | yes | Timestamp indicating when the status was last updated. Example: `2023-10-31T14:47:10.490130Z`. |
| `status.description` | string | yes | The description of the specific status code. Example: `Delivered to customer`. |
| `status.code` | integer | yes | The 4-digit status code associated with the mobile originated (MO) message. Example: `1500`. |
| `phone_number` | string | yes | The end user's phone number with country code included. Example: `11234567890`. |
| `content` | object |  | The content of the MO message sent by the end user. |
| `content.text_1` | string |  | The text message provided by end user. If Telesign splits the message into multiple parts, there may also be a `text_2`, `text_3`, etc. Example: `customer support agent`. |
| `content.subject` | string |  | The subject line that appears on the end user's handset. |
| `content.url_image_1` | string |  | An image URL provided by end user. If more than one image files are sent at once, they are marked as `url_image_1`, `url_image_2`, etc. **Required for:** MMS when the content is an image. |
| `content.url_video_1` | string |  | A video URL provided by the end user. If more than one video files are sent at once, they are marked as `url_video_1`, `url_video_2`, etc. **Required for:** MMS when the content is a video. |
| `content.url_audio_1` | string |  | A audio URL provided by the end user. If more than one audio files are sent at once, they are marked as `url_audio_1`, `url_audio_2`, etc. **Required for:** MMS when the content is an audio file. |
| `sub_resource` | string | yes | Returns value identifying the inbound channel used by the end user. Helpful when multiple channels are used with the same Mobile Originated (MO) Callback URL. Example: `mo_mms`. |


---

## Receive RCS callbacks

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/rcscallbacks>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Messaging regarding Mobile Originated (MO) messages from end users sent using its RCS channel. You can receive notifications from multiple Telesign services at the same endpoint. Confirm with our [Customer Support Team](mailto:support@telesign.com) that the channels you want to use for receiving inbound messages from end-users have been enabled. MO keyword handling feature is available for RCS, WhatsApp, and SMS channels, please contact our [Customer Support Team](mailto:support@telesign.com) to enable it for you.

> Looking for the high-level guide page with examples related to this action? Go to [Messaging - Receive inbound messages](https://developer.telesign.com/enterprise/docs/messaging-receive-inbound-messages).

#### Status codes

| Status code | Associated text string | Description       |
|-------------|------------------------|-------------------|
| 1500        | Delivered              | Delivered to you. |

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The service's unique identifier for the original transaction this notification is related to. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  | Contains properties related to the processing status of this transaction or send. |
| `status.updated_on` | string | yes | Timestamp indicating when the status was last updated. Example: `2023-10-31T14:47:10.490130Z`. |
| `status.description` | string | yes | The description of the specific status code. Example: `Delivered to customer`. |
| `status.code` | integer | yes | The 4-digit status code associated with the mobile originated (MO) message. Example: `1500`. |
| `phone_number` | string | yes | The end user's phone number with country code included. Example: `11234567890`. |
| `rcs_sender_id` | string |  | A [sender ID](https://support.telesign.com/s/article/What-is-a-Sender-ID) associated with the Rich Communication Services (RCS) agent used to send the message to the end user. In most cases, the callback parameter `rcs_sender_id` matches the `sender_id` provided in the request. However, Telesign may override the provided `sender_id` in order to improve delivery quality or follow SMS regulations in particular countries. |
| `content` | object |  | The content of the MO message sent by the end user. |
| `content.text` | string | yes | The text message or url provided by the end user. |
| `content.end_user_action` | object |  | An end user action that is a response to an MT (mobile terminated) message. It could be a quick reply or call to action event. |
| `content.end_user_action.postback_data` | string | yes | The data associated to the reply in a MT message. Example: `abcd1234`. |
| `content.end_user_action.original_reference_id` | string | yes | The reference ID of the original MT message. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `content.end_user_action.text` | string | yes | For suggested reply/action cases, this is the text specified on the button. When using the MO keyword handling feature, this is the text provided by end-user. Example: `stop`. |
| `content.end_user_action.iso_country_code` | string |  | A two letter country code representing the country the phone number is associated with. You can see a complete list in [Country Codes and Dialing Codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Required if the MO keyword handling feature is enabled. Example: `US`. |
| `content.end_user_action.action` | string enum |  | The action that was triggered in response to specific keywords in a MO message. Some keywords will trigger automatic responses. Can be "START", "STOP", "HELP", or "GENERIC". Required if the MO keyword handling feature is enabled. Allowed: `START`, `STOP`, `HELP`, `GENERIC`. Example: `STOP`. |
| `content.end_user_action.keyword` | string |  | Specific words in an MO message from an end-user (`content.end_user_action.text` parameter) that triggers certain actions. Each keyword can have different response template so the keyword "STOP" can use a response template that's in English while the keyword "ARREST" can use a response template that's in French. One action can be linked with different keywords, e.g. "STOP" action is linked with keywords: "end", "cancel", "unsubscribe", "quit", "stop", "arret". For "GENERIC" action, the keyword is empty. Required if the MO keyword handling feature is enabled. Example: `stop`. |
| `content.location` | object | yes | The location sent by the end user. |
| `content.location.latitude` | number | yes | The latitude coordinate of the location as a positive or negative. Example: `44.8237574`. |
| `content.location.longitude` | number | yes | The longitude coordinate of the location as a positive or negative number. Example: `20.4177198`. |
| `content.file` | object |  | Includes details about the image, video, audio, file, sticker or GIF sent by the end user. **Required for:** RCS when an image, video, audio, file, sticker or GIF is sent. |
| `content.file.payload` | object |  |  |
| `content.file.payload.name` | string | yes | The name of the file. Example: `62018.mp4`. |
| `content.file.payload.mime_type` | string | yes | The media type. Example: `video/mp4`. |
| `content.file.payload.uri` | string | yes | The URI of the file. |
| `content.file.payload.size_bytes` | integer | yes | The size of file (in bytes). Example: `8173352`. |
| `sub_resource` | string | yes | Returns value identifying the inbound channel used by the end user. Helpful when multiple channels are used with the same Mobile Originated (MO) Callback URL. Example: `mo_rcs`. |


---

## Receive WhatsApp callbacks

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/whatsappcallbacks>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Messaging regarding Mobile Originated (MO) messages from end-users sent using its WhatsApp channel. You can receive notifications from multiple Telesign services at the same endpoint. Confirm with our [Customer Support Team](mailto:support@telesign.com) that the channels you want to use for receiving inbound messages from end-users have been enabled. MO keyword handling feature is available for RCS, WhatsApp, and SMS channels, please contact our [Customer Support Team](mailto:support@telesign.com) to enable it for you.

> Looking for the high-level guide page with examples related to this action? Go to [Messaging - Receive inbound messages](https://developer.telesign.com/enterprise/docs/messaging-receive-inbound-messages).

#### Status codes

| Status code | Associated text string | Description       |
|-------------|------------------------|-------------------|
| 1500        | Delivered              | Delivered to you. |

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The service's unique identifier for the original transaction this notification is related to. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  | Contains properties related to the processing status of this transaction or send. |
| `status.updated_on` | string | yes | Timestamp indicating when the status was last updated. Example: `2023-10-31T14:47:10.490130Z`. |
| `status.description` | string | yes | The description of the specific status code. Example: `Delivered to customer`. |
| `status.code` | integer | yes | The 4-digit status code associated with the mobile originated (MO) message. Example: `1500`. |
| `phone_number` | string | yes | The end user's phone number with country code included. Example: `11234567890`. |
| `waba_phone_number` | string | yes | The phone number of your business account that triggered the notification. Example: `11234567890`. |
| `content` | object |  | The content of the MO message sent by the end user. |
| `content.type` | string enum | yes | Type of message. Allowed: `text`, `location`, `image`, `audio`, `video`, `document`, `sticker`, `unsupported`. |
| `content.content` | object |  | The content of the MO message. |
| `content.content.body` | string | yes | Text message. Included when `content.type` is `text`. Example: `Hello`. |
| `content.content.longitude` | number | yes | The longitude coordinate of the location as a positive or negative. Included when `content.type` is `location`. Example: `20.505544662476`. |
| `content.content.latitude` | number | yes | The latitude coordinate of the location as a positive or negative. Included when `content.type` is `location`. Example: `44.816028594971`. |
| `content.content.url` | string | yes | URL of the file. Included when `content.type` is `location`, `image`, `audio`, `video`, `document`, or `sticker`. |
| `content.content.name` | string |  | The name of the searched location. Included when `content.type` is `location`.   **Required for:** Searched location in WhatsApp. |
| `content.content.address` | string |  | The full address of the searched location. Included when `content.type` is `location`.   **Required for:** Searched location in WhatsApp. Example: `100 Main Street, Anywhere, State, US 01234`. |
| `content.content.sha256` | string | yes | SHA256 (Secure Hash Algorithm 256-bit) hash. Included when `content.type` is `image`, `audio`, `video`, `document`, or `sticker`. Example: `4+xruQdYHSw9CeCZeOUb/ZH4DUslQPaJjQSlhbGBWKU=`. |
| `content.content.mime_type` | string | yes | The media type. Included when `content.type` is `image`, `audio`, `video`, `document`, or `sticker`. Example: `image/jpeg`. |
| `content.content.voice` | boolean | yes | `true` if end user sent a recorded audio message otherwise `false` (such as when .mp3 file is sent). Included when `content.type` is `audio`. |
| `content.content.filename` | string | yes | The file name of the document. Included when `content.type` is `document`. Example: `test.pdf`. |
| `content.content.animated` | boolean | yes | `true` if an animated sticker; `false` if a static sticker. Included when `content.type` is `sticker`. |
| `content.end_user_action` | object |  | An end user action that is a response to an MT (mobile terminated) message. It a could be quick reply or call to action event. |
| `content.end_user_action.postback_data	` | string | yes | The data associated to the reply in a MT message. Example: `1233`. |
| `content.end_user_action.original_reference_id` | string | yes | The reference ID of the original MT message. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `content.end_user_action.text` | string | yes | For suggested reply/action cases, this is the text specified on the button. When using the MO keyword handling feature, this is the text provided by end-user. Example: `stop`. |
| `content.end_user_action.iso_country_code` | string |  | A two letter country code representing the country the phone number is associated with. You can see a complete list in [Country Codes and Dialing Codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Required if the MO keyword handling feature is enabled. Example: `US`. |
| `content.end_user_action.action` | string enum |  | The action that was triggered in response to specific keywords in a MO message. Some keywords will trigger automatic responses. Can be "START", "STOP", "HELP", or "GENERIC". Required if the MO keyword handling feature is enabled. Allowed: `START`, `STOP`, `HELP`, `GENERIC`. Example: `STOP`. |
| `content.end_user_action.keyword` | string |  | Specific words in an MO message from an end-user (`content.end_user_action.text` parameter) that triggers certain actions. Each keyword can have different response template so the keyword "STOP" can use a response template that's in English while the keyword "ARREST" can use a response template that's in French. One action can be linked with different keywords. For example, "STOP" action is linked with keywords: "end", "cancel", "unsubscribe", "quit", "stop", "arret". For "GENERIC" action, the keyword is empty. Required if the MO keyword handling feature is enabled. Example: `stop`. |


---

## Receive Viber callbacks

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/vibercallbacks>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Messaging regarding Mobile Originated (MO) messages from end users sent using its Viber channel. You can receive notifications from multiple Telesign services at the same endpoint. Confirm with our [Customer Support Team](mailto:support@telesign.com) that the channels you want to use for receiving inbound messages from end-users have been enabled.

> Looking for the high-level guide page with examples related to this action? Go to [Messaging - Receive inbound messages](https://developer.telesign.com/enterprise/docs/messaging-receive-inbound-messages).

#### Status codes

| Status code | Associated text string | Description       |
|-------------|------------------------|-------------------|
| 1500        | Delivered              | Delivered to you. |

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The service's unique identifier for the original transaction this notification is related to. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  | Contains properties related to the processing status of this transaction or send. |
| `status.updated_on` | string | yes | Timestamp indicating when the status was last updated. Example: `2023-10-31T14:47:10.490130Z`. |
| `status.description` | string | yes | The description of the specific status code. Example: `Delivered to customer`. |
| `status.code` | integer | yes | The 4-digit status code associated with the mobile originated (MO) message. Example: `1500`. |
| `phone_number` | string | yes | The end user's phone number with country code included. Example: `11234567890`. |
| `content` | object |  | The content of the MO message sent by the end user. |
| `content.original_reference_id` | string | yes | The reference ID of the original MT message, in case of two-way communication. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `content.text` | string | yes | The text message or url provided by the end user. Example: `Hello`. |
| `content.tracking_data` | string | yes | The data associated to the reply in a MT message. In the case of two-way communication, it used with the `reply_id` attribute. Example: `reply_2fa`. |
| `content.media` | string | yes | The file URL sent by the end user for images, video, or files. Each file sent by end user will be stored on Viber’s server for up to 7 days, after which it will no longer be available to download. |
| `content.file_name` | string | yes | The name of the file sent by the end user for images, video, or files. Example: `1695641912869284.jpg`. |


---

## Receive email callbacks

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/emailcallbacks>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Messaging regarding Mobile Originated (MO) messages from end users sent using its email channel. You can receive notifications from multiple Telesign services at the same endpoint. Confirm with our [Customer Support Team](mailto:support@telesign.com) that the channels you want to use for receiving inbound messages from end-users have been enabled.

> Looking for the high-level guide page with examples related to this action? Go to [Messaging - Receive inbound messages](https://developer.telesign.com/enterprise/docs/messaging-receive-inbound-messages).

#### Status codes

| Status code | Associated text string | Description       |
|-------------|------------------------|-------------------|
| 1500        | Delivered              | Delivered to you. |

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The service's unique identifier for the original transaction this notification is related to. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  | Contains properties related to the processing status of this transaction or send. |
| `status.updated_on` | string | yes | Timestamp indicating when the status was last updated. Example: `2023-10-31T14:47:10.490130Z`. |
| `status.description` | string | yes | The description of the specific status code. Example: `Delivered to customer`. |
| `status.code` | integer | yes | The 4-digit status code associated with the mobile originated (MO) message. Example: `1500`. |
| `email` | string | yes | End user's email address used for sending the inbound message. Example: `name@vero-finto.com`. |
| `content` | object |  | The content of the MO message sent by the end user. |
| `content.end_user_action` | object |  | An end user action that is a response to an MT (mobile terminated) message. It could be a quick reply or call to action event. |
| `content.end_user_action.template` | string | yes | The template name of the MT message. Example: `text`. |
| `content.end_user_action.event` | string | yes | The type of MO event sent by the end user, such as unsubscribe or complaint. Example: `unsubscribe`. |
| `sub_resource` | string | yes | Returns value identifying the inbound channel used by the end user. Helpful when multiple channels are used with the same Mobile Originated (MO) Callback URL. Example: `mo_email`. |


---

## Receive template management callbacks

Telesign sends this `POST` request to a callback URL that you host.

- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/templatescallbacks>

This is a web service created by you, to receive notifications from Telesign. The details described here are for notifications from Telesign Messaging for template management requests. You can receive notifications from multiple Telesign services at the same endpoint.

#### Status codes

| Status code | Text string | Description |
|-------------|------------------------|-------------|
|3850|Template successfully created|This template has been successfully created and is ready for use.|
|3851|Template approved by provider|This template has been successfully created by Telesign and approved by the channel provider and is ready for use.|
|3852|Template rejected by provider|This template has been rejected by the channel provider.|
|3853|Template successfully removed|This template has been successfully removed.|
|3854|Template flagged by provider|This template has been flagged by the channel provider due to misuse.|
|3855|Template disabled by provider|This template has been disabled by the channel provider.|
|3857|Removal unsuccessful - provider temporary problem|The template removal has been rejected by the channel provider.|

### Payload fields

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | The service's unique identifier for the original transaction this notification is related to. Length: 32-32. Example: `B56259E45884010488343BAA15FB0002`. |
| `name` | string | yes | The name of this template. This serves as a unique identifier per channel per customer. Example: `WAMarketingTemplate1`. |
| `channel` | string enum | yes | The channel that messages using this template are sent on. Allowed: `whatsapp`, `sms`. Example: `whatsapp`. |
| `language` | array of string |  | Abbreviations that specify the languages used in the text in your template. Required for WhatsApp templates. Not used for templates on other channels. See [Supported Languages](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#supported-languages) in Facebook's documentation for a complete list of valid abbreviations. |
| `status` | object | yes | Contains properties related to the processing status of this transaction or send. |
| `status.code` | integer | yes | Example: `3850`. |
| `status.description` | string | yes | Example: `Template successfully created`. |
| `status.updated_on` | string | yes | Timestamp that indicates when the status of this transaction or send was last updated. Example: `2016-10-21T14:05:36.181346Z`. |

### Example payload

```json
{
  "reference_id": "B56259E45884010488343BAA15FB0002",
  "name": "WAMarketingTemplate1",
  "channel": "whatsapp",
  "language": [
    "en_US"
  ],
  "status": {
    "code": 3850,
    "description": "Template successfully created",
    "updated_on": "2022-09-21T14:05:36.181346Z"
  }
}
```

