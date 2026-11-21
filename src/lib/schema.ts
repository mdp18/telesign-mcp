import { z, type ZodTypeAny } from "zod";
import type { JsonSchema, Operation, OperationParam } from "../catalog/types.js";
import { config } from "../config.js";

interface ConvertOptions {
  /**
   * Accept numbers and booleans where the spec says "string" and convert them to strings.
   * Used for path, query and form-encoded values, where everything is sent as text anyway.
   */
  lenientStrings?: boolean;
}

/** "30" -> 30. Models and humans often quote numbers. */
function numeric(value: unknown): unknown {
  return typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim()) ? Number(value) : value;
}

/** "true" / "false" -> boolean. */
function booleanish(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const text = value.trim().toLowerCase();
  return text === "true" ? true : text === "false" ? false : value;
}

function describe(schema: JsonSchema): string {
  const parts: string[] = [];
  if (schema.description) parts.push(schema.description);
  if (schema.maxLength !== undefined && schema.minLength !== undefined) parts.push(`Length ${schema.minLength}-${schema.maxLength}.`);
  else if (schema.maxLength !== undefined) parts.push(`Max length ${schema.maxLength}.`);
  else if (schema.minLength !== undefined) parts.push(`Min length ${schema.minLength}.`);
  if (schema.minimum !== undefined || schema.maximum !== undefined) parts.push(`Range ${schema.minimum ?? "-∞"} to ${schema.maximum ?? "∞"}.`);
  if (schema.default !== undefined && !/default/i.test(schema.description ?? "")) parts.push(`Default: ${JSON.stringify(schema.default)}.`);
  return parts.join(" ");
}

function withMeta(type: ZodTypeAny, schema: JsonSchema): ZodTypeAny {
  let out = type;
  if (schema.nullable) out = out.nullable();
  const text = describe(schema);
  return text ? out.describe(text) : out;
}

/**
 * Converts the JSON Schema subset used in the catalog into a Zod schema.
 *
 * The conversion is deliberately permissive: objects keep unknown keys, length limits are documented
 * rather than enforced, and defaults are never injected. Telesign validates the request; the schema's
 * job is to tell the model what the API accepts without rejecting inputs the spec forgot to list.
 */
export function toZod(schema: JsonSchema | undefined, options: ConvertOptions = {}): ZodTypeAny {
  if (!schema || typeof schema !== "object") return z.any();

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    const values = schema.enum.filter((v) => v !== null);
    if (values.length > 0 && values.every((v) => typeof v === "string")) {
      return withMeta(z.enum(values as [string, ...string[]]), schema);
    }
    const literals = values.map((v) => z.literal(v as string | number | boolean));
    if (literals.length === 1) return withMeta(literals[0], schema);
    if (literals.length > 1) return withMeta(z.union(literals as unknown as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]), schema);
  }

  const variants = schema.oneOf ?? schema.anyOf;
  if (Array.isArray(variants) && variants.length > 0 && !schema.properties) {
    const members = variants.map((v) => toZod(v, options));
    if (members.length === 1) return withMeta(members[0], schema);
    return withMeta(z.union(members as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]), schema);
  }

  switch (schema.type) {
    case "string": {
      const base = z.string();
      if (!options.lenientStrings) return withMeta(base, schema);
      return withMeta(
        z.preprocess((value) => (typeof value === "number" || typeof value === "boolean" ? String(value) : value), base),
        schema
      );
    }
    case "integer":
      return withMeta(z.preprocess(numeric, z.number().int()), schema);
    case "number":
      return withMeta(z.preprocess(numeric, z.number()), schema);
    case "boolean":
      return withMeta(z.preprocess(booleanish, z.boolean()), schema);
    case "array":
      return withMeta(z.array(schema.items ? toZod(schema.items, options) : z.any()), schema);
    case "object":
    default: {
      if (schema.properties && Object.keys(schema.properties).length > 0) {
        const shape: Record<string, ZodTypeAny> = {};
        const required = new Set(schema.required ?? []);
        for (const [name, child] of Object.entries(schema.properties)) {
          const converted = toZod(child, options);
          shape[name] = required.has(name) ? converted : converted.optional();
        }
        return withMeta(z.object(shape).passthrough(), schema);
      }
      if (schema.type === "object") {
        const extra = schema.additionalProperties;
        const valueType = extra && typeof extra === "object" ? toZod(extra, options) : z.any();
        return withMeta(z.record(z.string(), valueType), schema);
      }
      return withMeta(z.any(), schema);
    }
  }
}

/** Escape hatch for body fields that the published spec does not list. */
export const EXTRA_FIELDS = "extra_fields";

function paramToZod(param: OperationParam, lenientStrings: boolean): ZodTypeAny {
  const type = toZod(param.schema, { lenientStrings });
  return param.required ? type : type.optional();
}

/** Builds the Zod raw shape (tool arguments) for an operation. */
export function buildInputShape(op: Operation): Record<string, ZodTypeAny> {
  const shape: Record<string, ZodTypeAny> = {};
  // In read-only mode, parameters that would change state (such as verify_code on a status lookup) are not offered.
  const hidden = new Set(config.readOnly ? op.stateChangingParams ?? [] : []);
  for (const param of [...op.pathParams, ...op.queryParams, ...op.headerParams]) {
    if (hidden.has(param.name)) continue;
    shape[param.name] = paramToZod(param, true);
  }
  if (!op.body || op.bodyMode === "none") return shape;

  const lenientStrings = op.bodyType === "form";
  if (op.bodyMode === "flatten" && op.body.properties) {
    const required = new Set(op.body.required ?? []);
    for (const [name, child] of Object.entries(op.body.properties)) {
      const converted = toZod(child, { lenientStrings });
      shape[name] = required.has(name) ? converted : converted.optional();
    }
    if (!(EXTRA_FIELDS in shape)) {
      shape[EXTRA_FIELDS] = z.record(z.string(), z.any()).optional().describe("Additional request body fields not listed above, merged into the body as-is.");
    }
  } else {
    const body = toZod(op.body, { lenientStrings });
    shape.body = body.describe(op.body.description || "Request body. See the tool's reference documentation for its structure.");
  }
  return shape;
}
