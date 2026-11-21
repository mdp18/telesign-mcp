// Offline tests: nothing here talks to Telesign. Run with `npm test` (builds first).
import test from "node:test";
import assert from "node:assert/strict";

process.env.TELESIGN_CUSTOMER_ID = "FFFFFFFF-EEEE-DDDD-1234-AB1234567890";
process.env.TELESIGN_API_KEY = "ABC12345yusumoN6BYsBVkh+yRJ5czgsnCehZaOYldPJdmFh6NeX8kunZ2zU1YWaUw/0wV6xfw==";
process.env.TELESIGN_OAUTH_CLIENT_ID = "client-id";
process.env.TELESIGN_OAUTH_CLIENT_SECRET = "client-secret";
process.env.TELESIGN_PROTECT_USERNAME = "user";
process.env.TELESIGN_PROTECT_PASSWORD = "pass";
process.env.TELESIGN_PROTECT_API_KEY = "protect-key";
process.env.TELESIGN_TOOLSETS = "all";
process.env.TELESIGN_DRY_RUN = "true";

const { OPERATIONS, TOOLSETS } = await import("../build/catalog/operations.js");
const { buildRequest, digestHeaders, normalizePhone, redactRequest, redactTokens, redactUrl } = await import("../build/lib/http.js");
const { findSection, searchDocs } = await import("../build/docs/index.js");
const { buildInputShape } = await import("../build/lib/schema.js");
const { formatResult } = await import("../build/lib/format.js");
const { buildServer } = await import("../build/server.js");
const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");
const { z } = await import("zod");

const op = (tool) => {
  const found = OPERATIONS.find((o) => o.tool === tool);
  assert.ok(found, `operation ${tool} exists`);
  return found;
};

/** Smallest argument set that satisfies an operation's required parameters. */
function sample(schema) {
  if (!schema) return "x";
  if (schema.enum?.length) return schema.enum[0];
  if (schema.oneOf || schema.anyOf) return sample((schema.oneOf || schema.anyOf)[0]);
  switch (schema.type) {
    case "integer":
    case "number":
      return 1;
    case "boolean":
      return true;
    case "array":
      return [sample(schema.items)];
    case "object": {
      const out = {};
      for (const name of schema.required ?? []) out[name] = sample(schema.properties?.[name]);
      return out;
    }
    default:
      if (schema.properties) return sample({ ...schema, type: "object" });
      return "x";
  }
}

function minimalArgs(o) {
  const args = {};
  for (const p of [...o.pathParams, ...o.queryParams, ...o.headerParams]) if (p.required) args[p.name] = sample(p.schema);
  if (o.body && o.bodyMode === "flatten") Object.assign(args, sample({ ...o.body, type: "object" }));
  else if (o.body && o.bodyMode === "single") args.body = sample(o.body);
  return args;
}

async function connect() {
  const server = buildServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  return { server, client };
}

test("catalog is well formed", () => {
  assert.equal(OPERATIONS.length, 67, "catalog has the expected number of operations");
  const names = new Set();
  for (const o of OPERATIONS) {
    assert.match(o.tool, /^[a-z][a-z0-9_]{2,63}$/, `tool name ${o.tool}`);
    assert.ok(!names.has(o.tool), `duplicate tool ${o.tool}`);
    names.add(o.tool);
    assert.ok(TOOLSETS[o.toolset], `${o.tool}: toolset ${o.toolset} exists`);
    assert.match(o.url, /^https:\/\/[a-z0-9.-]+\.telesign\.com\//, `${o.tool}: url ${o.url}`);
    assert.ok(["GET", "POST", "PUT", "PATCH", "DELETE"].includes(o.method), `${o.tool}: method`);
    assert.ok(["basic", "oauth", "oauth-client", "protect-basic", "protect-bearer"].includes(o.auth), `${o.tool}: auth ${o.auth}`);
    assert.ok(o.description.length > 10, `${o.tool}: has a description`);
    const placeholders = [...o.url.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]).sort();
    assert.deepEqual(o.pathParams.map((p) => p.name).sort(), placeholders, `${o.tool}: path params match URL template`);
    if (o.bodyMode !== "none") assert.ok(o.bodyType === "json" || o.bodyType === "form", `${o.tool}: body type`);
    if (o.readOnly) assert.equal(o.destructive, false, `${o.tool}: read-only tools are not destructive`);
    if (o.method === "DELETE") assert.equal(o.destructive, true, `${o.tool}: DELETE is flagged destructive`);
  }
});

test("every operation converts to a valid input schema and builds a request", () => {
  for (const o of OPERATIONS) {
    const shape = buildInputShape(o);
    const args = minimalArgs(o);
    const parsed = z.object(shape).safeParse(args);
    assert.ok(parsed.success, `${o.tool}: minimal args validate: ${parsed.success ? "" : JSON.stringify(parsed.error.issues)}`);

    const request = buildRequest(o, parsed.data);
    assert.equal(request.method, o.method);
    assert.ok(!/[{}]/.test(request.url), `${o.tool}: no unresolved placeholders in ${request.url}`);
    assert.doesNotThrow(() => new URL(request.url));
    if (o.bodyType === "json" && request.body !== undefined) {
      assert.equal(request.headers["Content-Type"], "application/json");
      assert.doesNotThrow(() => JSON.parse(request.body), `${o.tool}: JSON body parses`);
    }
    if (o.bodyType === "form") assert.equal(request.headers["Content-Type"], "application/x-www-form-urlencoded");
    if (o.bodyMode === "none") assert.equal(request.body, undefined, `${o.tool}: no body`);
  }
});

test("request syntax matches the Telesign reference for key endpoints", () => {
  // SMS Verify: form-encoded, digits-only phone number
  let r = buildRequest(op("smsverify_send_code"), { phone_number: "+1 (555) 123-4567", verify_code: 12345, template: "Your code is $$CODE$$" });
  assert.equal(r.method + " " + r.url, "POST https://rest-ww.telesign.com/v1/verify/sms");
  assert.equal(r.body, "phone_number=15551234567&verify_code=12345&template=Your+code+is+%24%24CODE%24%24");

  // SMS Verify status with code check: query string
  r = buildRequest(op("smsverify_get_status"), { reference_id: "AEBC93B5898342F790E4E19FED41A7DA", verify_code: "57244" });
  assert.equal(r.method + " " + r.url, "GET https://rest-ww.telesign.com/v1/verify/AEBC93B5898342F790E4E19FED41A7DA?verify_code=57244");
  assert.equal(r.body, undefined);

  // Verify API: JSON body with nested recipient and policy
  r = buildRequest(op("verifyapi_send_otp"), {
    recipient: { phone_number: "+15551234567" },
    verification_policy: [{ method: "sms", fallback_time: 30 }, { method: "voice" }],
  });
  assert.equal(r.method + " " + r.url, "POST https://verify.telesign.com/verification");
  assert.deepEqual(JSON.parse(r.body), {
    recipient: { phone_number: "15551234567" },
    verification_policy: [{ method: "sms", fallback_time: 30 }, { method: "voice" }],
  });

  // Verify API finalize
  r = buildRequest(op("verifyapi_update_process"), { reference_id: "ABC123", action: "finalize", security_factor: "5724433" });
  assert.equal(r.method + " " + r.url, "PATCH https://verify.telesign.com/verification/ABC123/state");
  assert.deepEqual(JSON.parse(r.body), { action: "finalize", security_factor: "5724433" });

  // Phone ID: number in the path, add-ons as JSON
  r = buildRequest(op("phoneid_get_info"), { complete_phone_number: "+1 555 123 4567", addons: { sim_swap: {}, number_deactivation: { last_verified: "2018-04-05T00:00:00Z" } } });
  assert.equal(r.method + " " + r.url, "POST https://rest-ww.telesign.com/v1/phoneid/15551234567");
  assert.deepEqual(JSON.parse(r.body), { addons: { sim_swap: {}, number_deactivation: { last_verified: "2018-04-05T00:00:00Z" } } });

  // Intelligence Cloud: form-encoded on detect.telesign.com
  r = buildRequest(op("intelligence_assess_risk"), { phone_number: "15551234567", account_lifecycle_event: "create", originating_ip: "203.0.113.5" });
  assert.equal(r.method + " " + r.url, "POST https://detect.telesign.com/intelligence/phone");
  assert.equal(r.body, "phone_number=15551234567&account_lifecycle_event=create&originating_ip=203.0.113.5");

  // SMS
  r = buildRequest(op("messaging_send_sms"), { phone_number: "15551234567", message: "Hello & welcome", message_type: "ARN" });
  assert.equal(r.method + " " + r.url, "POST https://rest-ww.telesign.com/v1/messaging");
  assert.equal(r.body, "phone_number=15551234567&message=Hello+%26+welcome&message_type=ARN");

  // Omnichannel messaging
  r = buildRequest(op("messaging_send_message"), {
    channels: [{ channel: "whatsapp", fallback_time: 60 }, { channel: "sms" }],
    recipient: { phone_number: "+15551234567" },
    message: { sms: { template: "text", parameters: { text: "Hi" } } },
    message_type: "ARN",
  });
  assert.equal(r.method + " " + r.url, "POST https://rest-ww.telesign.com/v1/omnichannel");
  assert.equal(JSON.parse(r.body).recipient.phone_number, "15551234567");

  // Voice: generic action envelope
  r = buildRequest(op("voice_send_action"), { method: "dial", params: { to: "15555551212", caller_id_number: "15554441313" } });
  assert.equal(r.method + " " + r.url, "POST https://rest-ww.telesign.com/v2/voice");
  assert.deepEqual(JSON.parse(r.body), { method: "dial", params: { to: "15555551212", caller_id_number: "15554441313" } });

  // Recordings: query parameters only
  r = buildRequest(op("voice_list_recordings"), { start_date_time: "2024-01-01T00:00:00Z", pagesize: 10 });
  assert.equal(r.url, "https://rest-ww.telesign.com/v2/call_recording?start_date_time=2024-01-01T00%3A00%3A00Z&pagesize=10");

  // Path parameters are URL-encoded
  r = buildRequest(op("templates_get"), { channel: "whatsapp", name: "order update/1" });
  assert.equal(r.url, "https://rest-ww.telesign.com/v1/omnichannel/templates/whatsapp/order%20update%2F1");

  // Completion: PUT without a body
  r = buildRequest(op("smsverify_report_completion"), { reference_id: "ABC123" });
  assert.equal(r.method + " " + r.url, "PUT https://rest-ww.telesign.com/v1/verify/completion/ABC123");
  assert.equal(r.body, undefined);

  assert.throws(() => buildRequest(op("verifyapi_get_status"), {}), /reference_id/);
});

test("extra_fields are merged into the body and catalog defaults are applied", () => {
  let r = buildRequest(op("messaging_send_sms"), { phone_number: "15551234567", message: "Hi", message_type: "ARN", extra_fields: { integrator: "acme" } });
  assert.equal(r.body, "phone_number=15551234567&message=Hi&message_type=ARN&integrator=acme");

  r = buildRequest(op("verifyapi_send_otp"), { recipient: { phone_number: "15551234567" }, extra_fields: { new_option: { a: 1 } } });
  assert.deepEqual(JSON.parse(r.body), { recipient: { phone_number: "15551234567" }, new_option: { a: 1 } });

  r = buildRequest(op("protect_generate_access_token"), {});
  assert.deepEqual(JSON.parse(r.body), { productId: 3 });
  r = buildRequest(op("protect_generate_access_token"), { productId: 2 });
  assert.deepEqual(JSON.parse(r.body), { productId: 2 });
});

test("argument validation is lenient about quoted numbers and booleans", () => {
  const phoneId = z.object(buildInputShape(op("phoneid_get_info")));
  const parsed = phoneId.parse({ complete_phone_number: 15551234567, addons: { porting_history: { past_x_days: "30" }, number_deactivation: { last_verified: "2018-04-05T00:00:00Z" } } });
  assert.equal(parsed.complete_phone_number, "15551234567");
  assert.equal(parsed.addons.porting_history.past_x_days, 30);
  assert.equal(parsed.addons.number_deactivation.last_verified, "2018-04-05T00:00:00Z");

  // Quoted booleans are accepted where the API takes a boolean.
  const scim = z.object(buildInputShape(op("scim_create_user")));
  const user = { userName: "a@example.com", name: { familyName: "A", givenName: "B" }, emails: [], phoneNumbers: [] };
  assert.equal(scim.parse({ ...user, active: "true" }).active, true);
  assert.equal(scim.safeParse({ ...user, active: "maybe" }).success, false);
  assert.equal(phoneId.safeParse({ complete_phone_number: "15551234567", addons: { porting_history: { past_x_days: "soon" } } }).success, false);
});

test("deprecated Telesign operations are either left out or labelled", () => {
  // The generator refuses a deprecated operation unless the tool map acknowledges it, so this list is complete.
  const legacy = OPERATIONS.filter((o) => o.deprecated).map((o) => o.tool).sort();
  assert.deepEqual(legacy, ["intelligence_score_legacy", "phoneid_legacy_contact", "phoneid_legacy_number_deactivation"]);
  for (const name of legacy) assert.match(op(name).description, /^DEPRECATED by Telesign/);
  // The omnichannel send no longer offers the deprecated top-level phone_number; recipient.phone_number replaces it.
  const send = op("messaging_send_message").body.properties;
  assert.equal(send.phone_number, undefined);
  assert.ok(send.recipient.properties.phone_number);
});

test("retired Phone ID add-ons are not offered", () => {
  for (const name of ["phoneid_get_info", "phoneid_get_info_private"]) {
    const addons = Object.keys(op(name).body.properties.addons.properties);
    assert.ok(!addons.includes("contact_plus"), `${name}: contact_plus is retired`);
    for (const expected of ["sim_swap", "number_deactivation", "contact", "contact_match", "porting_history", "subscriber_status"]) {
      assert.ok(addons.includes(expected), `${name}: offers ${expected}`);
    }
  }
});

test("phone normalization leaves non-numeric values alone", () => {
  assert.equal(normalizePhone("+1 (555) 123-4567"), "15551234567");
  assert.equal(normalizePhone(15551234567), "15551234567");
  assert.equal(normalizePhone("not a number"), "not a number");
});

test("digest authentication signs the documented string-to-sign", async () => {
  const crypto = await import("node:crypto");
  const request = { method: "POST", url: "https://rest-ww.telesign.com/v1/verify/sms", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "phone_number=4445551212&language=en-US" };
  const now = new Date("2017-01-31T11:36:42Z");
  const headers = digestHeaders(request, "FFFFFFFF-EEEE-DDDD-1234-AB1234567890", process.env.TELESIGN_API_KEY, now, "nonce-1");
  const stringToSign =
    "POST\napplication/x-www-form-urlencoded\n\nx-ts-auth-method:HMAC-SHA256\nx-ts-date:Tue, 31 Jan 2017 11:36:42 GMT\nx-ts-nonce:nonce-1\n" +
    "phone_number=4445551212&language=en-US\n/v1/verify/sms";
  const expected = crypto.createHmac("sha256", Buffer.from(process.env.TELESIGN_API_KEY, "base64")).update(stringToSign).digest("base64");
  assert.equal(headers.Authorization, `TSA FFFFFFFF-EEEE-DDDD-1234-AB1234567890:${expected}`);
  assert.equal(headers["x-ts-date"], "Tue, 31 Jan 2017 11:36:42 GMT");
});

test("tokens are masked and errors are reported as errors", () => {
  assert.match(redactTokens({ access_token: "secret-token", expires_in: 3600 }).access_token, /redacted/);
  const failed = formatResult(op("smsverify_send_code"), {
    ok: false, status: 401, statusText: "Unauthorized", contentType: "application/json",
    data: { status: { code: 500, description: "Transaction not attempted" }, errors: [{ code: -30000, description: "Invalid Customer ID." }] },
    request: { method: "POST", url: "https://rest-ww.telesign.com/v1/verify/sms", headers: {} },
  });
  assert.equal(failed.isError, true);
  assert.match(failed.content[0].text, /-30000: Invalid Customer ID\./);
  const ok = formatResult(op("intelligence_assess_risk"), {
    ok: true, status: 200, statusText: "OK", contentType: "application/json",
    data: { reference_id: "R1", status: { code: 300, description: "Transaction successfully completed" }, risk: { level: "high", recommendation: "block", score: 959 } },
    request: { method: "POST", url: "https://detect.telesign.com/intelligence/phone", headers: {} },
  });
  assert.equal(ok.isError, undefined);
  assert.match(ok.content[0].text, /score 959, level high, recommendation block/);
});

test("one-time passcodes are not echoed in displayed URLs", () => {
  assert.equal(redactUrl("https://rest-ww.telesign.com/v1/verify/ABC?verify_code=57244"), "https://rest-ww.telesign.com/v1/verify/ABC?verify_code=<redacted>");
  assert.equal(redactUrl("https://x.telesign.com/a?ucid=BACF&verify_code=1&b=2"), "https://x.telesign.com/a?ucid=BACF&verify_code=<redacted>&b=2");
  assert.equal(redactUrl("https://rest-ww.telesign.com/v1/verify/ABC"), "https://rest-ww.telesign.com/v1/verify/ABC");

  // The outbound request keeps the real value; only the copy shown to the model is masked.
  const request = buildRequest(op("smsverify_get_status"), { reference_id: "ABC", verify_code: "57244" });
  assert.match(request.url, /verify_code=57244$/);
  assert.ok(!redactRequest(request).url.includes("57244"));

  const failed = formatResult(op("smsverify_get_status"), {
    ok: false, status: 400, statusText: "Bad Request", contentType: "application/json",
    data: { status: { code: 500, description: "Transaction not attempted" } },
    request: redactRequest(request),
  });
  assert.equal(failed.isError, true);
  assert.ok(!failed.content[0].text.includes("57244"), "the passcode does not appear in the error text");
});

test("search results resolve to the right section of a reference page", () => {
  // "Body parameters" repeats under every operation; an unqualified lookup returns the first one.
  const first = findSection("reference/silent-verify", "Body parameters");
  assert.match(first.text, /phone_number/);

  const qualified = findSection("reference/silent-verify", "Get final verification status > Body parameters");
  assert.ok(qualified, "qualified heading resolves");
  assert.match(qualified.text, /initiate_reference_id/);
  assert.ok(!/\| `phone_number` \|/.test(qualified.text), "it is not the other operation's table");

  assert.equal(findSection("reference/silent-verify", "No such operation > Body parameters"), null);
  assert.ok(findSection("verify-api", "When to use it"), "plain headings still resolve");

  const hit = searchDocs("initiate_reference_id", "reference/silent-verify", 5).find((h) => h.heading === "Body parameters");
  assert.ok(hit, "search finds the finalize body parameters");
  const path = [...hit.trail.slice(1), hit.heading].join(" > ");
  assert.match(findSection("reference/silent-verify", path).text, /initiate_reference_id/);
});

test("MCP server lists every tool with a valid schema and answers dry-run calls", async () => {
  const { client, server } = await connect();
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name);
  for (const o of OPERATIONS) assert.ok(names.includes(o.tool), `${o.tool} is registered`);
  for (const extra of ["verifyapi_check_code", "telesign_server_info", "docs_list", "docs_search", "docs_get", "docs_get_tool_reference"]) {
    assert.ok(names.includes(extra), `${extra} is registered`);
  }
  for (const t of tools) {
    assert.equal(t.inputSchema.type, "object", `${t.name}: object schema`);
    assert.ok(t.description && t.description.length <= 2000, `${t.name}: description length ${t.description?.length}`);
  }
  const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
  assert.equal(byName.smsverify_get_status.annotations.readOnlyHint, false, "checking a code changes state");
  assert.equal(byName.smsverify_get_status.annotations.idempotentHint, false);
  assert.equal(byName.verifyapi_get_status.annotations.readOnlyHint, true);
  assert.equal(byName.phoneid_get_info.annotations.readOnlyHint, true);
  const bytes = JSON.stringify(tools).length;
  console.log(`    tools/list with all toolsets: ${tools.length} tools, ${(bytes / 1024).toFixed(0)} KB`);

  // Dry-run every operation through the protocol.
  for (const o of OPERATIONS) {
    const result = await client.callTool({ name: o.tool, arguments: minimalArgs(o) });
    assert.ok(!result.isError, `${o.tool}: dry run succeeded: ${result.content?.[0]?.text}`);
    const body = result.content[0].text;
    assert.match(body, /^DRY RUN/, `${o.tool}: is a dry run`);
    assert.ok(body.includes(`${o.method} https://`), `${o.tool}: shows the request line`);
    assert.ok(!body.includes(process.env.TELESIGN_API_KEY) && !body.includes("client-secret") && !body.includes("protect-key"), `${o.tool}: no secrets in output`);
  }

  // Invalid arguments are rejected before any request is built.
  const bad = await client.callTool({ name: "messaging_send_sms", arguments: { phone_number: "15551234567" } });
  assert.equal(bad.isError, true);

  const check = await client.callTool({ name: "verifyapi_check_code", arguments: { reference_id: "ABC", code: 123456 } });
  assert.match(check.content[0].text, /PATCH https:\/\/verify\.telesign\.com\/verification\/ABC\/state/);
  assert.match(check.content[0].text, /"security_factor":"123456"/);

  const info = await client.callTool({ name: "telesign_server_info", arguments: {} });
  assert.match(info.content[0].text, /Dry run .*ON/);
  assert.ok(!info.content[0].text.includes(process.env.TELESIGN_API_KEY));

  await client.close();
  await server.close();
});

test("guides only mention tools and topics that exist", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const docsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "docs");
  const guides = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));
  assert.ok(guides.length >= 19, `expected at least 19 guides, found ${guides.length}`);

  const tools = new Set([...OPERATIONS.map((o) => o.tool), "verifyapi_check_code", "telesign_server_info", "telesign_find_tools", "telesign_enable_toolsets", "telesign_call_tool", "docs_list", "docs_search", "docs_get", "docs_get_tool_reference"]);
  const prefixes = [...new Set([...tools].map((t) => t.split("_")[0]))].join("|");
  const toolLike = new RegExp("`((?:" + prefixes + ")_[a-z0-9_]+)`", "g");
  const topics = new Set([...guides.map((f) => f.replace(/\.md$/, "")), ...fs.readdirSync(path.join(docsDir, "reference")).map((f) => "reference/" + f.replace(/\.md$/, ""))]);

  // Telesign field, template and parameter names that happen to start like a tool name.
  const notTools = new Set(["intelligence_details", "intelligence_score_value", "telesign_otp", "voice_lang"]);
  const problems = [];
  for (const file of guides) {
    const content = fs.readFileSync(path.join(docsDir, file), "utf8");
    assert.match(content, /^# \S/, `${file}: starts with a title`);
    for (const [, name] of content.matchAll(toolLike)) {
      // `scim_*` style wildcards and response field names that happen to share a prefix are fine.
      if (!tools.has(name) && !notTools.has(name) && !name.endsWith("_")) problems.push(`${file}: unknown tool \`${name}\``);
    }
    for (const [, topic] of content.matchAll(/docs_get\(\s*(?:topic:\s*)?"([^"]+)"/g)) {
      if (!topics.has(topic)) problems.push(`${file}: unknown topic "${topic}"`);
    }
    for (const [, name] of content.matchAll(/docs_get_tool_reference\(\s*"([^"]+)"/g)) {
      if (!tools.has(name) && !name.startsWith("<")) problems.push(`${file}: unknown tool reference "${name}"`);
    }
  }
  assert.deepEqual([...new Set(problems)], []);
});

test("documentation tools, resources and prompts work", async () => {
  const { client, server } = await connect();

  const list = await client.callTool({ name: "docs_list", arguments: {} });
  assert.match(list.content[0].text, /reference\/messaging/);
  assert.match(list.content[0].text, /- overview/);

  const search = await client.callTool({ name: "docs_search", arguments: { query: "sim swap" } });
  assert.ok(!search.isError);
  assert.match(search.content[0].text, /Search results/);
  const refSearch = await client.callTool({ name: "docs_search", arguments: { query: "initiate_reference_id", topic: "reference/silent-verify" } });
  assert.match(refSearch.content[0].text, /section: "Get final verification status > Body parameters"/);
  const followed = await client.callTool({ name: "docs_get", arguments: { topic: "reference/silent-verify", section: "Get final verification status > Body parameters" } });
  assert.match(followed.content[0].text, /initiate_reference_id/);

  for (const o of OPERATIONS) {
    const ref = await client.callTool({ name: "docs_get_tool_reference", arguments: { tool: o.tool } });
    assert.ok(!ref.isError, `${o.tool}: has reference docs`);
    assert.ok(ref.content[0].text.includes(`${o.method} ${o.url}`), `${o.tool}: reference shows the endpoint`);
  }

  const big = await client.callTool({ name: "docs_get", arguments: { topic: "reference/phone-id" } });
  assert.match(big.content[0].text, /outline/);
  const missing = await client.callTool({ name: "docs_get", arguments: { topic: "nope" } });
  assert.equal(missing.isError, true);

  const { resources } = await client.listResources();
  assert.ok(resources.some((r) => r.uri === "docs://telesign/overview"));
  assert.ok(resources.some((r) => r.uri === "docs://telesign/reference/verify"));
  const read = await client.readResource({ uri: "docs://telesign/overview" });
  assert.ok(read.contents[0].text.length > 500);

  const { prompts } = await client.listPrompts();
  assert.ok(prompts.length >= 4);
  const prompt = await client.getPrompt({ name: "verify_phone_number", arguments: { phone_number: "15551234567" } });
  assert.match(prompt.messages[0].content.text, /verifyapi_send_otp/);

  await client.close();
  await server.close();
});
