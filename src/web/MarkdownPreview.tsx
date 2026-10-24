import type { ReactNode } from "react";
import type { PhrasingContent, RootContent } from "mdast";
import { parseMarkdown } from "../core";

function renderInline(nodes: PhrasingContent[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case "text": return node.value;
      case "inlineCode": return <code key={key} className="article-inline-code">{node.value}</code>;
      case "strong": return <strong key={key}>{renderInline(node.children, key)}</strong>;
      case "emphasis": return <em key={key}>{renderInline(node.children, key)}</em>;
      case "delete": return <del key={key}>{renderInline(node.children, key)}</del>;
      case "link": {
        const safe = /^(https?:|mailto:|#|\/)/i.test(node.url);
        return safe
          ? <a key={key} href={node.url} rel="noreferrer">{renderInline(node.children, key)}</a>
          : <span key={key}>{renderInline(node.children, key)}</span>;
      }
      case "image": return <span key={key}>{node.alt || "Image"}</span>;
      case "break": return <br key={key} />;
      case "html": return null;
      default: return null;
    }
  });
}

function renderBlock(node: RootContent, key: string): ReactNode {
  switch (node.type) {
    case "heading": {
      const content = renderInline(node.children, key);
      if (node.depth === 1) return <h2 key={key} className="article-heading article-heading-main">{content}</h2>;
      if (node.depth === 2) return <h2 key={key} className="article-heading">{content}</h2>;
      if (node.depth === 3) return <h3 key={key} className="article-subheading">{content}</h3>;
      return <h4 key={key} className="article-subheading">{content}</h4>;
    }
    case "paragraph": return <p key={key}>{renderInline(node.children, key)}</p>;
    case "code": return <pre key={key} className="article-code"><code>{node.value}</code></pre>;
    case "blockquote": return <blockquote key={key}>{node.children.map((child, index) => renderBlock(child, `${key}-${index}`))}</blockquote>;
    case "list": {
      const ItemTag = node.ordered ? "ol" : "ul";
      return <ItemTag key={key}>{node.children.map((item, index) => <li key={`${key}-${index}`}>{item.children.map((child, childIndex) => renderBlock(child, `${key}-${index}-${childIndex}`))}</li>)}</ItemTag>;
    }
    case "table": return <div key={key} className="article-table-wrap"><table><tbody>{node.children.map((row, rowIndex) => <tr key={`${key}-${rowIndex}`}>{row.children.map((cell, cellIndex) => {
      const Cell = rowIndex === 0 ? "th" : "td";
      return <Cell key={`${key}-${rowIndex}-${cellIndex}`}>{renderInline(cell.children, `${key}-${rowIndex}-${cellIndex}`)}</Cell>;
    })}</tr>)}</tbody></table></div>;
    case "thematicBreak": return <hr key={key} />;
    // Raw HTML is never injected into the preview.
    case "html": return null;
    default: return null;
  }
}

export default function MarkdownPreview({ source }: { source: string }) {
  const tree = parseMarkdown(source);
  return <div className="article-body">{tree.children.map((node, index) => renderBlock(node, `block-${index}`))}</div>;
}
