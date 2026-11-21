# Phone ID - API reference

Phone number and subscriber intelligence: type, carrier, location, and identity attributes such as SIM swap, porting, contact and number deactivation.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `phoneid_get_info`, `phoneid_get_info_private`, `phoneid_live_status`, `phoneid_legacy_contact`, `phoneid_legacy_number_deactivation`._

## Request info about a phone number in path

**MCP tool:** `phoneid_get_info`

```http
POST https://rest-ww.telesign.com/v1/phoneid/{complete_phone_number}
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/submitphonenumberforidentity> (updated 2026-09-11)

Enter a phone number with country code to receive detailed information about carrier, location, and other details.

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
| `complete_phone_number` | string | yes | The phone number you want to collect information about. Provide the entire phone number, including the country code, with no spaces or special characters. Example: `11234567890`. |

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `account_lifecycle_event` | string |  | Indicates what stage an end user is in when you make this request. Acceptable values for this parameter are: * `create` - For the creation of a new account. * `sign-in` - For when an end user signs in to their account. * `transact` - For when an end user completes a transaction within their account. * `update` - For when an update is performed, such as an update of account information. * `delete` - For when an account is deleted. Example: `create`. |
| `external_id` | string |  | A customer-generated ID for this transaction. The response simply echoes the value provided for this parameter. Example: `CustomExternalID7349`. |
| `originating_ip` | string |  | Your end user's IP address (do not send your own IP address). IPv4 and IPv6 are supported. For IPv4, the value must be in the format defined by the Internet Engineering Task Force (IETF) in the Internet-Draft document titled [Internet Protocol](https://tools.ietf.org/html/rfc791). For IPv6, the value must be in the format defined by the IETF in the Internet-Draft document titled [IP Version 6 Addressing Architecture](https://tools.ietf.org/html/rfc4291#section-2.2). Example: `203.0.113.45`. |
| `addons` | object |  | Indicates which identity attributes you want to use with this request and contains any other inputs for use with those identity attributes. |
| `addons.age_verify` | object |  | Includes the Age Verify identity attribute in processing your request. Pass an empty object to use the minimum legal age of the country as the age threshold. See [Phone ID - Identity signals: Age Verify](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-age-verify) for more details on how to use this feature. |
| `addons.age_verify.age_threshold` | integer |  | Sets a custom age threshold. If the age of the subscriber of the phone number is equal to or greater than this value, the service returns true. WARNING: Do not use this feature without first confirming with the [Telesign Customer Support Team](mailto:support@telesign.com) that the countries you intend to use it with are supported! If you use this parameter for a country that is not supported, you may get incorrect results. Example: `21`. |
| `addons.active_call_status` | object |  | Includes the Active Call Status identity attribute in processing your request. The value should always be an empty object. See [Phone ID - Identity attributes: Active Call Status](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-active-call-status) for more details on how to use this feature. |
| `addons.breached_number_check` | object |  | Includes the Breached Data identity attribute in processing your request. See [Phone ID - Identity attributes: Breached Data](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-breached-data) for more details on on how to use this feature. |
| `addons.call_forward_detection` | object |  | Includes the Call Forwarding identity attribute in processing your request. The value should always be an empty object.  See [Phone ID - Identity attributes: Call Forwarding](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-call-forwarding) for more details on how to use this feature. |
| `addons.contact` | object |  | Includes the Contact identity attribute in processing your request. See [Phone ID - Identity attributes: Contact](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-contact) for more details on how to use this feature. |
| `addons.contact.email` | string |  | Email address given by the end user, to compare with the email associated with the number (Email ID feature: full-service accounts, limited markets). |
| `addons.contact_match` | object |  | Includes the Contact Match identity attribute in processing your request. See [Phone ID - Identity attributes: Contact Match](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-contact-match) for more details on how to use this feature. |
| `addons.contact_match.first_name` | string |  | The first name of the contact you want a match for. |
| `addons.contact_match.last_name` | string |  | The last name of the contact you want a match for. |
| `addons.contact_match.address` | string |  | The first line of the address you want to match for. By first line, the line containing the street is meant. |
| `addons.contact_match.city` | string |  | The city for the address you want a match for. |
| `addons.contact_match.postal_code` | string |  | The postal/zip code for the address you want a match for. The first five digits only. |
| `addons.contact_match.state` | string |  | The state for the address you want a match for. |
| `addons.contact_match.country` | string |  | The country for the address you want a match for. |
| `addons.contact_match.email` | string |  | Email address given by the end user, to match against the email on record (Email ID feature). |
| `addons.contact_match.date_of_birth` | string |  | Date of birth given by the end user, to match against the record. Example: `1954-01-06T00:00:00Z`. |
| `addons.number_deactivation` | object |  | Includes the Number Deactivation identity attribute in processing your request. See [Phone ID - Identity signals: Number Deactivation](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-number-deactivation) for more details on how to use this feature. |
| `addons.number_deactivation.last_verified` | string |  | Date and time you last verified this number, in ISO 8601 format. When included, the response reports whether the number has been recycled since then. Example: `2018-04-05T00:00:00Z`. |
| `addons.subscriber_status` | object |  | Includes the Subscriber Status identity attribute in processing your request. The value should always be an empty object. See [Phone ID - Identity signals: Subscriber Status](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-subscriber-status) for more details on how to use this feature. |
| `addons.porting_history` | object |  | Includes the Porting History add-on in processing your request. The value should always be an empty object. See [Phone ID - Identity signals: Porting History](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-porting-history) for more details on how to use this feature. |
| `addons.porting_history.past_x_days` | integer |  | How many days back the service will go to check for whether the phone number was ported. Example: `10`. |
| `addons.porting_status` | object |  | Includes the Porting Status identity attribute in processing your request. The value should always be an empty object. See [Phone ID - Identity signals: Porting Status](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-porting-status) for more details on how to use this feature. |
| `addons.sim_swap` | object |  | Includes the SIM Swap identity attribute in processing your request. The value should always be an empty object. See [Phone ID - Identity signals: SIM Swap](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-sim-swap) for more details on how to use this feature. |
| `consent` | object |  | A record of how and when you obtained consent to query this phone number. This is required for some add-ons. |
| `consent.method` | integer enum |  | A numeric code indicating how you collected consent to query this phone number. If you do not include this property, the default value recorded is `1`. *  `1` = Terms and conditions (TCO) *  `2` = Mobile app (MA) *  `3` = SMS *  `4` = OTHER Allowed: `1`, `2`, `3`, `4`. Default: `1`. |
| `consent.timestamp` | string |  | A timestamp indicating the date and time when you collected consent to query this phone number. Example: `2018-05-05T00:00:00Z`. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                      |
|-------------|------------------------|--------------------------------------------------|
| 300         | Transaction successfully completed            | The system was able to obtain all of the requested data for Phone ID.                      |
| 301         | Transaction partially completed | The system was able to obtain some of the data for Phone ID, but not all of it.                  |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

  | Status Code | Associated Text String |
  |-------------|------------------------|
  | 10032       | Request blocked due to this number appearing on a Telesign blocklist. |
  | 10033       | Unverified phone_number requested for trial account.              |
  | 10041       | Blocked due to legal compliance              |
  | 11000       | Invalid value for parameter phone_number |
  | 11001       | Invalid country code for parameter phone_number           |
  | 11003       | Invalid value for parameter account_lifecycle_event |
  | 11005       | Invalid value for parameter customer_id  |
  | 11010       | Invalid value for parameter originating_ip         |
  | 11011       | Invalid value for parameter reference_id |
  | 12000       | Missing required parameter phone_number |

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

**HTTP 500**

**Invalid Transaction.** Transaction not attempted.

**HTTP 503**

**Service Unavailable.** System unavailable, try again.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A 32-digit hex value used to identify the web service requests. The value is unique to each web service request, is randomly generated by Telesign, and is returned in the response message immediately following the web service request. Example: `F0123456789ABCDEF0123456789ABCDE`. |
| `phone_type` | object |  |  |
| `phone_type.code` | string |  | One of the [phone type codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-codes). Example: `1`. |
| `phone_type.override_reason` | string |  | Text describing the [phone type override](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-override-reason-codes) status of this phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `Non SMS-enabled Phone Number`. |
| `phone_type.description` | string |  | Text describing the phone type. Example: `FIXED_LINE`. |
| `phone_type.override_reason_id` | integer |  | A numeric code specifying the [phone type override](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-override-reason-codes) status of this phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `11`. |
| `blocklisting` | object |  | Contains details about whether the number was blocked and who requested the block. Contact our [Customer Support Team](mailto:support@telesign.com) to include this package in your response. |
| `blocklisting.block_code` | integer |  | A code indicating whether the number is blocked, and who blocked it. `0` for not blocked, `1` for blocked by TeleSign, `2` for block requested by your organization, `3` for block requested by your account or set by TeleSign on behalf of your account, and `4` if the block state is unknown. Example: `0`. |
| `blocklisting.block_description` | string |  | Text explaining the block status. Example: `Not blocked`. |
| `blocklisting.blocked` | boolean |  | If `true`, this number is blocked. If `false`, this number is not blocked. |
| `status` | object |  | Contains details about the status of your request. |
| `status.code` | integer |  | A numeric code indicating the processing status of the transaction. Example: `300`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Transaction successfully completed`. |
| `status.updated_on` | string |  | An <a href="http://www.ietf.org/rfc/rfc3339.txt">RFC 3339</a> timestamp indicating when the transaction status was updated. Example: `2024-10-03T14:51:28.709526Z`. |
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
| `age_verify` | object |  | Contains properties related to the use of the Age Verify identity attribute for this request. |
| `age_verify.age_verified` | boolean |  | If `true`, the subscriber's age is equal to or greater than the threshold used for this request. This property only appears if this identity attribute processed successfully. Default: `true`. |
| `age_verify.status` | object |  | Contains properties related to this identity attribute's processing status for this request. |
| `age_verify.status.code` | integer |  | A numeric code indicating this identity attribute's processing status for this request. Go to the Status Codes section on [Phone ID - Get started with identity attributes](https://developer.telesign.com/enterprise/docs/phone-id-get-started-with-identity-attributes) Example: `2800`. |
| `age_verify.status.description` | string |  | Text describing this add-on's status for processing this request. Go to the Status Codes section on [Phone ID - Get started with identity attributes](https://developer.telesign.com/enterprise/docs/phone-id-get-started-with-identity-attributes) for a full list of possible values. Example: `Request successfully completed`. |
| `active_call_status` | object |  | Contains properties related to the Active Call Status identity attribute. |
| `active_call_status.is_call_active` | boolean |  | Indicates whether the end user is engaged in an ongoing call. Returns `True` if the call is active and `False` if the call is inactive. |
| `active_call_status.call_duration` | integer |  | The duration of an ongoing call in seconds. The parameter is `None` if the call is inactive. Example: `120`. |
| `active_call_status.call_direction` | string |  | If the call is active, returns either `called` or `calling`, depending on who initiated the call. The parameter is `None` if the call is inactive. Example: `called`. |
| `active_call_status.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `active_call_status.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `active_call_status.status.description` | string |  | A brief description telling you what the code means. 2800 - Request successfully completed. 2801 - Invalid request add-on parameter: {parameter_name}. 2802 - active_call_status add-on temporarily unavailable. 2803 - Phone number out of active_call_status add-on coverage. 2804 - Phone number not applicable in active_call_status add-on. 2805 - No active_call_status add-on information for phone_number. 2806 - active_call_status add-on is not enabled. 2807 - Some parameters submitted in the request are not valid. 2810 - Request process failed during data collection. 2811 - Request processing timeout. Example: `Request successfully completed.`. |
| `breached_number_check` | object |  | Contains properties related to the use of the Breached Data identity attribute for this request. See [Phone ID - Identity attributes: Breached Data](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-breached-data) for more details on on how to use this feature. |
| `breached_number_check.phone_number_breached` | boolean |  | Returns `true` if the phone number was breached and `false` if the phone number wasn't breached. |
| `breached_number_check.breach_date` | string |  | The date when the breach occurred; this is returned by the data provider. Returns `null` if a breach isn't found. Example: `2024-05-25T00:00:00Z`. |
| `breached_number_check.breached_data` | array of string |  | Lists each [data type that was breached](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-breached-data#breached-data-types). Returns `null` if a breach isn't found. |
| `breached_number_check.status` | object |  | Contains details about the delivery status of this package. |
| `breached_number_check.status.code` | integer |  | A status or error code describing what happened after your request. Example: `2800`. |
| `breached_number_check.status.description` | string |  | A brief description of what the error or status code means. Example: `Request successfully completed.`. |
| `call_forward_detection` | object |  | Contains call forwarding status details for this phone number. Only present if you included the flag for the Call Forward Detection add-on in your request and Telesign has enabled this add-on for your account. |
| `call_forward_detection.call_forward_enabled` | string |  | Whether this phone number has call forwarding enabled. * `"true"` = It is enabled. * `"false"` = It is not enabled. |
| `call_forward_detection.call_forward_type` | string enum |  | The type of call forwarding enabled for this phone number. Conditional forwarding causes incoming calls to go to another phone line only when the initial destination phone number cannot be reached. Allowed: `conditional`, `None`, `unconditional`. Example: `conditional`. |
| `call_forward_detection.call_forward_condition` | string enum |  | The conditions under which calls will be forwarded for this number. If the phone number uses unconditional call forwarding or has no call forwarding at all, the value will be `"None"`. Allowed: `busy`, `unanswered`, `unreachable`, `None`. Example: `busy`. |
| `call_forward_detection.status` | object |  |  |
| `call_forward_detection.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `call_forward_detection.status.description` | string |  | A short description of the processing status for this identity attribute. Example: `Request successfully completed.`. |
| `carrier` | object |  | Contains details about the company that provides telecommunications services for this phone number. Behavior of this property, including information returned for ported phone numbers, can vary depending on the country of the phone number. See [How does carrier data vary by country?](https://support.telesign.com/s/article/How-does-carrier-data-vary-by-country) for more details. |
| `carrier.carrier_id` | integer |  | An ID specifying this carrier. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `309`. |
| `carrier.name` | string |  | The name of this carrier. Example: `AT&T Wireless`. |
| `carrier.mcc` | string |  | Mobile country code (MCC) associated with the specified phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `724`. |
| `carrier.mnc` | string |  | Mobile network code (MNC) associated with the specified phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `05`. |
| `contact` | object |  | Contains contact information for this phone number. You will only see this in your response if you used the associated identity attribute (Contact) and Telesign has enabled it for your account. See *[Phone ID - Identity signals: Contact](doc:phone-id-identity-attributes-contact)* for more details. |
| `contact.address1` | string |  | The name of the street in the address of the subscriber. Example: `2432 CHIMNEY POINT LN`. |
| `contact.address2` | string |  | Unit or suite number in the address of the subscriber. |
| `contact.address3` | string |  | Town, city, or state in the address of the subscriber. |
| `contact.address4` | string |  | Postal code in the address of the subscriber. |
| `contact.city` | string |  | The city in the address of the subscriber. Example: `LEXINGTON`. |
| `contact.country` | string |  | The country in the address of the subscriber. Example: `US`. |
| `contact.date_of_birth` | string |  | The date of birth of the subscriber, in a <a href="http://www.ietf.org/rfc/rfc3339.txt">RFC 3339</a> format. This property is not returned by default; to request addition of this property contact our [Customer Support Team](mailto:support@telesign.com). Example: `1954-01-06T00:00:00Z`. |
| `contact.email_address` | string |  | Email address of the owner of the phone number. Example: `jsmith@vero-finto.com`. |
| `contact.first_name` | string |  | The first name of the subscriber. Example: `MYLA`. |
| `contact.id` | string |  | The unique government-issued ID for this subscriber. This property is not returned by default and is only available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) to obtain the latest information on supported markets and to add this property to your account. Example: `300206845`. |
| `contact.last_name` | string |  | The last name of the subscriber. Example: `JONES`. |
| `contact.state_province` | string |  | State or province in the address of the subscriber. Example: `KY`. |
| `contact.zip_postal_code` | string |  | Postal code in the address of the subscriber. Example: `40509`. |
| `contact.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `contact.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `contact.status.description` | string |  | A brief description telling you what the code means.   2800 - Request successfully completed.  2801 - Invalid Request addons parameter {parameter_name}  2802 - number_deactivation add-on temporarily unavailable    2803 - Phone number out of number_deactivation add-on coverage.   2804 - Phone number not applicable in number_deactivation add-on.   2805 - No number_deactivation add-on information for phone_number.   2806 - number_deactivation add-on is not enabled.   2807 - Some parameters submitted in the request are not valid. Example: `Request successfully completed`. |
| `contact_match` | object |  | Contains contact match information for this phone number. Only present if you included the flag for Contact Match in your request and Telesign has enabled this identity attribute for your account. |
| `contact_match.address_score` | integer |  | A score from 0-100 showing you how close a match the address information you sent is to what is on file. It is recommended that scores greater than or equal to 80 be considered a 'pass' meaning it is enough of a match for validation. If you receive a score of -1 it means the match was not available. Example: `100`. |
| `contact_match.first_name_score` | integer |  | A score from 0-100 showing you how close a match the first name information you sent is to what is on file. It is recommended that scores greater than or equal to 80 be considered a 'pass' meaning it is enough of a match for validation. If you receive a score of -1 it means the match was not available. Example: `100`. |
| `contact_match.last_name_score` | integer |  | A score from 0-100 showing you how close a match the last name information you sent is to what is on file. It is recommended that scores greater than or equal to 80 be considered a 'pass' meaning it is enough of a match for validation. If you receive a score of -1 it means the match was not available. Example: `100`. |
| `contact_match.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `contact_match.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `contact_match.status.description` | string |  | A brief description telling you what the code means.   2800 - Request successfully completed.  2801 - Invalid Request addons parameter {parameter_name}  2802 - number_deactivation add-on temporarily unavailable    2803 - Phone number out of number_deactivation add-on coverage.   2804 - Phone number not applicable in number_deactivation add-on.   2805 - No number_deactivation add-on information for phone_number.   2806 - number_deactivation add-on is not enabled.   2807 - Some parameters submitted in the request are not valid. Example: `Request successfully completed.`. |
| `number_deactivation` | object |  | Contains properties related to the Number Deactivation identity attribute. |
| `number_deactivation.carrier_name` | string |  | The name of the carrier most recently associated with the number. Example: `Verizon`. |
| `number_deactivation.last_deactivated` | string |  | If the number was deactivated, this displays the date that it was last deactivated. Example: `2018-04-06T00:00:00Z`. |
| `number_deactivation.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `number_deactivation.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `number_deactivation.status.description` | string |  | A brief description telling you what the code means.   2800 - Request successfully completed.  2801 - Invalid Request addons parameter {parameter_name}  2802 - number_deactivation add-on temporarily unavailable    2803 - Phone number out of number_deactivation add-on coverage.   2804 - Phone number not applicable in number_deactivation add-on.   2805 - No number_deactivation add-on information for phone_number.   2806 - number_deactivation add-on is not enabled.   2807 - Some parameters submitted in the request are not valid. Example: `Request successfully completed`. |
| `number_deactivation.tracking_since` | string |  | Example: `2014-10-06T00:00:00Z`. |
| `number_deactivation.recycled_since_last_verification` | string enum |  | Allowed: `recycled`, `not_recycled`, `cannot_be_determined`. |
| `subscriber_status` | object |  | Contains properties related to the Subscriber Status identity attribute. |
| `subscriber_status.account_activation_date` | string |  | The date the account first became active. Example: `2024-05-08`. |
| `subscriber_status.account_type` | string |  | Example: `individual`. |
| `subscriber_status.account_tenure_max` | integer |  | The maximum amount of time in months the subscriber may have had their account. Coverage - All phone types. Available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) for additional information. Example: `6`. |
| `subscriber_status.account_tenure_min` | integer |  | The minimum amount of time in months the subscriber may have had their account. Example: `3`. |
| `subscriber_status.primary_account_holder` | boolean |  | Whether the phone number is the primary phone number of the account. Coverage - Mobile phones. Available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) for additional information. |
| `subscriber_status.account_status` | string |  | A string indicating whether an account is 'active' or 'suspended' or 'deactivated'. Coverage - All phone types. Available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) for additional information. Example: `active`. |
| `subscriber_status.contract_type` | string |  | Indicates whether an account is 'postpaid' (an account where service is provided by prior arrangement with a mobile network operator, and the subscriber pays at the end of each month) or 'prepaid' (an account where the subscriber pays for the service up front). Coverage - All phone types. Available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) for additional information. Example: `postpaid`. |
| `subscriber_status.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `subscriber_status.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. |
| `subscriber_status.status.description` | string |  | A brief description telling you what the code means. 2800 - Request successfully completed. 2801 - Invalid request add-on parameter: {parameter_name}. 2802 - subscriber_status add-on temporarily unavailable. 2803 - Phone number out of subscriber_status add-on coverage. 2804 - Phone number not applicable in subscriber_status add-on. 2805 - No subscriber_status add-on information for phone_number. 2806 - subscriber_status add-on is not enabled. 2807 - Some parameters submitted in the request are not valid. |
| `porting_history` | object |  | Contains porting history information for this phone number. Only present if you included the flag for the Porting History identity attribute in your request and Telesign has enabled this add-on for your account. |
| `porting_history.carrier_current` | string |  | The name of the current carrier for the phone number you provided. Example: `Sprint Spectrum, L.P.`. |
| `porting_history.carrier_previous` | string |  | The name of the carrier before the phone number was ported to the new carrier. Example: `US Cellular Corp.`. |
| `porting_history.mcc_carrier_current` | string |  | The mobile country code for the current carrier. This field can include multiple values for MCC. Example: `310`. |
| `porting_history.mcc_carrier_previous` | string |  | The mobile country code for the previous carrier. This field can include multiple values for MCC. Example: `310`. |
| `porting_history.mnc_carrier_current` | string |  | The mobile network code for the current carrier. This field can include multiple values for MNC. Example: `120`. |
| `porting_history.mnc_carrier_previous` | string |  | The mobile network code for the previous carrier. This field can include multiple values for MNC. Example: `160`. |
| `porting_history.phone_type_current` | string |  | The phone type currently associated with the phone number. Example: `MOBILE`. |
| `porting_history.phone_type_previous` | string |  | The phone type previously associated with the phone number. Example: `MOBILE`. |
| `porting_history.port_date` | string |  | The date the phone number was ported to a new carrier. Example: `2018-08-26T16:33:19Z`. |
| `porting_history.number_of_portings` | string |  | The number of times the phone number was ported during the time window you specified with `past_x_days` in your request. Example: `1`. |
| `porting_history.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `porting_history.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `porting_history.status.description` | string |  | A short description of the processing status for this identity attribute. Example: `Request successfully completed`. |
| `porting_status` | object |  | Contains porting status information for this phone number. Only present if you included the flag for the Porting Status identity attribute in your request and Telesign has enabled this add-on for your account. |
| `porting_status.mcc_current` | string |  | The mobile country code (MCC) for the current carrier associated with the device. The MNC is used in conjunction with the MCC to uniquely identify a carrier. Example: `310`. |
| `porting_status.mnc_current` | string |  | The mobile network code (MNC) for the current carrier associated with the device. The MNC is used in conjunction with the MCC to uniquely identify a carrier. Example: `01`. |
| `porting_status.ported` | boolean |  | Indicates whether the number was ported. |
| `porting_status.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `porting_status.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `porting_status.status.description` | string |  | A short description of the processing status for this identity attribute. Example: `Request successfully completed`. |
| `sim_swap` | object |  | Contains SIM swap information for this phone number. Only present if you included the flag for the SIM Swap identity attribute in your request and Telesign has enabled this add-on for your account. |
| `sim_swap.swap_date` | string |  | If the number has been sim swapped, the date and time of the swap appears here. Example: `2018-09-05T00:00:00Z`. |
| `sim_swap.swap_time` | string |  | If the number has been sim swapped, this field indicates at what time the swap occurred. Example: `00:00:00`. |
| `sim_swap.risk_indicator` | string |  | Telesign's assessment for how likely it is that a swap was carried out for a fraudulent purpose. The response is a number 1-4. 1 - (very low) swap did not occur or it occurred in the last 15+ days. 2 - (low) swap occurred some time between the last 3 and 14 days. 3 - (medium) swap occurred in the last 72 hours. 4 - (high) swap occurred same day. Example: `1`. |
| `sim_swap.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `sim_swap.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `sim_swap.status.description` | string |  | A short description of the processing status for this identity attribute. Example: `Request successfully completed`. |
| `external_id` | string |  | The customer-generated ID for this transaction that was provided in the request. If the `external_id` parameter was not included in the request, the value here is `null`. Example: `CustomExternalID7349`. |

### Example response (200)

```json
{
  "reference_id": "F0123456789ABCDEF0123456789ABCDE",
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
  "status": {
    "code": 300,
    "description": "Transaction successfully completed",
    "updated_on": "2015-10-03T14:51:28.709526Z"
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
  "location": {
    "city": "Odessa",
    "county": "Ector",
    "state": "TX",
    "zip": "79758",
    "country": {
      "iso2": "US",
      "iso3": "USA",
      "name": "United States"
    },
    "time_zone": {
      "name": "America/Chicago",
      "utc_offset_max": "-6",
      "utc_offset_min": "-6"
    },
    "coordinates": {
      "latitude": 31.8466,
      "longitude": -102.36778
    },
    "metro_code": "36220"
  },
  "carrier": {
    "carrier_id": 0,
    "name": "Verizon",
    "mcc": "724",
    "mnc": "05"
  },
  "age_verify": {
    "age_verified": true,
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "active_call_status": {
    "is_call_active": true,
    "call_duration": 120,
    "call_direction": "called",
    "status": {
      "code": 2800,
      "description": "Request successfully completed."
    }
  },
  "breached_number_check": {
    "phone_number_breached": true,
    "breach_date": "2017-05-25T00:00:00Z",
    "breached_data": [
      "username",
      "password",
      "email"
    ],
    "status": {
      "code": 2800,
      "description": "Request successfully completed."
    }
  },
  "call_forward_detection": {
    "call_forward_enabled": "true",
    "call_forward_type": "conditional",
    "call_forward_condition": "busy",
    "status": {
      "code": 2800,
      "description": "Request successfully completed."
    }
  },
  "contact": {
    "address1": "2432 CHIMNEY POINT LN",
    "address2": "string",
    "address3": "string",
    "address4": "string",
    "city": "LEXINGTON",
    "country": "US",
    "date_of_birth": "1958-01-01T00:00:00Z",
    "email_address": "jsmith@vero-finto.com",
    "first_name": "MYLA",
    "id": "300206845",
    "last_name": "JONES",
    "state_province": "KY",
    "zip_postal_code": "40509",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "contact_match": {
    "address_score": 100,
    "first_name_score": 100,
    "last_name_score": 100,
    "status": {
      "code": 2800,
      "description": "Request successfully completed."
    }
  },
  "number_deactivation": {
    "carrier_name": "Verizon",
    "last_deactivated": "2018-04-06T00:00:00Z",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    },
    "tracking_since": "2014-10-06T00:00:00Z",
    "recycled_since_last_verification": "recycled"
  },
  "subscriber_status": {
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    },
    "account_activation_date": "2017-05-08T00:00:00Z",
    "account_type": "individual",
    "account_tenure_max": 6,
    "account_tenure_min": 3,
    "primary_account_holder": true,
    "account_status": "active",
    "contract_type": "postpaid"
  },
  "porting_history": {
    "carrier_current": "Sprint Spectrum, L.P.",
    "carrier_previous": "US Cellular Corp.",
    "mcc_carrier_current": "310",
    "mcc_carrier_previous": "310",
    "mnc_carrier_current": "120",
    "mnc_carrier_previous": "160",
    "phone_type_current": "MOBILE",
    "phone_type_previous": "MOBILE",
    "port_date": "2018-08-26T16:33:19Z",
    "number_of_portings": "1",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "porting_status": {
    "mcc_current": "310",
    "mnc_current": "01",
    "ported": true,
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "sim_swap": {
    "swap_date": "2018-09-05T00:00:00Z",
    "swap_time": "00:00:00",
    "risk_indicator": "1",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "external_id": "CustomExternalID7349"
}
```


---

## Request info about a phone number

**MCP tool:** `phoneid_get_info_private`

```http
POST https://rest-ww.telesign.com/v1/phoneid
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/submitphonenumberforidentityalt> (updated 2026-09-11)

Enter a phone number with country code to receive detailed information about carrier, location, and other details.

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
| `phone_number` | string | yes | The phone number you want to collect information about. Provide the entire phone number, including the country code, with no spaces or special characters. Example: `11234567890`. |
| `account_lifecycle_event` | string |  | Indicates what stage an end user is in when you make this request. Acceptable values for this parameter are: * `create` - For the creation of a new account. * `sign-in` - For when an end user signs in to their account. * `transact` - For when an end user completes a transaction within their account. * `update` - For when an update is performed, such as an update of account information. * `delete` - For when an account is deleted. Example: `create`. |
| `external_id` | string |  | A customer-generated ID for this transaction. The response simply echoes the value provided for this parameter. Example: `CustomExternalID7349`. |
| `originating_ip` | string |  | Your end user's IP address (do not send your own IP address). IPv4 and IPv6 are supported. For IPv4, the value must be in the format defined by the Internet Engineering Task Force (IETF) in the Internet-Draft document titled [Internet Protocol](https://tools.ietf.org/html/rfc791). For IPv6, the value must be in the format defined by the IETF in the Internet-Draft document titled [IP Version 6 Addressing Architecture](https://tools.ietf.org/html/rfc4291#section-2.2). Example: `203.0.113.45`. |
| `addons` | object |  | Indicates which identity attributes you want to use with this request and contains any other inputs for use with those identity attributes. |
| `addons.age_verify` | object |  | Includes the Age Verify identity attribute in processing your request. Pass an empty object to use the minimum legal age of the country as the age threshold. See [Phone ID - Identity signals: Age Verify](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-age-verify) for more details on how to use this feature. |
| `addons.age_verify.age_threshold` | integer |  | Sets a custom age threshold. If the age of the subscriber of the phone number is equal to or greater than this value, the service returns true. WARNING: Do not use this feature without first confirming with the [Telesign Customer Support Team](mailto:support@telesign.com) that the countries you intend to use it with are supported! If you use this parameter for a country that is not supported, you may get incorrect results. Example: `21`. |
| `addons.active_call_status` | object |  | Includes the Active Call Status identity attribute in processing your request. The value should always be an empty object. See [Phone ID - Identity attributes: Active Call Status](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-active-call-status) for more details on how to use this feature. |
| `addons.breached_number_check` | object |  | Includes the Breached Data identity attribute in processing your request. See [Phone ID - Identity attributes: Breached Data](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-breached-data#breached-data-types) for more details on how to use this feature. |
| `addons.call_forward_detection` | object |  | Includes the Call Forwarding identity attribute in processing your request. The value should always be an empty object.  See [Phone ID - Identity attributes: Call Forwarding](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-call-forwarding) for more details on how to use this feature. |
| `addons.contact` | object |  | Includes the Contact identity attribute in processing your request. See [Phone ID - Identity attributes: Contact](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-contact) for more details on how to use this feature. |
| `addons.contact.email` | string |  | Email address given by the end user, to compare with the email associated with the number (Email ID feature: full-service accounts, limited markets). |
| `addons.contact_match` | object |  | Includes the Contact Match identity attribute in processing your request. See [Phone ID - Identity attributes: Contact Match](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-contact-match) for more details on how to use this feature. |
| `addons.contact_match.first_name` | string |  | The first name of the contact you want a match for. |
| `addons.contact_match.last_name` | string |  | The last name of the contact you want a match for. |
| `addons.contact_match.address` | string |  | The first line of the address you want to match for. By first line, the line containing the street is meant. |
| `addons.contact_match.city` | string |  | The city for the address you want a match for. |
| `addons.contact_match.postal_code` | string |  | The postal/zip code for the address you want a match for. The first five digits only. |
| `addons.contact_match.state` | string |  | The state for the address you want a match for. |
| `addons.contact_match.country` | string |  | The country for the address you want a match for. |
| `addons.contact_match.email` | string |  | Email address given by the end user, to match against the email on record (Email ID feature). |
| `addons.contact_match.date_of_birth` | string |  | Date of birth given by the end user, to match against the record. Example: `1954-01-06T00:00:00Z`. |
| `addons.number_deactivation` | object |  | Includes the Number Deactivation identity attribute in processing your request. See [Phone ID - Identity signals: Number Deactivation](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-number-deactivation) for more details on how to use this feature. |
| `addons.number_deactivation.last_verified` | string |  | Date and time you last verified this number, in ISO 8601 format. When included, the response reports whether the number has been recycled since then. Example: `2018-04-05T00:00:00Z`. |
| `addons.subscriber_status` | object |  | Includes the Subscriber Status identity attribute in processing your request. The value should always be an empty object. See [Phone ID - Identity signals: Subscriber Status](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-subscriber-status) for more details on how to use this feature. |
| `addons.porting_history` | object |  | Includes the Porting History add-on in processing your request. The value should always be an empty object. See [Phone ID - Identity signals: Porting History](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-porting-history) for more details on how to use this feature. |
| `addons.porting_history.past_x_days` | integer |  | How many days back the service will go to check for whether the phone number was ported. Example: `10`. |
| `addons.porting_status` | object |  | Includes the Porting Status identity attribute in processing your request. The value should always be an empty object. See [Phone ID - Identity signals: Porting Status](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-porting-status) for more details on how to use this feature. |
| `addons.sim_swap` | object |  | Includes the SIM Swap identity attribute in processing your request. The value should always be an empty object. See [Phone ID - Identity signals: SIM Swap](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-sim-swap) for more details on how to use this feature. |
| `consent` | object |  | A record of how and when you obtained consent to query this phone number. This is required for some add-ons. |
| `consent.method` | integer enum |  | A numeric code indicating how you collected consent to query this phone number. If you do not include this property, the default value recorded is `1`. *  `1` = Terms and conditions (TCO) *  `2` = Mobile app (MA) *  `3` = SMS *  `4` = OTHER Allowed: `1`, `2`, `3`, `4`. Default: `1`. |
| `consent.timestamp` | string |  | A timestamp indicating the date and time when you collected consent to query this phone number. Example: `2018-05-05T00:00:00Z`. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                      |
|-------------|------------------------|--------------------------------------------------|
| 300         | Transaction successfully completed            | The system was able to obtain all of the requested data for Phone ID.                      |
| 301         | Transaction partially completed | The system was able to obtain some of the data for Phone ID, but not all of it.                  |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

  | Status Code | Associated Text String |
  |-------------|------------------------|
  | 10032       | Request blocked due to this number appearing on a Telesign blocklist. |
  | 10033       | Unverified phone_number requested for trial account.              |
  | 10041       | Blocked due to legal compliance              |
  | 11000       | Invalid value for parameter phone_number |
  | 11001       | Invalid country code for parameter phone_number           |
  | 11003       | Invalid value for parameter account_lifecycle_event |
  | 11005       | Invalid value for parameter customer_id  |
  | 11010       | Invalid value for parameter originating_ip         |
  | 11011       | Invalid value for parameter reference_id |
  | 12000       | Missing required parameter phone_number |

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

**HTTP 500**

**Invalid Transaction.** Transaction not attempted.

**HTTP 503**

**Service Unavailable.** System unavailable, try again.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A 32-digit hex value used to identify the web service requests. The value is unique to each web service request, is randomly generated by Telesign, and is returned in the response message immediately following the web service request. Example: `F0123456789ABCDEF0123456789ABCDE`. |
| `phone_type` | object |  |  |
| `phone_type.code` | string |  | One of the [phone type codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-codes). Example: `1`. |
| `phone_type.override_reason` | string |  | Text describing the [phone type override](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-override-reason-codes) status of this phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `Non SMS-enabled Phone Number`. |
| `phone_type.description` | string |  | Text describing the phone type. Example: `FIXED_LINE`. |
| `phone_type.override_reason_id` | integer |  | A numeric code specifying the [phone type override](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-override-reason-codes) status of this phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `11`. |
| `blocklisting` | object |  | Contains details about whether the number was blocked and who requested the block. Contact our [Customer Support Team](mailto:support@telesign.com) to include this package in your response. |
| `blocklisting.block_code` | integer |  | A code indicating whether the number is blocked, and who blocked it. `0` for not blocked, `1` for blocked by TeleSign, `2` for block requested by your organization, `3` for block requested by your account or set by TeleSign on behalf of your account, and `4` if the block state is unknown. Example: `0`. |
| `blocklisting.block_description` | string |  | Text explaining the block status. Example: `Not blocked`. |
| `blocklisting.blocked` | boolean |  | If `true`, this number is blocked. If `false`, this number is not blocked. |
| `status` | object |  | Contains details about the status of your request. |
| `status.code` | integer |  | A numeric code indicating the processing status of the transaction. Example: `300`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Transaction successfully completed`. |
| `status.updated_on` | string |  | An <a href="http://www.ietf.org/rfc/rfc3339.txt">RFC 3339</a> timestamp indicating when the transaction status was updated. Example: `2024-10-03T14:51:28.709526Z`. |
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
| `age_verify` | object |  | Contains properties related to the use of the Age Verify identity attribute for this request. |
| `age_verify.age_verified` | boolean |  | If `true`, the subscriber's age is equal to or greater than the threshold used for this request. This property only appears if this identity attribute processed successfully. Default: `true`. |
| `age_verify.status` | object |  | Contains properties related to this identity attribute's processing status for this request. |
| `age_verify.status.code` | integer |  | A numeric code indicating this identity attribute's processing status for this request. Go to the Status Codes section on [Phone ID - Get started with identity attributes](https://developer.telesign.com/enterprise/docs/phone-id-get-started-with-identity-attributes) Example: `2800`. |
| `age_verify.status.description` | string |  | Text describing this add-on's status for processing this request. Go to the Status Codes section on [Phone ID - Get started with identity attributes](https://developer.telesign.com/enterprise/docs/phone-id-get-started-with-identity-attributes) for a full list of possible values. Example: `Request successfully completed`. |
| `active_call_status` | object |  | Contains properties related to the Active Call Status identity attribute. |
| `active_call_status.is_call_active` | boolean |  | Indicates whether the end user is engaged in an ongoing call. Returns `True` if the call is active and `False` if the call is inactive. |
| `active_call_status.call_duration` | integer |  | The duration of an ongoing call in seconds. The parameter is `None` if the call is inactive. Example: `120`. |
| `active_call_status.call_direction` | string |  | If the call is active, returns either `called` or `calling`, depending on who initiated the call. The parameter is `None` if the call is inactive. Example: `called`. |
| `active_call_status.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `active_call_status.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `active_call_status.status.description` | string |  | A brief description telling you what the code means. 2800 - Request successfully completed. 2801 - Invalid request add-on parameter: {parameter_name}. 2802 - active_call_status add-on temporarily unavailable. 2803 - Phone number out of active_call_status add-on coverage. 2804 - Phone number not applicable in active_call_status add-on. 2805 - No active_call_status add-on information for phone_number. 2806 - active_call_status add-on is not enabled. 2807 - Some parameters submitted in the request are not valid. 2810 - Request process failed during data collection. 2811 - Request processing timeout. Example: `Request successfully completed.`. |
| `breached_number_check` | object |  | Contains properties related to the use of the Breached Data identity attribute for this request. See [Phone ID - Identity attributes: Breached Data](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-breached-data) for more details on on how to use this feature. |
| `breached_number_check.phone_number_breached` | boolean |  | Returns `true` if the phone number was breached and `false` if the phone number wasn't breached. |
| `breached_number_check.breach_date` | string |  | The date when the breach occurred; this is returned by the data provider. Returns `null` if a breach isn't found. Example: `2024-05-25T00:00:00Z`. |
| `breached_number_check.breached_data` | array of string |  | Lists each [data type that was breached](https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-breached-data#breached-data-types). Returns `null` if a breach isn't found. |
| `breached_number_check.status` | object |  | Contains details about the delivery status of this package. |
| `breached_number_check.status.code` | integer |  | A status or error code describing what happened after your request. Example: `2800`. |
| `breached_number_check.status.description` | string |  | A brief description of what the error or status code means. Example: `Request successfully completed.`. |
| `call_forward_detection` | object |  | Contains call forwarding status details for this phone number. Only present if you included the flag for the Call Forward Detection add-on in your request and Telesign has enabled this add-on for your account. |
| `call_forward_detection.call_forward_enabled` | string |  | Whether this phone number has call forwarding enabled. * `"true"` = It is enabled. * `"false"` = It is not enabled. |
| `call_forward_detection.call_forward_type` | string enum |  | The type of call forwarding enabled for this phone number. Conditional forwarding causes incoming calls to go to another phone line only when the initial destination phone number cannot be reached. Allowed: `conditional`, `None`, `unconditional`. Example: `conditional`. |
| `call_forward_detection.call_forward_condition` | string enum |  | The conditions under which calls will be forwarded for this number. If the phone number uses unconditional call forwarding or has no call forwarding at all, the value will be `"None"`. Allowed: `busy`, `unanswered`, `unreachable`, `None`. Example: `busy`. |
| `call_forward_detection.status` | object |  |  |
| `call_forward_detection.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `call_forward_detection.status.description` | string |  | A short description of the processing status for this identity attribute. Example: `Request successfully completed.`. |
| `carrier` | object |  | Contains details about the company that provides telecommunications services for this phone number. Behavior of this property, including information returned for ported phone numbers, can vary depending on the country of the phone number. See [How does carrier data vary by country?](https://support.telesign.com/s/article/How-does-carrier-data-vary-by-country) for more details. |
| `carrier.carrier_id` | integer |  | An ID specifying this carrier. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `309`. |
| `carrier.name` | string |  | The name of this carrier. Example: `AT&T Wireless`. |
| `carrier.mcc` | string |  | Mobile country code (MCC) associated with the specified phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `724`. |
| `carrier.mnc` | string |  | Mobile network code (MNC) associated with the specified phone number. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. Example: `05`. |
| `contact` | object |  | Contains contact information for this phone number. You will only see this in your response if you used the associated identity attribute (Contact) and Telesign has enabled it for your account. See *[Phone ID - Identity signals: Contact](doc:phone-id-identity-attributes-contact)* for more details. |
| `contact.address1` | string |  | The name of the street in the address of the subscriber. Example: `2432 CHIMNEY POINT LN`. |
| `contact.address2` | string |  | Unit or suite number in the address of the subscriber. |
| `contact.address3` | string |  | Town, city, or state in the address of the subscriber. |
| `contact.address4` | string |  | Postal code in the address of the subscriber. |
| `contact.city` | string |  | The city in the address of the subscriber. Example: `LEXINGTON`. |
| `contact.country` | string |  | The country in the address of the subscriber. Example: `US`. |
| `contact.date_of_birth` | string |  | The date of birth of the subscriber, in a <a href="http://www.ietf.org/rfc/rfc3339.txt">RFC 3339</a> format. This property is not returned by default; to request addition of this property contact our [Customer Support Team](mailto:support@telesign.com). Example: `1954-01-06T00:00:00Z`. |
| `contact.email_address` | string |  | Email address of the owner of the phone number. Example: `jsmith@vero-finto.com`. |
| `contact.first_name` | string |  | The first name of the subscriber. Example: `MYLA`. |
| `contact.id` | string |  | The unique government-issued ID for this subscriber. This property is not returned by default and is only available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) to obtain the latest information on supported markets and to add this property to your account. Example: `300206845`. |
| `contact.last_name` | string |  | The last name of the subscriber. Example: `JONES`. |
| `contact.state_province` | string |  | State or province in the address of the subscriber. Example: `KY`. |
| `contact.zip_postal_code` | string |  | Postal code in the address of the subscriber. Example: `40509`. |
| `contact.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `contact.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `contact.status.description` | string |  | A brief description telling you what the code means.   2800 - Request successfully completed.  2801 - Invalid Request addons parameter {parameter_name}  2802 - number_deactivation add-on temporarily unavailable    2803 - Phone number out of number_deactivation add-on coverage.   2804 - Phone number not applicable in number_deactivation add-on.   2805 - No number_deactivation add-on information for phone_number.   2806 - number_deactivation add-on is not enabled.   2807 - Some parameters submitted in the request are not valid. Example: `Request successfully completed`. |
| `contact_match` | object |  | Contains contact match information for this phone number. Only present if you included the flag for Contact Match in your request and Telesign has enabled this identity attribute for your account. |
| `contact_match.address_score` | integer |  | A score from 0-100 showing you how close a match the address information you sent is to what is on file. It is recommended that scores greater than or equal to 80 be considered a 'pass' meaning it is enough of a match for validation. If you receive a score of -1 it means the match was not available. Example: `100`. |
| `contact_match.first_name_score` | integer |  | A score from 0-100 showing you how close a match the first name information you sent is to what is on file. It is recommended that scores greater than or equal to 80 be considered a 'pass' meaning it is enough of a match for validation. If you receive a score of -1 it means the match was not available. Example: `100`. |
| `contact_match.last_name_score` | integer |  | A score from 0-100 showing you how close a match the last name information you sent is to what is on file. It is recommended that scores greater than or equal to 80 be considered a 'pass' meaning it is enough of a match for validation. If you receive a score of -1 it means the match was not available. Example: `100`. |
| `contact_match.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `contact_match.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `contact_match.status.description` | string |  | A brief description telling you what the code means.   2800 - Request successfully completed.  2801 - Invalid Request addons parameter {parameter_name}  2802 - number_deactivation add-on temporarily unavailable    2803 - Phone number out of number_deactivation add-on coverage.   2804 - Phone number not applicable in number_deactivation add-on.   2805 - No number_deactivation add-on information for phone_number.   2806 - number_deactivation add-on is not enabled.   2807 - Some parameters submitted in the request are not valid. Example: `Request successfully completed.`. |
| `number_deactivation` | object |  | Contains properties related to the Number Deactivation identity attribute. |
| `number_deactivation.carrier_name` | string |  | The name of the carrier most recently associated with the number. Example: `Verizon`. |
| `number_deactivation.last_deactivated` | string |  | If the number was deactivated, this displays the date that it was last deactivated. Example: `2018-04-06T00:00:00Z`. |
| `number_deactivation.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `number_deactivation.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `number_deactivation.status.description` | string |  | A brief description telling you what the code means.   2800 - Request successfully completed.  2801 - Invalid Request addons parameter {parameter_name}  2802 - number_deactivation add-on temporarily unavailable    2803 - Phone number out of number_deactivation add-on coverage.   2804 - Phone number not applicable in number_deactivation add-on.   2805 - No number_deactivation add-on information for phone_number.   2806 - number_deactivation add-on is not enabled.   2807 - Some parameters submitted in the request are not valid. Example: `Request successfully completed`. |
| `number_deactivation.tracking_since` | string |  | Example: `2014-10-06T00:00:00Z`. |
| `number_deactivation.recycled_since_last_verification` | string enum |  | Allowed: `recycled`, `not_recycled`, `cannot_be_determined`. |
| `subscriber_status` | object |  | Contains properties related to the Subscriber Status identity attribute. |
| `subscriber_status.account_activation_date` | string |  | The date the account first became active. Example: `2024-05-08`. |
| `subscriber_status.account_type` | string |  | Example: `individual`. |
| `subscriber_status.account_tenure_max` | integer |  | The maximum amount of time in months the subscriber may have had their account. Coverage - All phone types. Available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) for additional information. Example: `6`. |
| `subscriber_status.account_tenure_min` | integer |  | The minimum amount of time in months the subscriber may have had their account. Example: `3`. |
| `subscriber_status.primary_account_holder` | boolean |  | Whether the phone number is the primary phone number of the account. Coverage - Mobile phones. Available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) for additional information. |
| `subscriber_status.account_status` | string |  | A string indicating whether an account is 'active' or 'suspended' or 'deactivated'. Coverage - All phone types. Available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) for additional information. Example: `active`. |
| `subscriber_status.contract_type` | string |  | Indicates whether an account is 'postpaid' (an account where service is provided by prior arrangement with a mobile network operator, and the subscriber pays at the end of each month) or 'prepaid' (an account where the subscriber pays for the service up front). Coverage - All phone types. Available in limited markets. Contact our [Customer Support Team](mailto:support@telesign.com) for additional information. Example: `postpaid`. |
| `subscriber_status.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `subscriber_status.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. |
| `subscriber_status.status.description` | string |  | A brief description telling you what the code means. 2800 - Request successfully completed. 2801 - Invalid request add-on parameter: {parameter_name}. 2802 - subscriber_status add-on temporarily unavailable. 2803 - Phone number out of subscriber_status add-on coverage. 2804 - Phone number not applicable in subscriber_status add-on. 2805 - No subscriber_status add-on information for phone_number. 2806 - subscriber_status add-on is not enabled. 2807 - Some parameters submitted in the request are not valid. |
| `porting_history` | object |  | Contains porting history information for this phone number. Only present if you included the flag for the Porting History identity attribute in your request and Telesign has enabled this add-on for your account. |
| `porting_history.carrier_current` | string |  | The name of the current carrier for the phone number you provided. Example: `Sprint Spectrum, L.P.`. |
| `porting_history.carrier_previous` | string |  | The name of the carrier before the phone number was ported to the new carrier. Example: `US Cellular Corp.`. |
| `porting_history.mcc_carrier_current` | string |  | The mobile country code for the current carrier. This field can include multiple values for MCC. Example: `310`. |
| `porting_history.mcc_carrier_previous` | string |  | The mobile country code for the previous carrier. This field can include multiple values for MCC. Example: `310`. |
| `porting_history.mnc_carrier_current` | string |  | The mobile network code for the current carrier. This field can include multiple values for MNC. Example: `120`. |
| `porting_history.mnc_carrier_previous` | string |  | The mobile network code for the previous carrier. This field can include multiple values for MNC. Example: `160`. |
| `porting_history.phone_type_current` | string |  | The phone type currently associated with the phone number. Example: `MOBILE`. |
| `porting_history.phone_type_previous` | string |  | The phone type previously associated with the phone number. Example: `MOBILE`. |
| `porting_history.port_date` | string |  | The date the phone number was ported to a new carrier. Example: `2018-08-26T16:33:19Z`. |
| `porting_history.number_of_portings` | string |  | The number of times the phone number was ported during the time window you specified with `past_x_days` in your request. Example: `1`. |
| `porting_history.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `porting_history.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `porting_history.status.description` | string |  | A short description of the processing status for this identity attribute. Example: `Request successfully completed`. |
| `porting_status` | object |  | Contains porting status information for this phone number. Only present if you included the flag for the Porting Status identity attribute in your request and Telesign has enabled this add-on for your account. |
| `porting_status.mcc_current` | string |  | The mobile country code (MCC) for the current carrier associated with the device. The MNC is used in conjunction with the MCC to uniquely identify a carrier. Example: `310`. |
| `porting_status.mnc_current` | string |  | The mobile network code (MNC) for the current carrier associated with the device. The MNC is used in conjunction with the MCC to uniquely identify a carrier. Example: `01`. |
| `porting_status.ported` | boolean |  | Indicates whether the number was ported. |
| `porting_status.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `porting_status.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `porting_status.status.description` | string |  | A short description of the processing status for this identity attribute. Example: `Request successfully completed`. |
| `sim_swap` | object |  | Contains SIM swap information for this phone number. Only present if you included the flag for the SIM Swap identity attribute in your request and Telesign has enabled this add-on for your account. |
| `sim_swap.swap_date` | string |  | If the number has been sim swapped, the date and time of the swap appears here. Example: `2018-09-05T00:00:00Z`. |
| `sim_swap.swap_time` | string |  | If the number has been sim swapped, this field indicates at what time the swap occurred. Example: `00:00:00`. |
| `sim_swap.risk_indicator` | string |  | Telesign's assessment for how likely it is that a swap was carried out for a fraudulent purpose. The response is a number 1-4. 1 - (very low) swap did not occur or it occurred in the last 15+ days. 2 - (low) swap occurred some time between the last 3 and 14 days. 3 - (medium) swap occurred in the last 72 hours. 4 - (high) swap occurred same day. Example: `1`. |
| `sim_swap.status` | object |  | Contains properties related to the processing status for this identity attribute. |
| `sim_swap.status.code` | integer |  | A numeric code indicating the processing status for this identity attribute. Example: `2800`. |
| `sim_swap.status.description` | string |  | A short description of the processing status for this identity attribute. Example: `Request successfully completed`. |
| `external_id` | string |  | The customer-generated ID for this transaction that was provided in the request. If the `external_id` parameter was not included in the request, the value here is `null`. Example: `CustomExternalID7349`. |

### Example response (200)

```json
{
  "reference_id": "F0123456789ABCDEF0123456789ABCDE",
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
  "status": {
    "code": 300,
    "description": "Transaction successfully completed",
    "updated_on": "2015-10-03T14:51:28.709526Z"
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
  "location": {
    "city": "Odessa",
    "county": "Ector",
    "state": "TX",
    "zip": "79758",
    "country": {
      "iso2": "US",
      "iso3": "USA",
      "name": "United States"
    },
    "time_zone": {
      "name": "America/Chicago",
      "utc_offset_max": "-6",
      "utc_offset_min": "-6"
    },
    "coordinates": {
      "latitude": 31.8466,
      "longitude": -102.36778
    },
    "metro_code": "36220"
  },
  "carrier": {
    "carrier_id": 0,
    "name": "Verizon",
    "mcc": "724",
    "mnc": "05"
  },
  "age_verify": {
    "age_verified": true,
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "active_call_status": {
    "is_call_active": true,
    "call_duration": 120,
    "call_direction": "called",
    "status": {
      "code": 2800,
      "description": "Request successfully completed."
    }
  },
  "breached_number_check": {
    "phone_number_breached": true,
    "breach_date": "2017-05-25T00:00:00Z",
    "breached_data": [
      "username",
      "password",
      "email"
    ],
    "status": {
      "code": 2800,
      "description": "Request successfully completed."
    }
  },
  "call_forward_detection": {
    "call_forward_enabled": "true",
    "call_forward_type": "conditional",
    "call_forward_condition": "busy",
    "status": {
      "code": 2800,
      "description": "Request successfully completed."
    }
  },
  "contact": {
    "address1": "2432 CHIMNEY POINT LN",
    "address2": "string",
    "address3": "string",
    "address4": "string",
    "city": "LEXINGTON",
    "country": "US",
    "date_of_birth": "1958-01-01T00:00:00Z",
    "email_address": "jsmith@vero-finto.com",
    "first_name": "MYLA",
    "id": "300206845",
    "last_name": "JONES",
    "state_province": "KY",
    "zip_postal_code": "40509",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "contact_match": {
    "address_score": 100,
    "first_name_score": 100,
    "last_name_score": 100,
    "status": {
      "code": 2800,
      "description": "Request successfully completed."
    }
  },
  "number_deactivation": {
    "carrier_name": "Verizon",
    "last_deactivated": "2018-04-06T00:00:00Z",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    },
    "tracking_since": "2014-10-06T00:00:00Z",
    "recycled_since_last_verification": "recycled"
  },
  "subscriber_status": {
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    },
    "account_activation_date": "2017-05-08T00:00:00Z",
    "account_type": "individual",
    "account_tenure_max": 6,
    "account_tenure_min": 3,
    "primary_account_holder": true,
    "account_status": "active",
    "contract_type": "postpaid"
  },
  "porting_history": {
    "carrier_current": "Sprint Spectrum, L.P.",
    "carrier_previous": "US Cellular Corp.",
    "mcc_carrier_current": "310",
    "mcc_carrier_previous": "310",
    "mnc_carrier_current": "120",
    "mnc_carrier_previous": "160",
    "phone_type_current": "MOBILE",
    "phone_type_previous": "MOBILE",
    "port_date": "2018-08-26T16:33:19Z",
    "number_of_portings": "1",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "porting_status": {
    "mcc_current": "310",
    "mnc_current": "01",
    "ported": true,
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "sim_swap": {
    "swap_date": "2018-09-05T00:00:00Z",
    "swap_time": "00:00:00",
    "risk_indicator": "1",
    "status": {
      "code": 2800,
      "description": "Request successfully completed"
    }
  },
  "external_id": "CustomExternalID7349"
}
```


---

## Get Live Status info

**MCP tool:** `phoneid_live_status`

```http
GET https://rest-ww.telesign.com/v1/phoneid/live/{complete_phone_number}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/submitphonenumberforlivestatus> (updated 2026-09-11)

Use this action to get insights about a phone number such as whether it is active or disconnected, whether its associated device is reachable or unreachable, and its associated device's roaming status.

To add this product to your account, [contact a Telesign expert](https://www.telesign.com/contact-sales?utm_campaign=contact%20sales%20form&utm_source=developer_portal&utm_medium=Referrer&utm_content=pid_live_status). This product is available for full-service accounts only.

#### General requirements
* **Protocols:** `https`
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

#### Frequency of same number requests
Sending too many request to the API for the same phone number within a short period of time may result in an error, even if data is available for that number. If you receive a -60001 error in the response after making consecutive requests for the same phone number, consider limiting your request rate.

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `complete_phone_number` | string | yes | The phone number you want to collect information about. Provide the entire phone number, including the country code, with no spaces or special characters. |

### Query parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `ucid` | string |  | A string that specifies one of the use case codes. \| Use Case \| Description \| \|----------\|-------------\| \| ATCK \| For use in a 2FA situation like updating an account, or trying to log in. \| \| BACF \| For creating an account on somebody's service in a situation where the service may be vulnerable to bulk attacks or individual fraudsters. \| \| BACS \| For creating an account on somebody's service in a situation where the service may be vulnerable to bulk attacks or individual spammers. \| \| CHBK \| For use in a situation such as someone trying to buy something expensive or unusual on your platform, and you want to verify that it is really them. \| \| CLDR \| Calendar Event \| \| LEAD \| For use in a situation where you require a person to enter their personal information in order to obtain information about something like a loan or realty or a school, and you want to check if the person is bogus or not. \| \| OTHR \| Other - if you have a situation not addressed by the other tags. \| \| PWRT \| For use in a situation where a password reset is required. \| \| RESV \| For use in a situation where you have end users making reservations and not showing up, and you want to be able to include some kind of phone verification in that loop. \| \| RXPF \| For use in situations where you are trying to prevent prescription fraud. \| \| SHIP \| For use in situations where you are sending a shipping notification. \| \| THEF \| For use in situations where you are trying to prevent an end user from deactivating or redirecting a phone number in order to take over someone else's identity. \| \| TRVF \| For use in situations where you are transferring money, and you want to check to see if it is approved by sending a text message or phone call to your end user. This is similar to CHBK, but is specifically for a money transaction. \| \| UNKN \| This is the same as OTHR. \| |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                      |
|-------------|------------------------|--------------------------------------------------|
| 300         | Transaction successfully completed           | The system was able to obtain all of the       requested data for PhoneID.                      |
| 301         | Transaction partially completed   | The system was able to obtain some of the data for PhoneID, but not all of it.                  |

| Error Code | Associated Text String | Description |
|-------|-----|--------|
| -60001 | PhoneID Live Data Not Found | Unable to return data for this phone number, for this request. |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -10001 | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service) -or- Unsupported product name |
| -40007 | Rate limit exceeded |
| -40032 | Blocked due to legal compliance. |

**HTTP 401**

**Unauthorized.** The request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

  | Error Codes | Description |
  |-------------|-------------|
  | -10009 | Invalid source IP address |
  | -20002 | This product is not enabled for this customer ID |
  | -20003 | This feature is not enabled for this CustomerID  |
  | -30002 | CustomerID Account Not Activated |
  | -30003 | CustomerID New Account Limit Reached |
  | -40002 | Not Authorized |

**HTTP 402**

**Payment Required.** If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

**HTTP 404**

**Not Found.** The server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

  | Error Codes | Description |
  |-------------|-------------|
  | -40001 | Status unavailable |
  | -40004 | Resource not found |

**HTTP 405**

| Error Codes | Description |
|-------------|-------------|
| -40005 | Method not allowed |

**HTTP 429**

**Too Many Requests.** The user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -40008 | [Product method] exceed transaction hard cap; Request denied |

**HTTP 500**

**Invalid Transaction.** Transaction not attempted. Error codes are listed in the `error` parameter in the response.

**HTTP 503**

**Service unavailable.** Try again. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -90001 | System unavailable; please try again later |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A 32-digit hex value used to identify the web service requests. The value is unique to each web service request, is randomly generated by Telesign, and is returned in the response message immediately following the web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string |  | The subresource in the URL accessed by this request. Example: `live`. |
| `errors` | array of object |  | An array of objects, one for each error that resulted from the request. |
| `errors[].code` | integer |  | A one to five-digit error code (possibly negative) that indicates the type of error that occurred. |
| `errors[].description` | string |  | A text description of this error. |
| `phone_type` | object |  | Contains properties with details about the phone type. |
| `phone_type.code` | string |  | One of the [phone type codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-codes). Example: `2`. |
| `phone_type.description` | string |  | Text describing the phone type. Example: `MOBILE`. |
| `status` | object |  | Contains properties with details about the request status. |
| `status.code` | integer |  | A numeric code indicating the processing status of this request. Example: `300`. |
| `status.description` | string |  | Text describing the transaction status. Example: `Transaction successfully completed`. |
| `status.updated_on` | string |  | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the transaction status was updated. Example: `2024-10-03T21:51:28.709526Z`. |
| `numbering` | object |  | Contains properties related to the numbering attributes of the specified phone number. |
| `numbering.original` | object |  | Contains details of the phone number specified in the original request. |
| `numbering.original.phone_number` | string |  | The base phone number. This is the phone number without the country dialing code. Example: `1234567890`. |
| `numbering.original.complete_phone_number` | string |  | The base phone number prefixed with the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). Example: `11234567890`. |
| `numbering.original.country_code` | string |  | A 1, 2, or 3-digit number representing the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes). For example, the country dialing code for both the U.S.A. and Canada is 1, and the country dialing code for the United Kingdom is 44. Example: `1`. |
| `numbering.cleansing` | object |  | Contains details about how the phone number was cleansed. Phone cleansing corrects common formatting issues in submitted phone numbers. |
| `numbering.cleansing.call` | object |  | Contains cleansing details about the phone number if it is enabled for receiving voice calls. |
| `numbering.cleansing.call.cleansed_code` | integer |  | One of the [phone number cleansing codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes) describing the cleansing operation TeleSign performed on the phose number. The default value is 100 (no changes were made to the phone number). Example: `100`. |
| `numbering.cleansing.call.country_code` | string |  | A 1, 2, or 3-digit number representing the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes). For example, the country dialing code for both the U.S.A. and Canada is 1, and the country dialing code for United Kingdom is 44. Example: `1`. |
| `numbering.cleansing.call.max_length` | integer |  | The maximum number of digits allowed for phone numbers with this particular country dialing code. Example: `10`. |
| `numbering.cleansing.call.min_length` | integer |  | The minimum number of digits allowed for phone numbers with this particular country dialing code. Example: `1`. |
| `numbering.cleansing.call.phone_number` | string |  | The base phone number. This is simply the phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes). Example: `1234567890`. |
| `numbering.cleansing.sms` | object |  | Contains cleansing details about a phone number enabled for receiving text messages. |
| `numbering.cleansing.sms.cleansed_code` | integer |  | One of the [phone number cleansing codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes) describing the cleansing operation TeleSign performed on the phose number. The default value is 100 (no changes were made to the phone number). Example: `100`. |
| `numbering.cleansing.sms.country_code` | string |  | A 1, 2, or 3-digit number representing the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes). For example, the country dialing code for both the U.S.A. and Canada is 1, and the country dialing code for United Kingdom is 44. Example: `1`. |
| `numbering.cleansing.sms.max_length` | integer |  | The maximum number of digits allowed for phone numbers with this particular country dialing code. Example: `10`. |
| `numbering.cleansing.sms.min_length` | integer |  | The minimum number of digits allowed for phone numbers with this particular country dialing code. Example: `10`. |
| `numbering.cleansing.sms.phone_number` | string |  | The base phone number. This is simply the phone number without the [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-number-cleansing-codes). Example: `1234567890`. |
| `location` | object |  | Contains geographical location information associated with the rate center of the phone number when the device was activated. Null is returned when data for a field isn't available for a specific market or country. |
| `location.city` | string |  | The city associated with the rate center of the phone number when the device was activated. Example: `Odessa`. |
| `location.county` | string |  | The county (or parish) associated with the rate center of the phone number when the device was activated (U.S. only). Example: `Ector`. |
| `location.state` | string |  | The two-letter [state abbreviation code](http://pe.usps.com/text/pub28/28apb.htm) of the state (province, district, or territory) associated with the rate center of the phone number when the device was activated (North America only). Example: `TX`. |
| `location.zip` | string |  | The five-digit United States Postal Service [ZIP Code](https://www.usps.com/nationalpremieraccounts/findzipcodes.htm) associated with the rate center of the phone number when the device was activated (U.S. only). Example: `79758`. |
| `location.country` | object |  | Contains properties related to the country associated with the rate center of the phone number when the device was activated. |
| `location.country.iso2` | string |  | The ISO 3166-1 2-letter [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the rate center of the phone number when the device was activated. Example: `US`. |
| `location.country.iso3` | string |  | The ISO 3166-1 3-letter country code associated with the rate center of the phone number when the device was activated. Example: `USA`. |
| `location.country.name` | string |  | The [country name](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the rate center of the phone number when the device was activated. Example: `United States`. |
| `location.time_zone` | object |  | Contains properties related to the time zone associated with the rate center of the phone number when the device was activated. For maximum and minimum UTC offsets, they are specified in units of hours, and range from -12 to +14. For positive numbers, the plus sign (+) may not be returned. Additional offsets due to Daylight Savings Time or Summer Time are not considered. For example, Russia, which spans 11 time zones, has a minimum UTC offset of +2, and a maximum of +12. |
| `location.time_zone.name` | string |  | The time zone associated with the rate center of the phone number when the device was activated (U.S. only). Example: `America/Chicago`. |
| `location.time_zone.utc_offset_max` | string |  | For international phone numbers, this parameter returns the maximum UTC offset for the country associated with the rate center of the phone number when the device was activated. For U.S. phone numbers, this parameter returns the same result as utc_offset_min. Example: `-6`. |
| `location.time_zone.utc_offset_min` | string |  | For international phone numbers, this parameter returns the minimum UTC offset for the country associated with the rate center of the phone number when the device was activated. For U.S. phone numbers, this parameter returns the UTC offset associated with the rate center of the phone number when the device was activated. Example: `-6`. |
| `location.coordinates` | object |  | Contains details about the geographical coordinates of the location where the phone number is registered. |
| `location.coordinates.latitude` | string |  | Latitude specifies the North-South position of a point on the Earth’s surface. It is an angular measurement that ranges from 0° at the Equator, to 90° at the North Pole (and -90° at the South Pole). It is returned here as a value indicating the number of degrees of latitude of the location associated with the phone number, expressed in seven decimal digits, with five decimal places. Example: `31.8466`. |
| `location.coordinates.longitude` | string |  | Longitude specifies the East-West position of a point on the Earth’s surface. It is an angle measured East or West from the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) —ranging from 0° at the prime meridian, to +180° Eastward and -180° Westward. It is returned here as a value indicating the number of degrees of longitude of the location associated with the phone number, expressed in eight decimal digits, with five decimal places. Example: `-102.36778`. |
| `location.metro_code` | string |  | A 4-digit string indicating the Primary Metropolitan Statistical Area (PMSA) code for the location associated with the rate center of the phone number when the device was activated (U.S. only). PMSA Codes are governed by the [US Census Bureau](http://www.census.gov/). This information is useful for large metropolitan areas that comprise several smaller cities. For example, the PMSA for Long Beach, California is Los Angeles County, which gives Long Beach the PMSA Code 4480. Example: `36220`. |
| `carrier` | object |  | Contains information about the company that provides telecommunications services for the phone number. |
| `carrier.name` | string |  | The name of the carrier associated with this number. Example: `Verizon`. |
| `live` | object |  | Contains details about a subscriber and subscriber's device. |
| `live.subscriber_status` | string |  | The current status of the subscriber’s phone number. \| Value \| Description \| \|-------\|-------------\| \| ACTIVE \| The phone number is in service. \| \| DISCONNECTED \| The phone number is not in service. \| Example: `ACTIVE`. |
| `live.device_status` | string |  | The current status of the device associated with this number. \| Value \| Description \| \|-------\|-------------\| \| REACHABLE \| The device is on-line, and is ready to initiate/receive calls. Note that subscriber_status=ACTIVE. \| \| UNAVAILABLE \| The device status is not available for this phone number. \| \| UNREACHABLE \| The device is either turned off, or it is out of the coverage area. \| Example: `REACHABLE`. |
| `live.roaming` | string |  | Whether the mobile device is currently roaming outside of the contracted service coverage area. \| Value \| Description \| \|-------\|-------------\| \| NO \| The mobile device is not currently roaming. \| \| UNAVAILABLE \| The service is unable to make a determination at this time. \| \| YES \| The mobile device is currently roaming. \| Example: `NO`. |
| `live.roaming_country` | string |  | The country in which the mobile device is roaming. \| Value \| Description \| \|-------\|-------------\| \| A string naming the country \| The name of the country (in mixed-case). \| \| null \| The service is unable to make a determination at this time. Example: `null`. |
| `live.roaming_country_iso2` | string |  | A two-character abbreviation for the country in which the mobile device is roaming. Example: `US`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "sub_resource": "live",
  "errors": [],
  "phone_type": {
    "code": "2",
    "description": "MOBILE"
  },
  "status": {
    "code": 300,
    "description": "Transaction successfully completed",
    "updated_on": "2024-10-03T21:51:28.709526Z"
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
        "min_length": 1,
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
  "location": {
    "city": "Marina del Rey",
    "county": "Los Angeles County",
    "state": "CA",
    "zip": "90292",
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
      "latitude": "34.18264",
      "longitude": "-118.30840"
    },
    "metro_code": ""
  },
  "carrier": {
    "name": "Verizon"
  },
  "live": {
    "subscriber_status": "ACTIVE",
    "device_status": "REACHABLE",
    "roaming": "NO",
    "roaming_country": "null"
  }
}
```


---

## Get contact details

**MCP tool:** `phoneid_legacy_contact`

```http
GET https://rest-ww.telesign.com/v1/phoneid/contact/{complete_phone_number}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getcontactdetailsforphonenumber> (updated 2026-09-11)

Enter a phone number to receive detailed contact information related to the subscriber's phone number to provide another set of indicators for established risk engines. NOTE: If you try this API out using the API Explorer, you will be billed for the transaction as you normally would.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `complete_phone_number` | string | yes | The phone number you want to collect information about. Provide the entire phone number, including the country code, with no spaces or special characters. |

### Query parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `ucid` | string |  | One of the use case codes. \| Use Case \| Description \|\|----------\|-------------\|\| ATCK \| For use in a 2FA situation like updating an account, or trying to log in. \|\| BACF \| For creating an account on somebody's service in a situation where the service may be vulnerable to bulk attacks or individual fraudsters. \|\| BACS \| For creating an account on somebody's service in a situation where the service may be vulnerable to bulk attacks or individual spammers. \|\| CHBK \| For use in a situation such as someone trying to buy something expensive or unusual on your platform, and you want to verify that it is really them. \|\| CLDR \| Calendar Event \| \| LEAD \| For use in a situation where you require a person to enter their personal information in order to obtain information about something like a loan or realty or a school, and you want to check if the person is bogus or not. \|\| OTHR \| Other - if you have a situation not addressed by the other tags. \|\| PWRT \| For use in a situation where a password reset is required. \|\| RESV \| For use in a situation where you have end users making reservations and not showing up, and you want to be able to include some kind of phone verification in that loop. \|\| RXPF \| For use in situations where you are trying to prevent prescription fraud. \|\| SHIP \| For use in situations where you are sending a shipping notification. \| \| THEF \| For use in situations where you are trying to prevent an end user from deactivating or redirecting a phone number in order to take over someone else's identity. \|\| TRVF \| For use in situations where you are transferring money, and you want to check to see if it is approved by sending a text message or phone call to your end user. This is similar to CHBK, but is specifically for a money transaction. \| \| UNKN \| This is the same as OTHR. \| |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status code | Associated text string | Description                                      |
|-------------|------------------------|--------------------------------------------------|
| 300         | Transaction successfully completed            | The system was able to obtain all of the requested data for Phone ID.                      |
| 301         | Transaction partially completed | The system was able to obtain some of the data for Phone ID, but not all of it.                  |

| Error | Description |
|-------|-------------|
| -60001 | Phone ID Contact data not found |

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -10001 | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service) -or- Unsupported product name |

**HTTP 401**

Unauthorized, the request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

  | Error Codes | Description |
  |-------------|-------------|
  | -10009 | Invalid source IP address |
  | -20002 | This product is not enabled for this customer ID |
  | -20003 | This feature is not enabled for this CustomerID  |
  | -30002 | CustomerID Account Not Activated |
  | -30003 | CustomerID New Account Limit Reached |
  | -40002 | Not Authorized |

**HTTP 402**

Payment Required. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

  | Error Codes | Description |
  |-------------|-------------|
  | -40001 | Status unavailable |
  | -40004 | Resource not found |

**HTTP 405**

| Error Codes | Description |
|-------------|-------------|
| -40005 | Method not allowed |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| 500 | Transaction not attempted. |
| -40007 | Rate limit exceeded |
| -40008 | [Product method] exceed transaction hard cap; Request denied |

**HTTP 500**

Invalid Transaction, transaction not attempted. Error codes are listed in the `error` parameter in the response.

**HTTP 503**

Service Unavailable, system unavailable, try again. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -90001 | System unavailable; please try again later |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. |
| `sub_resource` | string enum |  | The subresource accessed by your request. It is set to `contact`. Allowed: `contact`. Example: `contact`. |
| `errors` | array of object |  | Contains an object for each error that resulted from the request. |
| `errors[].code` | integer |  | A numeric code indicating the processing status for this transaction. |
| `errors[].description` | string |  | Text describing the type of error that occurred. |
| `phone_type` | object |  | Contains details about the phone type. |
| `phone_type.code` | string |  | One of the [phone type codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-codes). |
| `phone_type.description` | string |  | Text describing the phone type. |
| `status` | object |  | Contains details about the status of your request. |
| `status.code` | string |  | A numeric code indicating the processing status of the transaction. |
| `status.description` | string |  | Text describing the transaction status. |
| `status.updated_on` | string |  | An <a href="http://www.ietf.org/rfc/rfc3339.txt">RFC 3339</a> timestamp indicating when the transaction status was updated. |
| `numbering` | object |  | Contains properties related to the numbering attributes of the specified phone number. |
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
| `location` | object |  | Contains geographical location information associated with the phone number. |
| `location.city` | string |  | The city associated with the phone number. |
| `location.county` | string |  | The [county](https://www.census.gov/geo/reference/county-adjacency.html) (or parish) associated with the phone number (U.S. only). |
| `location.state` | string |  | The two-letter [state abbreviation code](http://pe.usps.com/text/pub28/28apb.htm) of the state (province, district, or territory) associated with the phone number (North America only). |
| `location.zip` | string |  | The five-digit United States Postal Service [ZIP Code](https://www.usps.com/nationalpremieraccounts/findzipcodes.htm) associated with the phone number (U.S. only). |
| `location.country` | object |  | Contains details about the country associated with the phone number. |
| `location.country.iso2` | string |  | The ISO 3166-1 two-letter [country dialing code](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the phone number. |
| `location.country.iso3` | string |  | The ISO 3166-1 three-letter country code associated with the phone number. |
| `location.country.name` | string |  | The [country name](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#country-codes-and-dialing-codes) associated with the phone number. |
| `location.time_zone` | object |  | Contains details about the [time zone](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#time-zones) associated with the phone number. For maximum and minimum UTC offsets, they are specified in units of hours, and range from -12 to +14. For positive numbers, the plus sign (+) may not be returned. Additional offsets due to Daylight Savings Time or Summer Time are not considered. For example, Russia, which spans 11 time zones, has a minimum UTC offset of +2, and a maximum of +12. |
| `location.time_zone.name` | string |  | The [time zone](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#time-zones) associated with the phone number (U.S. only). Example: `America/Los_Angeles`. |
| `location.time_zone.utc_offset_max` | string |  | For international phone numbers, this parameter returns the maximum UTC offset for the country associated with the phone number. For U.S. domestic phone numbers, this parameter returns the same result as utc_offset_min. |
| `location.time_zone.utc_offset_min` | string |  | For U.S. domestic phone numbers, this parameter returns the UTC offset associated with the phone number. For international phone numbers, this parameter returns the minimum UTC offset for the country associated with the phone number. |
| `location.coordinates` | object |  | Contains details about the geographical coordinates of the location where the phone number is registered. |
| `location.coordinates.latitude` | any |  | Latitude specifies the North-South position of a point on the Earth’s surface. It is an angular measurement that ranges from 0° at the Equator, to 90° at the North Pole (and -90° at the South Pole). It is returned here as a value indicating the number of degrees of latitude of the location associated with the phone number, expressed in seven decimal digits, with five decimal places. Example: `34.18264`. |
| `location.coordinates.longitude` | any |  | Longitude specifies the East-West position of a point on the Earth’s surface. It is an angle measured East or West from the <a href="https://en.wikipedia.org/wiki/Prime_meridian>Prime Meridian</a>—ranging from 0° at the Prime Meridian, to +180° Eastward and -180° Westward. It is returned here as a value indicating the number of degrees of longitude of the location associated with the phone number, expressed in eight decimal digits, with five decimal places. Example: `-118.30840`. |
| `location.metro_code` | string |  | A four-digit code indicating the <a href="http://www.census.gov/population/estimates/metro-city/99mfips.txt">Primary Metropolitan Statistical Area (PMSA)</a> code for the location associated with the phone number (U.S. only). PMSA Codes are governed by the []US Census Bureau](http://www.census.gov/). This information is useful for large metropolitan areas that comprise several smaller cities. For example, the PMSA for Long Beach, California is Los Angeles County, which gives Long Beach the PMSA Code 4480. |
| `carrier` | object |  | Contains information about the company that provides telecommunications services for the phone number. |
| `carrier.name` | string |  | The name of the carrier. Example: `Verizon`. |
| `contact` | object |  | Contact information for the end user associated with the phone number. |
| `contact.firstname` | string |  | The end user's first name or given name. If the result is a business name, the full business name goes in this field. Depending on the data provider, it might not be possible to distinguish business names from personal names. |
| `contact.lastname` | string |  | The end user's last name or family name. If they are a business, this value is null. |
| `contact.address1` | string |  | The first line of the end user’s street address. |
| `contact.address2` | string |  | The second line of the end user’s street address. |
| `contact.address3` | string |  | The third line of the end user's street address. |
| `contact.address4` | string |  | The fourth line of the end user's street address. |
| `contact.city` | string |  | The city in which the end user is located. |
| `contact.state_province` | string |  | The state, province, or region in which the end user is located. |
| `contact.country` | string |  | The country in which the end user is located. |
| `contact.zip_postal_code` | string |  | The United States Postal Service ZIP Code in which the end user is located (US addresses only). |


---

## Get deactivation status of a number

**MCP tool:** `phoneid_legacy_number_deactivation`

```http
GET https://rest-ww.telesign.com/v1/phoneid/number_deactivation/{complete_phone_number}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getphonenumberdeactstatus> (updated 2026-09-11)

The Phone ID Number Deactivation API determines whether a phone number has been deactivated, when, and by which carrier the phone number was deactivated based on carriers' phone number data and Telesign's proprietary analysis. NOTE: If you try this API out using the API Explorer, you will be billed for the transaction as you normally would.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/x-www-form-urlencoded`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `complete_phone_number` | string | yes | The phone number you want to collect information about. Provide the entire phone number, including the country code, with no spaces or special characters. |

### Query parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `ucid` | string |  | One of the use case codes. \| Use case \| Description \|\|----------\|-------------\|\| ATCK \| For use in a 2FA situation like updating an account, or trying to log in. \|\| BACF \| For creating an account on somebody's service in a situation where the service may be vulnerable to bulk attacks or individual fraudsters. \|\| BACS \| For creating an account on somebody's service in a situation where the service may be vulnerable to bulk attacks or individual spammers. \|\| CHBK \| For use in a situation such as someone trying to buy something expensive or unusual on your platform, and you want to verify that it is really them. \|\| CLDR \| Calendar Event \| \| LEAD \| For use in a situation where you require a person to enter their personal information in order to obtain information about something like a loan or realty or a school, and you want to check if the person is bogus or not. \|\| OTHR \| Other - if you have a situation not addressed by the other tags. \|\| PWRT \| For use in a situation where a password reset is required. \|\| RESV \| For use in a situation where you have end users making reservations and not showing up, and you want to be able to include some kind of phone verification in that loop. \|\| RXPF \| For use in situations where you are trying to prevent prescription fraud. \|\| SHIP \| For use in situations where you are sending a shipping notification. \| \| THEF \| For use in situations where you are trying to prevent an end user from deactivating or redirecting a phone number in order to take over someone else's identity. \|\| TRVF \| For use in situations where you are transferring money, and you want to check to see if it is approved by sending a text message or phone call to your end user. This is similar to CHBK, but is specifically for a money transaction. \| \| UNKN \| This is the same as OTHR. \| |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status code | Associated text string | Description                                      |
|-------------|------------------------|--------------------------------------------------|
| 300         | Transaction successfully completed            | The system was able to obtain all of the requested data for Phone ID.                      |
| 301         | Transaction partially completed | The system was able to obtain some of the data for Phone ID, but not all of it.                  |

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -10001 | Not Allowed Host (indicates that the IP address you are connecting from is not authorized to access the service) -or- Unsupported product name |
| -40007 | Rate limit exceeded |

**HTTP 401**

Unauthorized, the request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

  | Error Codes | Description |
  |-------------|-------------|
  | -10009 | Invalid source IP address |
  | -20002 | This product is not enabled for this customer ID |
  | -20003 | This feature is not enabled for this CustomerID  |
  | -30002 | CustomerID Account Not Activated |
  | -30003 | CustomerID New Account Limit Reached |
  | -40002 | Not Authorized |

**HTTP 402**

Payment Required. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

  | Error Codes | Description |
  |-------------|-------------|
  | -40001 | Status unavailable |
  | -40004 | Resource not found |

**HTTP 405**

| Error Codes | Description |
|-------------|-------------|
| -40005 | Method not allowed |

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -40008 | [Product method] exceed transaction hard cap; Request denied |

**HTTP 500**

Invalid Transaction, transaction not attempted. Error codes are listed in the `error` parameter in the response.

**HTTP 503**

Service Unavailable, system unavailable, try again. Error codes are listed in the `error` parameter in the response.

| Error Code | Description |
|------------|-------------|
| -90001 | System unavailable; please try again later |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. |
| `sub_resource` | string enum |  | The subresource accessed by your request. It is set to `number_deactivation`. Allowed: `number_deactivation`. Example: `number_deactivation`. |
| `number_deactivation` | object |  | Contains properties related to number deactivation for the specified phone number. |
| `number_deactivation.number` | string |  | The number for which the deactivation check is being performed. |
| `number_deactivation.tracking_since` | string |  | A timestamp indicating when number deactication began storing records for the carreier. |
| `number_deactivation.last_deactivated` | string |  | A timestamp indicating when the phone number was seen and/or reported as deactivated from the data stream provider. |
| `number_deactivation.mcc` | integer |  | The Mobile Country Code, consisting of three decimal digits. Mobile Country Code (MCC) is used in wireless telephone networks (for example GSM, CDMA, UMTS) in order to identify the country which a mobile subscriber belongs to. |
| `number_deactivation.mnc` | integer |  | The Mobile Network Code, consisting of two or three decimal digits. The Mobile Country Code (MCC) is used in combination with the Mobile Network Code (MNC) to uniquely identify a mobile network operator (carrier) who deactivated a phone number. One operator (carrier) can own more than one MNC and in that case, a list of MNCs is provided in the response, separated by a semicolon. The table contains carrier county and carrier name with corresponding MCC and MNC for carriers in coverage of Phone ID Number Deactivation. \| MCC \| MNC \| Carrier's country \| Carrier's name \| \|--\|--\|--\|--\| \| 310 \| 030;070;080;150;170;410;670;680;950 \| United States of America \| AT&T \| \| 310 \| 004;005;006;010;012;013;590;820;890;910 \| United States of America \| Verizon \| \| 310 \| 024;025;026;160;200;210;220;230;240;250;260;270;310;490;660;800 \| United States of America \| T-Mobile \| \| 310 \| 053;120;830;991 \| United States of America \| Sprint \| \| 310 \| 220 \| United States of America \| US Cellular \| \| 310 \| 120 \| United States of America \| Boost \| \| 310 \| 150 \| United States of America \| Tracfone \| \| 228 \| 01 \| Switzerland \| Swisscom \| \| 515 \| 02 \| Philippines \| Globe Telecom \| \| 240 \| 07;44 \| Sweden \| Tele2 \| |
| `errors` | array of object |  | Contains an object for each error that resulted from the request. |
| `errors[].code` | integer |  | A numeric code indicating the processing status for this transaction. |
| `errors[].description` | string |  | Text describing the type of error that occurred. |
| `status` | object |  | Contains details about the processing status of this request. |
| `status.code` | string |  | A numeric code indicating the processing status for this transaction. |
| `status.description` | string |  | Text describing the transaction status. |
| `status.updated_on` | string |  | An [RFC 3339](http://www.ietf.org/rfc/rfc3339.txt) timestamp indicating when the transaction status was updated. |

