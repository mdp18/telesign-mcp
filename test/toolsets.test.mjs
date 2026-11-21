// Offline tests for the default (core) tool list and for switching toolsets on at runtime.
// Runs in its own process so the environment differs from server.test.mjs.
import test from "node:test";
import assert from "node:assert/strict";

process.env.TELESIGN_CUSTOMER_ID = "FFFFFFFF-EEEE-DDDD-1234-AB1234567890";
process.env.TELESIGN_API_KEY = "c2VjcmV0";
process.env.TELESIGN_DRY_RUN = "true";
delete process.env.TELESIGN_TOOLSETS;
delete process.env.TELESIGN_READ_ONLY;
delete process.env.TELESIGN_DYNAMIC_TOOLSETS;

const { OPERATIONS, TOOLSETS } = await import("../build/catalog/operations.js");
const { buildServer } = await import("../build/server.js");
const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");
const { ToolListChangedNotificationSchema } = await import("@modelcontextprotocol/sdk/types.js");

const toolsIn = (...toolsets) => OPERATIONS.filter((o) => toolsets.includes(o.toolset)).map((o) => o.tool);
const coreKeys = Object.keys(TOOLSETS).filter((k) => TOOLSETS[k].tier === "core");

async function connect() {
  const server = buildServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  let listChanged = 0;
  client.setNotificationHandler(ToolListChangedNotificationSchema, async () => {
    listChanged++;
  });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  const names = async () => (await client.listTools()).tools.map((t) => t.name);
  return { server, client, names, changes: () => listChanged };
}

test("toolset tiers are sane", () => {
  assert.deepEqual(coreKeys.sort(), ["intelligence", "phone-id", "sms", "verify"]);
  for (const [key, info] of Object.entries(TOOLSETS)) assert.ok(["core", "extended", "admin"].includes(info.tier), `${key}: tier ${info.tier}`);
  for (const key of ["accounts", "scim", "protect-platform"]) assert.equal(TOOLSETS[key].tier, "admin");
});

test("only core toolsets are listed by default, and the list stays small", async () => {
  const { client, server, names } = await connect();
  const listed = await names();
  for (const tool of toolsIn(...coreKeys)) assert.ok(listed.includes(tool), `${tool} is listed`);
  for (const tool of toolsIn("voice", "messaging", "sms-verify", "accounts", "scim")) assert.ok(!listed.includes(tool), `${tool} is not listed`);
  for (const helper of ["verifyapi_check_code", "telesign_find_tools", "telesign_enable_toolsets", "telesign_call_tool", "telesign_server_info", "docs_search"]) {
    assert.ok(listed.includes(helper), `${helper} is listed`);
  }
  const bytes = JSON.stringify((await client.listTools()).tools).length;
  console.log(`    default tools/list: ${listed.length} tools, ${(bytes / 1024).toFixed(0)} KB`);
  assert.ok(bytes < 60_000, `default tool list should stay under 60 KB, is ${bytes}`);
  await client.close();
  await server.close();
});

test("a toolset can be switched on and off at runtime", async () => {
  const { client, server, names, changes } = await connect();

  const hidden = await client.callTool({ name: "voice_send_action", arguments: { method: "dial", params: {} } }).catch((error) => ({ isError: true, content: [{ text: String(error) }] }));
  assert.equal(hidden.isError, true, "a tool in a toolset that is off cannot be called directly");

  const on = await client.callTool({ name: "telesign_enable_toolsets", arguments: { toolsets: ["voice", "Number-Masking"] } });
  assert.ok(!on.isError, on.content[0].text);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.ok(changes() >= 1, "the client was told the tool list changed");
  let listed = await names();
  for (const tool of toolsIn("voice", "number-masking")) assert.ok(listed.includes(tool), `${tool} is listed after enabling`);

  const call = await client.callTool({ name: "voice_send_action", arguments: { method: "dial", params: { to: "15555551212", caller_id_number: "15554441313" } } });
  assert.match(call.content[0].text, /POST https:\/\/rest-ww\.telesign\.com\/v2\/voice/);

  const off = await client.callTool({ name: "telesign_enable_toolsets", arguments: { toolsets: ["voice"], enabled: false } });
  assert.ok(!off.isError);
  listed = await names();
  assert.ok(!listed.includes("voice_send_action"));
  assert.ok(listed.includes("numbermasking_create_sms_session"));

  await client.close();
  await server.close();
});

test("admin toolsets cannot be switched on from inside a session", async () => {
  const { client, server, names } = await connect();
  const result = await client.callTool({ name: "telesign_enable_toolsets", arguments: { toolsets: ["accounts"] } });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /locked/);
  assert.ok(!(await names()).includes("accounts_create_api_key"));

  const call = await client.callTool({ name: "telesign_call_tool", arguments: { tool: "accounts_delete_api_key", arguments: { key_id: "x" } } });
  assert.equal(call.isError, true);
  assert.match(call.content[0].text, /locked/);
  await client.close();
  await server.close();
});

test("telesign_find_tools and telesign_call_tool reach toolsets that are off", async () => {
  const { client, server } = await connect();

  const overview = await client.callTool({ name: "telesign_find_tools", arguments: {} });
  assert.match(overview.content[0].text, /\*\*voice\*\* \[off - can be enabled\]/);
  assert.match(overview.content[0].text, /\*\*verify\*\* \[on\]/);
  assert.match(overview.content[0].text, /\*\*accounts\*\* \[locked/);

  const found = await client.callTool({ name: "telesign_find_tools", arguments: { query: "whatsapp message" } });
  assert.match(found.content[0].text, /messaging_send_message/);
  assert.ok(!/accounts_/.test((await client.callTool({ name: "telesign_find_tools", arguments: { query: "api key" } })).content[0].text), "admin tools are not offered");

  const call = await client.callTool({
    name: "telesign_call_tool",
    arguments: { tool: "voiceverify_send_code", arguments: { phone_number: "+1 555 123 4567", verify_code: 12345 } },
  });
  assert.ok(!call.isError, call.content[0].text);
  assert.match(call.content[0].text, /POST https:\/\/rest-ww\.telesign\.com\/v1\/verify\/call/);
  assert.match(call.content[0].text, /phone_number=15551234567&verify_code=12345/);

  const invalid = await client.callTool({ name: "telesign_call_tool", arguments: { tool: "voiceverify_send_code", arguments: {} } });
  assert.equal(invalid.isError, true);
  assert.match(invalid.content[0].text, /phone_number/);

  // The hand-written Verify shortcut is reachable by name too.
  const shortcut = await client.callTool({ name: "telesign_call_tool", arguments: { tool: "verifyapi_check_code", arguments: { reference_id: "ABC", code: 123456 } } });
  assert.ok(!shortcut.isError, shortcut.content[0].text);
  assert.match(shortcut.content[0].text, /PATCH https:\/\/verify\.telesign\.com\/verification\/ABC\/state/);
  assert.match(shortcut.content[0].text, /"security_factor":"123456"/);
  const badShortcut = await client.callTool({ name: "telesign_call_tool", arguments: { tool: "verifyapi_check_code", arguments: { reference_id: "ABC" } } });
  assert.equal(badShortcut.isError, true);
  assert.match(badShortcut.content[0].text, /code/);

  const unknown = await client.callTool({ name: "telesign_call_tool", arguments: { tool: "nope", arguments: {} } });
  assert.equal(unknown.isError, true);

  await client.close();
  await server.close();
});
