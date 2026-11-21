# Intelligence - API reference

Machine-learning risk scoring for phone numbers and email addresses with allow / flag / block recommendations and reason codes.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `intelligence_assess_risk`, `intelligence_score_legacy`, `intelligence_assess_email`._

## Intelligence Cloud - Submit a phone number to evaluate

**MCP tool:** `intelligence_assess_risk`

```http
POST https://detect.telesign.com/intelligence/phone
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/submitphonenumberforintelligencecloud> (updated 2026-09-11)

Obtain a risk recommendation for this phone number, as well as other relevant information using Telesign Cloud API.

Migration from Intelligence to the Intelligence Cloud API is mandatory.

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
| `phone_number` | string | yes |  |
| `account_lifecycle_event` | string enum | yes | The attempted action associated with this phone number for which you want to evaluate its risk. Acceptable values for this parameter are - * create - For the creation of a new account. * sign-in - For when an end user signs in to their account. * transact - For when an end user completes a transaction within their account. * update - For when an update is performed, such as an update of account information or similar. * delete - For when an account is deleted. Allowed: `create`, `sign-in`, `transact`, `update`, `delete`. |
| `account_id` | string |  | Your end user's account ID. This value is case sensitive. |
| `device_id` | string |  | Your end user's device ID. This value is case sensitive. |
| `email_address` | string |  | Your end user's email address. This value is case sensitive. |
| `external_id` | string |  | Any ID passed from you that can uniquely identify this transaction in your system. The response simply echoes the value provided for this parameter. Example: `CustomExternalID7349`. |
| `originating_ip` | string |  | Your end user's IP address (do not send your own IP address). IPv4 and IPv6 are supported. For IPv4, the value must be in the format defined by the Internet Engineering Task Force (IETF) in the Internet-Draft document titled [Internet Protocol](https://tools.ietf.org/html/rfc791). For IPv6, the value must be in the format defined by the IETF in the Internet-Draft document titled [IP Version 6 Addressing Architecture](https://tools.ietf.org/html/rfc4291#section-2.2). |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status code property in the response object and use that, rather than the HTTP status code. Individual packages within the response may have their own status codes as well.

| Status Code | Associated Text String | Description                                |
|-------------|------------------------|--------|
| 300         | Transaction successfully completed           | The system was able to obtain all of the requested data.                      |
| 301         | Transaction partially completed | The system was able to obtain some of the data, but not all of it.                  |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

  | Status Code | Associated Text String |
  |-------------|------------------------|
  | 10032       | Request blocked due to this number appearing on a TeleSign blocklist.  |
  | 10033       | Unverified phone_number requested for trial account. |
  | 11000       | Invalid value for parameter phone_number |
  | 11001       | Invalid country code for parameter phone_number           |
  | 11002       | Invalid value for parameter account_id   |
  | 11003       | Invalid value for parameter account_lifecycle_event |
  | 11005       | Invalid value for parameter customer_id  |
  | 11006       | Invalid value for parameter device_id    |
  | 11007       | Invalid value for email_address          |
  | 11010       | Invalid value for parameter originating_ip         |
  | 11011       | Invalid value for parameter reference_id |
  | 12000       | Missing required parameter phone_number |
  | 12003       | Missing required parameter account_lifecycle_event |

**HTTP 401**

**Unauthorized.** The request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

 | Status Code | Associated Text String |
 |-------------|------------------------|
 | 10008       | Invalid signature      |
 | 10009       | Invalid value for parameter message      |
 | 10010       | Invalid value for parameter originating_ip         |
 | 10011       | Invalid value for parameter reference_id |
 | 10012       | This feature is not enabled for this CustomerID             |
 | 10013       | Invalid Request. CustomerID Account Not Found              |
 | 10014       | Invalid source IP address                |
 | 10015       | Invalid customer ID    |

**HTTP 402**

**Payment Required.** If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10030       | Insufficient funds in prepaid wallet         |

**HTTP 404**

**Not Found.** The server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10017       | Customer ID / Reference ID not found           |

**HTTP 429**

**Too Many Requests.** The user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10019       | Rate Limit Exceeded    |
| 10020       | PhoneId Standard exceeded transaction hard cap. Request denied.                |

**HTTP 451**

**Unavailable For Legal Reasons.**

| Status Code | Associated Text String |
|-------------|------------------------|
| 10041       | Blocked due to legal compliance |

**HTTP 500**

**Invalid Transaction.** Transaction not attempted.

**HTTP 503**

**Service Unavailable.** System unavailable, try again.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A 32-digit hex value used to identify the web service request. The value is unique to each web service request, is randomly-generated by Telesign, and is returned in the response message immediately following the web service request. Example: `CFMJ6FTL09O22UE1KC5NBD7ZMWKTMJB8`. |
| `external_id` | string |  | The customer-generated ID for this transaction that was provided in the request. If the `external_id` parameter was not included in the request, the value here is `null`. Example: `CustomExternalID7349`. |
| `status` | object |  | An object containing details about the request status. |
| `status.code` | integer |  | Transaction status code. Successful transactions can be assigned one of the following values: 	•	300 - successful transaction 	•	301 - partially successful transaction Example: `300`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Transaction successfully completed`. |
| `status.updated_on` | string |  | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the transaction status was updated. Example: `2024-10-06T21:25:03.420503Z`. |
| `location` | object |  | Contains geographical location information associated with the rate center of the phone number when the device was activated. Null is returned when data for a field isn't available for a specific market or country. |
| `location.city` | string |  | The city associated with the rate center of the phone number when the device was activated. Example: `Odessa`. |
| `location.county` | string |  | The county (or parish) associated with the rate center of the phone number when the device was activated (U.S. only). Example: `Ector`. |
| `location.state` | string |  | The two-letter [state abbreviation code](http://pe.usps.com/text/pub28/28apb.htm) of the state (province, district, or territory) associated with the rate center of the phone number when the device was activated (North America only). Example: `TX`. |
| `location.zip` | string |  | The five-digit United States Postal Service [ZIP Code](https://www.usps.com/nationalpremieraccounts/findzipcodes.htm) associated with the rate center of the phone number when the device was activated (U.S. only). Example: `79758`. |
| `location.country` | object |  | Contains properties related to the country associated with the rate center of the phone number when the device was activated. |
| `location.country.iso2` | string |  | The ISO 3166-1 2-letter [country code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the rate center of the phone number when the device was activated. Example: `US`. |
| `location.country.iso3` | string |  | The ISO 3166-1 3-letter country code associated with the rate center of the phone number when the device was activated. Example: `USA`. |
| `location.country.name` | string |  | The [country name](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the rate center of the phone number when the device was activated. Example: `United States`. |
| `location.time_zone` | object |  | Contains properties related to the time zone associated with the rate center of the phone number when the device was activated. For maximum and minimum UTC offsets, they are specified in units of hours, and range from -12 to +14. For positive numbers, the plus sign (+) may not be returned. Additional offsets due to Daylight Savings Time or Summer Time are not considered. For example, Russia, which spans 11 time zones, has a minimum UTC offset of +2, and a maximum of +12. |
| `location.time_zone.name` | string |  | The time zone associated with the rate center of the phone number when the device was activated (U.S. only). Example: `America/Chicago`. |
| `location.time_zone.utc_offset_min` | string |  | For international phone numbers, this parameter returns the minimum UTC offset for the country associated with the rate center of the phone number when the device was activated. For U.S. phone numbers, this parameter returns the UTC offset associated with the rate center of the phone number when the device was activated. Example: `-6`. |
| `location.time_zone.utc_offset_max` | string |  | For international phone numbers, this parameter returns the maximum UTC offset for the country associated with the rate center of the phone number when the device was activated. For U.S. phone numbers, this parameter returns the same result as utc_offset_min. Example: `-6`. |
| `location.coordinates` | object |  | Contains properties with details about the geographical coordinates of the location where the phone number is registered. |
| `location.coordinates.latitude` | number |  | Latitude specifies the North-South position of a point on the Earth’s surface. It is an angular measurement that ranges from 0° at the Equator, to 90° at the North Pole (and -90° at the South Pole). It is returned here as a value indicating the number of degrees of latitude of the location associated with the phone number, expressed in seven decimal digits, with five decimal places. Example: `31.8466`. |
| `location.coordinates.longitude` | number |  | Longitude specifies the East-West position of a point on the Earth’s surface. It is an angle measured East or West from the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) —ranging from 0° at the prime meridian, to +180° Eastward and -180° Westward. It is returned here as a value indicating the number of degrees of longitude of the location associated with the phone number, expressed in eight decimal digits, with five decimal places. Example: `-102.36778`. |
| `location.metro_code` | string |  | A 4-digit string indicating the Primary Metropolitan Statistical Area (PMSA) code for the location associated with the rate center of the phone number when the device was activated (U.S. only). Example: `36220`. |
| `numbering` | object |  | Contains properties related to the numbering attributes of the specified phone number. |
| `numbering.original` | object |  | Contains details about the original phone number included in the request. |
| `numbering.original.phone_number` | string |  | Input phone number before any transformation, returned as is, with all special characters, if any. Example: `1234567890`. |
| `numbering.original.complete_phone_number` | string |  | Input phone number after splitting country code from complete phone number, with special characters removed. Example: `11234567890`. |
| `numbering.original.country_code` | string |  | The input country calling code after splitting the country code from the complete phone number, with special characters removed. It is the 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for the United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing` | object |  | Contains details about how the phone number was cleansed. Phone cleansing corrects common formatting issues in submitted phone numbers. |
| `numbering.cleansing.call` | object |  | Contains cleansing details for the phone number if it is enabled to receive voice calls. |
| `numbering.cleansing.call.cleansed_code` | integer |  | One of the following values: •	100 - Exact match found using original number. •	101 - Match found by applying changes to the original number. •	102 - Restricted number. •	103 - No match found. •	104 - Country code and/or phone number are invalid. •	105 - No change but the match was either too long or too short. Example: `100`. |
| `numbering.cleansing.call.country_code` | string |  | The 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing.call.max_length` | integer |  | The maximum number of dialing digits allowed for phone numbers with this county dialing code, excluding the country code. Example: `10`. |
| `numbering.cleansing.call.min_length` | integer |  | The minimum number of dialing digits allowed for phone numbers with this county dialing code, excluding the country code. Example: `10`. |
| `numbering.cleansing.call.phone_number` | string |  | Phone number after all cleansing transformation rules (for the Voice request type) have been applied. Example: `1234567890`. |
| `numbering.cleansing.sms` | object |  | Contains cleansing details for the phone number if it is enabled to receive SMS. |
| `numbering.cleansing.sms.cleansed_code` | integer |  | One of the following values: •	100 - Exact match found using original number. •	101 - Match found by applying changes to the original number. •	102 - Restricted number. •	103 - No match found. •	104 - Country code and/or phone number are invalid. •	105 - No change but the match was either too long or too short. Example: `100`. |
| `numbering.cleansing.sms.country_code` | string |  | The 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing.sms.min_length` | integer |  | The minimum number of dialing digits allowed for phone numbers with this county dialing code, excluding the country code. Example: `10`. |
| `numbering.cleansing.sms.max_length` | integer |  | The maximum number of dialing digits allowed for phone numbers with this county dialing code, excluding the country code. Example: `10`. |
| `numbering.cleansing.sms.phone_number` | string |  | The base phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `1234567890`. |
| `phone_type` | object |  |  |
| `phone_type.code` | string |  | Type of service based on dial plan data (numbering_plan.dial_plan). \| Code \| Type \| \| :--- \| :--- \| \| **1** \| Fixed line \| \| **2** \| Mobile \| \| **3** \| PrePaid Mobile \| \| **4** \| Toll Free \| \| **5** \| VOIP \| \| **6** \| Pager \| \| **7** \| Payphone \| \| **9** \| Restricted/Premium Rate \| \| **10** \| Personal \| \| **11** \| Voicemail \| \| **20** \| Other \| \| **30** \| Email \| OR `null` Example: `1`. |
| `phone_type.description` | string |  | Description of the phone type, an enumerated value from the list of codes for `code`, which identifies the phone type. Example: `FIXED_LINE`. |
| `phone_type.override_reason` | string |  | Text describing the [phone type override](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-override-reason-codes) status of this phone number. Not included in response by default - depends on the “Phone Type Overrides Enabled” customer feature. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `Non SMS-enabled Phone Number`. |
| `phone_type.override_reason_id` | integer |  | A numeric code specifying the [phone type override](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-override-reason-codes) status of this phone number.  Not included in response by default - depends on the “Phone Type Overrides Enabled” customer feature. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `11`. |
| `blocklisting` | object |  | Contains details about whether the number was blocked and who requested the block. Contact our [Customer Support Team](mailto:support@telesign.com) to include this package in your response. |
| `blocklisting.block_code` | integer |  | A code indicating whether the number is blocked, and who blocked it. * `0` - Not blocked * `1`- Blocked by Telesign * `2` - Block requested by your organization *  `3` - Block requested by your account or set by Telesign on behalf of your account * `4` - Block state is unknown. Example: `0`. |
| `blocklisting.block_description` | string |  | Text explaining the block status. Example: `Not blocked`. |
| `blocklisting.blocked` | boolean |  | If `true`, this number is blocked. If `false`, this number is not blocked. |
| `carrier` | object |  | Contains details about the company that provides telecommunications services for this phone number. Behavior of this property, including information returned for ported phone numbers, can vary depending on the country of the phone number. See [How does carrier data vary by country?](https://support.telesign.com/s/article/How-does-carrier-data-vary-by-country) for more details. |
| `carrier.carrier_id` | integer |  | Six-character identifier for the provider associated with the phone number by prefix that can be used for billing purposes (carrier ID, operator ID). Might be incorrect in countries where MNP is possible, since the carrier information is provided by the prefix of the phone number, and not from the carrier itself. Not included in response by default - depends on the “Carrier ID Enabled” customer feature. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `309`. |
| `carrier.name` | string |  | Name of the provider associated with the phone number by prefix. Might be incorrect in countries where MNP is possible, since the carrier information is provided by the prefix of the phone number, and not from the carrier itself. Example: `AT&T Wireless`. |
| `risk` | object |  | Contains properties related to the risk recommendation for the specified phone number. |
| `risk.level` | string |  | The severity of the risk. [Risk Recommendation Scale](https://developer.telesign.com/enterprise/docs/intelligence-get-started#risk-recommendation-scale) provides a table. Example: `high`. |
| `risk.recommendation` | string enum |  | The action that Telesign recommends that you take based on the risk recommendation. Allowed: `allow`, `flag`, `block`. Example: `block`. |
| `risk.score` | integer |  | A measure of the transaction risk involved with conducting an online business transaction at the current time for this phone number. The scale ranges from zero to 1000, with a higher value indicating a higher risk. Example: `959`. |
| `risk_insights` | object |  | Contains reason code properties with additional info related to the risk recommendation.   [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings) provides the meaning of these reason codes. |
| `risk_insights.status` | integer enum |  | The processing status of the risk insights package for this request. Possible values are: \| Value \| Meaning \| \|-------\|---------\| \| 800   \| **Success.**  All fields successfully returned and available for use. \| \| 801   \| **Partial Success.**  No value available for category, but other data is available. \| \| 803   \| **Error.**  An error occurred; no data returned in this response. \| Allowed: `800`, `801`, `803`. Example: `800`. |
| `risk_insights.category` | array of integer |  | Reason codes related to the category of the phone number.   [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings) provides the meaning of the codes returned. |
| `risk_insights.a2p` | array of integer |  | Reason codes specific to application-to-person communication (A2P). These are automated communications sent to a human, like verification codes, appointment reminders, etc.   [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings) provides the meaning of the codes returned. |
| `risk_insights.p2p` | array of integer |  | Reason codes specific to person-to-person communication (P2P). This is two-way communication between two humans, like one friend texting another.   [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings) provides the meaning of the codes returned. |
| `risk_insights.number_type` | array of integer |  | Reason codes related to the phone number’s type.   [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings) provides the meaning of the codes returned. |
| `risk_insights.ip` | array of integer |  | Reason codes related to activity of the IP you provided for this phone number.   [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings) provides the meaning of the codes returned. |
| `risk_insights.email` | array of integer |  | Reason codes related to activity of the email address you provided for this phone number.   [Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings) provides the meaning of the codes returned. |

### Example response (200)

```json
{
  "reference_id": "CFMJ6FTL09O22UE1KC5NBD7ZMWKTMJB8",
  "external_id": "CustomExternalID7349",
  "status": {
    "code": 300,
    "description": "Transaction successfully completed",
    "updated_on": "2024-10-06T21:25:03.420503Z"
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
  "numbering": {
    "original": {
      "phone_number": "1234567890",
      "complete_phone_number": "11234567890",
      "country_code": "1"
    },
    "cleansing": {
      "call": {
        "cleansed_code": 100,
        "country_code": "1",
        "max_length": 10,
        "min_length": 10,
        "phone_number": "1234567890"
      },
      "sms": {
        "cleansed_code": 100,
        "country_code": "1",
        "max_length": 10,
        "min_length": 10,
        "phone_number": "1234567890"
      }
    }
  },
  "phone_type": {
    "code": "1",
    "override_reason": "Non SMS-enabled Phone Number",
    "description": "FIXED_LINE",
    "override_reason_id": 11
  },
  "blocklisting": {
    "block_code": 0,
    "block_description": "Not blocked",
    "blocked": true
  },
  "carrier": {
    "carrier_id": 309,
    "name": "AT&T Wireless"
  },
  "risk": {
    "level": "high",
    "recommendation": "block",
    "score": 959
  },
  "risk_insights": {
    "status": 800,
    "category": [
      10002
    ],
    "a2p": [
      20001,
      20101,
      21002
    ],
    "p2p": [
      30201
    ],
    "number_type": [
      40005,
      40011
    ],
    "ip": [
      50001,
      50004
    ],
    "email": [
      60003,
      60006
    ]
  }
}
```


---

## Submit a phone number to evaluate

**MCP tool:** `intelligence_score_legacy`

```http
POST https://rest-ww.telesign.com/v1/score/{complete_phone_number}
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/submitphonenumberforintelligence> (updated 2026-09-11)

> 📘 NOTE:
>
> This page is for the on-prem version of Intelligence which is deprecated. Please complete your migration to the [Intelligence Cloud API](https://developer.telesign.com/enterprise/reference/submitphonenumberforintelligencecloud). This migration is mandatory.

Obtain a risk recommendation for this phone number, as well as other relevant information.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `complete_phone_number` | string | yes | The phone number, as digits without spaces or special characters, beginning with the country dialing code. |

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `account_lifecycle_event` | string enum | yes | The attempted action associated with this phone number for which you want to evaluate its risk. Acceptable values for this parameter are - * create - For the creation of a new account. * sign-in - For when an end user signs in to their account. * transact - For when an end user completes a transaction within their account. * update - For when an update is performed, such as an update of account information or similar. * delete - For when an account is deleted. Allowed: `create`, `sign-in`, `transact`, `update`, `delete`. |
| `external_id` | string |  | A customer-generated ID for this transaction. The response simply echoes the value provided for this parameter. Example: `CustomExternalID7349`. |
| `originating_ip` | string |  | Your end user's IP address (do not send your own IP address). IPv4 and IPv6 are supported. For IPv4, the value must be in the format defined by the Internet Engineering Task Force (IETF) in the Internet-Draft document titled [Internet Protocol](https://tools.ietf.org/html/rfc791). For IPv6, the value must be in the format defined by the IETF in the Internet-Draft document titled [IP Version 6 Addressing Architecture](https://tools.ietf.org/html/rfc4291#section-2.2). |
| `device_id` | string |  | Your end user's device ID. This value is case sensitive. |
| `account_id` | string |  | Your end user's account ID. This value is case sensitive. |
| `email_address` | string |  | Your end user's email address. This value is case sensitive. |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status code property in the response object and use that, rather than the HTTP status code. Individual packages within the response may have their own status codes as well.

| Status Code | Associated Text String | Description                                |
|-------------|------------------------|--------|
| 300         | Transaction successfully completed           | The system was able to obtain all of the requested data.                      |
| 301         | Transaction partially completed | The system was able to obtain some of the data, but not all of it.                  |

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

  | Status Code | Associated Text String |
  |-------------|------------------------|
  | 10032       | Request blocked due to this number appearing on a TeleSign blocklist.  |
  | 10033       | Unverified phone_number requested for trial account. |
  | 11000       | Invalid value for parameter phone_number |
  | 11001       | Invalid country code for parameter phone_number           |
  | 11002       | Invalid value for parameter account_id   |
  | 11003       | Invalid value for parameter account_lifecycle_event |
  | 11005       | Invalid value for parameter customer_id  |
  | 11006       | Invalid value for parameter device_id    |
  | 11007       | Invalid value for email_address          |
  | 11010       | Invalid value for parameter originating_ip         |
  | 11011       | Invalid value for parameter reference_id |
  | 12000       | Missing required parameter phone_number |
  | 12003       | Missing required parameter account_lifecycle_event |

**HTTP 401**

Unauthorized, the request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

 | Status Code | Associated Text String |
 |-------------|------------------------|
 | 10008       | Invalid signature      |
 | 10009       | Invalid value for parameter message      |
 | 10010       | Invalid value for parameter originating_ip         |
 | 10011       | Invalid value for parameter reference_id |
 | 10012       | This feature is not enabled for this CustomerID             |
 | 10013       | Invalid Request. CustomerID Account Not Found              |
 | 10014       | Invalid source IP address                |
 | 10015       | Invalid customer ID    |

**HTTP 402**

Payment Required. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10030       | Insufficient funds in prepaid wallet         |

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10017       | Customer ID / Reference ID not found           |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10019       | Rate Limit Exceeded    |
| 10020       | PhoneId Standard exceeded transaction hard cap. Request denied.                |

**HTTP 500**

Invalid Transaction, transaction not attempted.

**HTTP 503**

Service Unavailable, system unavailable, try again.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A 32-digit hex value used to identify the web service request. The value is unique to each web service request, is randomly-generated by Telesign, and is returned in the response message immediately following the web service request. Example: `CFMJ6FTL09O22UE1KC5NBD7ZMWKTMJB8`. |
| `external_id` | string |  | The customer-generated ID for this transaction that was provided in the request. If the `external_id` parameter was not included in the request, the value here is `null`. Example: `CustomExternalID7349`. |
| `status` | object |  | An object containing details about the request status. |
| `status.code` | integer |  | One of the status codes or error codes. You should code against these and not HTTP response Example: `300`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Transaction successfully completed`. |
| `status.updated_on` | string |  | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the transaction status was updated. Example: `2024-10-06T21:25:03.420503Z`. |
| `location` | object |  | Contains geographical location information associated with the rate center of the phone number when the device was activated. Null is returned when data for a field isn't available for a specific market or country. |
| `location.city` | string |  | The city associated with the rate center of the phone number when the device was activated. Example: `Odessa`. |
| `location.county` | string |  | The county (or parish) associated with the rate center of the phone number when the device was activated (U.S. only). Example: `Ector`. |
| `location.state` | string |  | The two-letter [state abbreviation code](http://pe.usps.com/text/pub28/28apb.htm) of the state (province, district, or territory) associated with the rate center of the phone number when the device was activated (North America only). Example: `TX`. |
| `location.zip` | string |  | The five-digit United States Postal Service [ZIP Code](https://www.usps.com/nationalpremieraccounts/findzipcodes.htm) associated with the rate center of the phone number when the device was activated (U.S. only). Example: `79758`. |
| `location.country` | object |  | Contains properties related to the country associated with the rate center of the phone number when the device was activated. |
| `location.country.iso2` | string |  | The ISO 3166-1 2-letter [country code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the rate center of the phone number when the device was activated. Example: `US`. |
| `location.country.iso3` | string |  | The ISO 3166-1 3-letter country code associated with the rate center of the phone number when the device was activated. Example: `USA`. |
| `location.country.name` | string |  | The [country name](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the rate center of the phone number when the device was activated. Example: `United States`. |
| `location.time_zone` | object |  | Contains properties related to the time zone associated with the rate center of the phone number when the device was activated. For maximum and minimum UTC offsets, they are specified in units of hours, and range from -12 to +14. For positive numbers, the plus sign (+) may not be returned. Additional offsets due to Daylight Savings Time or Summer Time are not considered. For example, Russia, which spans 11 time zones, has a minimum UTC offset of +2, and a maximum of +12. |
| `location.time_zone.name` | string |  | The time zone associated with the rate center of the phone number when the device was activated (U.S. only). Example: `America/Chicago`. |
| `location.time_zone.utc_offset_max` | string |  | For international phone numbers, this parameter returns the maximum UTC offset for the country associated with the rate center of the phone number when the device was activated. For U.S. phone numbers, this parameter returns the same result as utc_offset_min. Example: `-6`. |
| `location.time_zone.utc_offset_min` | string |  | For international phone numbers, this parameter returns the minimum UTC offset for the country associated with the rate center of the phone number when the device was activated. For U.S. phone numbers, this parameter returns the UTC offset associated with the rate center of the phone number when the device was activated. Example: `-6`. |
| `location.coordinates` | object |  | Contains properties with details about the geographical coordinates of the location where the phone number is registered. |
| `location.coordinates.latitude` | number |  | Latitude specifies the North-South position of a point on the Earth’s surface. It is an angular measurement that ranges from 0° at the Equator, to 90° at the North Pole (and -90° at the South Pole). It is returned here as a value indicating the number of degrees of latitude of the location associated with the phone number, expressed in seven decimal digits, with five decimal places. Example: `31.8466`. |
| `location.coordinates.longitude` | number |  | Longitude specifies the East-West position of a point on the Earth’s surface. It is an angle measured East or West from the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) —ranging from 0° at the prime meridian, to +180° Eastward and -180° Westward. It is returned here as a value indicating the number of degrees of longitude of the location associated with the phone number, expressed in eight decimal digits, with five decimal places. Example: `-102.36778`. |
| `location.metro_code` | string |  | A 4-digit string indicating the Primary Metropolitan Statistical Area (PMSA) code for the location associated with the rate center of the phone number when the device was activated (U.S. only). PMSA Codes are governed by the [US Census Bureau](http://www.census.gov/). This information is useful for large metropolitan areas that comprise several smaller cities. For example, the PMSA for Long Beach, California is Los Angeles County, which gives Long Beach the PMSA Code 4480. Example: `36220`. |
| `numbering` | object |  | Contains properties related to the numbering attributes of the specified phone number. |
| `numbering.original` | object |  | Contains details about the original phone number included in the request. |
| `numbering.original.phone_number` | string |  | The base phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `1234567890`. |
| `numbering.original.complete_phone_number` | string |  | The base phone number prefixed with the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `11234567890`. |
| `numbering.original.country_code` | string |  | The 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for the United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing` | object |  | Contains details about how the phone number was cleansed. Phone cleansing corrects common formatting issues in submitted phone numbers. |
| `numbering.cleansing.call` | object |  | Contains cleansing details for the phone number if it is enabled to receive voice calls. |
| `numbering.cleansing.call.cleansed_code` | integer |  | One of the [phone number cleansing codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes) specifying the cleansing operation performed on the phone number. Example: `100`. |
| `numbering.cleansing.call.country_code` | string |  | The 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing.call.max_length` | integer |  | The maximum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `numbering.cleansing.call.min_length` | integer |  | The minimum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `numbering.cleansing.call.phone_number` | string |  | The base phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `1234567890`. |
| `numbering.cleansing.sms` | object |  | Contains cleansing details for the phone number if it is enabled to receive SMS. |
| `numbering.cleansing.sms.cleansed_code` | integer |  | One of the [phone number cleansing codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes) specifying the cleansing operation performed on the phone number. Example: `100`. |
| `numbering.cleansing.sms.country_code` | string |  | The 1, 2, or 3-digit [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is `1`, and the country dialing code for United Kingdom is `44`. Example: `1`. |
| `numbering.cleansing.sms.max_length` | integer |  | The maximum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `numbering.cleansing.sms.min_length` | integer |  | The minimum number of digits allowed for phone numbers with this country dialing code. Example: `10`. |
| `numbering.cleansing.sms.phone_number` | string |  | The base phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `1234567890`. |
| `phone_type` | object |  |  |
| `phone_type.code` | string |  | One of the [phone type codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-codes). Example: `1`. |
| `phone_type.override_reason` | string |  | Text describing the [phone type override](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-override-reason-codes) status of this phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `Non SMS-enabled Phone Number`. |
| `phone_type.description` | string |  | Text describing the phone type. Example: `FIXED_LINE`. |
| `phone_type.override_reason_id` | integer |  | A numeric code specifying the [phone type override](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-override-reason-codes) status of this phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `11`. |
| `blocklisting` | object |  | Contains details about whether the number was blocked and who requested the block. Contact our [Customer Support Team](mailto:support@telesign.com) to include this package in your response. |
| `blocklisting.block_code` | integer |  | A code indicating whether the number is blocked, and who blocked it. `0` for not blocked, `1` for blocked by TeleSign, `2` for block requested by your organization, `3` for block requested by your account or set by TeleSign on behalf of your account, and `4` if the block state is unknown. Example: `0`. |
| `blocklisting.block_description` | string |  | Text explaining the block status. Example: `Not blocked`. |
| `blocklisting.blocked` | boolean |  | If `true`, this number is blocked. If `false`, this number is not blocked. |
| `carrier` | object |  | Contains details about the company that provides telecommunications services for this phone number. Behavior of this property, including information returned for ported phone numbers, can vary depending on the country of the phone number. See [How does carrier data vary by country?](https://support.telesign.com/s/article/How-does-carrier-data-vary-by-country) for more details. |
| `carrier.carrier_id` | integer |  | An ID specifying this carrier. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `309`. |
| `carrier.name` | string |  | The name of this carrier. Example: `AT&T Wireless`. |
| `risk` | object |  | Contains properties related to the risk recommendation for the specified phone number. |
| `risk.level` | string |  | The severity of the risk. [Risk Recommendation Scales](https://developer.telesign.com/enterprise/docs/intelligence-get-started#risk-recommendation-scales) provides a table. Example: `high`. |
| `risk.recommendation` | string enum |  | The action that Telesign recommends that you take based on the risk recommendation. Allowed: `allow`, `flag`, `block`. Example: `block`. |
| `risk.score` | integer |  | A measure of the transaction risk involved with conducting an online business transaction at the current time for this phone number. The scale ranges from zero to 1000, with a higher value indicating a higher risk. Example: `959`. |
| `risk_insights` | object |  | Contains reason code properties with additional info related to the risk recommendation.   *[Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings)* provides the meaning of these reason codes. |
| `risk_insights.status` | integer enum |  | The processing status of the risk insights package for this request. Possible values are: \| Value \| Meaning \| \|-------\|---------\| \| 800   \| **Success.**  All fields successfully returned and available for use. \| \| 801   \| **Partial Success.**  No value available for category, but other data is available. \| \| 803   \| **Error.**  An error occurred; no data returned in this response. \| Allowed: `800`, `801`, `803`. Example: `800`. |
| `risk_insights.category` | array of integer |  | Reason codes related to the category of the phone number.   *[Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings)* provides the meaning of the codes returned. |
| `risk_insights.a2p` | array of integer |  | Reason codes specific to application-to-person communication (A2P). These are automated communications sent to a human, like verification codes, appointment reminders, etc.   *[Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings)* provides the meaning of the codes returned. |
| `risk_insights.p2p` | array of integer |  | Reason codes specific to person-to-person communication (P2P). This is two-way communication between two humans, like one friend texting another.   *[Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings)* provides the meaning of the codes returned. |
| `risk_insights.number_type` | array of integer |  | Reason codes related to the phone number’s type.   *[Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings)* provides the meaning of the codes returned. |
| `risk_insights.ip` | array of integer |  | Reason codes related to activity of the IP you provided for this phone number.   *[Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings)* provides the meaning of the codes returned. |
| `risk_insights.email` | array of integer |  | Reason codes related to activity of the email address you provided for this phone number.   *[Intelligence - Insights reason code mappings](https://developer.telesign.com/enterprise/docs/intelligence-insights-reason-code-mappings)* provides the meaning of the codes returned. |

### Example response (200)

```json
{
  "reference_id": "CFMJ6FTL09O22UE1KC5NBD7ZMWKTMJB8",
  "external_id": "CustomExternalID7349",
  "status": {
    "code": 300,
    "description": "Transaction successfully completed",
    "updated_on": "2024-10-06T21:25:03.420503Z"
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
  "numbering": {
    "original": {
      "phone_number": "1234567890",
      "complete_phone_number": "11234567890",
      "country_code": "1"
    },
    "cleansing": {
      "call": {
        "cleansed_code": 100,
        "country_code": "1",
        "max_length": 10,
        "min_length": 10,
        "phone_number": "1234567890"
      },
      "sms": {
        "cleansed_code": 100,
        "country_code": "1",
        "max_length": 10,
        "min_length": 10,
        "phone_number": "1234567890"
      }
    }
  },
  "phone_type": {
    "code": "1",
    "override_reason": "Non SMS-enabled Phone Number",
    "description": "FIXED_LINE",
    "override_reason_id": 11
  },
  "blocklisting": {
    "block_code": 0,
    "block_description": "Not blocked",
    "blocked": true
  },
  "carrier": {
    "carrier_id": 309,
    "name": "AT&T Wireless"
  },
  "risk": {
    "level": "high",
    "recommendation": "block",
    "score": 959
  },
  "risk_insights": {
    "status": 800,
    "category": [
      10002
    ],
    "a2p": [
      20001,
      20101,
      21002
    ],
    "p2p": [
      30201
    ],
    "number_type": [
      40005,
      40011
    ],
    "ip": [
      50001,
      50004
    ],
    "email": [
      60003,
      60006
    ]
  }
}
```


---

## Email Intelligence - Submit an email address to evaluate

**MCP tool:** `intelligence_assess_email`

```http
POST https://detect.telesign.com/intelligence/email
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/submitemailaddressforemailintelligence> (updated 2026-09-11)

Obtain a risk recommendation for this email address, as well as other relevant information using Email Intelligence API.

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
| `email_address` | string | yes | Your end user's email address. This value is case sensitive. |
| `account_lifecycle_event` | string enum | yes | The attempted action associated with this email address for which you want to evaluate the risk. Acceptable values for this parameter are - * create - For the creation of a new account. * sign-in - For when an end user signs in to their account. * transact - For when an end user completes a transaction within their account. * update - For when an update is performed, such as an update of account information or similar. * delete - For when an account is deleted. Allowed: `create`, `sign-in`, `transact`, `update`, `delete`. |
| `account_id` | string |  | Your end user's account ID. This value is case sensitive. |
| `phone_number` | string |  | Your end user's phone number. |
| `device_id` | string |  | Your end user's device ID. This value is case sensitive. |
| `external_id` | string |  | Any ID passed from you that can uniquely identify this transaction in your system. The response simply echoes the value provided for this parameter. Example: `CustomExternalID7349`. |
| `originating_ip` | string |  | Your end user's IP address (do not send your own IP address). IPv4 and IPv6 are supported. For IPv4, the value must be in the format defined by the Internet Engineering Task Force (IETF) in the Internet-Draft document titled [Internet Protocol](https://tools.ietf.org/html/rfc791). For IPv6, the value must be in the format defined by the IETF in the Internet-Draft document titled [IP Version 6 Addressing Architecture](https://tools.ietf.org/html/rfc4291#section-2.2). |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status code property in the response object and use that, rather than the HTTP status code. Individual packages within the response may have their own status codes as well.

| Status Code | Associated Text String | Description                                |
|-------------|------------------------|--------|
| 300         | Transaction successfully completed           | The system was able to obtain all of the requested data.                      |
| 301         | Transaction partially completed | The system was able to obtain some of the data, but not all of it.                  |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

  | Status Code | Associated Text String |
  |-------------|------------------------|
  | 10032       | Request blocked due to this number appearing on a TeleSign blocklist.  |
  | 10033       | Unverified phone_number requested for trial account. |
  | 11000       | Invalid value for parameter phone_number |
  | 11001       | Invalid country code for parameter phone_number           |
  | 11002       | Invalid value for parameter account_id   |
  | 11003       | Invalid value for parameter account_lifecycle_event |
  | 11005       | Invalid value for parameter customer_id  |
  | 11006       | Invalid value for parameter device_id    |
  | 11007       | Invalid value for email_address          |
  | 11010       | Invalid value for parameter originating_ip         |
  | 11011       | Invalid value for parameter reference_id |
  | 12000       | Missing required parameter phone_number |
  | 12003       | Missing required parameter account_lifecycle_event |

**HTTP 401**

**Unauthorized.** The request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

 | Status Code | Associated Text String |
 |-------------|------------------------|
 | 10008       | Invalid signature      |
 | 10009       | Invalid value for parameter message      |
 | 10010       | Invalid value for parameter originating_ip         |
 | 10011       | Invalid value for parameter reference_id |
 | 10012       | This feature is not enabled for this CustomerID             |
 | 10013       | Invalid Request. CustomerID Account Not Found              |
 | 10014       | Invalid source IP address                |
 | 10015       | Invalid customer ID    |

**HTTP 402**

**Payment Required.** If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10030       | Insufficient funds in prepaid wallet         |

**HTTP 404**

**Not Found.** The server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10017       | Customer ID / Reference ID not found           |

**HTTP 429**

**Too Many Requests.** The user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String |
|-------------|------------------------|
| 10019       | Rate Limit Exceeded    |
| 10020       | PhoneId Standard exceeded transaction hard cap. Request denied.                |

**HTTP 451**

**Unavailable For Legal Reasons.**

| Status Code | Associated Text String |
|-------------|------------------------|
| 10041       | Blocked due to legal compliance |

**HTTP 500**

**Invalid Transaction.** Transaction not attempted.

**HTTP 503**

**Service Unavailable.** System unavailable, try again.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A 32-digit hex value used to identify the web service request. The value is unique to each web service request, is randomly-generated by Telesign, and is returned in the response message immediately following the web service request. Example: `CFMJ6FTL09O22UE1KC5NBD7ZMWKTMJB8`. |
| `external_id` | string |  | The customer-generated ID for this transaction that was provided in the request. If the `external_id` parameter was not included in the request, the value here is `null`. Example: `CustomExternalID7349`. |
| `status` | object |  | An object containing details about the request status. |
| `status.code` | integer |  | Transaction status code. Successful transactions can be assigned one of the following values: 	•	300 - successful transaction 	•	301 - partially successful transaction Example: `300`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Transaction successfully completed`. |
| `status.updated_on` | string |  | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the transaction status was updated. Example: `2024-10-06T21:25:03.420503Z`. |
| `email_address_details` | object |  | Contains cleansing and intelligence details about the submitted email address. |
| `email_address_details.original` | object |  | Contains the submitted email address exactly as provided and its initial validity evaluation. |
| `email_address_details.original.email_address ` | string |  | The email address value exactly as provided in the request. Example: `u.s.e.rr1+telesign@gmail.comm!`. |
| `email_address_details.original.is_valid` | boolean |  | Indicates whether the original email address is syntactically valid. |
| `email_address_details.cleansed` | object |  | Provides the normalized version of the email address along with the extracted username and domain components. |
| `email_address_details.cleansed.email_address` | string |  | The cleansed email address after correcting common formatting issues. Example: `userr1@gmail.com`. |
| `email_address_details.cleansed.is_valid` | boolean |  | Indicates whether the cleansed email address is syntactically valid. |
| `email_address_details.cleansed.username` | string |  | The local-part (username) extracted from the cleansed email address Example: `userr1`. |
| `email_address_details.cleansed.domain` | string |  | The domain portion extracted from the cleansed email address. Example: `gmail.com`. |
| `email_address_details.cleansing_details` | object |  | Describes modifications applied during cleansing and includes indicators such as gibberish probability and tagging. |
| `email_address_details.cleansing_details.is_modified` | boolean |  | Indicates whether the submitted email address was modified during cleansing. |
| `email_address_details.cleansing_details.gibberish_probability` | number |  | A probability score indicating how likely the email username appears algorithmically generated or nonsensical. Example: `0.29`. |
| `email_address_details.cleansing_details.tag` | string |  | A tag extracted from the email address, such as a plustag, if applicable. Example: `telesign`. |
| `email_address_details.domain_details` | object |  | Provides structured information about the domain associated with the email address. |
| `email_address_details.domain_details.general_info` | object |  |  |
| `email_address_details.domain_details.general_info.registered_domain` | string |  | The registered/base domain associated with the email address. Example: `gmail.com`. |
| `email_address_details.domain_details.general_info.tld` | string |  | The toplevel domain extracted from the email address. Example: `com`. |
| `email_address_details.domain_details.general_info.tld_type` | string |  | The classification of the toplevel domain, such as general or countrycode. Example: `general`. |
| `email_address_details.domain_details.general_info.is_disposable` | boolean |  | Indicates whether the email domain is known to be disposable. |
| `intelligence_details` | object |  | Contains properties related to the risk recommendation and supporting insights. |
| `intelligence_details.risk` | object |  | Contains properties related to the risk recommendation for the specified email address. |
| `intelligence_details.risk.level` | string |  | The severity of the risk. Example: `high`. |
| `intelligence_details.risk.recommendation` | string enum |  | The action that Telesign recommends that you take based on the risk recommendation. Allowed: `allow`, `flag`, `block`. Example: `block`. |
| `intelligence_details.risk.score` | integer |  | A measure of transaction risk, ranging from zero to 1000, with a higher value indicating a higher risk. Example: `959`. |
| `intelligence_details.insights` | object |  | Contains reason code properties with additional info related to the risk recommendation. |
| `intelligence_details.insights.category` | array of integer |  | Reason codes related to the risk category. |
| `intelligence_details.insights.phone_number` | object |  | Provides activity‑based and static reason codes related to the phone number linked to the email address. |
| `intelligence_details.insights.phone_number.activity` | array of integer |  | Reason codes related to activity associated with the phone number linked to this email address. |
| `intelligence_details.insights.phone_number.static` | array of integer |  | Reason codes related to static attributes of the phone number linked to this email address. |
| `intelligence_details.insights.ip_address` | object |  | Contains activity‑based and static reason codes associated with the IP address linked to the email address. |
| `intelligence_details.insights.ip_address.activity` | array of integer |  | Reason codes related to activity associated with the IP address linked to this email address. |
| `intelligence_details.insights.ip_address.static` | array of integer |  | Reason codes related to static attributes of the IP address linked to this email address. |
| `intelligence_details.insights.email_address` | object |  | Provides activity, static, and domain‑related reason codes associated directly with the email address itself. |
| `intelligence_details.insights.email_address.activity` | array of integer |  | Reason codes related to activity associated with the email address. |
| `intelligence_details.insights.email_address.static` | array of integer |  | Reason codes related to static attributes of the email address. |
| `intelligence_details.insights.email_address.domain` | array of integer |  | Reason codes related to domain based attributes of the email address. |

### Example response (200)

```json
{
  "reference_id": "CFMJ6FTL09O22UE1KC5NBD7ZMWKTMJB8",
  "external_id": "CustomExternalID7349",
  "status": {
    "code": 300,
    "description": "Transaction successfully completed",
    "updated_on": "2024-10-06T21:25:03.420503Z"
  },
  "email_address_details": {
    "original": {
      "email_address ": "u.s.e.rr1+telesign@gmail.comm!",
      "is_valid": true
    },
    "cleansed": {
      "email_address": "userr1@gmail.com",
      "is_valid": true,
      "username": "userr1",
      "domain": "gmail.com"
    },
    "cleansing_details": {
      "is_modified": true,
      "gibberish_probability": 0.29,
      "tag": "telesign"
    },
    "domain_details": {
      "general_info": {
        "registered_domain": "gmail.com",
        "tld": "com",
        "tld_type": "general",
        "is_disposable": true
      }
    }
  },
  "intelligence_details": {
    "risk": {
      "level": "high",
      "recommendation": "block",
      "score": 959
    },
    "insights": {
      "category": [
        10031
      ],
      "phone_number": {
        "activity": [
          20003
        ],
        "static": [
          40005
        ]
      },
      "ip_address": {
        "activity": [
          50005
        ],
        "static": [
          50015
        ]
      },
      "email_address": {
        "activity": [
          60005
        ],
        "static": [
          60011
        ],
        "domain": [
          60101
        ]
      }
    }
  }
}
```

