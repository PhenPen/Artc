import { useMemo, useRef, useState } from "react";
import { diffLines } from "diff";
import { convertArticle } from "../core";
import type { Platform, Preset } from "../core";
import MarkdownPreview from "./MarkdownPreview";

const sample = `One of the first things to understand about Docker is that a container is not the same thing as permanent storage. This matters when you're running PostgreSQL, MySQL, MongoDB, or another application that needs to save data.

Imagine you create users and insert records into a PostgreSQL database. Then the container is removed. What happens to the data?

This is where Docker volumes come in.

## What Is a Docker Volume?

A Docker volume stores data independently of the container that uses it. The container can come and go while important data remains available.

For example, a Compose file can attach a named volume to PostgreSQL's data directory:

\`\`\`yaml
services:
  database:
    image: postgres:15
    volumes:
      - pg-data:/var/lib/postgresql/data

volumes:
  pg-data:
\`\`\`

The volume exists separately from the PostgreSQL container. That is why persistent storage matters for databases.`;

type View = "preview" | "diff" | "original";
const exampleMetadata = {
  title: "Docker Volumes: Why Container Data Needs Persistent Storage",
  description: "Understanding docker volumes and why persistent storage is needed",
  pubDate: "2026-10-04",
  tags: "Docker",
  draft: false,
};

export default function App() {
  const [source, setSource] = useState(sample);
  const [platform, setPlatform] = useState<Platform>("astro");
  const [preset, setPreset] = useState<Preset>("none");
  const [mediumCleanup, setMediumCleanup] = useState(false);
  const [linkedinCleanup, setLinkedinCleanup] = useState(false);
  const [metadata, setMetadata] = useState(exampleMetadata);
  const [view, setView] = useState<View>("preview");
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const output = useMemo(() => convertArticle(source, {
    ...metadata,
    title: metadata.title || "Untitled article",
    tags: metadata.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  }, {
    platform,
    preset,
    cleanup: platform === "medium" ? mediumCleanup : platform === "linkedin" ? linkedinCleanup : false,
  }), [source, platform, preset, mediumCleanup, linkedinCleanup, metadata]);

  function updateField(field: keyof typeof metadata, value: string | boolean) {
    setMetadata((current) => ({ ...current, [field]: value }));
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setMessage("Copied output");
    window.setTimeout(() => setMessage(""), 1800);
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${platform}-article.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function loadFile(file?: File) {
    if (!file) return;
    setSource(await file.text());
    setMessage(`Loaded ${file.name}`);
  }

  const diff = diffLines(source, output);
  const tags = metadata.tags.split(",").map((tag) => tag.trim()).filter(Boolean).join(", ");

  return <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-10">
    <div className="mx-auto max-w-[1440px]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-5">
        <div>
          <p className="mb-2 text-sm text-base-content/60">Local writing desk</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Artc</h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-base-content/65">Prepare one Markdown draft for Astro, Medium, or LinkedIn. Your article stays on this device.</p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["astro", "medium", "linkedin"] as Platform[]).map((item) => <button key={item} className={`btn min-h-11 rounded-field capitalize ${platform === item ? "btn-neutral" : "btn-ghost"}`} onClick={() => setPlatform(item)}>{item === "astro" ? "Astro" : item}</button>)}
        {platform !== "astro" && <>
          <span className="mx-1 hidden h-7 border-l border-base-300 sm:block" />
          <label className="sr-only" htmlFor="preset">Markdown preset</label>
          <select id="preset" className="select min-h-11 w-full max-w-52" value={preset} onChange={(event) => setPreset(event.target.value as Preset)}>
            <option value="none">Preset: None</option>
            <option value="clean-markdown">Preset: Clean Markdown</option>
            <option value="plain-text">Preset: Plain Text</option>
          </select>
        </>}
        {platform === "astro" && <span className="ml-auto text-sm text-base-content/60">Astro preserves the body exactly</span>}
      </div>

      {platform === "astro" && <section className="mb-6 grid gap-3 rounded-box border border-base-300 p-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Astro frontmatter">
        <div className="col-span-full flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-medium">Article details</h2>
          <p className="text-sm text-base-content/60">Written to the top of the Astro file</p>
        </div>
        <label className="form-control gap-1"><span className="text-sm">Title</span><input className="input input-bordered w-full" value={metadata.title} onChange={(e) => updateField("title", e.target.value)} /></label>
        <label className="form-control gap-1"><span className="text-sm">Description</span><input className="input input-bordered w-full" value={metadata.description} onChange={(e) => updateField("description", e.target.value)} /></label>
        <label className="form-control gap-1"><span className="text-sm">Publication date</span><input className="input input-bordered w-full" type="date" value={metadata.pubDate} onChange={(e) => updateField("pubDate", e.target.value)} /></label>
        <label className="form-control gap-1"><span className="text-sm">Tags, comma separated</span><input className="input input-bordered w-full" value={metadata.tags} onChange={(e) => updateField("tags", e.target.value)} /></label>
        <label className="flex min-h-11 items-center gap-3 self-end pb-2"><input className="checkbox" type="checkbox" checked={metadata.draft} onChange={(e) => updateField("draft", e.target.checked)} /><span className="text-sm">Draft</span></label>
      </section>}

      {platform !== "astro" && <section className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-box border border-base-300 px-4 py-3" aria-label="Platform cleanup options">
        <p className="text-sm font-medium">Cleanup options</p>
        {platform === "medium" && <label className="flex min-h-11 items-center gap-3"><input type="checkbox" className="checkbox" checked={mediumCleanup} onChange={(e) => setMediumCleanup(e.target.checked)} /><span className="text-sm">Remove horizontal rules</span></label>}
        {platform === "linkedin" && <label className="flex min-h-11 items-center gap-3"><input type="checkbox" className="checkbox" checked={linkedinCleanup} onChange={(e) => setLinkedinCleanup(e.target.checked)} /><span className="text-sm">Flatten headings and remove horizontal rules</span></label>}
      </section>}

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-2 flex min-h-11 items-center justify-between gap-2">
            <h2 className="text-lg font-medium">Original Markdown</h2>
            <div className="flex gap-2">
              <button className="btn btn-ghost min-h-11" onClick={() => fileInput.current?.click()}>Open file</button>
              <input ref={fileInput} className="hidden" type="file" accept=".md,.markdown,text/markdown,text/plain" onChange={(e) => void loadFile(e.target.files?.[0])} />
              <button className="btn btn-ghost min-h-11" onClick={() => setSource("")}>Clear</button>
            </div>
          </div>
          <textarea className="textarea textarea-bordered min-h-[420px] w-full resize-y font-mono text-sm leading-6" aria-label="Original Markdown" spellCheck={false} value={source} onChange={(e) => setSource(e.target.value)} />
        </section>

        <section className="min-w-0">
          <div className="mb-2 flex min-h-11 flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-medium">Article preview</h2>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-ghost min-h-11" onClick={() => void copyOutput()}>Copy</button>
              <button className="btn btn-neutral min-h-11" onClick={downloadOutput}>Download .md</button>
            </div>
          </div>
          <div role="tablist" className="tabs tabs-bordered mb-2">
            {(["preview", "diff", "original"] as View[]).map((item) => <button key={item} role="tab" aria-selected={view === item} className={`tab min-h-11 capitalize ${view === item ? "tab-active" : ""}`} onClick={() => setView(item)}>{item}</button>)}
          </div>
          <div className="min-h-[420px] overflow-hidden rounded-box border border-base-300 bg-base-100" aria-live="polite">
            {view === "preview" ? <article className="blog-preview">
              {platform === "astro" && <header className="blog-preview-header">
                <h2>{metadata.title || "Untitled article"}</h2>
                {metadata.description && <p className="blog-description">{metadata.description}</p>}
                <div className="blog-byline"><time dateTime={metadata.pubDate}>{metadata.pubDate ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(`${metadata.pubDate}T00:00:00`)) : ""}</time>{tags && <span>{tags}</span>}</div>
              </header>}
              {platform !== "astro" && preset === "plain-text"
                ? <div className="article-plain-text">{output}</div>
                : <MarkdownPreview source={platform === "astro" ? source : output} />}
            </article> : <pre className="source-view">{view === "original" ? source : diff.map((part, index) => <span key={index} className={part.added ? "diff-added" : part.removed ? "diff-removed" : ""}>{part.value}</span>)}</pre>}
          </div>
          <div className="mt-2 flex min-h-6 items-center justify-between text-sm text-base-content/60"><span>{message}</span><span>{output.length.toLocaleString()} characters</span></div>
        </section>
      </div>
      <footer className="mt-8 border-t border-base-300 pt-4 text-sm text-base-content/60">Runs locally. No account or upload required.</footer>
    </div>
  </main>;
}
