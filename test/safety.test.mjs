// Offline tests for read-only mode and for refusing insecure host overrides.
// Runs in its own process: read-only mode and the host override are read from the environment at import.
import test from "node:test";
import assert from "node:assert/strict";

process.env.TELESIGN_CUSTOMER_ID = "FFFFFFFF-EEEE-DDDD-1234-AB1234567890";
process.env.TELESIGN_API_KEY = "c2VjcmV0";
process.env.TELESIGN_TOOLSETS = "extended";
process.env.TELESIGN_READ_ONLY = "true";
// Deliberately insecure, and not resolvable, so nothing can leave the machine even if the guard failed.
process.env.TELESIGN_REST_URL = "http://telesign.invalid";
delete process.env.TELESIGN_DRY_RUN;

const { OPERATIONS } = await import("../build/catalog/operations.js");
const { assertSecureUrl, buildRequest, execute } = await import("../build/lib/http.js");
const { buildInputShape } = await import("../build/lib/schema.js");
const { buildServer } = await import("../build/server.js");
const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");

const op = (tool) => OPERATIONS.find((o) => o.tool === tool);

async function connect() {
  const server = buildServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  return { server, client };
}

test("only HTTPS (or loopback) URLs are accepted", () => {
  assert.doesNotThrow(() => assertSecureUrl("https://rest-ww.telesign.com/v1/phoneid/1"));
  assert.doesNotThrow(() => assertSecureUrl("http://localhost:8080/v1/phoneid/1"));
  assert.doesNotThrow(() => assertSecureUrl("http://127.0.0.1:8080/v1/phoneid/1"));
  assert.throws(() => assertSecureUrl("http://rest-ww.telesign.com/v1/phoneid/1"), /HTTPS/);
  assert.throws(() => assertSecureUrl("ftp://rest-ww.telesign.com/x"), /HTTPS/);
});

test("a non-HTTPS host override is refused before credentials are attached", async () => {
  const result = await execute(op("phoneid_get_info"), { complete_phone_number: "15551234567" });
  assert.equal(result.ok, false);
  assert.equal(result.status, 0, "no HTTP exchange took place");
  assert.match(result.error, /HTTPS/);
  assert.equal(result.request.headers.Authorization, undefined, "no credentials were prepared");

  // Hosts without an override are unaffected.
  assert.doesNotThrow(() => assertSecureUrl(buildRequest(op("intelligence_assess_risk"), { phone_number: "15551234567", account_lifecycle_event: "create" }).url));
});

test("redirects are not followed, so credentials cannot be forwarded", async () => {
  const http = await import("node:http");
  const listen = (handler) =>
    new Promise((resolve) => {
      const server = http.createServer(handler);
      server.listen(0, "127.0.0.1", () => resolve(server));
    });

  let targetHits = 0;
  const target = await listen((req, res) => {
    targetHits++;
    res.writeHead(200, { "content-type": "application/json" });
    res.end("{}");
  });
  let sourceHits = 0;
  const source = await listen((req, res) => {
    sourceHits++;
    res.writeHead(302, { location: `http://127.0.0.1:${target.address().port}/stolen` });
    res.end();
  });

  try {
    const redirecting = { ...op("phoneid_live_status"), url: `http://127.0.0.1:${source.address().port}/v1/phoneid/live/{complete_phone_number}` };
    const result = await execute(redirecting, { complete_phone_number: "15551234567" });
    assert.equal(sourceHits, 1, "the request reached the first host");
    assert.equal(targetHits, 0, "the redirect target was never contacted");
    assert.equal(result.ok, false);
    assert.ok(result.error, "the redirect is reported as a failed request");
  } finally {
    source.close();
    target.close();
  }
});

test("read-only mode does not offer parameters that change state", async () => {
  for (const name of ["smsverify_get_status", "voiceverify_get_status", "messaging_get_message_status"]) {
    const operation = op(name);
    assert.deepEqual(operation.stateChangingParams, ["verify_code"], `${name} declares verify_code as state-changing`);
    assert.ok(!("verify_code" in buildInputShape(operation)), `${name}: verify_code is hidden from the schema`);
    assert.throws(() => buildRequest(operation, { reference_id: "ABC", verify_code: "12345" }), /read-only/, `${name}: verify_code is rejected`);
    assert.doesNotThrow(() => buildRequest(operation, { reference_id: "ABC" }), `${name}: plain status lookup still works`);
  }

  const { client, server } = await connect();
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name);
  for (const name of ["smsverify_get_status", "voiceverify_get_status", "messaging_get_message_status"]) {
    const tool = tools.find((t) => t.name === name);
    assert.ok(tool, `${name} is listed in read-only mode`);
    assert.ok(!("verify_code" in tool.inputSchema.properties), `${name}: schema has no verify_code`);
    assert.equal(tool.annotations.readOnlyHint, true);
  }
  for (const name of ["smsverify_send_code", "messaging_send_sms", "verifyapi_send_otp", "verifyapi_check_code", "voice_send_action"]) {
    assert.ok(!names.includes(name), `${name} is not listed in read-only mode`);
  }

  // The call-by-name path enforces the same rule.
  const blocked = await client.callTool({ name: "telesign_call_tool", arguments: { tool: "smsverify_get_status", arguments: { reference_id: "ABC", verify_code: "12345" } } });
  assert.equal(blocked.isError, true);
  assert.match(blocked.content[0].text, /"verify_code" is not allowed in read-only mode/, "the caller is told why, rather than getting a silent status lookup");
  assert.ok(!blocked.content[0].text.includes("12345"), "the passcode is not echoed back");

  const shortcut = await client.callTool({ name: "telesign_call_tool", arguments: { tool: "verifyapi_check_code", arguments: { reference_id: "ABC", code: "12345" } } });
  assert.equal(shortcut.isError, true);
  assert.match(shortcut.content[0].text, /read-only/);
  const send = await client.callTool({ name: "telesign_call_tool", arguments: { tool: "smsverify_send_code", arguments: { phone_number: "15551234567" } } });
  assert.equal(send.isError, true);
  assert.match(send.content[0].text, /read-only/);

  await client.close();
  await server.close();
});
