# Voice - API reference

Programmable voice: dial, play, speak (TTS), gather input, record, and manage call recordings.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `voice_send_action`, `voice_list_recordings_for_call`, `voice_list_recordings`, `voice_delete_recordings`._

## Send an action

**MCP tool:** `voice_send_action`

```http
POST https://rest-ww.telesign.com/v2/voice
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/sendvoiceaction> (updated 2026-03-25)

Send an action to Telesign Voice. For more details on the object structure of each specific action type, see the *[Voice - Actions](https://developer.telesign.com/enterprise/reference/voice-actions)* page.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Protocols:** HTTPS
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json` (use [JSON-RPC](http://www.jsonrpc.org/specification) format)
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `method` | string |  | The type of the action included in this request. Example: `dial`. |
| `params` | object |  | Contains sub-properties associated with this action type. For more details on the object structure of each specific action type, see the *[Voice - Actions](https://developer.telesign.com/enterprise/reference/voice-actions)* page. |

### Example request

```json
{
  "method": "dial",
  "params": {
    "to": "15555551212",
    "caller_id_number": "15554441313",
    "send_dtmf": "6458",
    "external_id": "4142b474-d65d-4265-a5fa-a581b1fe6101",
    "is_primary": true
  }
}
```

### Responses

**HTTP 200**

The request was successfully processed, but the service could not complete the action.

|Error string | Description|
|--|--|
| `premium_to_number_rejected` | Phone number (`to`) in the request has the unsupported number type \"premium\". Action rejected. |
| `to_number_blocked_by_country` | Phone number (`to`) in the request is blocked based on its country of origin. Blocked countries can be specified either by you in the customer portal, or by Telesign. Action rejected. |
| `to_number_blocked_by_customer` | Phone number (`to`) in the request is on the blocked list in the customer portal. Action rejected.|
| `to_number_blocked_by_telesign` | Phone number (`to`) in the request is blocked by Telesign for all requests. Action rejected. |

**HTTP 202**

**Success.** The request was successfully processed and the action was successfully taken.

Status string|Description
--|--
`dial_accepted`|The dial action was completed successfully and the end user answered the call.

**HTTP 400**

|Error string|Description|
|--|--|
| `caller_id_number_not_owned` | Virtual number (`caller_id_number`) in the request is not owned by you. Action rejected. |
| `caller_id_number_not_provided` | Request does not include a virtual number (`caller_id_number`). Action rejected. |
| `invalid_phone_number` | Phone number (`to`) in the request is invalid. Action rejected. |
| `to_number_not_provided` | Request does not include a phone number (`to`). Action rejected. |
| `unsupported_call_state` | Action in the request is not supported for current call state, or not supported at all for this event. Action rejected. |

**HTTP 401**

|Error string|Description|
|--|--|
| `credentials_not_provided` | Customer ID and/or API key missing from the authorization header of the request. Action rejected.|
| `not_authorized` | Could not authenticate with the Customer ID and API key in the authorization header of the request. Action rejected. |

**HTTP 429**

|Error string|Description|
|--|--|
| `rate_limit_exceeded` | Account has exceeded rate limit for either outbound or inbound requests. Action rejected. |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A Telesign ID that uniquely identifies this Voice session. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | string |  | Example: `premium_to_number_rejected`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": "premium_to_number_rejected"
}
```


---

## Retrieve a list of recordings for a call

**MCP tool:** `voice_list_recordings_for_call`

```http
GET https://rest-ww.telesign.com/v2/call_recording/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getrecordingslistbycallid> (updated 2026-03-25)

Retrieve a list of recordings associated with the specified call. Each record includes a URL that can be used to download the recording, if available.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication)
* **Protocols:** HTTPS
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | Specifies the call for which you want to retrieve or delete recordings. This ID is returned in the HTTP response to the `dial` action that begins an outbound call or in the `incoming_call` event for an inbound call. |

### Responses

**HTTP 200**

OK

**HTTP 400**

**Bad Request.** Your request contains invalid parameters or is missing required parameters. Check that you've included a valid `reference_id` for a Telesign Voice phone call in the path.

**HTTP 401**

**Unauthorized.** Customer ID and/or API Key were not provided or were not valid.

**HTTP 404**

**Not Found.** No records were found matching the details of your request.

### Example response (200)

```json
[
  {
    "reference_id": "0123456789ABCDEF0123456789ABCDEF",
    "file_name": "0123456789ABCDEF0123456789ABCDEF_1631039244.wav",
    "status": "available",
    "date": "2021-09-07T18:27:24",
    "url": "https://call-recording-stg.tlsn.io/call_recording/D596D7B0D1800164898350B4E71B005C_1631039244.wav?Expires=1631043688&Signature=Jm-Y-qPZMMTbnye-NumQETh~5mNGd6PBRKURKXqeiqj44WeFaKzbdiyXln6ijXff409Srdqme0527mKU15CMuEQXepPeNI64m-ovtt6faE1TbRCa6zHaWeO2dcZM4XYCrILtsgi~j0S5Jj0~PnDMpGXw1XEFOKU55B2o-~asXkxbo-WniO9R8fGV8AHAATwON5roEmxJHNfT1oujq6M3Tq-CNwd46jEhf2tLuVdC1h1XTeHx6UATHPLw3shTPafR3iQ8PP9T8qjWQucoWuAUh5Y7WtDS6U3HMGkOC2QzveHpbA1RNaQMCqT~TvrCtTwEaQr7W~YD82mPwESr9DlRUg__&Key-Pair-Id=APKAJ2B7QX7EM7MEC7SA",
    "transcribe": {
      "language_code": "en-US",
      "transcription": [
        {
          "status": "completed",
          "result": "Welcome to Vero-Finto's customer service line. To better assist you with your issue, please state your name."
        }
      ]
    }
  }
]
```


---

## Get recordings list by date range

**MCP tool:** `voice_list_recordings`

```http
GET https://rest-ww.telesign.com/v2/call_recording
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getrecordingslistbydaterange> (updated 2026-03-25)

Retrieve a list of recordings by date range. Each record includes a reference ID that you can use with other Recordings actions.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication)
* **Protocols:** HTTPS
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Query parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `start_date_time` | string |  | A timestamp defining the beginning of the date range (inclusive). If you include this, you must also include the `end_date_time` param, and must not include `token`. Example: `2019-04-01T03:00:00`. |
| `end_date_time` | string |  | A timestamp defining the end of the date range (inclusive). If you include this, you must also include the `start_date_time` param, and must not include `token`. Example: `2019-04-02T23:00:00`. |
| `pagesize` | string |  | The number of records to return per page. Length: 0-100. Example: `10`. |
| `token` | string |  | Indicates to the service at which page of records to begin retrieval. Found in your previous request to the API. If you include this, you must not include either the `start_date_time` or the `end_date_time` params. |

### Responses

**HTTP 200**

**Success.** A list of recordings was successfully retrieved.

**HTTP 400**

**Bad Request.** Your request contains invalid parameters, contains mutually exclusive parameters, or is missing required parameters. If you included `start_date_time` and `end_date_time`, check that their values were in proper UTC format, and that `token` was not included. If you included `token`, check that its value was a valid token from a previous request to this API, and that `start_date_time` and `end_date_time` were not included.

**HTTP 401**

**Unauthorized.** Customer ID and/or API Key were not provided or were not valid.

**HTTP 404**

**Not Found.** No records were found matching the details of your request.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `call_recordings` | object |  |  |
| `call_recordings.reference_id` | string |  | Specifies the Telesign Voice call for which you want to retrieve or delete recordings. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `call_recordings.file_name` | string |  | The name of this call record file. If the recording is still in progress, this property does not appear. Example: `0123456789ABCDEF0123456789ABCDEF_1631039244.wav`. |
| `call_recordings.status` | string |  | The status of the recording. Possible values are: * `recording` - The call recording is still in progress. It is not yet available for retrieval. * `available` - The call recording is complete and available for retrieval. * `deleted` - The call recording has been deleted and is not available for retrieval. Example: `available`. |
| `call_recordings.date` | string |  | The UTC+0 date when the recording was created. It follows this format: {YYYY}-{MM}-{DD}T{hh}:{mm}:{ss}. Example: `2021-09-07T18:27:24`. |
| `token` | string |  | An arbitrary string you can include in your next request to the API, to return the next page of results. Example: `Z0FBQUFBQmRTM01KYUtpQUlRc0FNcEpuMjczYmlZcC1CMlZVe`. |

### Example response (200)

```json
{
  "call_recordings": {
    "reference_id": "0123456789ABCDEF0123456789ABCDEF",
    "file_name": "0123456789ABCDEF0123456789ABCDEF_1631039244.wav",
    "status": "available",
    "date": "2021-09-07T18:27:24"
  },
  "token": "Z0FBQUFBQmRTM01KYUtpQUlRc0FNcEpuMjczYmlZcC1CMlZVe"
}
```


---

## Delete recordings by ID

**MCP tool:** `voice_delete_recordings`

```http
DELETE https://rest-ww.telesign.com/v2/call_recording/{reference_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/deleterecordings> (updated 2026-03-25)

Delete all recordings and transcripts associated with the call specified by this reference ID.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication)
* **Protocols:** HTTPS
* **Endpoint:** `https://rest-ww.telesign.com/call_recording/{reference_id}`
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string | yes | Specifies the call for which you want to retrieve or delete recordings. This ID is returned in the HTTP response to the `dial` action that begins an outbound call or in the `incoming_call` event for an inbound call. |

### Responses

**HTTP 204**

**Success.** Recordings and transcripts deleted, if authorized.

**HTTP 400**

**Bad Request.** Your request contains invalid parameters or is missing required parameters. Check that you've included a valid `reference_id` for a Telesign Voice phone call in the path.

**HTTP 401**

**Unauthorized.** Customer ID and/or API Key were not provided or were not valid.

**HTTP 404**

**Not Found.** No records were found matching the details of your request.

**HTTP 503**

**Deletion Failure.** One or more of the files you attempted to delete could not be deleted. The response payload lists which files were deleted and which were not.

