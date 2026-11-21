# Accounts API - API reference

Programmatic account management: clone accounts and manage REST API keys.

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `accounts_clone_account`, `accounts_list_api_keys`, `accounts_create_api_key`, `accounts_get_api_key`, `accounts_update_api_key`, `accounts_delete_api_key`._

## Clone account

**MCP tool:** `accounts_clone_account`

```http
POST https://accounts.telesign.com/accounts/{source_account_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/cloneaccount> (updated 2026-10-14)

> 📘 NOTE:
>
> Accounts API is currently available on a limited basis. Contact our [Customer Support Team](mailto:support@telesign.com) if you’d like to explore using this API.

Use this endpoint to clone an account. The account corresponding to the account ID in the path of your request is used as the source account. Configuration properties of the source account are applied to the new account.

You may include contact details for an initial user in the request. Telesign uses those details to send an invitation to sign in to that user, so it's important to ensure that info is valid. You can manually create additional users in your account.

Users and permissions are not copied from the source account.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `source_account_id` | string | yes | Identifies the source account to clone. |

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `account_name` | string | yes | The name of this account. This must be unique within your organization. Example: `Vero-Finto`. |
| `users` | array of object | yes | All new users to be created and given access to this account. Do not include existing users from your organization. |

### Example request

```json
{
  "account_name": "Vero-Finto",
  "users": [
    {
      "first_name": "Jane",
      "last_name": "Smith",
      "phone": "11234567890",
      "email": "jsmith@vero-finto.com"
    }
  ]
}
```

### Responses

**HTTP 201**

**Success.** The new account was successfully created.

Status code | Associated text string
--|--
5005|New account was successfully created.

**HTTP 400**

**Bad Request.**

Status code | Associated text string
--|--
5101|Invalid value for body parameter {param name}.
5103|Invalid value for path parameter {param name}
5110|Request payload is improperly formatted.
5112|Missing required parameter {param_name}.
5114|Resource not found

**HTTP 401**

**Unauthorized.**

Status code | Associated text string
-- | --
5400 | Authentication failed.

**HTTP 403**

**Forbidden.**

Status code | Associated text string
-- | --
5401 | No permissions for this resource.

**HTTP 429**

**Rate limit exceeded.**

Status code | Associated text string
-- | --
5204 | Rate limit exceeded.

**HTTP 503**

**Service unavailable.**

Status code | Associated text string
-- | --
5500 | System unavailable. Please try again later.

### Response fields (201)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  |  |
| `status.code` | integer |  | Example: `5005`. |
| `status.description` | string |  | Example: `New account was successfully created.`. |
| `data` | object |  |  |
| `data.account_id` | string | yes | A unique identifier for this account. Example: `ABC1DE23-A12B-1234-56AB-AB1234567890`. |
| `data.users` | array of object | yes |  |
| `data.users[].first_name` | string | yes | The user's given name. Example: `Jane`. |
| `data.users[].last_name` | string | yes | The user's surname. Example: `Smith`. |
| `data.users[].phone` | string | yes | The contact phone number associated with this user. This is used for MFA when the user signs in. Include the country code. Do not include special characters or spaces. Example: `11234567890`. |
| `data.users[].email` | string | yes | The contact email address for this user. Example: `jsmith@vero-finto.com`. |
| `data.account_name` | string | yes | The name of this account. This must be unique within your organization. Example: `Vero-Finto`. |

### Example response (201)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 5005,
    "description": "New account was successfully created."
  },
  "data": {
    "account_id": "ABC1DE23-A12B-1234-56AB-AB1234567890",
    "users": [
      {
        "first_name": "Jane",
        "last_name": "Smith",
        "phone": "11234567890",
        "email": "jsmith@vero-finto.com"
      }
    ],
    "account_name": "Vero-Finto"
  }
}
```


---

## List REST API keys

**MCP tool:** `accounts_list_api_keys`

```http
GET https://accounts.telesign.com/keys
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/listrestapikeys> (updated 2026-10-14)

> 📘 NOTE:
>
> Accounts API is currently available on a limited basis. Contact our [Customer Support Team](mailto:support@telesign.com) if you’d like to explore using this API.

Use this action to list details related to all REST API keys for this account. The key values are not returned.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Responds with:** `application/json`

### Responses

**HTTP 200**

**Success.** A list of REST API key objects associated with this account was successfully returned.

Status code | Associated text string
--|--
5001|Key list was successfully retrieved.

**HTTP 401**

**Unauthorized.**

Status code | Associated text string
-- | --
5400 | Authentication failed.

**HTTP 403**

**Forbidden.**

Status code | Associated text string
-- | --
5401 | No permissions for this resource.

**HTTP 429**

**Rate limit exceeded.**

Status code | Associated text string
-- | --
5204 | Rate limit exceeded.

**HTTP 503**

**Service unavailable.**

Status code | Associated text string
-- | --
5500 | System unavailable. Please try again later.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  |  |
| `status.code` | integer |  | Example: `5001`. |
| `status.description` | string |  | Example: `Key list was successfully retrieved.`. |
| `data` | object |  | Contains REST API key data. |
| `data.keys` | array of object |  |  |
| `data.keys[].key_id` | string |  | A unique identifier for managing this REST API key. Cannot be used as a token to authenticate REST API requests. Example: `123456`. |
| `data.keys[].last_updated` | string |  | When this REST API key was last updated. Example: `2024-01-01T00:00:00Z`. |
| `data.keys[].expiration_date` | string |  | The expiration date of this REST API key. A value of `never` indicates that this key never expires. Example: `2025-01-01T00:00:00Z`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 5001,
    "description": "Key list was successfully retrieved."
  },
  "data": {
    "keys": [
      {
        "key_id": "123456",
        "last_updated": "2024-01-01T00:00:00Z",
        "expiration_date": "2026-09-05T00:00:00Z"
      }
    ]
  }
}
```


---

## Create new REST API key

**MCP tool:** `accounts_create_api_key`

```http
POST https://accounts.telesign.com/keys
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/post-accounts-account_id-keys-rest> (updated 2026-10-14)

> 📘 NOTE:
>
> Accounts API is currently available on a limited basis. Contact our [Customer Support Team](mailto:support@telesign.com) if you’d like to explore using this API.

Use this action to create a new REST API key for this Telesign account.

This is the only action of this API that returns the key’s value. Be sure to map it to the key ID in a secure fashion on your own system.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `expiration_date` | string | yes | The expiration date of this REST API key. A value of `never` indicates that this key never expires. Example: `2026-09-05T00:00:00Z`. |

### Example request

```json
{
  "expiration_date": "2026-09-05T00:00:00Z"
}
```

### Responses

**HTTP 201**

**Success.** A new REST API key was successfully created for this account.

Status code | Associated text string
--|--
5000|New key was successfully created.

**HTTP 400**

**Bad Request.**

Status code | Associated text string
--|--
5101|Invalid value for body parameter {param name}.
5110|Request payload is improperly formatted.
5111|The limit of {max_no_keys} keys has been reached.
5112|Missing required parameter {param_name}.
5113|{date-time-stamp} is not a valid future date.

**HTTP 401**

**Unauthorized.**

Status code | Associated text string
-- | --
5400 | Authentication failed.

**HTTP 403**

**Forbidden.**

Status code | Associated text string
-- | --
5401 | No permissions for this resource.

**HTTP 429**

**Rate limit exceeded.**

Status code | Associated text string
-- | --
5204 | Rate limit exceeded.

**HTTP 503**

**Service unavailable.**

Status code | Associated text string
-- | --
5500 | System unavailable. Please try again later.

### Response fields (201)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | object |  | Contains REST API key data. |
| `data.key_id` | string |  | A unique identifier for managing this REST API key. Cannot be used as a token to authenticate REST API requests. Example: `123456`. |
| `data.last_updated` | string |  | When this REST API key was last updated. Example: `2024-01-01T00:00:00Z`. |
| `data.expiration_date` | string |  | The expiration date of this REST API key. A value of `never` indicates that this key never expires. Example: `2025-01-01T00:00:00Z`. |
| `data.key` | string |  | The value of the REST API key. Example: `ABC12345yusumoN6BYsBVkh+yRJ5czgsnCehZaOYldPJdmFh6NeX8kunZ2zU1YWaUw/0wV6xfw==`. |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  |  |
| `status.code` | integer |  | Example: `5000`. |
| `status.description` | string |  | Example: `New key was successfully created.`. |

### Example response (201)

```json
{
  "data": {
    "key_id": "123456",
    "last_updated": "2024-01-01T00:00:00Z",
    "expiration_date": "2026-09-05T00:00:00Z",
    "key": "ABC12345yusumoN6BYsBVkh+yRJ5czgsnCehZaOYldPJdmFh6NeX8kunZ2zU1YWaUw/0wV6xfw==\n"
  },
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 5000,
    "description": "New key was successfully created."
  }
}
```


---

## Get one REST API key

**MCP tool:** `accounts_get_api_key`

```http
GET https://accounts.telesign.com/keys/{key_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/get-accounts-account_id-keys-rest-key_id> (updated 2026-10-14)

> 📘 NOTE:
>
> Accounts API is currently available on a limited basis. Contact our [Customer Support Team](mailto:support@telesign.com) if you’d like to explore using this API.

Use this action to list details related to the provided REST API key ID. The key value is not returned.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key_id` | string | yes | Unique identifier for managing this REST API key. This is NOT the key’s value, which is used to authenticate REST API requests. Example: `1234567`. |

### Responses

**HTTP 200**

**Success**. The specified key object was successfully returned.

Status code | Associated text string
--|--
5002| Key object was successfully retrieved.

**HTTP 400**

**Bad Request.**

Status code | Associated text string
--|--
5103|Invalid value for path parameter {param name}

**HTTP 401**

**Unauthorized.**

Status code | Associated text string
-- | --
5400 | Authentication failed.

**HTTP 403**

**Forbidden.**

Status code | Associated text string
-- | --
5401 | No permissions for this resource.

**HTTP 429**

**Rate limit exceeded.**

Status code | Associated text string
-- | --
5204 | Rate limit exceeded.

**HTTP 503**

**Service unavailable.**

Status code | Associated text string
-- | --
5500 | System unavailable. Please try again later.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  |  |
| `status.code` | integer |  | Example: `5002`. |
| `status.description` | string |  | Example: `Key object was successfully retrieved.`. |
| `data` | object |  |  |
| `data.key_id` | string |  | A unique identifier for managing this REST API key. Cannot be used as a token to authenticate REST API requests. Example: `123456`. |
| `data.last_updated` | string |  | When this REST API key was last updated. Example: `2024-01-01T00:00:00Z`. |
| `data.expiration_date` | string |  | The expiration date of this REST API key. A value of `never` indicates that this key never expires. Example: `2025-01-01T00:00:00Z`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 5002,
    "description": "Key object was successfully retrieved."
  },
  "data": {
    "key_id": "123456",
    "last_updated": "2024-01-01T00:00:00Z",
    "expiration_date": "2026-09-05T00:00:00Z"
  }
}
```


---

## Update REST API key

**MCP tool:** `accounts_update_api_key`

```http
PATCH https://accounts.telesign.com/keys/{key_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/patch-accounts-account_id-keys-rest-key_id> (updated 2026-10-14)

> 📘 NOTE:
>
> Accounts API is currently available on a limited basis. Contact our [Customer Support Team](mailto:support@telesign.com) if you’d like to explore using this API.

Use this action to update a REST API key. This is used to set an expiration date for a key, change the expiration date, or remove the expiration date (making it a non-expiring key).

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Encoding:** Accepts only **UTF-8 unicode** characters as inputs.
* **Accepts:** `application/json`
* **Responds with:** `application/json`
* **Required headers:** `Content-Type - application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key_id` | string | yes | Unique identifier for managing this REST API key. This is NOT the key’s value, which is used to authenticate REST API requests. Example: `1234567`. |

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `expiration_date` | string | yes | The expiration date of this REST API key. A value of `never` indicates that this key never expires. Example: `2026-09-05T00:00:00Z`. |

### Example request

```json
{
  "expiration_date": "2026-09-05T00:00:00Z"
}
```

### Responses

**HTTP 200**

**Success** The specified REST API key has been succesfully updated and the key object with its new details has been returned.

Status code | Associated text string
--|--
5003|Key was successfully updated.

**HTTP 400**

**Bad Request.**

Status code | Associated text string
--|--
5101|Invalid value for body parameter {param name}.
5103|Invalid value for path parameter {param name}
5110|Request payload is improperly formatted.
5112|Missing required parameter {param_name}.
5113|{date-time-stamp} is not a valid future date.

**HTTP 401**

**Unauthorized.**

Status code | Associated text string
-- | --
5400 | Authentication failed.

**HTTP 403**

**Forbidden.**

Status code | Associated text string
-- | --
5401 | No permissions for this resource.

**HTTP 429**

**Rate limit exceeded.**

Status code | Associated text string
-- | --
5204 | Rate limit exceeded.

**HTTP 503**

**Service unavailable.**

Status code | Associated text string
-- | --
5500 | System unavailable. Please try again later.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  |  |
| `status.code` | integer |  | Example: `5003`. |
| `status.description` | string |  | Example: `Key was successfully updated.`. |
| `data` | object |  |  |
| `data.key_id` | string |  | A unique identifier for managing this REST API key. Cannot be used as a token to authenticate REST API requests. Example: `123456`. |
| `data.last_updated` | string |  | When this REST API key was last updated. Example: `2024-01-01T00:00:00Z`. |
| `data.expiration_date` | string |  | The expiration date of this REST API key. A value of `never` indicates that this key never expires. Example: `2025-01-01T00:00:00Z`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 5003,
    "description": "Key was successfully updated."
  },
  "data": {
    "key_id": "123456",
    "last_updated": "2024-01-01T00:00:00Z",
    "expiration_date": "2026-09-05T00:00:00Z"
  }
}
```


---

## Remove REST API key

**MCP tool:** `accounts_delete_api_key`

```http
DELETE https://accounts.telesign.com/keys/{key_id}
```

- **Authentication:** Basic (Customer ID + API key)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/delete-accounts-account_id-keys-rest-key_id> (updated 2026-10-14)

> 📘 NOTE:
>
> Accounts API is currently available on a limited basis. Contact our [Customer Support Team](mailto:support@telesign.com) if you’d like to explore using this API.

Use this action to expire this REST API key immediately.

#### General requirements
* **Authentication:** [Basic](https://developer.telesign.com/enterprise/docs/authentication#basic-authentication) (easiest to implement) or [Digest](https://developer.telesign.com/enterprise/docs/authentication#digest-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key_id` | string | yes | Unique identifier for managing this REST API key. This is NOT the key’s value, which is used to authenticate REST API requests. Example: `1234567`. |

### Responses

**HTTP 200**

**Success.** The specified REST API key has been successfully expired and removed from the list of active keys for this account.

Status code | Associated text string
--|--
5004|Key successfully expired.

**HTTP 400**

**Bad Request.**

Status code | Associated text string
--|--
5103|Invalid value for path parameter {param name}

**HTTP 401**

**Unauthorized.**

Status code | Associated text string
-- | --
5400 | Authentication failed.

**HTTP 403**

**Forbidden.**

Status code | Associated text string
-- | --
5401 | No permissions for this resource.

**HTTP 429**

**Rate limit exceeded.**

Status code | Associated text string
-- | --
5204 | Rate limit exceeded.

**HTTP 503**

**Service unavailable.**

Status code | Associated text string
-- | --
5500 | System unavailable. Please try again later.

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `reference_id` | string |  | A unique, randomly generated hex value that identifies your web service request. Example: `0123456789ABCDEF0123456789ABCDEF`. |
| `status` | object |  |  |
| `status.code` | integer |  | Example: `5004`. |
| `status.description` | string |  | Example: `Key successfully expired.`. |

### Example response (200)

```json
{
  "reference_id": "0123456789ABCDEF0123456789ABCDEF",
  "status": {
    "code": 5004,
    "description": "Key successfully expired."
  }
}
```

