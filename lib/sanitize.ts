// Tiny allowlist sanitizer for admin-edited rich text before it renders on
// the public site. Keeps: h2 h3 p ul ol li strong em a br blockquote hr.
const ALLOWED = new Set(["h2", "h3", "p", "ul", "ol", "li", "strong", "b", "em", "i", "a", "br", "blockquote", "hr"]);

export function sanitizeHtml(html: string): string {
  let out = html;
  // Drop dangerous containers entirely.
  out = out.replace(/<(script|style|iframe|object|embed|form|svg|math|link|meta)[\s\S]*?<\/\1>/gi, "");
  out = out.replace(/<(script|style|iframe|object|embed|form|svg|math|link|meta)[^>]*\/?>/gi, "");
  // Strip event handlers + javascript: URLs.
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'>\s]*\2/gi, "$1=$2#$2");
  // Replace disallowed tags with nothing (keep inner text).
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tag: string) => {
    const t = tag.toLowerCase();
    if (!ALLOWED.has(t)) return "";
    if (match.startsWith("</")) return `</${t}>`;
    if (t === "a") {
      const href = match.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] ?? "#";
      return `<a href="${href.replace(/"/g, "&quot;")}" rel="noopener">`;
    }
    if (t === "br" || t === "hr") return `<${t}/>`;
    return `<${t}>`;
  });
  return out;
}
