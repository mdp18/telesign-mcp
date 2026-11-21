# Accounts API - SCIM user management - API reference

SCIM 2.0 provisioning of portal users and groups (OAuth 2.0 client credentials).

_Generated from Telesign's OpenAPI definitions. Tools in this toolset: `scim_get_service_provider_config`, `scim_list_resource_types`, `scim_get_resource_type`, `scim_list_schemas`, `scim_get_schema`, `scim_list_users`, `scim_create_user`, `scim_get_user`, `scim_replace_user`, `scim_patch_user`, `scim_delete_user`, `scim_list_groups`, `scim_get_group`, `scim_patch_group`, `auth_request_access_token`._

## Get Service Provider Config

**MCP tool:** `scim_get_service_provider_config`

```http
GET https://accounts.telesign.com/scim/v2/ServiceProviderConfig
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/get_service_provider_config_scim_v2_serviceproviderconfig_get> (updated 2026-10-14)

List the capabilities of this service.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Responses

**HTTP 200**

Successful Response

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"]`. |
| `documentationUri` | string |  | Length: 1-65536. |
| `patch` | object | yes |  |
| `patch.supported` | boolean | yes |  |
| `bulk` | object | yes |  |
| `bulk.supported` | boolean | yes |  |
| `bulk.maxOperations` | integer | yes |  |
| `bulk.maxPayloadSize` | integer | yes |  |
| `filter` | object | yes |  |
| `filter.supported` | boolean | yes |  |
| `filter.maxResults` | integer | yes |  |
| `changePassword` | object | yes |  |
| `changePassword.supported` | boolean | yes |  |
| `sort` | object | yes |  |
| `sort.supported` | boolean | yes |  |
| `etag` | object | yes |  |
| `etag.supported` | boolean | yes |  |
| `authenticationSchemes` | array of object | yes |  |
| `authenticationSchemes[].type` | string | yes |  |
| `authenticationSchemes[].name` | string | yes |  |
| `authenticationSchemes[].description` | string | yes |  |
| `authenticationSchemes[].specUri` | string |  | Length: 1-65536. |
| `authenticationSchemes[].documentationUri` | string |  | Length: 1-65536. |
| `authenticationSchemes[].primary` | boolean |  |  |
| `meta` | object | yes |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |


---

## List Resource Types

**MCP tool:** `scim_list_resource_types`

```http
GET https://accounts.telesign.com/scim/v2/ResourceTypes
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/list_resource_types_scim_v2_resourcetypes_get> (updated 2026-10-14)

List the Resource Types included in this service.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Responses

**HTTP 200**

Successful Response

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:api:messages:2.0:ListResponse"]`. |
| `totalResults` | integer | yes |  |
| `startIndex` | integer |  | Default: `1`. |
| `itemsPerPage` | integer |  |  |
| `Resources` | array of any |  |  |


---

## Get Resource Type

**MCP tool:** `scim_get_resource_type`

```http
GET https://accounts.telesign.com/scim/v2/ResourceTypes/{resource_type_name}
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/get_resource_type_scim_v2_resourcetypes__resource_type_name__get> (updated 2026-10-14)

Retrieve one Resource Type by name.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `resource_type_name` | string | yes |  |

### Responses

**HTTP 200**

Successful Response

**HTTP 422**

Validation Error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:ResourceType"]`. |
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string |  |  |
| `endpoint` | string | yes |  |
| `schema` | string | yes |  |
| `schemaExtensions` | array of object |  | Default: `[]`. |
| `schemaExtensions[].schema` | string | yes |  |
| `schemaExtensions[].required` | boolean | yes |  |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |


---

## List Schemas

**MCP tool:** `scim_list_schemas`

```http
GET https://accounts.telesign.com/scim/v2/Schemas
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/list_schemas_scim_v2_schemas_get> (updated 2026-10-14)

List the Schemas used by this service.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Responses

**HTTP 200**

Successful Response

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:api:messages:2.0:ListResponse"]`. |
| `totalResults` | integer | yes |  |
| `startIndex` | integer |  | Default: `1`. |
| `itemsPerPage` | integer |  |  |
| `Resources` | array of any |  |  |


---

## Get Schema

**MCP tool:** `scim_get_schema`

```http
GET https://accounts.telesign.com/scim/v2/Schemas/{schema_id}
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/get_schema_scim_v2_schemas__schema_id__get> (updated 2026-10-14)

Retrieve one Schema by ID.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schema_id` | string | yes |  |

### Responses

**HTTP 200**

Successful Response

**HTTP 422**

Validation Error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string |  |  |
| `attributes` | array of object |  | Default: `[]`. |
| `attributes[].name` | string | yes |  |
| `attributes[].type` | string enum |  | An enumeration. Allowed: `string`, `boolean`, `decimal`, `integer`, `dateTime`, `reference`, `complex`. Default: `"string"`. |
| `attributes[].multiValued` | boolean |  | Default: `false`. |
| `attributes[].description` | string |  |  |
| `attributes[].required` | boolean |  | Default: `false`. |
| `attributes[].caseExact` | boolean |  | Default: `false`. |
| `attributes[].mutability` | string enum |  | An enumeration. Allowed: `readOnly`, `readWrite`, `immutable`, `writeOnly`. Default: `"readWrite"`. |
| `attributes[].returned` | string enum |  | An enumeration. Allowed: `always`, `never`, `default`, `request`. Default: `"default"`. |
| `attributes[].uniqueness` | string enum |  | An enumeration. Allowed: `none`, `server`, `global`. Default: `"none"`. |
| `attributes[].subAttributes` | array of object |  |  |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |


---

## Get Users

**MCP tool:** `scim_list_users`

```http
GET https://accounts.telesign.com/scim/v2/Users
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/get_users_scim_v2_users_get> (updated 2026-10-14)

List all Users for this instance.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Responses

**HTTP 200**

Successful Response

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:api:messages:2.0:ListResponse"]`. |
| `totalResults` | integer | yes |  |
| `startIndex` | integer |  | Default: `1`. |
| `itemsPerPage` | integer |  |  |
| `Resources` | array of any |  |  |


---

## Create User

**MCP tool:** `scim_create_user`

```http
POST https://accounts.telesign.com/scim/v2/Users
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/create_user_scim_v2_users_post> (updated 2026-10-14)

Create one User for your instance.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:User"]`. |
| `id` | string |  |  |
| `externalId` | string |  |  |
| `userName` | string | yes |  |
| `name` | object | yes |  |
| `name.formatted` | string |  |  |
| `name.familyName` | string | yes |  |
| `name.givenName` | string | yes |  |
| `name.middleName` | string |  |  |
| `active` | boolean | yes |  |
| `emails` | array of object | yes |  |
| `emails[].value` | string | yes |  |
| `emails[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `emails[].primary` | boolean |  |  |
| `emails[].display` | string |  |  |
| `groups` | array of object |  |  |
| `groups[].value` | string | yes |  |
| `groups[].display` | string |  |  |
| `groups[].ref` | string |  | Length: 1-65536. |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |
| `phoneNumbers` | array of object | yes |  |
| `phoneNumbers[].value` | string | yes |  |
| `phoneNumbers[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `phoneNumbers[].primary` | boolean |  |  |
| `phoneNumbers[].display` | string |  |  |

### Responses

**HTTP 201**

Successful Response

**HTTP 422**

Validation Error

### Response fields (201)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:User"]`. |
| `id` | string |  |  |
| `externalId` | string |  |  |
| `userName` | string | yes |  |
| `name` | object | yes |  |
| `name.formatted` | string |  |  |
| `name.familyName` | string | yes |  |
| `name.givenName` | string | yes |  |
| `name.middleName` | string |  |  |
| `active` | boolean | yes |  |
| `emails` | array of object | yes |  |
| `emails[].value` | string | yes |  |
| `emails[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `emails[].primary` | boolean |  |  |
| `emails[].display` | string |  |  |
| `groups` | array of object |  |  |
| `groups[].value` | string | yes |  |
| `groups[].display` | string |  |  |
| `groups[].ref` | string |  | Length: 1-65536. |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |
| `phoneNumbers` | array of object |  |  |
| `phoneNumbers[].value` | string | yes |  |
| `phoneNumbers[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `phoneNumbers[].primary` | boolean |  |  |
| `phoneNumbers[].display` | string |  |  |


---

## Retrieve User

**MCP tool:** `scim_get_user`

```http
GET https://accounts.telesign.com/scim/v2/Users/{user_id}
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/retrieve_user_scim_v2_users__user_id__get> (updated 2026-10-14)

Retrieve one User by ID.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | string | yes | The SCIM ID of the user. |

### Responses

**HTTP 200**

Successful Response

**HTTP 422**

Validation Error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:User"]`. |
| `id` | string |  |  |
| `externalId` | string |  |  |
| `userName` | string | yes |  |
| `name` | object | yes |  |
| `name.formatted` | string |  |  |
| `name.familyName` | string | yes |  |
| `name.givenName` | string | yes |  |
| `name.middleName` | string |  |  |
| `active` | boolean | yes |  |
| `emails` | array of object | yes |  |
| `emails[].value` | string | yes |  |
| `emails[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `emails[].primary` | boolean |  |  |
| `emails[].display` | string |  |  |
| `groups` | array of object |  |  |
| `groups[].value` | string | yes |  |
| `groups[].display` | string |  |  |
| `groups[].ref` | string |  | Length: 1-65536. |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |


---

## Update User

**MCP tool:** `scim_replace_user`

```http
PUT https://accounts.telesign.com/scim/v2/Users/{user_id}
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/update_user_scim_v2_users__user_id__put> (updated 2026-10-14)

Replace all details for one existing User by ID.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | string | yes | The SCIM ID of the user. |

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:User"]`. |
| `id` | string |  |  |
| `externalId` | string |  |  |
| `userName` | string | yes |  |
| `name` | object | yes |  |
| `name.formatted` | string |  |  |
| `name.familyName` | string | yes |  |
| `name.givenName` | string | yes |  |
| `name.middleName` | string |  |  |
| `active` | boolean | yes |  |
| `emails` | array of object | yes |  |
| `emails[].value` | string | yes |  |
| `emails[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `emails[].primary` | boolean |  |  |
| `emails[].display` | string |  |  |
| `groups` | array of object |  |  |
| `groups[].value` | string | yes |  |
| `groups[].display` | string |  |  |
| `groups[].ref` | string |  | Length: 1-65536. |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |
| `phoneNumbers` | array of object | yes |  |
| `phoneNumbers[].value` | string | yes |  |
| `phoneNumbers[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `phoneNumbers[].primary` | boolean |  |  |
| `phoneNumbers[].display` | string |  |  |

### Responses

**HTTP 200**

Successful Response

**HTTP 422**

Validation Error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:User"]`. |
| `id` | string |  |  |
| `externalId` | string |  |  |
| `userName` | string | yes |  |
| `name` | object | yes |  |
| `name.formatted` | string |  |  |
| `name.familyName` | string | yes |  |
| `name.givenName` | string | yes |  |
| `name.middleName` | string |  |  |
| `active` | boolean | yes |  |
| `emails` | array of object | yes |  |
| `emails[].value` | string | yes |  |
| `emails[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `emails[].primary` | boolean |  |  |
| `emails[].display` | string |  |  |
| `groups` | array of object |  |  |
| `groups[].value` | string | yes |  |
| `groups[].display` | string |  |  |
| `groups[].ref` | string |  | Length: 1-65536. |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |
| `phoneNumbers` | array of object |  |  |
| `phoneNumbers[].value` | string | yes |  |
| `phoneNumbers[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `phoneNumbers[].primary` | boolean |  |  |
| `phoneNumbers[].display` | string |  |  |


---

## Patch Update User

**MCP tool:** `scim_patch_user`

```http
PATCH https://accounts.telesign.com/scim/v2/Users/{user_id}
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/patch_update_user_scim_v2_users__user_id__patch> (updated 2026-10-14)

Modify one existing User by ID.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | string | yes | The SCIM ID of the user. |

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:api:messages:2.0:PatchOp"]`. |
| `Operations` | array of object | yes |  |
| `Operations[].op` | string enum | yes | An enumeration. Allowed: `add`, `replace`, `remove`. |
| `Operations[].path` | string |  |  |
| `Operations[].value` | any |  |  |

### Responses

**HTTP 200**

Successful Response

**HTTP 422**

Validation Error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:User"]`. |
| `id` | string |  |  |
| `externalId` | string |  |  |
| `userName` | string | yes |  |
| `name` | object | yes |  |
| `name.formatted` | string |  |  |
| `name.familyName` | string | yes |  |
| `name.givenName` | string | yes |  |
| `name.middleName` | string |  |  |
| `active` | boolean | yes |  |
| `emails` | array of object | yes |  |
| `emails[].value` | string | yes |  |
| `emails[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `emails[].primary` | boolean |  |  |
| `emails[].display` | string |  |  |
| `groups` | array of object |  |  |
| `groups[].value` | string | yes |  |
| `groups[].display` | string |  |  |
| `groups[].ref` | string |  | Length: 1-65536. |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |
| `phoneNumbers` | array of object |  |  |
| `phoneNumbers[].value` | string | yes |  |
| `phoneNumbers[].type` | string enum | yes | An enumeration. Allowed: `work`, `mobile`, `home`, `other`. |
| `phoneNumbers[].primary` | boolean |  |  |
| `phoneNumbers[].display` | string |  |  |


---

## Delete User

**MCP tool:** `scim_delete_user`

```http
DELETE https://accounts.telesign.com/scim/v2/Users/{user_id}
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/delete_user_scim_v2_users__user_id__delete> (updated 2026-10-14)

Deprovision one User by ID. Note that instead of deleting the user, its active status is set to `false`.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | string | yes | The SCIM ID of the user. |

### Responses

**HTTP 204**

Successful Response

**HTTP 422**

Validation Error


---

## Get Groups

**MCP tool:** `scim_list_groups`

```http
GET https://accounts.telesign.com/scim/v2/Groups
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/get_groups_scim_v2_groups_get> (updated 2026-10-14)

List all Groups for this instance.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Responses

**HTTP 200**

Successful Response

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:api:messages:2.0:ListResponse"]`. |
| `totalResults` | integer | yes |  |
| `startIndex` | integer |  | Default: `1`. |
| `itemsPerPage` | integer |  |  |
| `Resources` | array of any |  |  |


---

## Retrieve Group

**MCP tool:** `scim_get_group`

```http
GET https://accounts.telesign.com/scim/v2/Groups/{group_id}
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/retrieve_group_scim_v2_groups__group_id__get> (updated 2026-10-14)

Retrieve one Group by ID.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `group_id` | string | yes | The SCIM ID of the group. |

### Responses

**HTTP 200**

Successful Response

**HTTP 422**

Validation Error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:Group"]`. |
| `id` | string |  |  |
| `externalId` | string |  |  |
| `displayName` | string | yes |  |
| `members` | array of object |  |  |
| `members[].value` | string | yes |  |
| `members[].display` | string |  |  |
| `members[].ref` | string |  |  |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |


---

## Update Group

**MCP tool:** `scim_patch_group`

```http
PATCH https://accounts.telesign.com/scim/v2/Groups/{group_id}
```

- **Authentication:** OAuth 2.0 bearer token (client credentials; fetched automatically)
- **Request body:** `application/json`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/update_group_scim_v2_groups__group_id__patch> (updated 2026-10-14)

Modify one existing Group by ID.

#### General requirements
* **Authentication:** [OAuth 2.0](https://developer.telesign.com/enterprise/docs/authentication#oauth-20-authentication)
* **Responds with:** `application/json`

### Path parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `group_id` | string | yes | The SCIM ID of the group. |

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:api:messages:2.0:PatchOp"]`. |
| `Operations` | array of object | yes |  |
| `Operations[].op` | string enum | yes | An enumeration. Allowed: `add`, `replace`, `remove`. |
| `Operations[].path` | string |  |  |
| `Operations[].value` | any |  |  |

### Responses

**HTTP 200**

Successful Response

**HTTP 422**

Validation Error

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `schemas` | array of string |  | Default: `["urn:ietf:params:scim:schemas:core:2.0:Group"]`. |
| `id` | string |  |  |
| `externalId` | string |  |  |
| `displayName` | string | yes |  |
| `members` | array of object |  |  |
| `members[].value` | string | yes |  |
| `members[].display` | string |  |  |
| `members[].ref` | string |  |  |
| `meta` | object |  |  |
| `meta.resourceType` | string |  |  |
| `meta.created` | string |  |  |
| `meta.location` | string |  | Length: 1-65536. |


---

## Request access token

**MCP tool:** `auth_request_access_token`

```http
POST https://login.telesign.com/oidc/token
```

- **Authentication:** Basic (OAuth client ID + client secret)
- **Request body:** `application/x-www-form-urlencoded`
- **Telesign reference:** <https://developer.telesign.com/enterprise/reference/post-access-token> (updated 2026-11-16)

Request an access token as part of an OAuth 2.0 client credentials flow.

### Body parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `grant_type` | string enum | yes | The OAuth 2.0 grant type. See https://oauth.net/2/grant-types/ for more details. Allowed: `client_credentials`. Example: `client_credentials`. |

### Example request

```json
{
  "grant_type": "client_credentials",
  "client_id": "KTUQODL4Vr5ImAsz",
  "client_secret": "v4R43yybYGtz8nZF"
}
```

### Responses

**HTTP 200**

OK

### Response fields (200)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `access_token` | string | yes | The access token string issued by the Telesign authorization server. Example: `3e816b8057066077b79cb29b09427345`. |
| `expires_in` | integer | yes | Total duration (in seconds) that this token remains valid. Example: `1800`. |
| `token_type` | string | yes | The type of token that this is; you can expect that the value here will always be `Bearer`. Example: `Bearer`. |
| `scope` | string | yes | The scopes granted to this token, which in turn determines which Telesign services it can use. Multiple scopes are separated by spaces. Example: `scim accounts`. |

### Example response (200)

```json
{
  "access_token": "3e816b8057066077b79cb29b09427345",
  "expires_in": 1800,
  "token_type": "Bearer",
  "scope": "scim accounts"
}
```

