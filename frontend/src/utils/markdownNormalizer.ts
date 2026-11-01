// src/utils/markdownNormalizer.ts
// Normalization layer for DSA Editorial and Problem descriptions

/**
 * Normalizes editorial Markdown and math expressions before rendering
 */
export function normalizeEditorialMarkdown(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // 1. Remove kramdown / Jekyll attribute syntax e.g. {:width="539px"}, {:align=center}, {:class="..."}
  text = text.replace(/\{:[^}]+\}/g, '');

  // 2. Normalize standalone block math:
  // e.g. "Complexity$$O(n)$$" -> "Complexity\n\n$$O(n)$$\n\n"
  text = text.replace(/([^\n$])\$\$([^\n$]+)\$\$([^\n$])/g, '$1\n\n$$$$2$$\n\n$3');

  // 3. Fix instances where LaTeX math was written as \( ... \) or \[ ... \]
  text = text.replace(/\\\((.*?)\\\)/g, '$$$1$$');
  text = text.replace(/\\\[(.*?)\\\]/gs, '\n\n$$$$1$$\n\n');

  // 4. Clean HTML entities from raw scraping or API sources
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");

  // 5. Ensure Markdown headings have a space after '#' (e.g. '##Approach' -> '## Approach')
  text = text.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');

  // 6. Normalize list items that may not have space after marker
  text = text.replace(/^(\d+\.)([^\s])/gm, '$1 $2');
  text = text.replace(/^([*-])([^\s*-])/gm, '$1 $2');

  return text.trim();
}

/**
 * Validates if an image URL is safe and resolvable in the browser
 */
export function isSafeImageUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // Disallow relative local paths like ../Figures/..., file://, or non-web protocols
  if (trimmed.startsWith('../') || trimmed.startsWith('./') || trimmed.startsWith('/')) {
    return false;
  }
  return trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('data:image/');
}
