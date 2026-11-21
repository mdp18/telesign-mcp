# Omnichannel Messaging - API reference

One API for SMS, MMS, RCS, WhatsApp, Viber and email with cascading fallback channels, channel capability checks and message templates.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `messaging_send_message`, `messaging_get_message_status`, `messaging_check_channel_capability`, `messaging_check_rcs_capability`, `templates_create`, `templates_list`, `templates_get`, `templates_delete`._

## Send a message with advanced features

**MCP tool:** `messaging_send_message`

```http
POST https://rest-ww.telesign.com/v1/omnichannel
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/sendadvancedmessage> (updated 2026-09-11)

Use this action to send a message with advanced features through your specified channel (optionally with cascading backup channels) to a recipient phone number or email address.

To add this product to your account, [contact a Telesign expert](https://www.telesign.com/contact-sales?utm_campaign=contact%20sales%20form&utm_source=developer_portal&utm_medium=Referrer&utm_content=messaging). This product is available for full-service accounts only.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `channels` | array of object | yes | All the potential channels you want the service to be able to try and details on how to use those channels. If the first channel attempted fails, you have specified a fallback channel, and the fallback timeout has elapsed, the service looks to the next channel object here for details on what to do. |
| `channels[].channel` | string enum | yes | A potential channel you want the service to use for sending this message. The order in which channels are tried depends on the order they are defined in the request. For example, if you specify `rcs` and then `sms`, the service tries RCS and then attempts to use SMS as a fallback if the RCS message fails. Allowed: `rcs`, `whatsapp`, `sms`, `mms`, `viber`, `email`. |
| `channels[].fallback_time` | integer |  | The duration of time (in seconds) that the service should wait before it concludes that the message has failed on this channel and attempts to send on the backup channel if one is provided. Default: `300`. Range: 30 to 3600. Example: `600`. |
| `recipient` | object |  | Contains properties specifying the contact information needed to communicate with a recipient for a particular channel. At least one sub-property must be included. If the `phone_number` parameter is not included in this request, this parameter is required. |
| `recipient.phone_number` | string |  | The recipient's phone number, as digits without spaces or special characters, beginning with the country dialing code. **Required if RCS, SMS, WA, Viber, or MMS is selected as the channel.** Example: `11234567890`. |
| `recipient.email` | string |  | The recipient's email address. **Required if email is selected as the channel.** Example: `jsmith@vero-finto.com`. |
| `message` | object | yes | Contains properties specifying to the service how to construct the message for each channel. There should be one object in here for each channel, plus a default object with configuration to be applied if none of the specified channels can be used. |
| `message.rcs` | object |  | Contains properties specifying to the service how to construct the message for this channel. |
| `message.rcs.template` | string |  | The name of the template to use for this message. Example: `url_action`. |
| `message.rcs.parameters` | object |  | Contains sub-properties with values for variables in the message template. Which sub-properties to include here depends on which template you have selected. |
| `message.rcs.parameters.text` | string |  | The main text of your message.  **Required for:** `text`,`dial_action`,`url_action`,`2_suggested_replies`, `3_suggested_replies` templates. Example: `All purchases today are 20% off!`. |
| `message.rcs.parameters.button_text_1` | string |  | The text of the first suggested reply.  **Required for:** `2_suggested_replies`, `3_suggested_replies` templates. Example: `Yes`. |
| `message.rcs.parameters.button_payload_1` | string |  | Unique identifier for the first reply.  **Required for:** `2_suggested_replies`, `3_suggested_replies` templates. Example: `r1id`. |
| `message.rcs.parameters.button_text_2` | string |  | The text of the second suggested reply.  **Required for:** `2_suggested_replies`, `3_suggested_replies` templates. Example: `No`. |
| `message.rcs.parameters.button_payload_2` | string |  | Unique identifier for the second reply.  **Required for:** `2_suggested_replies`, `3_suggested_replies` templates. Example: `r2id`. |
| `message.rcs.parameters.button_text_3` | string |  | The text of the third suggested reply.  **Required for:** `3_suggested_replies` template. Example: `Not sure`. |
| `message.rcs.parameters.button_payload_3` | string |  | Unique identifier for the third reply.  **Required for:** `3_suggested_replies` template. Example: `r3id`. |
| `message.rcs.parameters.url_text` | string |  | Text for the link in the message.  **Required for:** `url_action`, `rc_url_action_vertical`, `rc_url_action_horizontal` templates. Example: `See all deals here.`. |
| `message.rcs.parameters.url_payload` | string |  | Unique identifier for the link in the message.  **Required for:** `url_action`, `rc_url_action_vertical`, `rc_url_action_horizontal` templates. Example: `mktUrl1`. |
| `message.rcs.parameters.url` | string |  | Depending on the template being used, this is either the URL for the link in the message or the URL for a media file or file attachment to embed in the message.  **Required for:** `media`, `url_action`, `rc_url_action_vertical`, `rc_url_action_horizontal`, `file` Example: `https://acme.co/summer_deals`. |
| `message.rcs.parameters.dial_text` | string |  | Text on the click-to-call button.  **Required for:** `dial_action`, `rc_dial_action_vertical`, `rc_dial_action_horizontal` templates. Example: `Call agent`. |
| `message.rcs.parameters.phone_number_to_dial` | string |  | The complete phone number to call when the button is selected. Include `+` at the beginning of international numbers.  **Required for:** `dial_action`, `rc_dial_action_vertical`, `rc_dial_action_horizontal` templates. Example: `+15555551212`. |
| `message.rcs.parameters.dial_payload` | string |  | Unique identifier for the click-to-call phone number in the message.  **Required for:** `dial_action`, `rc_dial_action_vertical`, `rc_dial_action_horizontal` templates. Example: `dial_id`. |
| `message.rcs.parameters.media_url` | string |  | The URL reference for the image to include in the rich card in your message. **Required for:** `rc_url_action_vertical`, `rc_dial_action_vertical`, `rc_url_action_horizontal`, `rc_dial_action_horizontal` templates. Example: `https://s3.amazonaws.com/acmeco-content/group_photo.jpg`. |
| `message.rcs.parameters.latitude` | string |  | The latitude coordinate of your location as a positive or negative number. **Required for:** `location` Example: `37.423021`. |
| `message.rcs.parameters.longitude` | string |  | The longitude coordinate of your location as a positive or negative number. **Required for:** `location` Example: `-122.083739`. |
| `message.whatsapp` | object |  | Contains properties specifying to the service how to construct the message for this channel. |
| `message.whatsapp.template` | string |  | The name of the template to use for this message. Example: `url_action`. |
| `message.whatsapp.parameters` | object |  | Contains sub-properties with values for variables in the message template. Which sub-properties to include here depends on which template you have selected. |
| `message.whatsapp.parameters.text` | string |  | The main text of your message.  **Required for:** `text` Example: `All purchases today are 20% off!`. |
| `message.whatsapp.parameters.header_url` | string |  | The source URL for a media file or file attachment to embed in the message.  **Required for:** `image`, `video`, `audio`, `file` Example: `https://acme.co/summer_deals.png`. |
| `message.whatsapp.parameters.file_name` | string |  | The display name of the file on end-user device. If you do not include a value for this parameter, the service uses a default value of "file".  **Required for:** `file` Example: `Instruction for payment.pdf`. |
| `message.whatsapp.parameters.latitude` | string |  | The latitude coordinate of your location (number only). **Required for:** `location` Example: `37.423021`. |
| `message.whatsapp.parameters.longitude` | string |  | The longitude coordinate of your location (number only). **Required for:** `location` Example: `-122.083739`. |
| `message.viber` | object |  | Contains properties specifying to the service how to construct the message for this channel. |
| `message.viber.template` | string enum |  | The name of the template to use for this message. Allowed: `text`, `text_session`, `image`, `image_session`, `video`, `text_video`, `url_action_video`, `url_action`, `otp_verify`, `text_2way`, `image_2way`, `telesign_otp`. |
| `message.viber.parameters` | object |  | Contains sub-properties with values for variables in the message template. Which sub-properties to include here depends on which template you have selected. |
| `message.viber.parameters.text` | string |  | The main text of your message.  **Required for:** `text`, `text_session`, `url_action`,  `text_video` and `url_action_video`. Example: `All purchases today are 20% off!`. |
| `message.viber.parameters.url` | string |  | Depending on the template being used, this is the URL for the link in the message or the URL where you are hosting an image or video file in the message. **Required for:** `image`, `image_session`, `url_action`, `video`, `text_video`, and `url_action_video`. Example: `https://vero-finto/summer_deals.png`. |
| `message.viber.parameters.url_id` | string |  | Unique identifier for the link in the message. **Required for:** `url_action` Example: `mktUrl1`. |
| `message.viber.parameters.url_text` | string |  | Text for the link button in the message.  **Required for:** `url_action` Example: `Learn more about our deals here.`. |
| `message.viber.parameters.open_url` | string |  | The URL end users are directed to or the action performed when pressing the action button. Example: `https://example.com/vero-finto/video_placeholder_name.jpg`. |
| `message.viber.parameters.url_thumbnail` | string |  | A static image that acts as the preview image for the video.  **Required for:** `text_video`. Example: `https://vero-finto-test.com`. |
| `message.viber.parameters.otp_code` | string |  | The OTP code of your verified template message.  **Required for:** `otp_verify` Example: `12345`. |
| `message.viber.parameters.language` | string |  | ISO 639-1 two-letter language code. For more details, see [Messaging - Send Viber verification message](https://developer.telesign.com/enterprise/docs/messaging-send-viber-verification-message). If not specified, the default value will be English language.  **Optional for:** `otp_verify` Example: `en`. |
| `message.viber.parameters.reply_id` | string |  | This is sent back to the provider when a message sent to a end user is answered. The end user’s reply is linked to the tracking data value that is set in the request. Example: `nxjs634!`. |
| `message.viber.parameters.button_text` | string |  | The text that appears on the action button. Example: `Click here for video`. |
| `message.mms` | object |  | Contains properties specifying to the service how to construct the message for this channel. |
| `message.mms.template` | string |  | The name of the template to use for this message. Example: `image`. |
| `message.mms.parameters` | object |  | Contains sub-properties with values for variables in the message template. Which sub-properties to include here depends on which template you have selected. |
| `message.mms.parameters.url` | string |  | The source URL for a media file to embed in the message.  **Required for:** `image`, `video`, `audio` Example: `https://acme.co/summer_deals.png`. |
| `message.sms` | object |  | Contains properties specifying to the service how to construct the message for this channel. |
| `message.sms.template` | string |  | The name of the template to use for this message. Example: `text`. |
| `message.sms.parameters` | object |  | Contains sub-properties with values for variables in the message template. Which sub-properties to include here depends on which template you have selected. |
| `message.sms.parameters.text` | string |  | The main text of your message.  **Required for:** `text`,`dial_action`,`url_action`,`2_suggested_replies`, `3_suggested_replies` templates. Example: `All purchases today are 20% off!`. |
| `message.email` | object |  | Contains properties specifying to the service how to construct the message for this channel. |
| `message.email.template` | string |  | The name of the custom template to use for this message. Length: 0-64. Example: `your-custom-template-name`. |
| `message.email.parameters` | object |  | Contains sub-properties with values for variables in the message template. Which sub-properties to include here depends on what is defined in your custom template. |
| `message.default` | object |  | Contains properties specifying to the service how to construct the message for any channel where the equivalent details under `message` are not provided for it. |
| `message.default.template` | string |  | The name of the template to use for this message. Example: `text`. |
| `message.default.parameters` | object |  | Contains sub-properties with values for variables in the message template. Which sub-properties to include here depends on which template you have selected. |
| `message.default.parameters.text` | string |  | The main text of your message.  **Required for:** `text`,`dial_action`,`url_action`,`2_suggested_replies`, `3_suggested_replies` templates. Example: `All purchases today are 20% off!`. |
| `message_type` | string enum | yes | The purpose for which the message is being sent. Choose from `OTP` - one-time passwords, `ARN` - alerts, reminders, and notifications, or `MKT` - marketing messages. Allowed: `ARN`, `MKT`, `OTP`. Example: `ARN`. |
| `external_id` | string |  | Your own identifier, used to refer to this transaction. Length: 0-100. Example: `MKT432538`. |
| `callback_url` | string |  | Your URL that you want Telesign to send callbacks to for this transaction. Overrides any previously set callback URL for your account. Example: `https://acme.co/mkt_omni_callbacks`. |
| `account_lifecycle_event` | string enum |  | The phase of the customer life-cycle the end user is in when this transaction is sent. Choices include: * `create` - Create a new account. * `sign-in` - End user signs-in to their account. * `transact` - End user completes a transaction. * `update` - End user updates contact details or other info related to their account. * `delete` - Delete an account. Allowed: `create`, `sign-in`, `transact`, `update`, `delete`. |
| `sender_id` | string |  | Specifies the  [sender ID](https://support.telesign.com/s/article/What-is-a-Sender-ID) to be displayed to the end user on the generated message. Before using this, give any sender IDs you might want to use to our Customer Support Team, so we can add them to our allow list. If the sender ID in this field is not on this list, it is not used. We do not guarantee that the sender ID you specify will be used; Telesign may override this value to improve delivery quality or to follow the regulations of particular countries. Example: `15558675310`. |
| `originating_ip` | string |  | The IP address of the end user the message is sent to. Must be in the format defined by the Internet Engineering Task Force (IETF). Example: `160.199.219.47`. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a message being sent. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

 | Status Code | Text String | Description |
 |-------------|-------------|-------------|
 | 3001     | Message in progress  | Telesign successfully received this message request and is processing it. (Intermediate)|

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

 | Status Code | Text String | Description |
 |-------------|------------------------|--|
 |3102|Invalid value for parameter message_type: {message_type}|The value of parameter `message_type` is not one of the supported values: `ARN`, `MKT`, `OTP`. (Final)|
 |3103|Unsupported value for parameter external_id: {external_id}|The value of parameter `external_id` is longer than 100 or contains non-ASCII characters. (Final)|
 |3104|Invalid value for parameter account_lifecycle_event: {account_lifecycle_event}|The value of parameter `account_lifecycle_event` is not one of the supported values: `create`, `sign-in`, `transact`, `update`, `delete`. (Final)|
 |3105|Invalid value for parameter originating_ip: {originating_ip}|Parameter originating_ip is improperly formatted. (Final)|
 |  3106 |Invalid value for parameter callback_url: {callback_url}|The value of parameter `callback_url` is empty. (Final)|
 |  3110  |Invalid request|The API request or its JSON payload is improperly formatted. (Final)|
 |  3113  |Invalid value for parameter channel: {channels}|The value of the parameter `channels` contains the same `channel` more than once or is improperly formatted. (Final)|
  |  3116  |Payload limit size exceeded|Allowed payload size is limited to 10KB |
 |  3300  |Missing parameter channels|The API request does not contain mandatory parameter `channels`. (Final)|
 |  3301  |Missing parameter channel|The value of the parameter `channels` does not contain any instances of the mandatory sub-property `channel`. (Final)|
 |  3302  |Missing parameter phone_number|The API request does not contain the mandatory parameter `phone_number`. (Final)|
 |  3303  |Missing parameter message|The  API request does not contain the mandatory parameter `message`. (Final)|
 |  3304  |Missing parameter message_type|The API request does not contain the mandatory parameter `message_type`. (Final)|

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

 | Status Code | Text String | Description|
 |-------------|------------------------|--|
 | 3400       | Not authorized |No permissions for this resource or authorization failed. (Final)|

**HTTP 413**

Request entity too large. Allowed payload size is limited to 10KB.

**HTTP 429**

**Too many requests.** The user sent too many requests in a given amount of time. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

 | Status code | Text string | Description |
 |-------------|-------------|-------------|
 | 3203 |Callback URL parameter not enabled for Customer ID|Using `callback_url` in the API request is not allowed for this customer. (Final)|
 | 3204 |Rate limit exceeded|Allowed number of requests per second to the Telesign Messaging API has been exceeded. (Final)|
 | 3206	|Omnichnnel Product not enabled for Customer ID|Telesign Messaging is not enabled for this customer. (Final)|

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

 | Status Code | Text String | Description|
 |-------------|------------------------|--|
 | 3500 |System Unavailable|The system is currently unavailable. The request should be resubmitted. (Final)|

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, 32-digit hex value randomly generated by Telesign to identify this request. Example: `35C8B5D509BC10689196FED2AD551B8A`. |
| `status` | object | yes | Contains properties related to the request status. |
| `status.code` | integer | yes | This code describes the status of your transaction. You can use this code to programmatically respond. This can be either a status code or an error code. Example: `3001`. |
| `status.description` | string | yes | A text description of the status code. Example: `Message in progress`. |
| `external_id` | string | yes | Your own identifier, used to refer to this transaction. If you did not supply an external ID in your request, the value of this response property is `null`. Default: `"MKT432538"`. Example: `MKT432538`. |

### Example response (200)

```json
{
  "reference_id": "35C8B5D509BC10689196FED2AD551B8A",
  "status": {
    "code": 3001,
    "description": "Message in progress"
  },
  "external_id": "MKT432538"
}
```


---

## Get transaction status

**MCP tool:** `messaging_get_message_status`

```http
GET https://rest-ww.telesign.com/v1/omnichannel/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getmessagingstatus> (updated 2026-09-11)

Get delivery status and other details for a Telesign Messaging transaction that you have created. Get transaction status can be used for all Messaging API transactions. Also use this endpoint to complete verification, if Telesign generated your code.

To enable this feature for your account, contact our [Customer Support Team](mailto:support@telesign.com).

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique identifier you can use to query Messaging to find out the status of your transaction. |

### Query parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `verify_code` | string |  | If Telesign generated the code sent to your end user, include the asserted verification code from your end user here. Example: `57244`. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in a new resource being created. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                      |
|-------------|------------------------|--------------------------------------------------|
| 3002 | Delivered to Gateway | The message is in the process of delivery. Once all delivery options are exhausted, the status will be updated. (Intermediate) |
| 3000 | Delivered | The message was delivered to the end user. (Final if the last channel used doesn't support Read status. Intermediate otherwise) |
| 3003 | Delivery error | The message could not be delivered to the end-user. (Final) |
| 3005 | Message is read | The message has been read by the end user. (Final) |
| 3006 | None of the channels is enabled for the customer | None of the channels specified in the request is enabled for the customer or has valid value. (Final) |

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                      |
|--------|----------------------------------|---------------------------------|
| 3311   | Invalid value for parameter reference_id | Invalid value entered as `reference_id`. (Final) |

**HTTP 401**

**Unauthorized.** The request requires user authentication. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                      |
|--------|----------------------------------|---------------------------------|
| 3206   | Omnichannel Product not enabled for Customer ID | The get transaction status feature is not enabled. (Final) |
| 3400  | Not authorized | No permissions for this resource or the authorization failed. (Final) |Unauthorized |
| 3411 | Invalid API Key. | Invalid API Key.|
| 3412 | Required 'Authorization' header is not in the correct format | Required 'Authorization' header is not in the correct format |

**HTTP 404**

**Not Found.** The server has not found anything matching the Request-URI. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                      |
|--------|----------------------------------|---------------------------------|
| -10004 | ReferenceID expired. | Returned when get transaction status is invoked for a reference ID that was processed more than 12 hours ago. |

**HTTP 429**

**Too Many Requests.** The user sent too many requests in a given amount of time. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                          |
|--------|----------------------------------|---------------------------------|
| 3204   | Rate limit exceeded | Rate limit exceeded. |

**HTTP 503**

**Service Unavailable.** The system is unavailable, try again. If you want to code against a response, you should retrieve the status or error code and use that rather than the HTTP status response.

| Status Code | Associated Text String | Description                                      |
|--------|----------------------------------|---------------------------------|
| 3041 | System unavailable | The system is unavailable, try again later. |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, 32-digit hex value randomly generated by Telesign to identify this request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `external_id` | string |  | Your own identifier, used to refer to this transaction. If you did not supply an external ID in your request, the value of this response property is `null`. Example: `7c8832a1-ab0c-4f12-89f3-0bfbfb7f9645`. |
| `status` | object |  | Contains details about the request status. |
| `status.code` | integer | yes | A numeric code that indicates the status of your transaction. Example: `290`. |
| `status.description` | string | yes | Text describing the status of your transaction. Example: `Message in progress`. |
| `status.last_channel` | string | yes | The name of the channel, or the last channel from `channel_status` array. Example: `sms`. |
| `status.updated_on` | string | yes | A timestamp showing when your transaction status was updated last. Example: `2020-05-04 22:07:01:226`. |
| `additional_info` | object | yes | Contains properties about mobile country code and the mobile network code associated with the mobile device. |
| `additional_info.price` | string |  | The cost incurred for sending the message. For the `sms` channel, this field is present if “Send customer price” (SMS feature) and “Report Enrichment Enabled” (Messaging feature) are enabled for your account. For other channels, this field is present if “Send Price in DLR” (Channel feature) and “Report Enrichment Enabled” (Messaging feature) are enabled for your account. Example: `0.0050`. |
| `additional_info.currency` | string |  | The currency in which the price is expressed (e.g., 'USD'). This field is present if the 'Report Enrichment Enabled' feature is active on your account. Example: `USD`. |
| `additional_info.mcc` | string |  | Returns the mobile country code (MCC) for the current carrier associated with the mobile device if this feature is enabled for Messaging. The MCC is used in conjunction with the mobile network code (MNC) to uniquely identify a carrier. Example: `310`. |
| `additional_info.mnc` | string |  | Returns the mobile network code (MNC) value(s) for the current carrier associated with the device if this feature is enabled for Messaging. The MNC is used in conjunction with the mobile country code (MCC) to uniquely identify a carrier. Example: `012`. |
| `verify` | object |  | Contains properties about the status of the verification attempt by the end user (if any). Only returned in the get transaction status response when an OTP code is auto-generated by Telesign. |
| `verify.code_state` | string | yes | Indicates whether the verification code you provided in your request matches that sent by Telesign to the end user. Possible values are: * `VALID` - The codes match. The offered code is valid. Used for get transaction status by reference ID and OTP code. * `INVALID` - The codes do not match and the offered code is not valid. Used for get transaction status by reference ID and OTP code. * `UNKNOWN` - Any other state. Used for get transaction status by reference ID. Example: `VALID`. |
| `verify.code_entered` | string | yes | When an OTP code is auto-generated by Telesign (eg. get transactio status by reference ID and OTP code), If the end user entered a code, what they entered is provided here. When get transaction status by reference ID is used, `null` is returned instead. Example: `9321041`. |
| `channel_status` | array of object | yes | Contains details about the status of each channel specified for sending OTP codes. |
| `channel_status[].viber` | object |  | Contains details about the status of the viber channel if specified for sending OTP codes. |
| `channel_status[].viber.code` | integer | yes | The status code that pertains to the channel. Example: `3000`. |
| `channel_status[].viber.description` | string | yes | The description for the channel's status code. Example: `Delivered`. |
| `channel_status[].viber.reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. In case of channel status code 3001, reference_id will not be returned. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `channel_status[].viber.updated_on` | string | yes | The timestamp indicating when the transaction status is logged. Example: `2020-05-04 22:07:01:226`. |
| `channel_status[].whatsapp` | object |  | Contains details about the status of the whatsapp channel if specified for sending OTP codes. |
| `channel_status[].whatsapp.code` | integer | yes | The status code that pertains to the channel. Example: `3000`. |
| `channel_status[].whatsapp.description` | string | yes | The description for the channel's status code. Example: `Delivered`. |
| `channel_status[].whatsapp.reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. In case of channel status code 3001, reference_id will not be returned. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `channel_status[].whatsapp.updated_on` | string | yes | The timestamp indicating when the transaction status is logged. Example: `2020-05-04 22:07:01:226`. |
| `channel_status[].rcs` | object |  | Contains details about the status of the rcs channel if specified for sending OTP codes. |
| `channel_status[].rcs.code` | integer | yes | The status code that pertains to the channel. Example: `3000`. |
| `channel_status[].rcs.description` | string | yes | The description for the channel's status code. Example: `Delivered`. |
| `channel_status[].rcs.reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. In case of channel status code 3001, reference_id will not be returned. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `channel_status[].rcs.updated_on` | string | yes | The timestamp indicating when the transaction status is logged. Example: `2020-05-04 22:07:01:226`. |
| `channel_status[].sms` | object |  | Contains details about the status of the sms channel if specified for sending OTP codes. |
| `channel_status[].sms.code` | integer | yes | The status code that pertains to the channel. Example: `3000`. |
| `channel_status[].sms.description` | string | yes | The description for the channel's status code. Example: `Delivered`. |
| `channel_status[].sms.reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. In case of channel status code 3001, reference_id will not be returned. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `channel_status[].sms.updated_on` | string | yes | The timestamp indicating when the transaction status is logged. Example: `2020-05-04 22:07:01:226`. |
| `channel_status[].email` | object |  | Contains details about the status of the email channel if specified for sending OTP codes. |
| `channel_status[].email.code` | integer | yes | The status code that pertains to the channel. Example: `3000`. |
| `channel_status[].email.description` | string | yes | The description for the channel's status code. Example: `Delivered`. |
| `channel_status[].email.reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. In case of channel status code 3001, reference_id will not be returned. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `channel_status[].email.updated_on` | string | yes | The timestamp indicating when the transaction status is logged. Example: `2020-05-04 22:07:01:226`. |

### Example response (200)

```json
{
  "status": {
    "updated_on": "2024-11-12T13:08:37.000000Z",
    "code": 3000,
    "description": "Delivered",
    "last_channel": "whatsapp"
  },
  "reference_id": "364C81F5F3D0020C91E7A731DE93A777",
  "currency": "USD",
  "price": "0.0050",
  "additional_info": {
    "mcc": "310",
    "mnc": "012"
  },
  "channel_status": [
    {
      "viber": {
        "code": 3112,
        "description": "Specified template does not exist for selected channel",
        "reference_id": "364C81F5F40C0120923096EEAF73053E",
        "updated_on": "2024-11-12T13:08:35.212526Z"
      }
    },
    {
      "whatsapp": {
        "code": 3000,
        "description": "Delivered",
        "reference_id": "364C81F5F46402189211BDE408330A86",
        "updated_on": "2024-11-12T13:08:37.000000Z"
      }
    }
  ],
  "verify": {
    "code_entered": "50361",
    "code_state": "VALID"
  }
}
```


---

## Check channel-capability of a phone number

**MCP tool:** `messaging_check_channel_capability`

```http
GET https://rest-ww.telesign.com/capability/{channel}/{phone_number}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/checkphonenumberchannelcapability> (updated 2026-09-11)

Use this action to check capability of a phone number to use the specified channel.

To enable this feature for your account, contact our [Customer Support Team](mailto:support@telesign.com).

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string | yes | The phone number that the service should check for capability to use the specified channel. |
| `channel` | string enum | yes | The service checks the phone number for capability to use this channel. Allowed: `rcs`. |

### Responses

**HTTP 200**

**Success.** The service successfully processed this request. Code against the Telesign `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3055|Delivery channel not supported by the end user's device|The device associated with this phone number cannot use the selected channel.
3060|Delivery channel supported by the end user's device|The device associated with this phone number can use the selected channel.
3115|Destination phone number not in coverage|The device associated with this phone number can use the selected channel, but it is not in coverage for Telesign Messaging.

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3109|Invalid value for parameter sender_id: {sender_id}|The value of the sender_id parameter in your request is invalid.
3110|Invalid request|This API request was not properly formatted. (Final)

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3210|Capability Check not enabled for Customer ID|This feature (Capability Check) is not enabled for this Customer ID. (Final)

**HTTP 429**

**Too many requests.** Too many requests sent to this API in a given amount of time. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3204|Rate limit exceeded|Allowed number of requests per second on the Telesign Messaging API has been exceeded. (Final)

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3041|Carrier rejected - temporary problem|The channel provider failed to respond. The request should be resubmitted.
3500 | System Unavailable | The system is currently unavailable. The request should be resubmitted. (Final)

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object | yes |  |
| `status.code` | integer |  | Example: `3060`. |
| `status.description` | string |  | Example: `Delivery channel supported by the end user's device`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 3060,
    "description": "Delivery channel supported by the end user's device"
  }
}
```


---

## Check capability of a phone number for an RBM agent

**MCP tool:** `messaging_check_rcs_capability`

```http
GET https://rest-ww.telesign.com/capability/rcs/{phone_number}/{agent_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/checkphonenumberrbmcapability> (updated 2026-09-11)

Use this action to check capability of a phone number to receive messages from the specified RBM agent.

To enable this feature for your account, contact our [Customer Support Team](mailto:support@telesign.com).

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string | yes | The phone number that the service should check for capability to receive messages from the specified RBM agent. |
| `agent_id` | string | yes | Narrows the check to the phone number's capability to use the RBM agent specified by this unique identifier. Length: 0-20. Example: `my_rbm_id`. |

### Responses

**HTTP 200**

**Success.** The service successfully processed this request. Code against the Telesign `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3055|Delivery channel not supported by the end user's device|The device associated with this phone number cannot use the selected channel.
3060|Delivery channel supported by the end user's device|The device associated with this phone number can use the selected channel.
3115|Destination phone number not in coverage|The device associated with this phone number can use the selected channel, but it is not in coverage for Telesign Messaging.

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3109|Invalid value for parameter sender_id: {sender_id}|The value of the sender_id parameter in your request is invalid.
3110|Invalid request|This API request was not properly formatted. (Final)

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3210|Capability Check not enabled for Customer ID|This feature (Capability Check) is not enabled for this Customer ID. (Final)

**HTTP 429**

**Too many requests.** Too many requests sent to this API in a given amount of time. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3204|Rate limit exceeded|Allowed number of requests per second on the Telesign Messaging API has been exceeded. (Final)

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the Telesign status or error codes from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
--|--|--
3041|Carrier rejected - temporary problem|The channel provider failed to respond. The request should be resubmitted.
3500 | System Unavailable | The system is currently unavailable. The request should be resubmitted. (Final)

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object | yes |  |
| `status.code` | integer |  | Example: `3060`. |
| `status.description` | string |  | Example: `Delivery channel supported by the end user's device`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 3060,
    "description": "Delivery channel supported by the end user's device"
  }
}
```


---

## Create messaging template

**MCP tool:** `templates_create`

```http
POST https://rest-ww.telesign.com/v1/omnichannel/templates
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/createmsgtemplate> (updated 2026-09-11)

Use this action to create a Telesign Messaging template.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | The name of this template. Use only lowercase alpha characters and underscores. For WhatsApp, the name must include "telesign_otp" if you want Telesign to generate the OTP for you. For example: "verofinto_telesign_otp_wa_template". To enable this feature and create SMS templates with the OTP auto-generated by Telesign, contact our [Customer Support Team](mailto:support@telesign.com). Length: 0-512. Example: `wa_bogo`. |
| `type` | string enum | yes | Specifies whether the template requires verification by the channel provider or not. Allowed: `standard`, `verified`. Example: `verified`. |
| `channel` | string enum | yes | The channel the template is used with. Each template can only be used with one channel. Allowed: `whatsapp`, `sms`. Example: `whatsapp`. |
| `category` | string enum |  | The category name specifying this template's use case. Only required for WhatsApp templates. Do not include any whitespace characters. Allowed: `marketing`, `utility`, `authentication`, `1way`. Example: `marketing`. |
| `language` | string |  | An abbreviation specifying the language of the text in the template. This is required for WhatsApp templates and not supported for other templates. See  [Messaging - Supported languages for WhatsApp templates](https://developer.telesign.com/enterprise/docs/messaging-supported-languages-for-whatsapp-templates) for a list of valid abbreviations. Example: `en_US`. |
| `content` | array of object \| object \| object \| object \| object | yes | Contains properties defining the new template. The array can contain up to one instance of each object type: `header`, `body`, `footer`, `suggested_action`, and `suggested_reply`. A `body` object must be included. To add the first object, select the `Add` button. To add more objects, scroll past the `suggested_reply` object and select the `Add` button again. If you select a different object without using the `Add` button, it will replace your previous selection with the new one. |
| content[] — option 1: header | object |  |  |
| `content[].header` | object |  | Contains properties related to the header of this template. Not supported for SMS templates. [Variables](https://developer.telesign.com/enterprise/docs/messaging-create-whatsapp-template#variables) can be included here. |
| `content[].header.type` | string enum |  | The type of content to display in the header of this template. Required when using a template header. Allowed: `text`, `image`, `video`, `file`, `location`. Example: `image`. |
| `content[].header.text` | string |  | Text to display in the header of this template. This is required if the value of `type` in this object is `text`. [Variables](https://developer.telesign.com/enterprise/docs/messaging-create-whatsapp-template#variables) can be included here. Length: 0-60. Example: `Welcome to {{}} `. |
| `content[].header.sample_url` | string |  | The source URL for a sample media file or file for download of the type to be displayed in the messages created with this template. This is required for verified templates if the value of the `type` property in this object is `image`, `video`, or `file`. Example: `https://s3.amazonaws.com/verofinto-mktg/small-logo.jpg`. |
| `content[].header.sample_text` | array of string |  | A list of the sample values for each of the variables in `text`. This parameter is required if a variable is used in `text`. Use double curly brackets to include a variable name in a parameter value. See [Variables](https://developer.telesign.com/enterprise/docs/messaging-create-whatsapp-template#variables) for more information about formatting variables. |
| content[] — option 2: body | object |  |  |
| `content[].body` | object | yes | Contains properties related to the body of this template. [Variables](https://developer.telesign.com/enterprise/docs/messaging-create-whatsapp-template#variables) can be included here. |
| `content[].body.type` | string enum | yes | The type of content to display in the body of this template. Allowed: `text`. Example: `text`. |
| `content[].body.text` | string |  | Text to display in the body of this template. This is required if the value of `type` in this object is `text`. [Variables](https://developer.telesign.com/enterprise/docs/messaging-create-whatsapp-template#variables) can be included here. Length: 0-1024. Example: `Buy one get one free!`. |
| `content[].body.sample_text` | array of string |  | A list of the sample values for each of the variables in `text`. This parameter is required if a variable is used in `text`. Use double curly brackets to include a variable name in a parameter value. See [Variables](https://developer.telesign.com/enterprise/docs/messaging-create-whatsapp-template#variables) for more information about formatting variables. |
| content[] — option 3: footer | object |  |  |
| `content[].footer` | object |  | Contains properties related to the footer of this template. Not supported for SMS templates. Variables are not supported in the footer. |
| `content[].footer.type` | string enum |  | The type of content to display in the footer of this template. Required when using a template footer. Allowed: `text`. Example: `text`. |
| `content[].footer.text` | string |  | Text to display in the footer of this template. This is required if the value of `type` in this object is `text`. Variables are not supported in the footer. Length: 0-60. Example: `Reply STOP to unsubscribe`. |
| content[] — option 4: Suggested action | object |  |  |
| `content[].suggested_action` | array of object |  | Each item contains properties that define a call-to-action element to include in this template. Not supported for SMS templates. |
| `content[].suggested_action[].action_type` | string enum |  | The type of call-to-action this button provides. A button of type `dial` and one of type `url` can only be included in the same template if it is a WhatsApp template. Button types `url` and `url_dynamic` are only supported for WhatsApp templates. Allowed: `dial`, `url`, `url_dynamic`, `otp`. Example: `dial`. |
| `content[].suggested_action[].otp` | object |  | Contains properties defining the parts of the template related to presenting a one-time passcode (OTP) so an end-user can copy it. |
| `content[].suggested_action[].otp.otp_text` | string |  | Defines the text shown on a copy code button below a one-time passcode when a WhatsApp copy code authentication template is used. The button allows the end-user to copy a one-time passcode. Use `Autofill` when a WhatsApp one-tap autofill or zero-tap authentication template is used. Required when using the authentication category for WhatsApp verified templates. Length: 0-25. Example: `Autofill`. |
| `content[].suggested_action[].otp.package_name` | string |  | Lists your Android app's package name. It must match the package name set on the intent in Android and will have at least two segments (one or more dots), and each segment must start with a letter. All characters must be alphanumeric or an underscore. Required when using a WhatsApp [one-tap autofill](https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates/autofill-button-authentication-templates) or [zero-tap](https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates/zero-tap-authentication-templates) OTP template. Example: `com.example.myapplication`. |
| `content[].suggested_action[].otp.signature_hash` | string |  | Lists your Android app's signing key hash. It must match the installed app's signing key hash. All characters must be either alphanumeric, +, /, or = (a-zA-Z0-9+/=). Required when using a WhatsApp [one-tap autofill](https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates/autofill-button-authentication-templates) or [zero-tap](https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates/zero-tap-authentication-templates) OTP template. Length: 11-11. Example: `28aFAINcGX7`. |
| `content[].suggested_action[].otp.zero_tap_terms_accepted` | boolean |  | Set to `true` to indicate that you understand that your use of [zero-tap](https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates/zero-tap-authentication-templates) is subject to the [WhatsApp Business Terms of Service](https://www.whatsapp.com/legal/business-terms), and that it's your responsibility to ensure your end users expect that the code will be automatically filled in on their behalf when they choose to receive the zero-tap code through WhatsApp. If it is set to `false`, the template will **not** be created because you need to accept WhatsApp’s zero-tap terms before creating zero-tap enabled message templates. |
| `content[].suggested_action[].dial` | object |  | Contains properties defining a click-to-call button. |
| `content[].suggested_action[].dial.phone_number_to_dial` | string |  | The phone number for the end user's device to call when this button is selected. This is required when using click-to-call buttons. Example: `18003334444`. |
| `content[].suggested_action[].dial.dial_text` | string |  | Text to display on this button. This is required when using click-to-call buttons. Example: `Call us`. |
| `content[].suggested_action[].url` | object |  | Contains properties defining a link button. |
| `content[].suggested_action[].url.url` | string |  | The complete URL of the destination of this link button. This cannot be modified by individual sends with this template. Required when using link buttons. Length: 0-2000. Example: `https://verofintoshop.com/orders`. |
| `content[].suggested_action[].url.url_text` | string |  | Text to display on this button. Required when using link buttons. Length: 0-25. Example: `Track Order`. |
| `content[].suggested_action[].url_dynamic` | object |  | Contains properties defining a link button with a URL that can be dynamically modified in each message sent with this template. |
| `content[].suggested_action[].url_dynamic.url` | string |  | The base URL for the destination of this link button. Can be a static or dynamic url. In each message sent with this template you can add to this path for that send. Note that the maximum length for this value *includes the characters added to the path in any message using this template*. WhatsApp reserves 50 of the 200 characters for its own use. So you should stay far enough below this maximum to leave room for the length of characters you expect each message to add. Required when using link buttons. Length: 0-2000. Example: `https://verofintoshop.com/orders?id=`. |
| `content[].suggested_action[].url_dynamic.url_text` | string |  | Text to display on this button. Required when using link buttons. Length: 0-25. Example: `Track Order`. |
| content[] — option 5: Suggested reply | object |  |  |
| `content[].suggested_reply` | object |  | Contains properties that define suggested replies to include in this template. Supported for WhatsApp templates only. [Variables](https://developer.telesign.com/enterprise/docs/messaging-create-whatsapp-template#variables) can be included here. |
| `content[].suggested_reply.reply_type` | string enum |  | The type of suggested replies to display in this template. Use `button` for WhatsApp [quick replies](https://developers.facebook.com/docs/messenger-platform/reference/buttons/quick-replies) and `list` for WhatsApp [list messages](https://developers.facebook.com/docs/whatsapp/guides/interactive-messages/#list-messages). Allowed: `button`, `list`. Example: `button`. |
| `content[].suggested_reply.button_number` | integer |  | The number of buttons to include in this template. Required for suggested replies with type `buttons`. Range: -∞ to 3. Example: `2`. |
| `content[].suggested_reply.buttons` | array of object |  | Each item contains properties that define a suggested reply button to include in this template. Required when `suggested_reply.reply_type` has the value `button`. See WhatsApp [quick replies](https://developers.facebook.com/docs/messenger-platform/reference/buttons/quick-replies). |
| `content[].suggested_reply.buttons[].button_text` | string | yes | Text to display on this button. This cannot be changed in individual Messaging requests using this template. Length: 0-25. Example: `Yes`. |
| `content[].suggested_reply.sections` | array of object |  | Each item contains properties that define a suggested reply section to include in this template. Required for suggested replies with type `list`. See WhatsApp [list messages](https://developers.facebook.com/docs/whatsapp/guides/interactive-messages/#list-messages). |
| `content[].suggested_reply.sections[].row_number` | integer |  | he number of rows included in this section. A maximum of 10 rows can be included across **all** sections in this template. Range: -∞ to 10. Example: `1`. |

### Example requests

**Image**

```json
{
  "name": "name_of_the_template",
  "type": "verified",
  "channel": "whatsapp",
  "content": [
    {
      "header": {
        "type": "image",
        "sample_url": "https://s3.amazonaws.com/vero-finto-mktg/small-logo.jpg"
      }
    },
    {
      "body": {
        "type": "text",
        "text": "Hello, welcome to {{1}}.",
        "sample_text": [
          "Vero-Finto"
        ]
      }
    }
  ],
  "category": "marketing",
  "language": "en"
}
```

**Dynamic link button**

```json
{
  "type": "verified",
  "channel": "whatsapp",
  "name": "wa_purchase_conf_track",
  "category": "marketing",
  "language": "en_US",
  "content": [
    {
      "body": {
        "type": "text",
        "text": "Thanks for your purchase on verofinto.com! Track your order status here:"
      }
    },
    {
      "suggested_action": [
        {
          "otp": {
            "zero_tap_terms_accepted": true
          },
          "url_dynamic": {
            "url": "https://verofintoshop.com/orders?id=",
            "url_text": "Track Order"
          },
          "action_type": "url_dynamic"
        }
      ]
    }
  ]
}
```

**Copy code button**

```json
{
  "name": "copy_code_template",
  "type": "verified",
  "channel": "whatsapp",
  "content": [
    {
      "body": {
        "type": "text"
      }
    },
    {
      "suggested_action": [
        {
          "action_type": "otp",
          "otp": {
            "otp_text": "Copy code"
          }
        }
      ]
    }
  ],
  "category": "authentication",
  "language": "en"
}
```

**Location header**

```json
{
  "name": "location_header_template",
  "type": "verified",
  "channel": "whatsapp",
  "content": [
    {
      "header": {
        "type": "location"
      }
    },
    {
      "body": {
        "type": "text",
        "text": "This is example of Location header template."
      }
    }
  ],
  "category": "marketing",
  "language": "en"
}
```

**One-tap autofill**

```json
{
  "name": "one_tap_template",
  "type": "verified",
  "channel": "whatsapp",
  "content": [
    {
      "body": {
        "type": "text"
      }
    },
    {
      "suggested_action": [
        {
          "action_type": "otp",
          "otp": {
            "otp_text": "Autofill",
            "package_name": "com.example.myapplication",
            "signature_hash": "2FAINcGX7"
          }
        }
      ]
    }
  ],
  "category": "authentication",
  "language": "en"
}
```

**Zero-tap**

```json
{
  "name": "zero_tap_template",
  "type": "verified",
  "channel": "whatsapp",
  "content": [
    {
      "body": {
        "type": "text"
      }
    },
    {
      "suggested_action": [
        {
          "action_type": "otp",
          "otp": {
            "otp_text": "Autofill",
            "package_name": "com.example.myapplication",
            "signature_hash": "2FAINcGX7",
            "zero_tap_terms_accepted": true
          }
        }
      ]
    }
  ],
  "category": "authentication",
  "language": "en"
}
```

### Responses

**HTTP 200**

**Success.** Your request was successful and the service is processing your new template. Code against the Telesign status code from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
------------|-------------|------------
3801|Request succesful|This template is being processed by the service. Additional updates on the status of this transaction will be sent to your transaction callback service endpoint.

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3110|Invalid request|The API request or its JSON payload is improperly formatted. (Final)
3301|Missing parameter channel|The API request does not contain the mandatory parameter `channel`. (Final)
3802|Missing parameter name|The API request does not contain the mandatory parameter `name`. (Final)
3803|Missing parameter type|The API request does not contain the mandatory parameter `type`. (Final)
3815|Missing parameter content|The API request does not contain the mandatory parameter `content`. (Final)
3816|Invalid value for parameter category: {category}|The value of parameter `category` is not one of the supported values. See request schema for a list of supported values. (Final)
3817|Invalid value for parameter category: {language}|The value of parameter `language` is not one of the supported values. See request schema for a list of supported values. (Final)
3819|Invalid value for parameter sample_text|The value for the `sample_text` parameter is missing or the number of values does not match the number of variables in the body or header.
3856|Invalid value for parameter name: {name}|Template name already exists, or it is missing, or it is not valid. (Final)

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3400|Not authorized|Insufficient permissions to access this resource or authorization failed.
3818|Template Management Product not enabled for Customer ID|Omnichannel product is not enabled. (Final)

**HTTP 429**

**Too many requests.** Too many requests sent to this service in a given amount of time. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3204|Rate limit exceeded|Allowed number of requests per second for this product or feature has been exceeded.

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3500|System Unavailable|The system is currently unavailable. The request should be resubmitted.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `status` | object |  | Contains properties related to the request status. |
| `status.code` | integer | yes | A numeric code that indicates the status of your transaction. Example: `290`. |
| `status.description` | string | yes | Text describing the status of your transaction. Example: `Message in progress`. |
| `status.updated_on` | string | yes | A timestamp showing when your transaction status was updated last. Example: `2022-31-03T14:51:28.709526Z`. |
| `id` | string |  | The service's unique identifier for this transaction. Example: `B5862A14363C016C8832D53625270015`. |
| `name` | string | yes | The name of this template. Use only lowercase alpha characters and underscores. For WhatsApp, the name must include "telesign_otp" if you want Telesign to generate the OTP for you. For example: "verofinto_telesign_otp_wa_template". To enable this feature and create SMS templates with the OTP auto-generated by Telesign, contact our [Customer Support Team](mailto:support@telesign.com). Length: 0-512. Example: `wa_bogo`. |

### Example response (200)

```json
{
  "status": {
    "code": 3800,
    "description": "Request successful",
    "updated_on": "2022-02-12T14:57:11.765723Z"
  },
  "id": "B5862A14363C016C8832D53625270015",
  "name": "wa_bogo"
}
```


---

## Get all messaging templates

**MCP tool:** `templates_list`

```http
GET https://rest-ww.telesign.com/v1/omnichannel/templates
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getallmsgtemplates> (updated 2026-09-11)

Use this action to get details for all Telesign Messaging templates associated with this Customer ID.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in data being retrieved.

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3400|Not authorized|Insufficient permissions to access this resource or authorization failed.
3818|Template Management Product not enabled for Customer ID|Omnichannel product is not enabled. (Final)

**HTTP 429**

**Too many requests.** Too many requests sent to this service in a given amount of time. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3204|Rate limit exceeded|Allowed number of requests per second for this product or feature has been exceeded.

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3500|System Unavailable|The system is currently unavailable. The request should be resubmitted.

### Example response (200)

```json
[
  {
    "name": "wa_bogo",
    "type": "verified",
    "channel": "whatsapp",
    "category": "marketing",
    "language": "en_US",
    "status": "Approved",
    "mandatory_parameters": [
      "header_url",
      "body_text_1"
    ]
  },
  {
    "name": "wa_purchase_conf",
    "type": "verified",
    "channel": "whatsapp",
    "category": "utility",
    "language": "en_US",
    "status": "Approved",
    "mandatory_parameters": [
      "header_url",
      "body_text_1",
      "body_text_2"
    ]
  }
]
```


---

## Get messaging template

**MCP tool:** `templates_get`

```http
GET https://rest-ww.telesign.com/v1/omnichannel/templates/{channel}/{name}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getmsgtemplate> (updated 2026-09-11)

Use this action to get details for the specified Telesign Messaging template.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `channel` | string enum | yes | One of the Telesign Messaging channels for which programmatic template management is supported. Allowed: `whatsapp`, `sms`. Example: `whatsapp`. |
| `name` | string | yes | The name of this template. Example: `wa_bogo`. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and resulted in data being retrieved.

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3856|Invalid value for parameter name: {name}|The value of parameter name is missing or not valid.

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3400|Not authorized|Insufficient permissions to access this resource or authorization failed.
3818|Template Management Product not enabled for Customer ID|Omnichannel product is not enabled. (Final)

**HTTP 429**

**Too many requests.** Too many requests sent to this service in a given amount of time. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3204|Rate limit exceeded|Allowed number of requests per second for this product or feature has been exceeded.

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3500|System Unavailable|The system is currently unavailable. The request should be resubmitted.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | The name of this template. Use only lowercase alpha characters and underscores. For WhatsApp, the name must include "telesign_otp" if you want Telesign to generate the OTP for you. For example: "verofinto_telesign_otp_wa_template". To enable this feature and create SMS templates with the OTP auto-generated by Telesign, contact our [Customer Support Team](mailto:support@telesign.com). Length: 0-512. Example: `wa_bogo`. |
| `type` | string enum | yes | Specifies whether the template requires verification by the channel provider or not. Allowed: `standard`, `verified`. Example: `verified`. |
| `channel` | string enum | yes | The channel the template is used with. Each template can only be used with one channel. Allowed: `whatsapp`, `sms`. Example: `whatsapp`. |
| `category` | string enum |  | The category name specifying this template's use case. Only required for WhatsApp templates. Do not include any whitespace characters. Allowed: `marketing`, `utility`, `authentication`, `1way`. Example: `marketing`. |
| `language` | string |  | An abbreviation specifying the language of the text in the template. This is required for WhatsApp templates and not supported for other templates. See  [Messaging - Supported languages for WhatsApp templates](https://developer.telesign.com/enterprise/docs/messaging-supported-languages-for-whatsapp-templates) for a list of valid abbreviations. Example: `en_US`. |
| `status` | string | yes | The place of this template in Telesign's approval process. Note that WhatsApp templates used to initiate a conversation with a user also must be approved by WhatsApp. Telesign submits these templates for approval on your behalf and passes through the WhatsApp approval status in this same property. Example: `Approved`. |
| `mandatory_parameters` | array of string | yes | Lists each parameter you must include when you use this template in a Telesign Messaging request. |

### Example response (200)

```json
{
  "name": "wa_bogo",
  "type": "verified",
  "channel": "whatsapp",
  "category": "marketing",
  "language": "en_US",
  "status": "Approved",
  "mandatory_parameters": [
    "body_text_1"
  ]
}
```


---

## Delete template

**MCP tool:** `templates_delete`

```http
DELETE https://rest-ww.telesign.com/v1/omnichannel/templates/{channel}/{name}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/deletemsgtemplate> (updated 2026-09-11)

Use this action to delete a Telesign Messaging template.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `channel` | string enum | yes | One of the Telesign Messaging channels for which programmatic template management is supported. Allowed: `whatsapp`, `sms`. Example: `whatsapp`. |
| `name` | string | yes | The name of this template. Example: `wa_bogo`. |

### Responses

**HTTP 200**

**Success.** Your request was successful and the service is processing your deletion. Code against the Telesign status code from the `status.code` property in the response payload, rather than the HTTP status code of the response.

Status code | Text string | Description
------------|-------------|------------
3801|Request succesful|This deletion request is being processed by the service. Additional updates on the status ofthis transaction will be sent to your transaction callback service endpoint.

**HTTP 400**

**Bad request.** The request could not be understood by the server due to malformed syntax. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3856|Invalid value for parameter name: {name}|The value of parameter name is missing or not valid.

**HTTP 401**

**Unauthorized.** The request requires user authentication. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3400|Not authorized|Insufficient permissions to access this resource or authorization failed.
3818|Template Management Product not enabled for Customer ID|Omnichannel product is not enabled. (Final)

**HTTP 429**

**Too many requests.** Too many requests sent to this service in a given amount of time. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3204|Rate limit exceeded|Allowed number of requests per second for this product or feature has been exceeded.

**HTTP 503**

**Service unavailable.** The system is unavailable, try again. Code against the value of the Telesign `status.code` property in the response payload, rather than the HTTP status code.

Status code | Text string        | Description
------------|--------------------|------------
3500|System Unavailable|The system is currently unavailable. The request should be resubmitted.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `status` | object |  | Contains properties related to the request status. |
| `status.code` | integer | yes | A numeric code that indicates the status of your transaction. Example: `290`. |
| `status.description` | string | yes | Text describing the status of your transaction. Example: `Message in progress`. |
| `status.updated_on` | string | yes | A timestamp showing when your transaction status was updated last. Example: `2022-31-03T14:51:28.709526Z`. |
| `id` | string |  | The service's unique identifier for this transaction. Example: `B5862A14363C016C8832D53625270015`. |
| `name` | string | yes | The name of this template. Use only lowercase alpha characters and underscores. For WhatsApp, the name must include "telesign_otp" if you want Telesign to generate the OTP for you. For example: "verofinto_telesign_otp_wa_template". To enable this feature and create SMS templates with the OTP auto-generated by Telesign, contact our [Customer Support Team](mailto:support@telesign.com). Length: 0-512. Example: `wa_bogo`. |

### Example response (200)

```json
{
  "status": {
    "code": 3800,
    "description": "Request successful",
    "updated_on": "2022-02-12T14:57:11.765723Z"
  },
  "id": "B5862A14363C016C8832D53625270015",
  "name": "wa_bogo"
}
```

