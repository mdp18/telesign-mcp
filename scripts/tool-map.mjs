// Maps Telesign reference-page slugs (https://developer.telesign.com/enterprise/reference/<slug>)
// to MCP tool names and toolsets. Edit this file to rename tools or move them between toolsets,
// then run `npm run sync-specs`.
//
// Flags:
//   readOnly    - the call does not change anything at Telesign and sends nothing to an end user
//   destructive - the call deletes or irreversibly changes data
//   idempotent  - repeating the call with the same arguments has no additional effect
//   stateChangingParams - parameters that turn a read-only call into one that changes state (a status
//                 lookup with verify_code checks the code and uses an attempt); hidden in read-only mode
//   skip        - documented page that should not become a tool (reason given)
//   note        - extra guidance appended to the tool description
//   defaults    - body fields sent when the caller does not supply them
//   omit        - body parameters to leave out of the tool (for example secrets the server supplies itself)
//   dropFields  - property names to remove everywhere (request, responses, examples): retired features
//   patchBody   - function(bodySchema) that corrects the request schema where the published OpenAPI
//                 definition disagrees with Telesign's own documentation pages
//
// Toolset tiers:
//   core     - registered by default
//   extended - not listed by default; the assistant can switch them on at runtime (telesign_enable_toolsets)
//              or the operator can pin them on with TELESIGN_TOOLSETS
//   admin    - only available when the operator lists them in TELESIGN_TOOLSETS (or uses "all")

// The Phone ID OpenAPI definition lists response fields as the inputs of some add-ons. The inputs below
// follow the identity-attribute documentation pages:
//   https://developer.telesign.com/enterprise/docs/phone-id-get-started-with-identity-attributes
//   https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-number-deactivation
//   https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-contact-match
//   https://developer.telesign.com/enterprise/docs/phone-id-identity-attributes-contact
// Contact Plus is deprecated and no longer supported by Telesign, although its OpenAPI definition still lists it.
const RETIRED_PHONE_ID_ADDONS = ["contact_plus"];

function fixPhoneIdAddons(body) {
  const addons = body?.properties?.addons?.properties;
  if (!addons) return;
  addons.number_deactivation = {
    type: "object",
    description:
      addons.number_deactivation?.description ||
      "Number Deactivation add-on: whether the number has been deactivated, when, and by which carrier.",
    properties: {
      last_verified: {
        type: "string",
        description:
          "Date and time you last verified this number, in ISO 8601 format. When included, the response reports whether the number has been recycled since then.",
        example: "2018-04-05T00:00:00Z",
      },
    },
  };
  if (addons.contact_match?.properties) {
    delete addons.contact_match.properties.input_used; // response field
    addons.contact_match.properties.email ??= {
      type: "string",
      description: "Email address given by the end user, to match against the email on record (Email ID feature).",
    };
    addons.contact_match.properties.date_of_birth ??= {
      type: "string",
      description: "Date of birth given by the end user, to match against the record.",
      example: "1954-01-06T00:00:00Z",
    };
  }
  if (addons.contact) {
    addons.contact.type = "object";
    addons.contact.properties = {
      ...(addons.contact.properties || {}),
      email: {
        type: "string",
        description:
          "Email address given by the end user, to compare with the email associated with the number (Email ID feature: full-service accounts, limited markets).",
      },
    };
  }
}

// The Verify API OpenAPI definition omits "viber" from the method enum, but Telesign documents it:
//   https://developer.telesign.com/enterprise/docs/verify-api-get-started-with-viber
function addViberMethod(body) {
  const method = body?.properties?.verification_policy?.items?.properties?.method;
  if (Array.isArray(method?.enum) && !method.enum.includes("viber")) method.enum.push("viber");
}

// The Messaging OpenAPI definition lists fewer Viber templates than the documentation pages use:
//   https://developer.telesign.com/enterprise/docs/messaging-overview (text_2way, image_2way)
//   https://developer.telesign.com/enterprise/docs/messaging-get-transaction-status-after-auto-generating-an-otp-code (telesign_otp)
function addViberTemplates(body) {
  const template = body?.properties?.message?.properties?.viber?.properties?.template;
  if (!Array.isArray(template?.enum)) return;
  for (const name of ["text_2way", "image_2way", "telesign_otp"]) if (!template.enum.includes(name)) template.enum.push(name);
}

// Bulk SMS accepts a request-level session_id that the OpenAPI definition leaves out:
//   https://developer.telesign.com/enterprise/docs/sms-send-bulk-sms
function addBulkSessionId(body) {
  if (!body?.properties || body.properties.session_id) return;
  body.properties.session_id = {
    type: "string",
    description:
      "Your own ID for this bulk transaction. It is returned in delivery callbacks for recipients that have no ID of their own in recipients.",
    example: "CustomExternalID7349",
  };
}

export const TOOLSETS = {
  verify: {
    title: "Verify API",
    tier: "core",
    blurb: "Omnichannel verification: one-time passcodes over SMS, WhatsApp, Viber, RCS, email and voice with automatic fallback, plus Silent Verify and Push.",
  },
  "sms-verify": {
    title: "SMS Verify API",
    tier: "extended",
    blurb: "Standalone SMS one-time passcode verification with Telesign- or self-generated codes.",
  },
  "voice-verify": {
    title: "Voice Verify API",
    tier: "extended",
    blurb: "One-time passcode verification delivered by voice call (text-to-speech).",
  },
  "silent-verify": {
    title: "Silent Verify API",
    tier: "extended",
    blurb: "Zero-interaction verification that confirms possession of a mobile number over the carrier data network.",
  },
  "app-verify": {
    title: "App Verify API",
    tier: "extended",
    blurb: "Android app verification by flash call: the caller ID of an auto-terminated voice call is the verification code.",
  },
  "smart-verify": {
    title: "Smart Verify API",
    tier: "extended",
    blurb: "Verification where Telesign decides whether an SMS or a voice call is the most effective way to deliver the passcode.",
  },
  sms: {
    title: "SMS",
    tier: "core",
    blurb: "Text messaging for alerts, notifications and account security: single SMS, bulk SMS, delivery status and completion reporting.",
  },
  messaging: {
    title: "Omnichannel Messaging",
    tier: "extended",
    blurb: "One API for SMS, MMS, RCS, WhatsApp, Viber and email with cascading fallback channels, channel capability checks and message templates.",
  },
  "number-masking": {
    title: "Number Masking",
    tier: "extended",
    blurb: "Private SMS and voice sessions between two parties who never see each other's real phone number.",
  },
  voice: {
    title: "Voice",
    tier: "extended",
    blurb: "Programmable voice: dial, play, speak (TTS), gather input, record, and manage call recordings.",
  },
  "phone-id": {
    title: "Phone ID",
    tier: "core",
    blurb: "Phone number and subscriber intelligence: type, carrier, location, and identity attributes such as SIM swap, porting, contact and number deactivation.",
  },
  intelligence: {
    title: "Intelligence",
    tier: "core",
    blurb: "Machine-learning risk scoring for phone numbers and email addresses with allow / flag / block recommendations and reason codes.",
  },
  "deactivated-numbers": {
    title: "Deactivated Numbers API",
    tier: "extended",
    blurb: "Daily files of deactivated phone numbers so you can clean your user base in bulk.",
  },
  accounts: {
    title: "Accounts API",
    tier: "admin",
    blurb: "Programmatic account management: clone accounts and manage REST API keys.",
  },
  scim: {
    title: "Accounts API - SCIM user management",
    tier: "admin",
    blurb: "SCIM 2.0 provisioning of portal users and groups (OAuth 2.0 client credentials).",
  },
  "protect-platform": {
    title: "Protect Platform and Flow Builder",
    tier: "admin",
    blurb: "Protect Platform authentication and Flow Builder transactional flows (select regions, full-service accounts).",
  },
};

export const TOOL_MAP = {
  // ---- Verify API (omnichannel) ----
  createverificationprocess: {
    tool: "verifyapi_send_otp",
    toolset: "verify",
    patchBody: addViberMethod,
    note: 'Typical call: {"recipient": {"phone_number": "15551234567"}, "verification_policy": [{"method": "sms", "fallback_time": 30}, {"method": "voice"}]}. Keep the returned reference_id, then check the code with verifyapi_check_code.',
  },
  getverificationprocess: { tool: "verifyapi_get_status", toolset: "verify", readOnly: true },
  updateverificationprocess: {
    tool: "verifyapi_update_process",
    toolset: "verify",
    note: 'To check a code the end user typed, verifyapi_check_code is the simpler equivalent (action "finalize").',
  },

  // ---- SMS Verify API ----
  sendsmsverifycode: { tool: "smsverify_send_code", toolset: "sms-verify" },
  getsmsverifystatus: { tool: "smsverify_get_status", toolset: "sms-verify", readOnly: true, stateChangingParams: ["verify_code"] },
  reportsmsverifycompletion: { tool: "smsverify_report_completion", toolset: "sms-verify", idempotent: true },

  // ---- Voice Verify API ----
  sendvoiceverifycode: { tool: "voiceverify_send_code", toolset: "voice-verify" },
  getvoiceverifystatus: { tool: "voiceverify_get_status", toolset: "voice-verify", readOnly: true, stateChangingParams: ["verify_code"] },
  reportvoiceverifycompletion: { tool: "voiceverify_report_completion", toolset: "voice-verify", idempotent: true },

  // ---- Silent Verify API ----
  createsilentverifyrequest: { tool: "silentverify_initiate", toolset: "silent-verify" },
  getsilentverifystatus: { tool: "silentverify_finalize", toolset: "silent-verify" },

  // ---- App Verify API ----
  sendappverifycode: { tool: "appverify_initiate", toolset: "app-verify" },
  getappverifystatus: { tool: "appverify_get_status", toolset: "app-verify", readOnly: true },
  endappverifycall: { tool: "appverify_finalize_call", toolset: "app-verify" },
  reportappverifycallerid: { tool: "appverify_report_caller_id", toolset: "app-verify" },
  reportappverifytimeout: { tool: "appverify_report_timeout", toolset: "app-verify" },

  // ---- Smart Verify API ----
  sendsmartverifycode: { tool: "smartverify_send_code", toolset: "smart-verify" },

  // ---- Messaging (Engage API) ----
  sendadvancedmessage: {
    tool: "messaging_send_message",
    toolset: "messaging",
    patchBody: addViberTemplates,
    note: 'message needs one entry per channel listed in channels, e.g. {"sms": {"template": "text", "parameters": {"text": "Hello"}}}. For plain SMS only, messaging_send_sms is simpler.',
  },
  getmessagingstatus: { tool: "messaging_get_message_status", toolset: "messaging", readOnly: true, stateChangingParams: ["verify_code"] },
  sendsms: { tool: "messaging_send_sms", toolset: "sms" },
  getsmsstatus: { tool: "messaging_get_sms_status", toolset: "sms", readOnly: true },
  reportsmscompletion: { tool: "messaging_report_completion", toolset: "sms", idempotent: true },
  sendbulksms: { tool: "messaging_send_bulk_sms", toolset: "sms", patchBody: addBulkSessionId },
  checkphonenumberchannelcapability: { tool: "messaging_check_channel_capability", toolset: "messaging", readOnly: true },
  checkphonenumberrbmcapability: { tool: "messaging_check_rcs_capability", toolset: "messaging", readOnly: true },
  createmsgtemplate: { tool: "templates_create", toolset: "messaging" },
  getallmsgtemplates: { tool: "templates_list", toolset: "messaging", readOnly: true },
  getmsgtemplate: { tool: "templates_get", toolset: "messaging", readOnly: true },
  deletemsgtemplate: { tool: "templates_delete", toolset: "messaging", destructive: true, idempotent: true },

  // ---- Number Masking ----
  createmaskedsmssession: { tool: "numbermasking_create_sms_session", toolset: "number-masking" },
  createmaskedvoicesmssession: { tool: "numbermasking_create_sms_voice_session", toolset: "number-masking" },

  // ---- Voice ----
  sendvoiceaction: {
    tool: "voice_send_action",
    toolset: "voice",
    note: `method is the action name: dial, dial_session, hangup, play, play_multiple, speak, send_dtmf, record_start, record_pause, record_resume, record_stop. params holds the fields of that action, e.g. for dial: {"to": "15554441313", "caller_id_number": "15555551212", "event_url": "https://..."}. See docs_get("voice") for the params of every action.`,
  },
  getrecordingslistbycallid: { tool: "voice_list_recordings_for_call", toolset: "voice", readOnly: true },
  getrecordingslistbydaterange: { tool: "voice_list_recordings", toolset: "voice", readOnly: true },
  deleterecordings: { tool: "voice_delete_recordings", toolset: "voice", destructive: true, idempotent: true },

  // ---- Phone ID ----
  submitphonenumberforidentity: {
    tool: "phoneid_get_info",
    toolset: "phone-id",
    readOnly: true,
    patchBody: fixPhoneIdAddons,
    dropFields: RETIRED_PHONE_ID_ADDONS,
    note: 'Request identity attributes by adding keys to addons, e.g. {"sim_swap": {}, "porting_status": {}, "number_deactivation": {"last_verified": "2024-01-31T00:00:00Z"}, "contact_match": {"first_name": "...", "last_name": "..."}}. Each add-on must be enabled for the account. See docs_get("phone-id").',
  },
  submitphonenumberforidentityalt: {
    tool: "phoneid_get_info_private",
    toolset: "phone-id",
    readOnly: true,
    patchBody: fixPhoneIdAddons,
    dropFields: RETIRED_PHONE_ID_ADDONS,
    note: "Same as phoneid_get_info, but the phone number travels in the request body instead of the URL, so it stays out of URL logs.",
  },
  submitphonenumberforlivestatus: { tool: "phoneid_live_status", toolset: "phone-id", readOnly: true },
  getcontactdetailsforphonenumber: { tool: "phoneid_legacy_contact", toolset: "phone-id", readOnly: true },
  getphonenumberdeactstatus: { tool: "phoneid_legacy_number_deactivation", toolset: "phone-id", readOnly: true },

  // ---- Intelligence ----
  submitphonenumberforintelligencecloud: { tool: "intelligence_assess_risk", toolset: "intelligence", readOnly: true },
  submitphonenumberforintelligence: { tool: "intelligence_score_legacy", toolset: "intelligence", readOnly: true },
  submitemailaddressforemailintelligence: { tool: "intelligence_assess_email", toolset: "intelligence", readOnly: true },
  submitemailaddressforemailintelligenceextendedresponse: {
    skip: "Same request as intelligence_assess_email; this page only documents the extended response.",
    toolset: "intelligence",
  },

  // ---- Deactivated Numbers API ----
  getdeactnumfilelist: { tool: "deactivatednumbers_list_files", toolset: "deactivated-numbers", readOnly: true },
  getdeactnumfile: { tool: "deactivatednumbers_download_file", toolset: "deactivated-numbers", readOnly: true },

  // ---- Accounts API ----
  cloneaccount: { tool: "accounts_clone_account", toolset: "accounts" },
  listrestapikeys: { tool: "accounts_list_api_keys", toolset: "accounts", readOnly: true },
  "post-accounts-account_id-keys-rest": { tool: "accounts_create_api_key", toolset: "accounts" },
  "get-accounts-account_id-keys-rest-key_id": { tool: "accounts_get_api_key", toolset: "accounts", readOnly: true },
  "patch-accounts-account_id-keys-rest-key_id": { tool: "accounts_update_api_key", toolset: "accounts" },
  "delete-accounts-account_id-keys-rest-key_id": { tool: "accounts_delete_api_key", toolset: "accounts", destructive: true, idempotent: true },

  // ---- Accounts API: SCIM ----
  get_service_provider_config_scim_v2_serviceproviderconfig_get: { tool: "scim_get_service_provider_config", toolset: "scim", readOnly: true },
  list_resource_types_scim_v2_resourcetypes_get: { tool: "scim_list_resource_types", toolset: "scim", readOnly: true },
  get_resource_type_scim_v2_resourcetypes__resource_type_name__get: { tool: "scim_get_resource_type", toolset: "scim", readOnly: true },
  list_schemas_scim_v2_schemas_get: { tool: "scim_list_schemas", toolset: "scim", readOnly: true },
  get_schema_scim_v2_schemas__schema_id__get: { tool: "scim_get_schema", toolset: "scim", readOnly: true },
  get_users_scim_v2_users_get: { tool: "scim_list_users", toolset: "scim", readOnly: true },
  create_user_scim_v2_users_post: { tool: "scim_create_user", toolset: "scim" },
  retrieve_user_scim_v2_users__user_id__get: { tool: "scim_get_user", toolset: "scim", readOnly: true },
  update_user_scim_v2_users__user_id__put: { tool: "scim_replace_user", toolset: "scim", idempotent: true },
  patch_update_user_scim_v2_users__user_id__patch: { tool: "scim_patch_user", toolset: "scim" },
  delete_user_scim_v2_users__user_id__delete: { tool: "scim_delete_user", toolset: "scim", destructive: true, idempotent: true },
  get_groups_scim_v2_groups_get: { tool: "scim_list_groups", toolset: "scim", readOnly: true },
  retrieve_group_scim_v2_groups__group_id__get: { tool: "scim_get_group", toolset: "scim", readOnly: true },
  update_group_scim_v2_groups__group_id__patch: { tool: "scim_patch_group", toolset: "scim" },

  // ---- Authentication API / Protect Platform / Flow Builder ----
  "post-access-token": {
    tool: "auth_request_access_token",
    toolset: "scim",
    omit: ["client_id", "client_secret"],
    note: "The server authenticates with TELESIGN_OAUTH_CLIENT_ID / TELESIGN_OAUTH_CLIENT_SECRET and fetches tokens for SCIM tools automatically; use this tool only to check that the OAuth app works. The token value is masked in the result.",
  },
  initiateauthentication: {
    tool: "protect_generate_access_token",
    toolset: "protect-platform",
    defaults: { productId: 3 },
    note: "The server fetches and caches this token automatically for Flow Builder tools; use this tool only to check that Protect Platform credentials work. The token value is masked in the result.",
  },
  initializetransactionalflow: { tool: "flowbuilder_init_flow", toolset: "protect-platform" },
};

// Webhook pages: Telesign calls *your* server. These become reference docs, not tools.
export const CALLBACK_SLUGS = [
  "unifiedverifycallbacks",
  "smsverifycallbacks",
  "smsdeliveryreports",
  "msgsmscallbacks",
  "bulksmscallbacks",
  "mmscallbacks",
  "rcscallbacks",
  "whatsappcallbacks",
  "vibercallbacks",
  "emailcallbacks",
  "templatescallbacks",
];
