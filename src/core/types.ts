export type Platform = "astro" | "medium" | "linkedin";
export type Preset = "none" | "clean-markdown" | "plain-text";

export interface ArticleMetadata {
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
  draft: boolean;
}

export interface ConvertOptions {
  platform: Platform;
  preset?: Preset;
  cleanup?: boolean;
}
