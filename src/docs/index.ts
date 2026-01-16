import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DOC_TOPICS = [
  "overview",
  "phone-id",
  "intelligence",
  "verify-api",
  "messaging-sms",
  "error-codes",
  "best-practices",
] as const;

export type DocTopic = (typeof DOC_TOPICS)[number];

// Cache for loaded docs
const docsCache: Record<string, string> = {};

export function getDoc(topic: string): string | null {
  if (docsCache[topic]) {
    return docsCache[topic];
  }

  try {
    const filePath = path.join(__dirname, `${topic}.md`);
    const content = fs.readFileSync(filePath, "utf-8");
    docsCache[topic] = content;
    return content;
  } catch {
    return null;
  }
}

export function getAllDocs(): Record<string, string> {
  const docs: Record<string, string> = {};

  for (const topic of DOC_TOPICS) {
    const content = getDoc(topic);
    if (content) {
      docs[topic] = content;
    }
  }

  return docs;
}