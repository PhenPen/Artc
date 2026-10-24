import { describe, expect, it } from "vitest";
import { applyPlatformCleanup, convertArticle, formatFrontmatter, transformMarkdown } from "./index";

const meta = { title: "A title", description: "An article", pubDate: "2026-10-24", tags: ["TypeScript", "notes"], draft: true };

describe("Astro output", () => {
  it("writes fields in the requested order with an inline tags array", () => {
    expect(formatFrontmatter(meta)).toBe([
      "---", 'title: "A title"', 'description: "An article"', 'pubDate: "2026-10-24"',
      'tags: ["TypeScript", "notes"]', "draft: true", "---",
    ].join("\n"));
  });
  it("leaves the body untouched", () => {
    const body = "# Heading\r\n\r\n<!-- keep -->\r\n\r\n```csharp\r\nvar x = \"#tag\";\r\n```";
    expect(convertArticle(body, meta, { platform: "astro" })).toBe(`${formatFrontmatter(meta)}\n${body}`);
  });
});

describe("syntax-aware presets", () => {
  it("leaves the source unchanged for None", () => {
    const source = "## C# and [link](https://example.com/a#fragment)\n\n<!-- #keep -->";
    expect(transformMarkdown(source, "none")).toBe(source);
  });
  it("keeps URL fragments when normalizing Markdown", () => {
    const result = transformMarkdown("Read [the guide](https://example.com/docs#start).", "clean-markdown");
    expect(result).toContain("https://example.com/docs#start");
  });
  it("keeps GFM table text in Plain Text", () => {
    const result = transformMarkdown("| Name | Value |\n| --- | --- |\n| C# | #tag |", "plain-text");
    expect(result).toContain("Name | Value");
    expect(result).toContain("C# | #tag");
  });
  it("removes Markdown formatting while keeping code, full URL fragments, and comments", () => {
    const source = "## **C# notes** [link](https://example.com/a#fragment)\n\n`C#`\n\n```csharp\nvar x = \"#tag\";\n```\n\n<!-- keep #comment -->";
    const result = transformMarkdown(source, "plain-text");
    expect(result).toContain("C# notes link");
    expect(result).toContain("C#");
    expect(result).toContain('var x = "#tag";');
    expect(result).toContain("<!-- keep #comment -->");
    expect(result).toContain("https://example.com/a#fragment");
  });
});

describe("independent platform cleanup", () => {
  it("removes thematic separators for Medium while retaining headings", () => {
    const result = applyPlatformCleanup("# Heading\n\n---\n\nText", "medium");
    expect(result).toContain("# Heading");
    expect(result).not.toContain("---");
  });
  it("flattens headings for LinkedIn without rewriting comments or code", () => {
    const result = applyPlatformCleanup("# Heading\n\n<!-- note -->\n\n```csharp\nvar n = 1;\n```", "linkedin");
    expect(result).not.toContain("# Heading");
    expect(result).toContain("Heading");
    expect(result).toContain("<!-- note -->");
    expect(result).toContain("var n = 1;");
  });
});
