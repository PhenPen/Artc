import type { ArticleMetadata, ConvertOptions } from "./types";
import { applyPlatformCleanup, transformMarkdown } from "./markdown";

export function formatFrontmatter(metadata: ArticleMetadata): string {
  const tags = metadata.tags.map((tag) => JSON.stringify(tag)).join(", ");
  return [
    "---",
    `title: ${JSON.stringify(metadata.title)}`,
    `description: ${JSON.stringify(metadata.description)}`,
    `pubDate: ${JSON.stringify(metadata.pubDate)}`,
    `tags: [${tags}]`,
    `draft: ${metadata.draft ? "true" : "false"}`,
    "---",
  ].join("\n");
}

export function convertArticle(body: string, metadata: ArticleMetadata, options: ConvertOptions): string {
  if (options.platform === "astro") {
    return `${formatFrontmatter(metadata)}\n${body}`;
  }
  let result = transformMarkdown(body, options.preset ?? "none", false);
  if (options.cleanup) result = applyPlatformCleanup(result, options.platform);
  return result;
}
