# Deactivated Numbers API - API reference

Daily files of deactivated phone numbers so you can clean your user base in bulk.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `deactivatednumbers_list_files`, `deactivatednumbers_download_file`._

## Get file list

**MCP tool:** `deactivatednumbers_list_files`

```http
GET https://deact-api.telesign.com/files
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getdeactnumfilelist> (updated 2026-09-11)

Use this action to get a list of files accessible for you to download that contain deactivated phone numbers.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and a list of file names was retrieved.

Code | Meaning
--|--
2200|Request successfully completed

**HTTP 401**

**Unauthorized.** The request requires user authentication. Customer ID and/or API Key were not provided or were not valid.

Code | Meaning
--|--
2201|Unauthorized access.

**HTTP 403**

**Forbidden.** This user does not have access to this resource.

Code | Meaning
--|--
2203|Request forbidden

**HTTP 500**

**Internal server error.** There was a problem on our side. Try again later.

Code | Meaning
--|--
2250|Internal Server Error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `list_of_files` | array of string |  | Each element in this array is the name of a compressed file containing deactivated numbers. Use these filenames with the `/download/{file_name}` endpoint to download the available files as needed. |
| `code` | integer |  | A numeric code indicating the status of processing this request. Example: `2200`. |
| `description` | string |  | A text description of processing status of this request. Example: `Request successfully completed`. |

### Example response (200)

```json
{
  "list_of_files": [
    "att-deacts_20210719.zip",
    "verizon-deacts_20210719.zip"
  ],
  "code": 2200,
  "description": "Request successfully completed"
}
```


---

## Get file

**MCP tool:** `deactivatednumbers_download_file`

```http
GET https://deact-api.telesign.com/download/{file_name}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/getdeactnumfile> (updated 2026-09-11)

Use this action to download one specified file that contains deactivated phone numbers.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Responds with:** `application/json` or `application/octet-stream`
* **Rate limit:** [Default rate limits by product](https://support.telesign.com/s/article/do-you-have-any-rate-limits)

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `file_name` | string | yes | The filename of the deactivated numbers file you want to download. |

### Responses

**HTTP 200**

**Success.** Your request was fulfilled and a file was retrieved. Note that no response JSON object is returned in the payload, only the contents of the file itself.

**HTTP 401**

**Unauthorized.** The request requires user authentication. Customer ID and/or API Key were not provided or were not valid.

Code | Meaning
--|--
2201|Unauthorized access.

**HTTP 403**

**Forbidden.** This user does not have access to this resource.

Code | Meaning
--|--
2203|Request forbidden

**HTTP 404**

**File not found.** The file was not available to retrieve.

Code | Meaning
--|--
2204|Download failed, the file you are trying to download doesn't exist or may have been deleted.

**HTTP 500**

**Internal server error.** There was a problem on our side. Try again later.

Code | Meaning
--|--
2250|Internal Server Error

