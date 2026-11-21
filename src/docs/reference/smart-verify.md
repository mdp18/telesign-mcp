# Smart Verify API - API reference

Verification where Telesign decides whether an SMS or a voice call is the most effective way to deliver the passcode.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `smartverify_send_code`._

## Send smart verify code

**MCP tool:** `smartverify_send_code`

```http
POST https://rest-ww.telesign.com/v1/verify/smart
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/sendsmartverifycode> (updated 2026-09-11)

Use this action to send a one-time passcode (OTP) to your end user with the Telesign Smart Verify API. The service decides whether it is most effective to send the code in an SMS or in a voice message.

#### General requirements
* **Authentication:** [Basic](doc:authentication#basic-authentication) (easiest to implement)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/x-www-form-urlencoded`
* **Responds with:** `application/json`

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string | yes | The end user's phone number you want to send a message to, including the country code, as a string of digits without spaces or special characters, beginning with the country dialing code. |
| `ucid` | string |  | An abbreviation specifying a use case. Valid options are: * ATCK - for use in a 2FA situation like updating an account or logging in * BACF - for creating an account where the service may be vulnerable to bulk attacks and fraudsters * BACS - for creating an account where the service may be vulnerable to bulk attacks or individual spammers * CHBK - for use when someone is trying to buy something expensive or unusual and you want to verify it is really them * CLDR - calendar event * LEAD - for use in a situation where you require a person to enter personal information in order to obtain information about something like a loan or realty or school, and you want to check if the person is bogus or not * OTHR - if you have a situation not addressed by other tags * PWRT - for use in a situation where a passwor reset is required * RESV - for use when you have end users making reservations and not showing up, and you want to be able to include phone verification in the loop * RXPF - for use when you are trying to prevent prescription fraud * SHIP - for use when you are sending a shippingnotification * THEF - for use when you are trying to prevent an end user from deactivating or redirecting a phone number in order to take over someone else's identity * TRVF - for use when you are transferring moneyand you want to check to see if it is approved by sending a text message or phone call to your end user. This is similar to CHBK, but is specifically for a money transaction * UNKN - if you have a situation not addressed by other tags (same as OTHR). |
| `tts_message` | string |  | If you choose to pass a custom message, you use this parameter to indicate what the custom message would be for text to speech (TTS). You MUST set the language parameter if you use this parameter. If a language is not supported, Telesign may choose a default for you. If you do not set the language tag, United States English is assumed. Make sure to use $$CODE$$ in your message string, as this will generate and insert a random string with appropriate length as part of your TTS message. |
| `language` | string |  | If you use the tts_message parameter you must set the language. Choose from the list of [supported languages](https://developer.telesign.com/enterprise/docs/voice-verify-supported-languages-for-text-to-speech) also used by the Telesign Voice Verify API. |
| `sms_message` | string |  | If you choose to pass a custom message, you use this parameter to indicate what the custom message would be if an SMS is sent. |
| `preference` | string enum |  | Overrides the service's automatic method selection (SMS falling back on voice call), and attempts to force it to use your specified method. You can specify either `Voice Verify` (use call) or `SMS Verify` (use SMS) as the recommended method to attempt. Telesign uses the override method whenever possible. Telesign may ignore this specified method if the destination device does not support it. Allowed: `SMS Verify`, `Voice Verify`. |
| `ignore_risk` | boolean |  | Overrides the service's automatic method selection (SMS falling back on voice call), and attempts to force it to use your specified method. You can specify either `Voice Verify` (use call) or `SMS Verify` (use SMS) as the recommended method to attempt. Telesign uses the override method whenever possible. Telesign may ignore this specified method if the destination device does not support it. |

### Responses

**HTTP 200**

Your request was fulfilled and resulted in a new resource being created. Code against the status or error code and use that rather than the HTTP status response.

**HTTP 400**

Bad request, the request could not be understood by the server due to malformed syntax. Code against the status or error code and use that rather than the HTTP status response.

**HTTP 401**

Unauthorized, the request requires user authentication. Code against the status or error code and use that rather than the HTTP status response.

**HTTP 404**

Not Found, the server has not found anything matching the Request-URI. Code against the status or error code and use that rather than the HTTP status response.

**HTTP 405**

Responses are based on the subresource used. Code against the status or error code and use that rather than the HTTP status response.

**HTTP 429**

Too Many Requests, the user sent too many requests in a given amount of time. Code against the status or error code and use that rather than the HTTP status response.

**HTTP 503**

Service Unavailable, system unavailable, try again. Code against the status or error code and use that rather than the HTTP status response.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Length: 32-32. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `sub_resource` | string enum |  | The channel that the service used to send this message. Allowed: `sms`, `voice`. Example: `sms`. |
| `errors` | array of object |  | Contains an object specifying each error that occurred. If no errors occurred, the array is empty. |
| `errors[].code` | integer |  | A numeric code specifying which error occurred. Example: `-10001`. |
| `errors[].description` | string |  | Text describing the error that occurred. Example: `Invalid Request: PhoneNumber Parameter`. |
| `status` | object |  | Contains properties describing the preliminary delivery status of the SMS you sent. |
| `status.updated_on` | string | yes | An RFC 3339 timestamp indicating when the delivery status was last updated. Example: `2020-08-27T17:28:49.559307Z`. |
| `status.code` | integer | yes | A numeric code indicating the transaction status. Example: `290`. |
| `status.description` | string | yes | Text describing the transaction status. Example: `Message in progress`. |
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
| `phone_type` | object |  | This object is only included if enabled by the [Telesign Customer Support Team](mailto:support@telesign.com). |
| `phone_type.code` | string |  | One of the [phone type codes](https://developer.telesign.com/enterprise/docs/codes-languages-and-time-zones#phone-type-codes). Example: `2`. |
| `phone_type.description` | string |  | Text describing the phone type. Example: `MOBILE`. |
| `carrier` | object |  | Contains details about the company that provides telecommunications services for this phone number. |
| `carrier.carrier_id` | string |  | An ID specifying this carrier. Contact our [Customer Support Team](mailto:support@telesign.com) to include this property in your response. |
| `carrier.name` | string |  | The name of this carrier. Example: `Verizon`. |

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
  "numbering": {
    "original": {
      "phone_number": "7833012348",
      "complete_phone_number": "17833012348",
      "country_code": "1"
    },
    "cleansing": {
      "call": {
        "cleansed_code": 100,
        "country_code": "1",
        "max_length": 10,
        "min_length": 10,
        "phone_number": "7833012348"
      },
      "sms": {
        "cleansed_code": 100,
        "country_code": "1",
        "max_length": 10,
        "min_length": 10,
        "phone_number": "7833012348"
      }
    }
  },
  "phone_type": {
    "code": "2",
    "description": "MOBILE"
  },
  "carrier": {
    "carrier_id": "string",
    "name": "Verizon"
  }
}
```

