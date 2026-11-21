import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DOCS_DIR = path.dirname(fileURLToPath(import.meta.url));

export interface DocTopic {
  /** Topic id, e.g. "verify-api" or "reference/messaging". */
  id: string;
  kind: "guide" | "reference";
  title: string;
  file: string;
  chars: number;
}

export interface DocSection {
  topic: string;
  /** Heading text without the leading #s. */
  heading: string;
  level: number;
  /** Headings of the enclosing sections, outermost first. */
  trail: string[];
  /** Section text including its heading line and all nested subsections. */
  text: string;
  /** Section text up to the next heading of any level. */
  own: string;
}

// Guides are listed first, in reading order; anything else found on disk follows alphabetically.
const GUIDE_ORDER = [
  "overview",
  "authentication",
  "verify-api",
  "sms-verify",
  "voice-verify",
  "silent-verify",
  "app-verify",
  "messaging",
  "messaging-sms",
  "number-masking",
  "voice",
  "phone-id",
  "intelligence",
  "deactivated-numbers",
  "accounts",
  "protect-platform",
  "callbacks",
  "error-codes",
  "best-practices",
];

let topicsCache: DocTopic[] | null = null;
const textCache = new Map<string, string>();
const sectionCache = new Map<string, DocSection[]>();

function titleOf(file: string, fallback: string): string {
  try {
    const fd = fs.openSync(file, "r");
    const buffer = Buffer.alloc(400);
    const read = fs.readSync(fd, buffer, 0, 400, 0);
    fs.closeSync(fd);
    const match = buffer.toString("utf8", 0, read).match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : fallback;
  } catch {
    return fallback;
  }
}

function scan(dir: string, prefix: string, kind: DocTopic["kind"]): DocTopic[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const file = path.join(dir, name);
      const id = prefix + name.replace(/\.md$/, "");
      return { id, kind, title: titleOf(file, id), file, chars: fs.statSync(file).size };
    });
}

export function listTopics(): DocTopic[] {
  if (topicsCache) return topicsCache;
  const guides = scan(DOCS_DIR, "", "guide");
  const rank = (id: string) => {
    const index = GUIDE_ORDER.indexOf(id);
    return index === -1 ? GUIDE_ORDER.length : index;
  };
  guides.sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
  topicsCache = [...guides, ...scan(path.join(DOCS_DIR, "reference"), "reference/", "reference")];
  return topicsCache;
}

export function topicIds(): string[] {
  return listTopics().map((topic) => topic.id);
}

export function getDoc(topicId: string): string | null {
  const cached = textCache.get(topicId);
  if (cached !== undefined) return cached;
  const topic = listTopics().find((t) => t.id === topicId);
  if (!topic) return null;
  try {
    const content = fs.readFileSync(topic.file, "utf8").replace(/\r\n/g, "\n");
    textCache.set(topicId, content);
    return content;
  } catch {
    return null;
  }
}

/** Splits a document into sections on markdown headings (ignoring headings inside code fences). */
export function getSections(topicId: string): DocSection[] {
  const cached = sectionCache.get(topicId);
  if (cached) return cached;
  const doc = getDoc(topicId);
  if (!doc) return [];

  const lines = doc.split("\n");
  const heads: Array<{ line: number; level: number; heading: string }> = [];
  let fence: string | null = null;
  lines.forEach((line, index) => {
    const mark = line.match(/^\s*(`{3,}|~{3,})/);
    if (mark) {
      if (fence === null) fence = mark[1][0];
      else if (mark[1][0] === fence) fence = null;
      return;
    }
    if (fence !== null) return;
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) heads.push({ line: index, level: heading[1].length, heading: heading[2] });
  });

  const sections: DocSection[] = [];
  const stack: Array<{ level: number; heading: string }> = [];
  heads.forEach((head, i) => {
    while (stack.length && stack[stack.length - 1].level >= head.level) stack.pop();
    const trail = stack.map((s) => s.heading);
    stack.push(head);
    let end = lines.length;
    for (let j = i + 1; j < heads.length; j++) {
      if (heads[j].level <= head.level) {
        end = heads[j].line;
        break;
      }
    }
    const ownEnd = i + 1 < heads.length ? heads[i + 1].line : lines.length;
    sections.push({
      topic: topicId,
      heading: head.heading,
      level: head.level,
      trail,
      text: lines.slice(head.line, end).join("\n").trim(),
      own: lines.slice(head.line, ownEnd).join("\n").trim(),
    });
  });
  sectionCache.set(topicId, sections);
  return sections;
}

/** Indented outline of a document's headings (levels 1-3). */
export function outline(topicId: string): string {
  return getSections(topicId)
    .filter((s) => s.level <= 3)
    .map((s) => `${"  ".repeat(s.level - 1)}- ${s.heading}`)
    .join("\n");
}

/**
 * Finds a section by heading: exact match first, then case-insensitive substring.
 *
 * Headings such as "Body parameters" repeat under every operation of a reference page, so a heading can be
 * qualified with its parents: "Finalize verification > Body parameters". Every part before the last must
 * match one of the section's enclosing headings, in order.
 */
export function findSection(topicId: string, heading: string): DocSection | null {
  const parts = heading.split(">").map((part) => part.trim().toLowerCase().replace(/^#+\s*/, "")).filter(Boolean);
  if (parts.length > 1) {
    const wantedHeading = parts[parts.length - 1];
    const parents = parts.slice(0, -1);
    const under = (section: DocSection) => {
      let from = 0;
      for (const parent of parents) {
        const at = section.trail.findIndex((t, i) => i >= from && t.toLowerCase().includes(parent));
        if (at === -1) return false;
        from = at + 1;
      }
      return true;
    };
    const candidates = getSections(topicId).filter(under);
    return (
      candidates.find((s) => s.heading.toLowerCase() === wantedHeading) ??
      candidates.find((s) => s.heading.toLowerCase().includes(wantedHeading)) ??
      null
    );
  }
  const wanted = parts[0] ?? "";
  const sections = getSections(topicId);
  return (
    sections.find((s) => s.heading.toLowerCase() === wanted) ??
    sections.find((s) => s.heading.toLowerCase().includes(wanted)) ??
    null
  );
}

/** Returns the reference section that documents one MCP tool. */
export function getToolReference(tool: string): { topic: string; text: string } | null {
  const marker = `**MCP tool:** \`${tool}\``;
  for (const topic of listTopics().filter((t) => t.kind === "reference")) {
    const section = getSections(topic.id).find((s) => s.level === 2 && s.text.includes(marker));
    if (section) return { topic: topic.id, text: section.text };
  }
  return null;
}

export interface SearchHit {
  topic: string;
  heading: string;
  trail: string[];
  score: number;
  snippet: string;
}

function tokenize(query: string): string[] {
  return [...new Set(query.toLowerCase().match(/[a-z0-9_.+-]+/g) ?? [])].filter((term) => term.length > 1 || /\d/.test(term));
}

/** Ranked full-text search over documentation sections. */
export function searchDocs(query: string, topicId?: string, limit = 8): SearchHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  const phrase = query.trim().toLowerCase();
  const topics = listTopics().filter((t) => !topicId || t.id === topicId);
  const hits: SearchHit[] = [];

  for (const topic of topics) {
    for (const section of getSections(topic.id)) {
      const body = section.own.toLowerCase();
      const heading = section.heading.toLowerCase();
      let matched = 0;
      let score = 0;
      for (const term of terms) {
        const inHeading = heading.includes(term);
        const count = body.split(term).length - 1;
        if (inHeading || count > 0) matched++;
        score += (inHeading ? 6 : 0) + Math.min(count, 5);
      }
      if (matched === 0) continue;
      // Sections that match every term rank well above partial matches.
      score *= matched === terms.length ? 3 : matched / terms.length;
      if (terms.length > 1 && body.includes(phrase)) score += 15;
      if (topic.kind === "guide") score *= 1.15;

      const lines = section.own.split("\n").slice(1);
      const relevant = lines.filter((line) => line.trim() && terms.some((term) => line.toLowerCase().includes(term)));
      const snippet = (relevant.length ? relevant : lines.filter((line) => line.trim()))
        .slice(0, 5)
        .map((line) => (line.length > 320 ? `${line.slice(0, 320)} …` : line))
        .join("\n");
      hits.push({ topic: topic.id, heading: section.heading, trail: section.trail, score, snippet });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
