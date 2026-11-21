#!/usr/bin/env node
// Builds src/catalog/operations.ts and src/docs/reference/*.md from the OpenAPI definitions that
// Telesign publishes on every API reference page.
//
//   node scripts/sync-specs.mjs                 fetch pages from developer.telesign.com
//   node scripts/sync-specs.mjs --from <dir>    read pages from a local folder instead
//                                               (files named reference__<slug>.md or <slug>.md)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOOL_MAP, TOOLSETS, CALLBACK_SLUGS } from "./tool-map.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://developer.telesign.com";
const REF = `${SITE}/enterprise/reference/`;
const args = process.argv.slice(2);
const fromDir = args.includes("--from") ? path.resolve(args[args.indexOf("--from") + 1]) : null;

// Description budgets for tool schemas. The full text always lands in src/docs/reference.
const PARAM_DESC_LIMITS = [320, 200, 120]; // by nesting depth: top-level argument, nested, deeper
const TOOL_DESC_LIMIT = 700;

// ---------------------------------------------------------------- page loading

async function loadPage(slug) {
  if (fromDir) {
    for (const name of [`reference__${slug}.md`, `${slug}.md`]) {
      const file = path.join(fromDir, name);
      if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
    }
    throw new Error(`No local page for ${slug} in ${fromDir}`);
  }
  const res = await fetch(`${REF}${slug}.md`, { headers: { "user-agent": "telesign-mcp-sync-specs" } });
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  return res.text();
}

function parsePage(text) {
  const t = text.replace(/\r\n/g, "\n");
  const m = t.match(/# OpenAPI definition\s*(`{3,})json\s*\n([\s\S]*?)\n\1/);
  if (!m) return null;
  const updated = (t.match(/^updatedAt:\s*(\S+)/m) || [])[1] || "";
  return { spec: JSON.parse(m[2]), updated: updated.slice(0, 10) };
}

// ---------------------------------------------------------------- schema helpers

function deref(node, spec, seen = []) {
  if (Array.isArray(node)) return node.map((n) => deref(n, spec, seen));
  if (!node || typeof node !== "object") return node;
  if (typeof node.$ref === "string") {
    const ref = node.$ref;
    if (!ref.startsWith("#/")) return { description: `See ${ref}` };
    if (seen.includes(ref)) return { type: "object", description: `Recursive reference to ${ref.split("/").pop()}` };
    let target = spec;
    for (const part of ref.slice(2).split("/")) target = target?.[part.replace(/~1/g, "/").replace(/~0/g, "~")];
    if (target === undefined) return { description: `Unresolved reference ${ref}` };
    const { $ref, ...siblings } = node;
    return { ...deref(target, spec, [...seen, ref]), ...deref(siblings, spec, seen) };
  }
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = deref(v, spec, seen);
  return out;
}

const KEEP = new Set([
  "type", "description", "enum", "properties", "required", "items", "oneOf", "anyOf", "allOf", "default",
  "minLength", "maxLength", "minimum", "maximum", "minItems", "maxItems", "format", "additionalProperties",
  "nullable", "example", "title", "const",
]);

function absolutize(md) {
  return md
    .replace(/\]\(\/(enterprise|api-reference)\//g, (_, p) => `](${SITE}/${p === "api-reference" ? "enterprise/docs" : p}/`)
    .replace(/\]\(\/(reference|docs)\//g, (_, p) => `](${SITE}/enterprise/${p}/`)
    .replace(/<Anchor[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/Anchor>/g, (_, href, label) => `[${label}](${href.startsWith("/") ? SITE + href : href})`)
    .replace(/<br\s*\/?>/g, " ");
}

function cleanText(s) {
  if (typeof s !== "string") return s;
  return absolutize(s).replace(/ /g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function truncate(s, limit) {
  if (s.length <= limit) return s;
  const cut = s.slice(0, limit);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(".\n"));
  return (stop > limit * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "")) + " […]";
}

// Merge allOf members that are all plain objects into a single object schema.
function mergeAllOf(schema) {
  if (!schema || typeof schema !== "object" || !Array.isArray(schema.allOf)) return schema;
  const parts = schema.allOf.map(mergeAllOf);
  const mergeable = parts.every((p) => p && typeof p === "object" && !p.oneOf && !p.anyOf && (p.type === "object" || p.properties || Object.keys(p).every((k) => k === "description" || k === "title")));
  const { allOf, ...rest } = schema;
  if (!mergeable) return parts.length === 1 ? { ...parts[0], ...rest } : { ...rest, allOf: parts };
  const merged = { ...rest, type: "object", properties: { ...(rest.properties || {}) }, required: [...(rest.required || [])] };
  for (const p of parts) {
    Object.assign(merged.properties, p.properties || {});
    for (const r of p.required || []) if (!merged.required.includes(r)) merged.required.push(r);
    if (!merged.description && p.description) merged.description = p.description;
    if (p.additionalProperties !== undefined && merged.additionalProperties === undefined) merged.additionalProperties = p.additionalProperties;
  }
  if (!merged.required.length) delete merged.required;
  return merged;
}

// Names of properties left out because Telesign marks them deprecated (reported at the end of a run).
const droppedDeprecated = new Set();

// Normalised schema with full-length descriptions (used for docs). Deprecated properties are dropped.
function normalize(schema) {
  if (Array.isArray(schema)) return schema.map(normalize);
  if (!schema || typeof schema !== "object") return schema;
  schema = mergeAllOf(schema);
  const out = {};
  for (const [k, v] of Object.entries(schema)) {
    if (!KEEP.has(k)) continue;
    if (k === "properties") {
      out.properties = {};
      for (const [name, sub] of Object.entries(v || {})) {
        if (sub && sub.deprecated === true) {
          droppedDeprecated.add(name);
          continue;
        }
        out.properties[name] = normalize(sub);
      }
    } else if (k === "description" || k === "title") {
      const text = cleanText(String(v));
      if (text) out[k] = text;
    } else if (k === "items" || k === "additionalProperties") {
      out[k] = typeof v === "object" ? normalize(v) : v;
    } else if (k === "oneOf" || k === "anyOf" || k === "allOf") {
      out[k] = v.map(normalize);
    } else if (k === "example") {
      if (["string", "number", "boolean"].includes(typeof v) && String(v).length <= 80) out.example = v;
    } else if (k === "required") {
      const live = Array.isArray(v) ? v.filter((name) => schema.properties?.[name]?.deprecated !== true) : [];
      if (live.length) out.required = live;
    } else {
      out[k] = v;
    }
  }
  if (!out.type && out.properties) out.type = "object";
  return out;
}

// Markdown links and emphasis cost tokens without helping a model choose arguments.
function plain(text) {
  return text
    .replace(/\[([^\]]+)\]\((?:https?:|mailto:)[^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Compact copy for tool input schemas: short descriptions (shorter the deeper they nest),
// examples folded into the description. `depth` is the nesting level of `schema` as a tool argument.
function compact(schema, depth = 0) {
  if (Array.isArray(schema)) return schema.map((s) => compact(s, depth));
  if (!schema || typeof schema !== "object") return schema;
  const out = {};
  for (const [k, v] of Object.entries(schema)) {
    if (k === "properties") {
      out.properties = {};
      for (const [name, sub] of Object.entries(v)) out.properties[name] = compact(sub, depth + 1);
    } else if (k === "items" || k === "additionalProperties") {
      out[k] = typeof v === "object" ? compact(v, depth) : v;
    } else if (k === "oneOf" || k === "anyOf" || k === "allOf") {
      out[k] = v.map((s) => compact(s, depth));
    } else if (k === "example" || k === "title") {
      continue;
    } else {
      out[k] = v;
    }
  }
  const limit = PARAM_DESC_LIMITS[Math.max(0, Math.min(depth, PARAM_DESC_LIMITS.length - 1))];
  let desc = schema.description ? truncate(plain(schema.description), limit) : "";
  if (!desc && schema.title) desc = schema.title;
  if (schema.example !== undefined && !desc.includes(String(schema.example))) desc = `${desc}${desc ? " " : ""}Example: ${schema.example}`;
  if (desc) out.description = desc;
  else delete out.description;
  return out;
}

// ---------------------------------------------------------------- operation extraction

const METHODS = ["get", "post", "put", "patch", "delete"];

// Used when a reference page leaves a path parameter undocumented.
const DEFAULT_PARAM_DESCRIPTIONS = {
  reference_id: "The reference_id Telesign returned when the transaction was created.",
  complete_phone_number: "The phone number, as digits without spaces or special characters, beginning with the country dialing code.",
  phone_number: "The phone number, as digits without spaces or special characters, beginning with the country dialing code.",
  key_id: "The ID of the REST API key.",
  user_id: "The SCIM ID of the user.",
  group_id: "The SCIM ID of the group.",
  file_name: "The name of the file, as returned by the file list.",
};

function firstOperation(spec) {
  for (const [p, item] of Object.entries(spec.paths || {})) {
    for (const method of METHODS) if (item[method]) return { path: p, item, method, op: item[method] };
  }
  return null;
}

function authFor(spec, op, baseUrl) {
  const security = op.security ?? spec.security ?? [];
  const names = security.flatMap((s) => Object.keys(s));
  if (names.includes("ClientCredentials")) return "oauth";
  if (names.includes("bearerAuth")) return "protect-bearer";
  if (/di-platform\.telesign\.com/.test(baseUrl)) return "protect-basic";
  if (/login\.telesign\.com/.test(baseUrl)) return "oauth-client";
  return "basic";
}

function pickBody(op, spec) {
  const content = op.requestBody ? deref(op.requestBody, spec).content || {} : {};
  const order = ["application/json", "application/x-www-form-urlencoded"];
  const type = order.find((t) => content[t]) || Object.keys(content)[0];
  if (!type) return { bodyType: null, schema: null, example: undefined };
  const media = content[type];
  const examples = media.examples ? Object.values(media.examples).map((e) => e?.value).filter((v) => v !== undefined) : [];
  const example = media.example ?? examples[0];
  return {
    bodyType: type.includes("json") ? "json" : type.includes("form-urlencoded") ? "form" : "json",
    schema: normalize(deref(media.schema || {}, spec)),
    example,
    examples: media.examples ? Object.fromEntries(Object.entries(media.examples).map(([k, e]) => [k, e?.value])) : undefined,
  };
}

function responsesOf(op, spec) {
  const out = [];
  for (const [status, raw] of Object.entries(op.responses || {})) {
    const r = deref(raw, spec);
    const media = r.content ? r.content["application/json"] || Object.values(r.content)[0] : null;
    let example;
    if (media) {
      example = media.example ?? (media.examples ? Object.values(media.examples)[0]?.value : undefined);
    }
    out.push({
      status,
      description: cleanText(r.description || ""),
      schema: media?.schema ? normalize(media.schema) : undefined,
      example,
    });
  }
  return out;
}

// Removes every property / key with one of the given names, anywhere in a schema or example payload.
// Used for features Telesign has retired but still lists in its OpenAPI definitions.
function dropKeys(value, names) {
  if (Array.isArray(value)) return value.map((v) => dropKeys(v, names));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (names.includes(key)) continue;
    out[key] = key === "required" && Array.isArray(child) ? child.filter((n) => !names.includes(n)) : dropKeys(child, names);
  }
  return out;
}

function buildOperation(slug, map, page) {
  const { spec, updated } = page;
  const found = firstOperation(spec);
  if (!found) throw new Error(`${slug}: no operation in OpenAPI definition`);
  const { path: opPath, item, method, op } = found;
  if (op.deprecated === true && !map.deprecated) {
    throw new Error(`${slug}: Telesign marks this operation deprecated. Remove it from TOOL_MAP, or set "deprecated: true" on its entry to offer it as a labelled legacy tool.`);
  }
  const isDeprecated = op.deprecated === true || !!map.deprecated;
  let server = (op.servers || item.servers || spec.servers || [])[0]?.url || "";
  if (server && !/^https?:\/\//.test(server)) server = `https://${server}`;
  const url = server.replace(/\/$/, "") + opPath;

  const byKey = new Map(); // operation-level parameters override path-level ones
  for (const p of [...(item.parameters || []), ...(op.parameters || [])].map((p) => deref(p, spec))) byKey.set(`${p.in}:${p.name}`, p);
  const params = [...byKey.values()];
  const toParam = (p) => ({
    name: p.name,
    required: !!p.required || p.in === "path",
    schema: normalize({ ...(p.schema || { type: "string" }), description: p.description || p.schema?.description || DEFAULT_PARAM_DESCRIPTIONS[p.name] || "" }),
  });
  const pathParams = params.filter((p) => p.in === "path").map(toParam);
  for (const name of [...opPath.matchAll(/\{([^}]+)\}/g)].map((m) => m[1])) {
    if (!pathParams.some((p) => p.name === name)) {
      const description = DEFAULT_PARAM_DESCRIPTIONS[name];
      pathParams.push({ name, required: true, schema: description ? { type: "string", description } : { type: "string" } });
    }
  }
  const queryParams = params.filter((p) => p.in === "query").map(toParam);
  const skipHeader = /^(authorization|content-type.*|accept|date|x-ts-.*)$/i;
  const headerParams = params.filter((p) => p.in === "header" && !skipHeader.test(p.name) && !/^x-api-key$/i.test(p.name)).map(toParam);

  const body = pickBody(op, spec);
  const retired = map.dropFields || [];
  if (retired.length) for (const key of ["schema", "example", "examples"]) body[key] = dropKeys(body[key], retired);
  if (map.patchBody && body.schema) map.patchBody(body.schema);
  for (const name of map.omit || []) {
    if (body.schema?.properties) delete body.schema.properties[name];
    if (body.schema?.required) body.schema.required = body.schema.required.filter((r) => r !== name);
  }
  // Flatten object bodies into top-level tool arguments unless names would collide.
  const taken = new Set([...pathParams, ...queryParams, ...headerParams].map((p) => p.name));
  const props = body.schema?.properties ? Object.keys(body.schema.properties) : [];
  const flatten = !!body.schema && body.schema.type === "object" && props.length > 0 && !body.schema.oneOf && !body.schema.anyOf && !props.some((n) => taken.has(n));

  const fullDescription = cleanText(op.description || spec.info?.description || "");
  const title = cleanText(op.summary || slug);
  return {
    tool: map.tool,
    toolset: map.toolset,
    note: map.note,
    deprecated: isDeprecated,
    defaults: map.defaults,
    stateChangingParams: map.stateChangingParams,
    slug,
    title,
    api: spec.info?.title || "",
    description: fullDescription,
    method: method.toUpperCase(),
    url,
    auth: authFor(spec, op, url),
    digest: /\[Digest\]\(|digest-authentication/i.test(op.description || ""),
    bodyType: body.bodyType,
    bodyMode: !body.schema ? "none" : flatten ? "flatten" : "single",
    pathParams,
    queryParams,
    headerParams,
    body: body.schema,
    bodyExample: body.example,
    bodyExamples: body.examples,
    responses: retired.length ? dropKeys(responsesOf(op, spec), retired) : responsesOf(op, spec),
    readOnly: !!map.readOnly,
    destructive: !!map.destructive,
    idempotent: !!map.idempotent || !!map.readOnly,
    docsUrl: REF + slug,
    updated,
  };
}

// ---------------------------------------------------------------- catalog (runtime) shape

function summarize(description, title, note) {
  // Drop the boilerplate "General requirements" block and move ReadMe callouts (> NOTE: ...) after the main text.
  const blocks = description
    .split(/\n(?=#{1,6} )/)
    .filter((block) => !/^#{1,6}\s*General requirements/i.test(block))
    .join("\n")
    .split(/\n{2,}/);
  const strip = (b) => b.replace(/^#{1,6}\s*/gm, "").replace(/^>\s?/gm, "").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
  const main = blocks.filter((b) => !b.trimStart().startsWith(">")).map(strip).filter(Boolean);
  const callouts = blocks.filter((b) => b.trimStart().startsWith(">")).map(strip).filter(Boolean);
  const text = truncate(plain([...main, ...callouts].join(" ")) || title, TOOL_DESC_LIMIT);
  return note ? `${text}\n${note}` : text;
}

function toCatalogEntry(o) {
  const param = (p) => ({ name: p.name, required: p.required, schema: compact(p.schema) });
  return {
    tool: o.tool,
    toolset: o.toolset,
    title: o.title,
    description: (o.deprecated ? "DEPRECATED by Telesign; kept for existing integrations. " : "") + summarize(o.description, o.title, o.note),
    ...(o.deprecated ? { deprecated: true } : {}),
    method: o.method,
    url: o.url,
    auth: o.auth,
    digest: o.digest,
    bodyType: o.bodyType,
    bodyMode: o.bodyMode,
    pathParams: o.pathParams.map(param),
    queryParams: o.queryParams.map(param),
    headerParams: o.headerParams.map(param),
    body: o.body ? compact(o.body, o.bodyMode === "flatten" ? -1 : 0) : null,
    ...(o.defaults ? { defaults: o.defaults } : {}),
    ...(o.stateChangingParams?.length ? { stateChangingParams: o.stateChangingParams } : {}),
    readOnly: o.readOnly,
    destructive: o.destructive,
    idempotent: o.idempotent,
    docsUrl: o.docsUrl,
  };
}

// ---------------------------------------------------------------- reference docs

function typeLabel(s) {
  if (!s) return "";
  if (s.enum) return `${s.type || "string"} enum`;
  if (s.oneOf || s.anyOf) return (s.oneOf || s.anyOf).map(typeLabel).filter(Boolean).join(" \\| ") || "any";
  if (s.type === "array") return `array of ${typeLabel(s.items) || "any"}`;
  return s.type || (s.properties ? "object" : "any");
}

// Makes text safe for a markdown table cell: pipes are escaped unless they already are (a pipe
// preceded by an odd number of backslashes is escaped; an even number escapes only the backslashes),
// and line breaks are flattened.
function cell(text) {
  return String(text ?? "")
    .replace(/(\\*)\|/g, (match, backslashes) => (backslashes.length % 2 === 1 ? match : `${backslashes}\\|`))
    .replace(/\n+/g, " ")
    .trim();
}

function describe(s) {
  const bits = [];
  if (s.description) bits.push(s.description);
  if (s.enum) bits.push(`Allowed: ${s.enum.map((e) => `\`${e}\``).join(", ")}.`);
  if (s.default !== undefined) bits.push(`Default: \`${JSON.stringify(s.default)}\`.`);
  if (s.minLength !== undefined || s.maxLength !== undefined) bits.push(`Length: ${s.minLength ?? 0}-${s.maxLength ?? "∞"}.`);
  if (s.minimum !== undefined || s.maximum !== undefined) bits.push(`Range: ${s.minimum ?? "-∞"} to ${s.maximum ?? "∞"}.`);
  if (s.example !== undefined) bits.push(`Example: \`${s.example}\`.`);
  return bits.join(" ");
}

function schemaRows(schema, prefix = "", required = [], depth = 0, rows = []) {
  if (!schema || depth > 6) return rows;
  const variants = schema.oneOf || schema.anyOf;
  if (variants && !schema.properties) {
    variants.forEach((v, i) => {
      if (v.properties || v.items) {
        rows.push([`${prefix || "(body)"} — option ${i + 1}${v.title ? `: ${v.title}` : ""}`, typeLabel(v), "", cell(v.description || "")]);
        schemaRows(v, prefix, v.required || [], depth + 1, rows);
      }
    });
    return rows;
  }
  for (const [name, sub] of Object.entries(schema.properties || {})) {
    const key = prefix ? `${prefix}.${name}` : name;
    rows.push([`\`${key}\``, typeLabel(sub), (schema.required || required).includes(name) ? "yes" : "", cell(describe(sub))]);
    if (sub.properties || sub.oneOf || sub.anyOf) schemaRows(sub, key, sub.required || [], depth + 1, rows);
    if (sub.type === "array" && sub.items && (sub.items.properties || sub.items.oneOf || sub.items.anyOf)) schemaRows(sub.items, `${key}[]`, sub.items.required || [], depth + 1, rows);
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
    rows.push([`\`${prefix ? prefix + "." : ""}<key>\``, typeLabel(schema.additionalProperties), "", cell(describe(schema.additionalProperties))]);
  }
  return rows;
}

function table(headers, rows) {
  if (!rows.length) return "";
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

const AUTH_LABEL = {
  basic: "Basic (Customer ID + API key)",
  oauth: "OAuth 2.0 bearer token (client credentials; fetched automatically)",
  "oauth-client": "Basic (OAuth client ID + client secret)",
  "protect-basic": "Protect Platform Basic (username + password) plus `x-API-key`",
  "protect-bearer": "Protect Platform bearer token (fetched automatically)",
};

function json(value) {
  return "```json\n" + JSON.stringify(value, null, 2) + "\n```";
}

function operationDoc(o) {
  const out = [`## ${o.title}`, "", `**MCP tool:** \`${o.tool}\``, "", "```http", `${o.method} ${o.url}`, "```", ""];
  if (o.deprecated) out.push("- **Status:** deprecated by Telesign. Kept for existing integrations; prefer the current equivalent.");
  out.push(`- **Authentication:** ${AUTH_LABEL[o.auth]}`);
  if (o.bodyType) out.push(`- **Request body:** \`${o.bodyType === "json" ? "application/json" : "application/x-www-form-urlencoded"}\``);
  out.push(`- **Telesign reference:** <${o.docsUrl}>${o.updated ? ` (updated ${o.updated})` : ""}`, "");
  if (o.description) out.push(o.description.replace(/^(#{1,6}) /gm, (_, h) => "#".repeat(Math.min(6, h.length + 2)) + " "), "");
  const paramRows = (list) => list.map((p) => [`\`${p.name}\``, typeLabel(p.schema), p.required ? "yes" : "", cell(describe(p.schema))]);
  const head = ["Name", "Type", "Required", "Description"];
  if (o.pathParams.length) out.push("### Path parameters", "", table(head, paramRows(o.pathParams)), "");
  if (o.queryParams.length) out.push("### Query parameters", "", table(head, paramRows(o.queryParams)), "");
  if (o.headerParams.length) out.push("### Header parameters", "", table(head, paramRows(o.headerParams)), "");
  if (o.body) {
    const rows = schemaRows(o.body);
    out.push("### Body parameters", "");
    if (o.bodyMode === "single") out.push("Pass the whole request body in the tool's `body` argument.", "");
    out.push(rows.length ? table(head, rows) : cell(o.body.description || "Free-form JSON object."), "");
  }
  if (o.bodyExamples && Object.keys(o.bodyExamples).length > 1) {
    out.push("### Example requests", "");
    for (const [name, value] of Object.entries(o.bodyExamples).slice(0, 6)) out.push(`**${name}**`, "", json(value), "");
  } else if (o.bodyExample !== undefined) {
    out.push("### Example request", "", json(o.bodyExample), "");
  }
  if (o.responses.length) {
    out.push("### Responses", "");
    // Descriptions often embed a status-code table, so each response gets its own block instead of a table cell.
    for (const r of o.responses) out.push(`**HTTP ${r.status}**${r.description ? "\n\n" + r.description.replace(/^(#{1,6}) /gm, "##### ") : ""}`, "");
    const ok = o.responses.find((r) => /^2/.test(r.status));
    if (ok?.schema) {
      const rows = schemaRows(ok.schema);
      if (rows.length) out.push(`### Response fields (${ok.status})`, "", table(["Name", "Type", "Required", "Description"], rows), "");
    }
    if (ok?.example !== undefined) out.push(`### Example response (${ok.status})`, "", json(ok.example), "");
  }
  return out.join("\n");
}

function callbackDoc(slug, page) {
  const { spec } = page;
  const found = firstOperation(spec);
  if (!found) return "";
  const { op } = found;
  const body = pickBody(op, spec);
  const out = [`## ${cleanText(op.summary || slug)}`, "", `Telesign sends this \`${found.method.toUpperCase()}\` request to a callback URL that you host.`, "", `- **Telesign reference:** <${REF + slug}>`, ""];
  const desc = cleanText(op.description || "");
  if (desc) out.push(desc.replace(/^(#{1,6}) /gm, (_, h) => "#".repeat(Math.min(6, h.length + 2)) + " "), "");
  if (body.schema) {
    const rows = schemaRows(body.schema);
    if (rows.length) out.push("### Payload fields", "", table(["Name", "Type", "Required", "Description"], rows), "");
  }
  if (body.example !== undefined) out.push("### Example payload", "", json(body.example), "");
  return out.join("\n");
}

// ---------------------------------------------------------------- main

async function main() {
  const operations = [];
  const skipped = [];
  for (const [slug, map] of Object.entries(TOOL_MAP)) {
    if (map.skip) { skipped.push(`${slug}: ${map.skip}`); continue; }
    const page = parsePage(await loadPage(slug));
    if (!page) throw new Error(`${slug}: no OpenAPI definition on page`);
    operations.push(buildOperation(slug, map, page));
  }

  const names = new Set();
  for (const o of operations) {
    if (names.has(o.tool)) throw new Error(`Duplicate tool name ${o.tool}`);
    if (!TOOLSETS[o.toolset]) throw new Error(`Unknown toolset ${o.toolset} for ${o.tool}`);
    names.add(o.tool);
  }

  // Catalog
  const catalogDir = path.join(ROOT, "src", "catalog");
  fs.mkdirSync(catalogDir, { recursive: true });
  const catalog = operations.map(toCatalogEntry);
  const toolsets = Object.fromEntries(Object.entries(TOOLSETS).map(([k, v]) => [k, v]));
  fs.writeFileSync(
    path.join(catalogDir, "operations.ts"),
    `// GENERATED by scripts/sync-specs.mjs from Telesign's published OpenAPI definitions. Do not edit by hand.\n` +
      `import type { Operation, ToolsetInfo } from "./types.js";\n\n` +
      `export const TOOLSETS: Record<string, ToolsetInfo> = ${JSON.stringify(toolsets, null, 2)};\n\n` +
      `export const OPERATIONS: Operation[] = ${JSON.stringify(catalog, null, 2)};\n`
  );

  // Reference docs
  const refDir = path.join(ROOT, "src", "docs", "reference");
  fs.rmSync(refDir, { recursive: true, force: true });
  fs.mkdirSync(refDir, { recursive: true });
  for (const [key, info] of Object.entries(TOOLSETS)) {
    const ops = operations.filter((o) => o.toolset === key);
    if (!ops.length) continue;
    const head = [
      `# ${info.title} - API reference`, "", info.blurb, "",
      `_Generated from Telesign's OpenAPI definitions. Tools in this toolset: ${ops.map((o) => `\`${o.tool}\``).join(", ")}._`, "",
    ];
    fs.writeFileSync(path.join(refDir, `${key}.md`), head.join("\n") + "\n" + ops.map(operationDoc).join("\n\n---\n\n") + "\n");
  }
  const callbacks = [];
  for (const slug of CALLBACK_SLUGS) {
    const page = parsePage(await loadPage(slug));
    if (page) callbacks.push(callbackDoc(slug, page));
  }
  fs.writeFileSync(
    path.join(refDir, "callbacks.md"),
    `# Callbacks (webhooks) - API reference\n\nTelesign posts these payloads to callback URLs that you host. They are not MCP tools; use this page to build or debug your callback handler.\n\n` +
      callbacks.join("\n\n---\n\n") + "\n"
  );

  const size = JSON.stringify(catalog).length;
  console.log(`${operations.length} operations, ${Object.keys(TOOLSETS).length} toolsets, ${callbacks.length} callbacks; catalog ${(size / 1024).toFixed(0)} KB`);
  for (const s of skipped) console.log(`skipped ${s}`);
  if (droppedDeprecated.size) console.log(`dropped deprecated fields: ${[...droppedDeprecated].join(", ")}`);
  if (args.includes("--verbose")) {
    for (const o of catalog) {
      const n = (o.body?.properties ? Object.keys(o.body.properties).length : 0) + o.pathParams.length + o.queryParams.length;
      console.log(`${o.tool.padEnd(40)} ${o.method.padEnd(6)} ${o.url}  auth=${o.auth} body=${o.bodyType || "-"}/${o.bodyMode} args=${n} ${(JSON.stringify(o).length / 1024).toFixed(1)}KB`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
