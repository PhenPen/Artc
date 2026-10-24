#!/usr/bin/env node
import { Command } from "commander";
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { convertArticle } from "../core/index";
import type { Platform, Preset } from "../core/index";

const program = new Command();
program.name("article-tool").description("Convert Markdown articles for Astro, Medium, and LinkedIn").version("0.1.0");
program.command("convert")
  .argument("<input>", "Markdown file")
  .option("-p, --platform <platform>", "astro, medium, or linkedin", "astro")
  .option("--preset <preset>", "none, clean-markdown, or plain-text", "none")
  .option("--cleanup", "apply this platform's spacing cleanup")
  .option("-o, --output <file>", "write to a file instead of stdout")
  .option("--title <title>", "Astro title")
  .option("--description <description>", "Astro description", "")
  .option("--pub-date <date>", "Astro publication date", new Date().toISOString().slice(0, 10))
  .option("--tags <tags>", "comma-separated Astro tags", "")
  .option("--draft", "set Astro draft to true")
  .action(async (input: string, options: {
    platform: string; preset: string; cleanup?: boolean; output?: string; title?: string;
    description: string; pubDate: string; tags: string; draft?: boolean;
  }) => {
    if (!["astro", "medium", "linkedin"].includes(options.platform)) throw new Error("Platform must be astro, medium, or linkedin.");
    if (!["none", "clean-markdown", "plain-text"].includes(options.preset)) throw new Error("Preset must be none, clean-markdown, or plain-text.");
    const body = await readFile(resolve(input), "utf8");
    const output = convertArticle(body, {
      title: options.title ?? basename(input, ".md"),
      description: options.description,
      pubDate: options.pubDate,
      tags: options.tags ? options.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      draft: Boolean(options.draft),
    }, { platform: options.platform as Platform, preset: options.preset as Preset, cleanup: options.cleanup });
    if (options.output) await writeFile(resolve(options.output), output, "utf8");
    else process.stdout.write(output);
  });

await program.parseAsync(process.argv);
