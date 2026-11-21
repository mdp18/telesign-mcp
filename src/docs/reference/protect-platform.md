# Protect Platform and Flow Builder - API reference

Protect Platform authentication and Flow Builder transactional flows (select regions, full-service accounts).

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `protect_generate_access_token`, `flowbuilder_init_flow`._

## Generate access token

**MCP tool:** `protect_generate_access_token`

```http
POST https://us-east-1.di-platform.telesign.com/authenticationmanager/v1/authenticate/api
```

- **Authentication:** Protect Platform Basic (username + password) plus `x-API-key`
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/initiateauthentication> (updated 2026-09-11)

> 📘 NOTE:
>
> Select regional availability. This feature is currently available for customers with end users in select countries. To find out if this feature is available in your region, contact a Telesign expert. This product is available for full-service accounts only.

Use this endpoint to generate an access token to interact securely with Protect Platform services, which require an external authentication service that issues an access token upon successful validation of an API Key.

Send credentials via Basic Auth ("Authorization: Basic ...") together with "x-API-key". After you send a POST request to the authentication service with the required credentials, the service returns a Bearer token, which must be included in the Authorization header of all subsequent API requests to ensure secure access. If your access token expires, you must re-authenticate using this endpoint to obtain a new token. Include the accessToken in the Authorization header of every API request for authentication and authorization.

#### General requirements
* **Authentication:** [Basic]
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Required headers:**
   * `Content-Type: application/json`
   * `x-API-key: [YOUR_API_KEY_HERE]`

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `productId` | integer |  | The Product ID associated with the Flow Builder. The Product Id for the Flow Builder is `3`. Default: `3`. |

### Example request

```json
{
  "productId": 3
}
```

### Responses

**HTTP 200**

**Success.** The request was processed successfully.

| Status | Condition | error.message | Description |
| --- | --- | --- | --- |
| Success | — | The request was processed successfully. |

**HTTP 400**

**Request validation failed.** One or more fields are missing or have the wrong type/format. See `errors.description` for more details.

Status Condition | error.message  | Description
------------|---------------------|------------------------------
Malformed JSON/body fields  | `Request validation failed`         | One or more fields are missing or have the wrong type/format. See `errors.description` for a per-field breakdown.

**HTTP 401**

**Authorization Errors.** The authentication request failed because the token was invalid, expired, couldn't be validated or because no authorization header was provided.

Status Condition | error.message  | Description
------------|---------------------|------------------------------
Token failed validation  | Error validating token         | Token could not be parsed or verified.
Product failed validation | Error validating token access to product | Credentials have no access to the product.
No Authorization header | No authorization header provided | Authentication header is completely absent.
Token expired / not found | Invalid or expired token | Token is syntactically valid but expired or no longer accepted.

**HTTP 404**

**Unknown path.** The requested resource or endpoint does not exist. Invalid Path or endpoint requested, the API returns an error.

Status Condition | error.message  | Description
------------|---------------------|----------------
Unknown path | `Endpoint not found` | The requested resource or endpoint does not exist.

**HTTP 500**

**Internal error.** Unexpected exception on the server side.

Status Condition | error.message  | Description
------------|---------------------|----------------
Internal error | Internal Server Error | Unexpected exception on the server side.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `message` | string |  | Describes the results of the authentication request. Example: `Operation completed successfully.`. |
| `data` | object |  | Contains properties related to the the access token. |
| `data.accessToken` | string |  | Access token to be used in `Authorization: Bearer`. Must be used in all subsequent API requests. Example: `YOUR_ACCESS_TOKEN_HERE`. |
| `data.expirationTimeSeconds` | integer |  | The validity of the token, measured in seconds. Example: `28800`. |

### Example response (200)

```json
{
  "message": "Operation completed successfully.",
  "data": {
    "accessToken": "YOUR_ACCESS_TOKEN_HERE",
    "expirationTimeSeconds": 28800
  }
}
```


---

## Initialize transactional flow

**MCP tool:** `flowbuilder_init_flow`

```http
POST https://us-east-1.di-hub.telesign.com/hubv2/model/flow/init-flow
```

- **Authentication:** Protect Platform bearer token (fetched automatically)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/initializetransactionalflow> (updated 2026-03-25)

> 📘 NOTE:
>
> Select regional availability. This feature is currently available for customers with end users in select countries. To find out if this feature is available in your region, contact a Telesign expert. This product is available for full-service accounts only.

This endpoint starts a transactional flow inside the Flow Builder. The request must contain a valid flowId and a dataToReplace object whose keys match the parameters defined when the flow was created.

#### General Requirements

* **Authentication:** This authentication method is mandatory, to obtain a valid token from the authentication system, post that include it in all API requests.
* **Encoding:** The API only accepts characters in UTF-8 Unicode format.
* **Accepts:** application/json is the expected data format for the API.
* **Responds with:** application/json is the data format for API responses.
* **Required headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer [your-Access-token]`

#### How `dataToReplace` works

`dataToReplace` is the payload that feeds the flow with the dynamic values your business logic needs. Each entry is a simple key → value pair. **Key** must be identical (case, spelling, numbers, underscores) to the parameter name configured under *Request parameters*. **Value** is a primitive JSON value (string, number, or boolean).

#### Required versus optional parameters

In two situations, a parameter becomes required and will trigger a `400 – Missing Required Parameters` error if absent:

| Field(s) | Situation |
| --- | --- |
| **Mail field / Phone field** | Select **one** existing parameter that holds the user’s e-mail or phone number. The Hub flags it as required for nodes such as **PhoneID**. |
| **Advanced → Select required fields** | Multi-select listing **all** parameters in the flow. Any parameter you select here is required at runtime; un-selected parameters remain optional. |

If a required parameter is missing **or** the key name doesn’t match, the response is:

```json
{
  "data": null,
  "error": {
    "message": "Required fields missing: <parameterName>"
  }
}
```

> 📘 NOTE:
>
> The comparison is case-sensitive (clientId ≠ ClientID). Parameters not flagged in either list above are optional and can be omitted without error.

#### Naming and value rules

| # | Content type | Rule |
| --- | --- | --- |
| 1 | Case-sensitive | `clientId`, `clientID`, and `CLIENTID` are three different parameters. |
| 2 | Free-form names | Letters, numbers, and underscores allowed (`segment`, `Segment1`, `customer_email`). Avoid spaces. |
| 3 | Primitive values | Accepts string, number, boolean. |
| 4 | One-to-one mapping | Every **required** parameter must appear in `dataToReplace`; optional parameters may be skipped. |

**Example 1 – ID lookup**

1. Create flow: Add a Request parameter called `idNumber`.
2. Call `/init-flow` with:

```json
{
  "flowId": "…",
  "dataToReplace": {
    "idNumber": "90123456"
  }
}
```

3. Result: The flow forwards `90123456` to a downstream personal-data service.

**Example 2 – Customer segment routing**

1. Create flow: Add a parameter called `segment`.
2. Call `/init-flow` with:

```json
{
  "flowId": "…",
  "dataToReplace": {
    "segment": "GOLD"
  }
}
```

3. Result: Branching rules route GOLD customers to the premium path.

> 📘 NOTE:
>
> If you rename or delete a parameter in the flow designer, update your `dataToReplace` keys accordingly to avoid the 400 – Missing Required Parameters error.

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `flowId` | string | yes | Unique identifier of the flow created in the Transactional Hub. |
| `dataToReplace` | object | yes | Dictionary of key → value pairs the flow will consume. Keys must match the names defined in Request parameters (case-sensitive). Values are primitive JSON types. |

### Example requests

**Full example**

```json
{
  "flowId": "18380c27-1d1c-4f79-a449-a7c8b12ddf62",
  "dataToReplace": {
    "name": "Juan",
    "cellphone": "11234567890",
    "email": "juan.perez@example.com",
    "age": 28,
    "message": "Hello, this is an example"
  }
}
```

**Id lookup**

```json
{
  "flowId": "…",
  "dataToReplace": {
    "idNumber": "90123456"
  }
}
```

**Segment routing**

```json
{
  "flowId": "…",
  "dataToReplace": {
    "segment": "GOLD"
  }
}
```

### Responses

**HTTP 200**

**Success.** The request has been successfully processed, and the flow has been initialized.

| Error Condition | error.message | Description |
| --- | --- | --- |
| Success | — | The request was processed successfully. A `pTracking` UUID is returned so you can trace the transaction. |

**HTTP 400**

**Missing Required Parameters.** Missing required parameters or invalid body fields. The client must send both `flowId` (UUID v4) and `dataToReplace` (object).

| Error Condition | `error.message` | Description |
| --- | --- | --- |
| Missing / invalid body fields | Request validation failed | One or more fields are missing or have the wrong type/format. See error.details for a per-field breakdown. |
| Missing required dynamic parameters | Required fields missing: <param1>, <param2>… | The flow was configured to expect certain parameters that were not supplied. |
| Invalid flow status | Invalid Flow | The supplied flowId exists, but its status does not allow this operation. |

**HTTP 401**

**Authentication issues.** The request failed because no authorization header provided, an incomplete header (e.g. `Bearer` without token), no authorization header provided, unsupported authorization method, invalid signature, or an expired token.

| Error Condition | `error.message` | Description |
| --- | --- | --- |
| No Authorization header | No authorization header provided | Authentication header is completely absent. |
| Bad header format | Authorization header format error | Header present but incomplete (e.g. Bearer without the token). |
| Unsupported scheme | Unsupported authorization method | Scheme is not Bearer or Basic. |
| Token failed validation | Error validating token | Token could not be parsed or verified. |
| Token expired / not found | Invalid or expired token | Token is syntactically valid but no longer accepted. |

**HTTP 404**

**Flow ID not found.** The flowId provided does not exist or does not belong to the authenticated account.

| Error Condition | error.message | Description |
| --- | --- | --- |
| Unknown flowId | This FlowId was not found | The supplied flowId does not exist. |

**HTTP 500**

**Internal Server Error.** Unexpected exception on the server side.

| Error Condition | error.message | Description |
| --- | --- | --- |
| Internal error | Internal Server Error | Unexpected exception on the server side. |

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | object |  |  |
| `data.status` | string |  | Text describing the results of your request. |
| `data.pTracking` | string |  | A unique identifier (UUID v4) that allows you to track a transaction. A UUID v4 is a 128-bit identifier that is randomly generated from pseudo-random numbers. |
| `error` | object |  | Contains the error information. When the request is successful, this value is null. |

### Example response (200)

```json
{
  "data": {
    "status": "success",
    "pTracking": "802f22a7-c98c-43aa-9ac0-0a0060de8360"
  },
  "error": null
}
```

