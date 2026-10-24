import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import type { Root, RootContent, PhrasingContent } from "mdast";
import type { Preset } from "./types";

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, {
  bullet: "-",
  fences: true,
  resourceLink: true,
});

export function parseMarkdown(markdown: string): Root {
  return processor.parse(markdown) as Root;
}

function plainInline(nodes: PhrasingContent[]): string {
  return nodes.map((node) => {
    if (node.type === "text" || node.type === "inlineCode") return node.value;
    if (node.type === "link") return `${plainInline(node.children)} (${node.url})`;
    if (node.type === "strong" || node.type === "emphasis" || node.type === "delete") return plainInline(node.children);
    if (node.type === "image") return node.alt ?? "";
    if (node.type === "break") return "\n";
    if (node.type === "html") return node.value;
    return "";
  }).join("");
}

function plainBlocks(nodes: RootContent[]): string[] {
  const blocks: string[] = [];
  for (const node of nodes) {
    if (node.type === "heading" || node.type === "paragraph") blocks.push(plainInline(node.children));
    else if (node.type === "code") blocks.push(node.value);
    else if (node.type === "html") blocks.push(node.value);
    else if (node.type === "table") {
      for (const row of node.children) blocks.push(row.children.map((cell) => plainInline(cell.children)).join(" | "));
    }
    else if (node.type === "blockquote") blocks.push(plainBlocks(node.children).join("\n\n").split("\n").map((line) => `> ${line}`).join("\n"));
    else if (node.type === "list") {
      const marker = node.ordered ? "1." : "-";
      for (const item of node.children) {
        const content = plainBlocks(item.children).join(" ");
        blocks.push(`${marker} ${content}`);
      }
    }
    // Thematic breaks are presentation only and have no plain-text equivalent.
  }
  return blocks;
}

function cleanMarkdown(root: Root): Root {
  // Parsing and reserializing normalizes Markdown syntax without regex edits to source text.
  return root;
}

export function transformMarkdown(markdown: string, preset: Preset = "none", cleanup = false): string {
  if (preset === "none" && !cleanup) return markdown;
  const tree = processor.parse(markdown) as Root;
  if (preset === "plain-text") {
    const output = plainBlocks(tree.children).join("\n\n").trim();
    return output ? `${output}\n` : "";
  }
  const transformed = cleanMarkdown(tree);
  const output = processor.stringify(transformed).trim();
  return output ? `${output}\n` : "";
}

export function applyPlatformCleanup(markdown: string, platform: "medium" | "linkedin"): string {
  const tree = processor.parse(markdown) as Root;
  const children: RootContent[] = [];
  for (const node of tree.children) {
    if (node.type === "thematicBreak") continue;
    if (platform === "linkedin" && node.type === "heading") {
      children.push({ type: "paragraph", children: node.children });
      continue;
    }
    children.push(node);
  }
  // Code and HTML comment nodes remain intact; only platform-specific block structure changes.
  const output = processor.stringify({ type: "root", children }).trim();
  return output ? `${output}\n` : "";
}

