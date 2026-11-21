import type { McpServer, RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OPERATIONS, TOOLSETS } from "../catalog/operations.js";
import type { Operation } from "../catalog/types.js";
import { config, selectToolsets } from "../config.js";
import { execute } from "../lib/http.js";
import { formatResult, type ToolResult } from "../lib/format.js";
import { buildInputShape } from "../lib/schema.js";

/**
 * Tracks which toolsets are switched on for one server instance.
 *
 * Every tool of every *available* toolset is registered at startup, but tools of toolsets that are not
 * enabled are registered disabled: they are not listed and cannot be called until the toolset is
 * switched on. Enabling a toolset makes the SDK send `notifications/tools/list_changed`, so clients
 * that support it refresh their tool list mid-session.
 */
export class ToolsetManager {
  private readonly registered = new Map<string, RegisteredTool>();
  private readonly active = new Set<string>();
  readonly available: string[];

  constructor() {
    const selection = selectToolsets();
    this.available = selection.available;
    selection.enabled.forEach((key) => this.active.add(key));
  }

  /** Operations this server instance may ever call (respects admin gating and read-only mode). */
  operations(): Operation[] {
    return OPERATIONS.filter((op) => this.available.includes(op.toolset) && (!config.readOnly || op.readOnly));
  }

  /** Operations whose tools are currently listed. */
  activeOperations(): Operation[] {
    return this.operations().filter((op) => this.active.has(op.toolset));
  }

  find(tool: string): Operation | undefined {
    return this.operations().find((op) => op.tool === tool);
  }

  isActive(toolset: string): boolean {
    return this.active.has(toolset);
  }

  isAvailable(toolset: string): boolean {
    return this.available.includes(toolset);
  }

  track(op: Operation, tool: RegisteredTool): void {
    this.registered.set(op.tool, tool);
    if (!this.active.has(op.toolset)) tool.disable();
  }

  /** Attaches a hand-written tool to a toolset so it is listed and hidden together with it. */
  trackExtra(toolset: string, name: string, tool: RegisteredTool): void {
    this.registered.set(name, tool);
    this.extras.push({ toolset, name });
    if (!this.active.has(toolset)) tool.disable();
  }

  private readonly extras: Array<{ toolset: string; name: string }> = [];

  private toolsOf(toolset: string): string[] {
    return [...this.operations().filter((op) => op.toolset === toolset).map((op) => op.tool), ...this.extras.filter((e) => e.toolset === toolset).map((e) => e.name)];
  }

  /** Switches a toolset on. Returns the tool names that became available. */
  enable(toolset: string): string[] {
    if (!this.isAvailable(toolset)) return [];
    this.active.add(toolset);
    const names = this.toolsOf(toolset);
    for (const name of names) this.registered.get(name)?.enable();
    return names;
  }

  /** Switches a toolset off. Returns the tool names that were hidden. */
  disable(toolset: string): string[] {
    if (!this.active.has(toolset)) return [];
    this.active.delete(toolset);
    const names = this.toolsOf(toolset);
    for (const name of names) this.registered.get(name)?.disable();
    return names;
  }
}

export function describeTool(op: Operation): string {
  const toolset = TOOLSETS[op.toolset];
  return `${op.description}\n${toolset ? toolset.title + ". " : ""}${op.method} ${op.url.replace(/^https:\/\//, "")}. Full parameter and response reference: docs_get_tool_reference("${op.tool}").`;
}

/** Validates arguments against an operation's schema and performs the request. */
export async function callOperation(op: Operation, args: unknown): Promise<ToolResult> {
  const parsed = z.object(buildInputShape(op)).safeParse(args ?? {});
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `- ${issue.path.join(".") || "(arguments)"}: ${issue.message}`).join("\n");
    return {
      content: [{ type: "text", text: `Invalid arguments for ${op.tool}:\n${issues}\nSee docs_get_tool_reference("${op.tool}") for the accepted parameters.` }],
      isError: true,
    };
  }
  return formatResult(op, await execute(op, parsed.data as Record<string, unknown>));
}

/** Registers one MCP tool per Telesign API operation in the generated catalog. */
export function registerCatalogTools(server: McpServer, manager: ToolsetManager): void {
  for (const op of manager.operations()) {
    // A status tool that also accepts a code to check is only read-only when that parameter is hidden.
    const changesState = !config.readOnly && (op.stateChangingParams?.length ?? 0) > 0;
    const tool = server.registerTool(
      op.tool,
      {
        title: op.title,
        description: describeTool(op),
        inputSchema: buildInputShape(op),
        annotations: {
          title: op.title,
          readOnlyHint: op.readOnly && !changesState,
          destructiveHint: op.destructive,
          idempotentHint: op.idempotent && !changesState,
          openWorldHint: true,
        },
      },
      async (args: Record<string, unknown>) => formatResult(op, await execute(op, args ?? {}))
    );
    manager.track(op, tool);
  }
}
