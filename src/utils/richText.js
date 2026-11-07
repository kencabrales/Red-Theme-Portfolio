const FONT_SIZES = {
  "1": "12px",
  "2": "14px",
  "3": "16px",
  "4": "18px",
  "5": "24px",
  "6": "28px",
  "7": "32px",
};

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "blockquote", "a", "span", "div",
]);

export function sanitizeRichText(value = "") {
  const source = String(value || "");
  if (!source.trim()) return "";
  if (typeof DOMParser === "undefined" || typeof document === "undefined") {
    return source.replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, "");
  }

  const parsed = new DOMParser().parseFromString(source, "text/html");

  const cleanNode = (node) => {
    if (node.nodeType === 3) return document.createTextNode(node.textContent || "");
    if (node.nodeType !== 1) return document.createDocumentFragment();

    const sourceTag = node.tagName.toLowerCase();
    const tag = sourceTag === "font" ? "span" : sourceTag;
    if (!ALLOWED_TAGS.has(tag)) {
      const fragment = document.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => fragment.appendChild(cleanNode(child)));
      return fragment;
    }

    const element = document.createElement(tag);

    if (sourceTag === "font") {
      const size = FONT_SIZES[node.getAttribute("size") || ""];
      if (size) element.style.fontSize = size;
    }

    if (tag === "span") {
      const fontSize = node.style?.fontSize || "";
      if (/^(1[0-9]|2[0-9]|3[0-6])px$/.test(fontSize)) {
        element.style.fontSize = fontSize;
      }
    }

    if (tag === "a") {
      const href = (node.getAttribute("href") || "").trim();
      const safeHref =
        href.startsWith("https://") ||
        href.startsWith("http://") ||
        href.startsWith("mailto:") ||
        href.startsWith("/");
      if (safeHref) {
        element.setAttribute("href", href);
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      }
    }

    Array.from(node.childNodes).forEach((child) => element.appendChild(cleanNode(child)));
    return element;
  };

  const container = document.createElement("div");
  Array.from(parsed.body.childNodes).forEach((node) => container.appendChild(cleanNode(node)));
  return container.innerHTML;
}

export function plainTextToHtml(value = "") {
  return String(value || "")
    .split(/\\r?\\n/)
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return "<p>" + (escaped || "<br>") + "</p>";
    })
    .join("");
}
