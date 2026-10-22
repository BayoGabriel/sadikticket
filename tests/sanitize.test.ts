import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "@/lib/sanitize";

describe("sanitizeHtml", () => {
  it("keeps the safe subset", () => {
    const out = sanitizeHtml("<h2>Title</h2><p>Hello <strong>bold</strong> and <em>italic</em></p><ul><li>a</li><li>b</li></ul>");
    expect(out).toContain("<h2>Title</h2>");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<ul><li>a</li><li>b</li></ul>");
  });

  it("strips scripts and event handlers", () => {
    const out = sanitizeHtml('<p onclick="alert(1)">hi</p><script>alert(1)</script>');
    expect(out).not.toContain("script");
    expect(out).not.toContain("onclick");
    expect(out).toContain("<p>hi</p>");
  });

  it("only allows safe hrefs on links", () => {
    const ok = sanitizeHtml('<a href="https://example.com">x</a>');
    expect(ok).toContain('href="https://example.com"');
    const bad = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(bad).not.toContain("javascript");
  });

  it("drops unknown tags but keeps text", () => {
    const out = sanitizeHtml("<div><span>inside</span></div>");
    expect(out).not.toContain("<div>");
    expect(out).not.toContain("<span>");
    expect(out).toContain("inside");
  });
});
