# Deactivated Numbers API

The Deactivated Numbers API gives you downloadable report files listing phone numbers that carriers deactivated the previous day. You use the files to keep a do-not-send list, so that your Telesign SMS and SMS Verify traffic does not go to numbers while they are deactivated (and possibly reassigned to someone else). Telesign cautions that doing this may be required to comply with government or carrier restrictions.

It is a bulk, file-based product: two endpoints, one that lists the available files and one that downloads a file. There is no per-number lookup here.

## When to use it

- **Bulk user-base cleaning**: you hold many phone numbers and want to remove or suppress those that were disconnected, without paying for a lookup per number.
- **Messaging compliance**: you send SMS or SMS Verify messages through Telesign and must block messaging (and for some carriers billing) to deactivated numbers for a carrier-defined period.
- **Daily hygiene jobs**: a scheduled job that picks up each day's new files and updates a suppression database.

Pick a different product when you need an answer for one specific number at the moment of a transaction (for example at sign-in or before sending an OTP). That is the Phone ID Number Deactivation identity attribute; see "Bulk files compared with the Phone ID number_deactivation add-on" below.

## How it works

Telesign's documented daily routine:

1. Once per day, request the file list (`deactivatednumbers_list_files`). Store the list with the date you fetched it.
2. Compare it with the previous day's list and keep only the filenames that are new.
3. Download each new file (`deactivatednumbers_download_file`). The response body is the raw contents of a ZIP file; save it under the same filename.
4. Uncompress each ZIP. You get a CSV file (or another data format for a few carriers).
5. Parse each data file using the column layout for that carrier. The carrier is identified by the filename.
6. Verizon Wireless only: discard every record whose `Status` column is not `deactivated`. For all other carriers, every record is a deactivated number.
7. Save the numbers to your do-not-send database(s) and have your messaging integration check them before sending.
8. Remove numbers from the do-not-send list again after the carrier's deactivation period has passed. A deactivated number is only in do-not-send status for a limited time, which varies by carrier.

Key facts:

- **Age of data**: the reports contain the previous day's deactivations, for all carriers.
- **Deactivation period**: 2 days for all carriers except Boost (50 days), Sprint (50 days) and Verizon Wireless (31 days).
- **File type**: carriers send CSV only, except Sprint, T-Mobile and West Central Wireless, which also use other formats (see the carrier table).

## MCP tools

| Tool | What it does | Endpoint |
| --- | --- | --- |
| `deactivatednumbers_list_files` | Lists the names of the deactivated-number files you can download. Takes no arguments. | `GET https://deact-api.telesign.com/files` |
| `deactivatednumbers_download_file` | Downloads one file by name. The body is binary (ZIP). | `GET https://deact-api.telesign.com/download/{file_name}` |

Both use Basic (or Digest) authentication with your Customer ID and API key, and both are read-only. Use `docs_get_tool_reference("<tool>")` for the full reference.

## Quick start

List the available files. Takes an empty argument object and returns `list_of_files`, `code` and `description`.

```json
{}
```

Tool: `deactivatednumbers_list_files`. Example response:

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

Download one file. Pass a name exactly as it appeared in `list_of_files`. With `TELESIGN_DOWNLOAD_DIR` set, the tool reports the path the ZIP was saved to; without it, the tool only reports the size.

```json
{
  "file_name": "att-deacts_20210719.zip"
}
```

Tool: `deactivatednumbers_download_file`.

A typical agent run is: call `deactivatednumbers_list_files`, pick the names not yet processed, call `deactivatednumbers_download_file` once per name, then unzip and parse the saved files outside the MCP server.

## How the download tool saves files

The download endpoint returns `application/octet-stream`, not JSON. The MCP server cannot return binary data as tool output, so it behaves as follows:

- **`TELESIGN_DOWNLOAD_DIR` is set**: the server writes the response bytes to that directory (creating it if needed), using the requested filename, and returns a message of the form "Binary response (N bytes) saved to <path>". Any character in the name other than letters, digits, underscore, dot and hyphen is replaced by `_`. An existing file with the same name is overwritten.
- **`TELESIGN_DOWNLOAD_DIR` is not set**: nothing is written. The tool returns only the size and content type of the response, with a hint to set `TELESIGN_DOWNLOAD_DIR`. The file contents are discarded, so you must set the variable and call the tool again to get the data.

The server does not unzip or parse the file. `TELESIGN_DOWNLOAD_DIR` is an environment variable of the MCP server process, so it is set in the server configuration, not passed as a tool argument. Error responses (401, 403, 404, 500) are JSON and are returned as normal tool output.

## Key parameters

| Parameter | Tool | Notes |
| --- | --- | --- |
| `file_name` | `deactivatednumbers_download_file` | Required. The filename of the deactivated numbers file to download. Always take it from the current `list_of_files`; a name that is not available returns code `2204`. |

`deactivatednumbers_list_files` has no parameters. There is no filter by carrier or date; filter the returned names yourself.

## File naming

The carrier and the report date are encoded in the filename: a carrier prefix, `-deacts_`, and the date as `yyyyMMdd`. The carrier table documents the pattern as `<carrier>-deacts_yyyyMMdd.csv.zip` (for example `att-deacts_yyyyMMdd.csv.zip`), while the API reference example shows names such as `att-deacts_20210719.zip`. Do not build filenames yourself; use the names returned by `deactivatednumbers_list_files` and match on the carrier prefix.

## Report columns

Parse each file according to its carrier. Columns appear in this order:

| Carriers | Columns |
| --- | --- |
| All carriers except Sprint, T-Mobile USA and Verizon Wireless | Deact Date, Carrier ID, Deactivated Number |
| Sprint and T-Mobile USA | Deact Date, Carrier ID, Deactivated Number, New Number |
| Verizon Wireless | Status, Deact Date, Carrier ID, Deactivated Number, New Number |

For Verizon Wireless, keep only rows whose `Status` is `deactivated`.

## Carrier coverage

Coverage is the set of mobile operators below. The ID is the carrier ID used in the reports. Filename formats are reproduced as Telesign documents them.

| Mobile operator | ID | Filename format | Notes |
| --- | --- | --- | --- |
| Alaska Communications Systems (ACS) | 592 | `acs-deacts_yyyyMMdd.csv.zip` | |
| Arctic Slope Telephone Cooperative Association (ASTAC) | 10242 | `astac-deacts_yyyyMMdd.csv.zip` | |
| AT&T | 383 | `att-deacts_yyyyMMdd.csv.zip` | |
| Atlantic Tele-Network International (ATNI) | 10542 | `atni-deacts_yyyyMMdd.csv.zip` | |
| Bandwidth (includes Republic Wireless) | 766 | `bandwidth-deacts_yyyyMMdd.csv.zip` | |
| Blue Wireless | 15606 | `blue-deacts_yyyyMMdd.csv.zip` | |
| BlueGrass Cellular | 562 | `blueGrass-deacts_yyyyMMdd.csv.zip` | |
| Boost | 586 | `boost-deacts_yyyyMMdd.csv.zip` | Block all messaging to deactivated numbers for 50 days. |
| Cable & Cellular/Mid-Rivers Communications | 834 | `cablecellular-deacts_yyyyMMdd.csv.zip` | |
| Carolina West | 564 | `carolinaWest-deacts_yyyyMMdd.csv.zip` | |
| CellCom | 587 | `cellcom-deacts_yyyyMMdd.csv.zip` | |
| Cellular One of N.E. Arizona | 566 | `c1neaz-deacts_yyyyMMdd.csv.zip` | |
| Chat Mobility | 619 | `chat-deacts_yyyyMMdd.csv.zip` | |
| Copper Valley Telecom | 802 | `chat-deacts_yyyyMMdd.csv.zip` | Same prefix as Chat Mobility in the Telesign table. |
| Cordova Telephone Cooperative Inc dba Cordova Wireless | 10282 | `cordova-deacts_yyyyMMdd.csv.zip` | |
| Cross Wireless | 618 | `cross-deacts_yyyyMMdd.csv.zip` | |
| Digital Communications Consulting | 11316 | `digitalCommunicationsConsulting_yyyyMMdd.csv.zip` | No `-deacts` in the documented name. |
| Duet Wireless (through NewCore Wireless) | 696 | `duet-deacts_yyyyMMdd.csv.zip` | |
| East Kentucky Network (Appalachia Wireless) | 570 | `appalachian-deacts_yyyyMMdd.csv.zip` | |
| GCI Communications | 603 | `inland-deacts_yyyyMMdd.csv.zip` | Prefix `inland` in the Telesign table. |
| Illinois Valley Cellular | 574 | `ivc-deacts_yyyyMMdd.csv.zip` | |
| Inland Cellular | 575 | `cordova-deacts_yyyyMMdd.csv.zip` | Prefix `cordova` in the Telesign table. |
| Limitless Mobile (formerly Immix) | 588 | `immix-deacts_yyyyMMdd.csv.zip` | |
| MTPCS Cellular One (Cellone Nation) | 655 | `cellone-deacts_yyyyMMdd.csv.zip` | |
| Nemont CDMA | 796 | `nemont-deacts_yyyyMMdd.csv.zip` | |
| Nemont UMTS | (none listed) | `nemontUMTS-deacts_yyyyMMdd.csv.zip` | |
| Nex-Tech Communications | 578 | `nextech-deacts_yyyyMMdd.csv.zip` | |
| Northwest Missouri Cellular | 620 | `nwmissouri-deacts_yyyyMMdd.csv.zip` | |
| Panhandle Wireless | 626 | `ptci-deacts_yyyyMMdd.csv.zip` | |
| Pine Belt Cellular | 10352 | `pinebelt-deacts_yyyyMMdd.csv.zip` | |
| Pine Cellular | 580 | `pine-deacts_yyyyMMdd.csv.zip` | |
| Rural Independent Network Alliance (RINA) | 567 | `ctci-deacts_yyyyMMdd.csv.zip` | |
| Shelcomm | 11293 | `shelcomm-deacts_yyyyMMdd.csv.zip` | |
| SouthernLINC | 763 | `southernlinc-deacts_yyyyMMdd.csv.zip` | |
| Sprint | 34 | `sprint-deacts_yyyyMMdd.csv.zip` | Block all messaging and billing to deactivated numbers for 50 days. Formats include CSV, Sprint-formatted CSV and Sprint pipe-delimited. Has a New Number column. |
| SRT Communications | (none listed) | `srt-deacts_yyyyMMdd.csv.zip` | |
| Standing Rock | 764 | `standingRock-deacts_yyyyMMdd.csv.zip` | |
| T-Mobile USA | 79 | `tmobile-deacts_yyyyMMdd.csv.zip` | Formats include CSV, T-Mobile formatted CSV and XML. Has a New Number column. |
| Thumb Cellular | 604 | `thumb-deacts_yyyyMMdd.csv.zip` | |
| Tracfone | 556 | `attTracfone-deacts_yyyyMMdd.csv.zip` | |
| Triangle Wireless | 10272 | `triangle-deacts_yyyyMMdd.csv.zip` | |
| U.S. Cellular | 56 | `usCellular-deacts_yyyymmdd.csv.zip` | |
| Union Telephone | 549 | `union-deacts_yyyyMMdd.csv.zip` | |
| Verizon Wireless | 77 | `verizon-deacts_yyyyMMdd.csv.zip` | All messaging and billing to deactivated numbers must be blocked for 31 days. Has Status and New Number columns; keep only `deactivated` rows. |
| Viaero Wireless | 650 | `viaero-deacts_yyyyMMdd.csv.zip` | |
| West Central Wireless | 559 | `westCentral-deacts_yyyyMMdd.csv.zip` | Formats include CSV and text file. |

Carriers with no note use the standard three columns, CSV format and the 2-day deactivation period. Numbers on carriers that are not in this table are not covered by the files.

## Bulk files compared with the Phone ID number_deactivation add-on

| | Deactivated Numbers API | Phone ID Number Deactivation |
| --- | --- | --- |
| Shape | Daily files covering every deactivation a carrier reported. | One request per phone number. |
| Tools | `deactivatednumbers_list_files`, `deactivatednumbers_download_file` | `phoneid_get_info` with `addons.number_deactivation`, or `phoneid_legacy_number_deactivation` |
| What you get | Rows of deactivation date, carrier ID and deactivated number (plus new number and status for some carriers). | For the queried number: `carrier_name`, `last_deactivated`, `tracking_since`, and `recycled_since_last_verification` (`recycled`, `not_recycled` or `cannot_be_determined`) when you supply a `last_verified` date. |
| Typical use | Maintain a do-not-send list and clean a whole user base on a schedule. | Check one number during a transaction, for example to see whether it was recycled since the user last verified. |
| Processing | You download, unzip, parse and store the data, and expire entries after the carrier's deactivation period. | Nothing to store; the answer comes back in the response. |
| Cost model | No per-number lookup. | Billed per lookup. |

A per-number check looks like this (`phoneid_get_info`); it returns the standard Phone ID data plus a `number_deactivation` block.

```json
{
  "complete_phone_number": "15551234567",
  "addons": {
    "number_deactivation": {
      "last_verified": "2024-01-01T00:00:00Z"
    }
  }
}
```

The Phone ID attribute must be added to your account by Telesign and is documented as available to full-service accounts only. See the `phone-id` guide for details.

## Responses and status codes

The list endpoint returns JSON. The download endpoint returns the file itself on success, with no JSON object, and a JSON error object (`code`, `description`) on failure.

| HTTP | `code` | Meaning | What to do |
| --- | --- | --- | --- |
| 200 | 2200 | Request successfully completed (file list). | Use `list_of_files`. |
| 200 | (none) | File contents returned (download). | Read the saved file from `TELESIGN_DOWNLOAD_DIR`. |
| 401 | 2201 | Unauthorized access. The Customer ID and/or API key were missing or not valid. | Check credentials. |
| 403 | 2203 | Request forbidden. This user does not have access to the resource. | Ask Telesign to enable the Deactivated Numbers API for the account. |
| 404 | 2204 | Download failed; the file does not exist or may have been deleted. | Refresh the file list and use a current name. |
| 500 | 2250 | Internal Server Error. | Try again later. |

Response fields of the file list:

| Field | Meaning |
| --- | --- |
| `list_of_files` | Array of filenames of compressed files containing deactivated numbers. Pass a name to the download tool. |
| `code` | Numeric status of the request, for example `2200`. |
| `description` | Text description of the status. |

## Requirements and limits

- **Access**: the account must be allowed to use the API; otherwise the endpoints return `2203` (HTTP 403).
- **Authentication**: Basic or Digest, over HTTPS, base URL `deact-api.telesign.com`.
- **Rate limits**: Telesign's default rate limits by product apply. The documented usage is one file-list request per day.
- **Retention**: files can disappear from the list (`2204` mentions that a file "may have been deleted"), so download new files promptly.
- **Compliance**: block messaging to deactivated numbers for the carrier's period: 2 days by default, 31 days for Verizon Wireless (messaging and billing), 50 days for Sprint (messaging and billing) and Boost (messaging).
- **Parsing**: adjust parsing per carrier (columns, formats). Only Verizon Wireless files contain non-deactivation rows.
- **MCP server**: set `TELESIGN_DOWNLOAD_DIR` before using `deactivatednumbers_download_file`; otherwise only the size is reported.

## Related

- Guides: `phone-id` (per-number Number Deactivation attribute), `messaging-sms` (the SMS traffic this list protects), `intelligence` (risk scoring), `best-practices`, `error-codes`.
- Tool reference: `docs_get_tool_reference("deactivatednumbers_list_files")`, `docs_get_tool_reference("deactivatednumbers_download_file")`.
- Telesign pages:
  - https://developer.telesign.com/enterprise/docs/deactivated-numbers-api-overview
  - https://developer.telesign.com/enterprise/docs/deactivated-numbers-api-report-columns
  - https://developer.telesign.com/enterprise/docs/deactivated-numbers-api-details-by-carrier
  - https://developer.telesign.com/enterprise/reference/getdeactnumfilelist
  - https://developer.telesign.com/enterprise/reference/getdeactnumfile
  - https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-number-deactivation
