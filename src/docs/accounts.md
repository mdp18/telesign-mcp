# Accounts API

The Telesign Accounts API lets you manage Telesign accounts and their configuration from code instead of through the portal. It has two parts: account operations (clone an existing account, and create, inspect, expire and rotate the REST API keys of an account) and a SCIM 2.0 interface for provisioning the users and groups of your Telesign organization from an identity provider or script. Everything here is administrative and security-sensitive: these tools change who can sign in and which credentials work.

Telesign states that the Accounts API is currently available on a limited basis. Contact Telesign Customer Support (support@telesign.com) to have it enabled before relying on it.

## When to use the Accounts API

- **Rotate API keys on a schedule or after a suspected leak.** Create a new key, deploy it, then expire the old one.
- **Give keys a lifetime.** Set, change or remove the expiration date of a key.
- **Audit keys.** List the keys of an account with their last update and expiration dates (key values are never listed).
- **Stand up a new account with the same configuration as an existing one**, for example a separate account for a new brand, region or environment.
- **Automate user lifecycle** for the Telesign portal: create users when people join, deactivate them when they leave, and manage group membership through SCIM, typically driven by an identity provider.

It is not a messaging or verification product; it does not send anything to end users. For how request authentication works in general, see topic `authentication`.

## Enabling the accounts and scim toolsets in the MCP server

Both toolsets are opt-in. They are not registered unless named in the `TELESIGN_TOOLSETS` environment variable:

```
TELESIGN_TOOLSETS=default,accounts,scim
```

`default` keeps the standard toolsets; add `accounts`, `scim` or both. (`all` enables every toolset.)

| Toolset | Tools | Credentials the server needs |
| --- | --- | --- |
| `accounts` | `accounts_*` (6 tools) | `TELESIGN_CUSTOMER_ID` and `TELESIGN_API_KEY`, the same as the other REST tools |
| `scim` | `scim_*` (14 tools) and `auth_request_access_token` | `TELESIGN_OAUTH_CLIENT_ID` and `TELESIGN_OAUTH_CLIENT_SECRET` |

How the server handles OAuth for SCIM:

- You never pass a token to a `scim_*` tool. The server requests an access token from `https://login.telesign.com/oidc/token` with the client credentials, caches it until shortly before it expires, and sends it as a bearer token.
- If the two OAuth variables are missing, SCIM tools fail with a message telling you to set them.
- Access tokens are masked in tool output. `auth_request_access_token` shows the token as a redacted placeholder with its length unless the server is started with `TELESIGN_REVEAL_TOKENS=true`.

## How the account and key operations work

All account and key operations are on `https://accounts.telesign.com` and use Basic (or Digest) authentication with the Customer ID and API key of the account being managed. Key operations act on the account whose credentials the server is using; there is no account ID argument for them.

**Key terms**

- **Key ID** (`key_id`): an identifier used to manage a key. It is not a secret and cannot be used to authenticate requests.
- **Key value** (`key`): the secret that authenticates REST requests. It is returned only once, when the key is created.
- **Expiration date** (`expiration_date`): a timestamp such as `2026-09-05T00:00:00Z`, or the literal `never` for a key that does not expire.

**Rotating a key**

1. `accounts_list_api_keys` - see the existing keys and their expiration dates.
2. `accounts_create_api_key` - create the replacement. Store the returned `data.key` in your secret store immediately, mapped to its `data.key_id`.
3. Deploy the new key everywhere the old one is used (including this MCP server's `TELESIGN_API_KEY`, and any callback handler that verifies Telesign signatures).
4. `accounts_update_api_key` to give the old key a near-future expiration date, or `accounts_delete_api_key` to expire it immediately.

**Cloning an account**

`accounts_clone_account` creates a new account using the account in the path (`source_account_id`) as the template. Configuration properties of the source are applied to the new account. Users and permissions are not copied. You may name one initial user in the request; Telesign emails that person an invitation to sign in, so the contact details must be valid. Further users can be added manually afterwards (or through SCIM).

## How SCIM provisioning and OAuth 2.0 client credentials work

SCIM (System for Cross-domain Identity Management) 2.0 is the standard protocol identity providers use to push users and groups into applications. Telesign exposes it under `https://accounts.telesign.com/scim/v2/` and protects it with OAuth 2.0 (client credentials flow), not with the Customer ID and API key.

One-time setup, done by an organization-level admin:

1. Make sure Telesign has enabled Integrations / OAuth 2.0 for your organization. This is an organization-level setting, not an account-level one.
2. Sign in to the Telesign full-service portal and go to **Settings > Integrations**, then the **OAuth Apps** tab.
3. Create an OAuth app for the integration with a descriptive name, and assign it only the scopes it needs. The scopes for this API are `accounts` ("Permits use of the Accounts API") and `scim` ("Permits programmatic user management using SCIM operations of the Accounts API").
4. Copy the Client ID and Client Secret and store them securely. For the MCP server, set them as `TELESIGN_OAUTH_CLIENT_ID` and `TELESIGN_OAUTH_CLIENT_SECRET`.

At run time the flow is:

1. `POST https://login.telesign.com/oidc/token` with `grant_type=client_credentials`. Telesign recommends passing the client credentials with Basic auth (`Basic base64(client_id:client_secret)`); they can also be sent as body parameters.
2. The response contains `access_token`, `token_type` (always `Bearer`), `expires_in` (seconds; `1800` in Telesign's example) and `scope` (space-separated, for example `scim accounts`).
3. Each SCIM request carries `Authorization: Bearer <access_token>`.

The MCP server performs steps 1 to 3 itself for every `scim_*` call.

SCIM resources:

- **Users** have `userName`, `name` (`givenName`, `familyName`), `active`, `emails` and `phoneNumbers` (each entry has a `value` and a `type` of `work`, `mobile`, `home` or `other`), and optional `externalId` and `groups`.
- **Groups** have `displayName` and `members`. Groups can be listed, read and patched; there is no tool to create or delete a group.
- **Discovery** endpoints describe the service: its capabilities (`ServiceProviderConfig`: whether patch, bulk, filter, sort, etag and change-password are supported), its resource types and its schemas.

Deleting a user through SCIM deprovisions rather than erases: Telesign sets the user's `active` status to `false`.

## MCP tools

Account and key tools (toolset `accounts`):

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `accounts_clone_account` | Create a new account from a source account's configuration | `POST https://accounts.telesign.com/accounts/{source_account_id}` |
| `accounts_list_api_keys` | List the REST API keys of the account (no key values) | `GET https://accounts.telesign.com/keys` |
| `accounts_create_api_key` | Create a REST API key; the only call that returns the key value | `POST https://accounts.telesign.com/keys` |
| `accounts_get_api_key` | Get details of one key (no key value) | `GET https://accounts.telesign.com/keys/{key_id}` |
| `accounts_update_api_key` | Set, change or remove a key's expiration date | `PATCH https://accounts.telesign.com/keys/{key_id}` |
| `accounts_delete_api_key` | Expire a key immediately | `DELETE https://accounts.telesign.com/keys/{key_id}` |

SCIM and token tools (toolset `scim`):

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `scim_get_service_provider_config` | List the capabilities of the SCIM service | `GET https://accounts.telesign.com/scim/v2/ServiceProviderConfig` |
| `scim_list_resource_types` | List the resource types the service offers | `GET https://accounts.telesign.com/scim/v2/ResourceTypes` |
| `scim_get_resource_type` | Get one resource type by name | `GET https://accounts.telesign.com/scim/v2/ResourceTypes/{resource_type_name}` |
| `scim_list_schemas` | List the schemas the service uses | `GET https://accounts.telesign.com/scim/v2/Schemas` |
| `scim_get_schema` | Get one schema by ID | `GET https://accounts.telesign.com/scim/v2/Schemas/{schema_id}` |
| `scim_list_users` | List all users | `GET https://accounts.telesign.com/scim/v2/Users` |
| `scim_create_user` | Create one user | `POST https://accounts.telesign.com/scim/v2/Users` |
| `scim_get_user` | Get one user by SCIM ID | `GET https://accounts.telesign.com/scim/v2/Users/{user_id}` |
| `scim_replace_user` | Replace all details of a user | `PUT https://accounts.telesign.com/scim/v2/Users/{user_id}` |
| `scim_patch_user` | Modify selected attributes of a user | `PATCH https://accounts.telesign.com/scim/v2/Users/{user_id}` |
| `scim_delete_user` | Deprovision a user (sets `active` to `false`) | `DELETE https://accounts.telesign.com/scim/v2/Users/{user_id}` |
| `scim_list_groups` | List all groups | `GET https://accounts.telesign.com/scim/v2/Groups` |
| `scim_get_group` | Get one group by SCIM ID | `GET https://accounts.telesign.com/scim/v2/Groups/{group_id}` |
| `scim_patch_group` | Modify a group, for example its members | `PATCH https://accounts.telesign.com/scim/v2/Groups/{group_id}` |
| `auth_request_access_token` | Request an OAuth 2.0 access token (rarely needed; the server fetches tokens itself) | `POST https://login.telesign.com/oidc/token` |

Use `docs_get_tool_reference("<tool>")` for the full parameter and response tables of any of these.

## Tools that need confirmation from the user first

These tools change credentials or access. An assistant should describe exactly what will happen and get an explicit yes from the user before calling them, and should never call them as a side effect of another task.

| Tool | Why it is sensitive |
| --- | --- |
| `accounts_create_api_key` | Creates a live credential with broad access to every product enabled on the account. The secret appears in the tool result. Each account has a maximum number of keys (status `5111`) |
| `accounts_update_api_key` | A wrong date can expire a key that production systems depend on, or turn a temporary key into one that never expires |
| `accounts_delete_api_key` | Expires the key immediately. Every system still using it starts failing authentication. If it is the key this MCP server uses, the server's own REST calls stop working |
| `accounts_clone_account` | Creates a new account in the organization and sends an invitation email to the named user |
| `scim_create_user` | Grants a person access to the Telesign organization |
| `scim_replace_user` | Overwrites every attribute of the user; anything omitted is lost |
| `scim_patch_user` | Can deactivate a user or change their contact details |
| `scim_delete_user` | Deprovisions the user (marked destructive in the server) |
| `scim_patch_group` | Changes group membership, and therefore what members can do |

Read-only tools (`accounts_list_api_keys`, `accounts_get_api_key`, the SCIM list / get / discovery tools) are safe to call without confirmation. If the server runs with `TELESIGN_READ_ONLY` on, only tools that do not send messages or change data are registered; with `TELESIGN_DRY_RUN` on, requests are built and shown but not sent, which is a good way to preview a change.

Before `accounts_delete_api_key` or an expiring `accounts_update_api_key`, confirm the `key_id` with `accounts_get_api_key` and check with the user that a replacement key is already deployed.

## Quick start: managing REST API keys

List the keys of the account. Takes no arguments; returns `data.keys[]` with `key_id`, `last_updated` and `expiration_date`.

```json
{}
```

Create a key that expires on a given date (`accounts_create_api_key`). Returns status `5000` and `data.key_id`, `data.expiration_date` and the secret `data.key`.

```json
{ "expiration_date": "2027-06-30T00:00:00Z" }
```

Create a non-expiring key.

```json
{ "expiration_date": "never" }
```

Look at one key (`accounts_get_api_key`). Returns status `5002` and the key's dates, never its value.

```json
{ "key_id": "123456" }
```

Change a key's expiration date (`accounts_update_api_key`), for example to retire the old key at the end of a rotation window. Returns status `5003` and the updated key object.

```json
{ "key_id": "123456", "expiration_date": "2027-01-15T00:00:00Z" }
```

Expire a key now (`accounts_delete_api_key`). Returns status `5004`. Confirm with the user first.

```json
{ "key_id": "123456" }
```

## Quick start: cloning an account

Clone an account and invite its first user (`accounts_clone_account`). Returns HTTP 201 with status `5005` and `data.account_id`, `data.account_name` and `data.users`.

```json
{
  "source_account_id": "ABC1DE23-A12B-1234-56AB-AB1234567890",
  "account_name": "Example-Staging",
  "users": [
    {
      "first_name": "Jane",
      "last_name": "Smith",
      "phone": "15551234567",
      "email": "jane.smith@example.com"
    }
  ]
}
```

## Quick start: SCIM users and groups

Discover what the SCIM service supports (`scim_get_service_provider_config`, no arguments).

```json
{}
```

List users (`scim_list_users`, no arguments). Returns a SCIM list response: `totalResults`, `startIndex`, `itemsPerPage` and `Resources`.

```json
{}
```

Create a user (`scim_create_user`). Returns HTTP 201 with the stored user, including its SCIM `id`.

```json
{
  "userName": "jane.smith@example.com",
  "name": { "givenName": "Jane", "familyName": "Smith" },
  "active": true,
  "emails": [{ "value": "jane.smith@example.com", "type": "work", "primary": true }],
  "phoneNumbers": [{ "value": "15551234567", "type": "mobile" }]
}
```

Deactivate a user without replacing the whole record (`scim_patch_user`). Returns the updated user.

```json
{
  "user_id": "USER_SCIM_ID",
  "Operations": [{ "op": "replace", "path": "active", "value": false }]
}
```

Add a user to a group (`scim_patch_group`). Returns the updated group with its `members`.

```json
{
  "group_id": "GROUP_SCIM_ID",
  "Operations": [{ "op": "add", "path": "members", "value": [{ "value": "USER_SCIM_ID" }] }]
}
```

Deprovision a user (`scim_delete_user`). Returns HTTP 204 with no body. Confirm with the user first.

```json
{ "user_id": "USER_SCIM_ID" }
```

The two patch examples follow the standard SCIM PatchOp shape (`op` is `add`, `replace` or `remove`, with an optional `path` and a `value`). Telesign's reference does not publish example patch bodies, so check `scim_get_schema` and `scim_get_service_provider_config` for what the service accepts.

## Key parameters

| Parameter | Used by | How to choose a value |
| --- | --- | --- |
| `expiration_date` | `accounts_create_api_key`, `accounts_update_api_key` | Required. A future timestamp (`2027-06-30T00:00:00Z`) or `never`. A past or malformed date returns `5113` |
| `key_id` | get / update / delete key | The management identifier from `accounts_list_api_keys`. Not the key value |
| `source_account_id` | `accounts_clone_account` | The account to copy configuration from |
| `account_name` | `accounts_clone_account` | Required. Must be unique within your organization |
| `users` | `accounts_clone_account` | New users only (not existing users of your organization); the API schema allows at most one. Each has `first_name`, `last_name`, `phone` (digits with country code; used for MFA at sign-in) and `email` |
| `user_id`, `group_id` | SCIM user and group tools | The SCIM `id` of the resource, as returned by the list or create tools |
| `userName`, `name`, `active`, `emails`, `phoneNumbers` | `scim_create_user`, `scim_replace_user` | All required. `name` needs `givenName` and `familyName`; each email and phone entry needs `value` and `type` |
| `Operations` | `scim_patch_user`, `scim_patch_group` | Required list of `{op, path, value}`; `op` is `add`, `replace` or `remove` |
| `grant_type` | `auth_request_access_token` | Always `client_credentials` |

`scim_replace_user` is a full replacement (HTTP PUT): send the complete user. Use `scim_patch_user` to change one attribute.

## Responses and status codes

Account and key operations return `reference_id`, a `status` object (`code`, `description`) and, on success, a `data` object. Code against `status.code`.

| Code | HTTP | Meaning | What to do |
| --- | --- | --- | --- |
| 5000 | 201 | New key was successfully created | Store `data.key` now; it cannot be retrieved later |
| 5001 | 200 | Key list was successfully retrieved | |
| 5002 | 200 | Key object was successfully retrieved | |
| 5003 | 200 | Key was successfully updated | |
| 5004 | 200 | Key successfully expired | The key no longer authenticates |
| 5005 | 201 | New account was successfully created | Note `data.account_id` |
| 5101 | 400 | Invalid value for body parameter {param name} | Fix the named parameter |
| 5103 | 400 | Invalid value for path parameter {param name} | Check `key_id` or `source_account_id` |
| 5110 | 400 | Request payload is improperly formatted | Send valid JSON with the required fields |
| 5111 | 400 | The limit of {max_no_keys} keys has been reached | Expire an unused key first |
| 5112 | 400 | Missing required parameter {param_name} | Add the parameter |
| 5113 | 400 | {date-time-stamp} is not a valid future date | Use a future timestamp or `never` |
| 5114 | 400 | Listed as "Too many users included in the request" in Telesign's code list and as "Resource not found" on the clone account reference page | For clone: send at most one user and check the source account ID |
| 5204 | 429 | Rate limit exceeded | Slow down and retry |
| 5400 | 401 | Authentication failed | Check the Customer ID and API key |
| 5401 | 403 | No permissions for this resource | The credentials are valid but not permitted to use this resource; ask Telesign whether the Accounts API is enabled for you |
| 5500 | 503 | System unavailable. Please try again later | Retry later |

SCIM operations do not use Telesign status codes. They return standard SCIM JSON with HTTP `200` (read, replace, patch), `201` (create) or `204` (delete), and HTTP `422` "Validation Error" when the path or body is invalid. The token endpoint returns HTTP 200 with the token fields described above.

## Requirements and limits

- **Limited availability.** The Accounts API must be enabled for you by Telesign Customer Support.
- **OAuth 2.0 for SCIM** requires Integrations / OAuth 2.0 to be enabled for the organization and an OAuth app created by an org-level admin in the full-service portal.
- **Key values are shown once.** Only `accounts_create_api_key` returns `data.key`. List and get operations never return it. If the value is lost, create another key and expire that one.
- **Key limit.** An account can hold a limited number of keys; exceeding it returns `5111` with the limit in the message.
- **Clone does not copy users or permissions**, and accepts at most one initial user.
- **Rate limits apply** (`5204`). The documentation does not state the numbers.
- **Least privilege.** A REST API key gives access to every product enabled on the account, so treat key creation as a privileged act. Give OAuth apps only the scopes they need.
- **Encoding.** JSON bodies, UTF-8.

## Related

- Topics: `authentication` (Basic, Digest and OAuth 2.0 in detail), `best-practices` (credential security), `error-codes` (Accounts API codes 5000-5500), `callbacks` (callback signatures use the API key), `reference/accounts` and `reference/scim` (generated parameter and response tables).
- Telesign pages used:
  - https://developer.telesign.com/enterprise/docs/accounts-api-overview
  - https://developer.telesign.com/enterprise/docs/authentication (OAuth 2.0 authentication)
  - https://developer.telesign.com/enterprise/reference/cloneaccount
  - https://developer.telesign.com/enterprise/reference/listrestapikeys
  - https://developer.telesign.com/enterprise/reference/post-accounts-account_id-keys-rest
  - https://developer.telesign.com/enterprise/reference/get-accounts-account_id-keys-rest-key_id
  - https://developer.telesign.com/enterprise/reference/patch-accounts-account_id-keys-rest-key_id
  - https://developer.telesign.com/enterprise/reference/delete-accounts-account_id-keys-rest-key_id
  - https://developer.telesign.com/enterprise/reference/post-access-token
  - https://developer.telesign.com/enterprise/reference/get_service_provider_config_scim_v2_serviceproviderconfig_get (and the other SCIM reference pages under `/enterprise/reference/*scim_v2*`)
