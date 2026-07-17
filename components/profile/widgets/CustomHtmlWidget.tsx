"use client";

import DOMPurify from "isomorphic-dompurify";

interface Props {
  html: string;
  accentHex?: string;
}

// Deliberately restrictive: this HTML is written by one user and rendered in
// every visitor's browser, so it's a stored-XSS surface if left unsanitized
// (script tags, event-handler attributes, javascript: URLs, iframes/forms
// pointing anywhere, etc. could target every visitor, not just the author).
// DOMPurify strips scripts/handlers by default; the explicit allowlist below
// is defense-in-depth on top of that default, and rules out iframe/object/
// embed/form/style entirely rather than trying to sanitize their contents.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "b", "i", "strong", "em", "u", "s", "a", "span", "div",
    "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "code", "pre", "hr", "img",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  FORBID_TAGS: ["iframe", "object", "embed", "form", "input", "style", "script"],
  FORBID_ATTR: ["style", "class", "onerror", "onload", "onclick"],
};

/**
 * components/profile/widgets/CustomHtmlWidget.tsx
 * Sanitized custom HTML block. Data stored in User.widgetConfig:
 *   { "custom-html": { enabled: true, config: { html: string } } }
 */
export function CustomHtmlWidget({ html }: Props) {
  const clean = DOMPurify.sanitize(html, SANITIZE_CONFIG);
  if (!clean.trim()) return null;

  return (
    <div
      className="glass rounded-2xl p-5 text-sm text-text-secondary leading-relaxed [&_a]:underline [&_a]:text-purple [&_img]:rounded-lg [&_img]:max-w-full"
      // content is sanitized above via DOMPurify with a restrictive allowlist
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
