export interface InlineTextSegment {
  kind: 'text' | 'strong' | 'emphasis';
  text: string;
}

const INLINE_EMPHASIS_PATTERN = /(\*\*[^*\n]+\*\*|_[^_\n]+_)/g;

export function parseInlineEmphasis(text: string): InlineTextSegment[] {
  return text
    .split(INLINE_EMPHASIS_PATTERN)
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return { kind: 'strong', text: segment.slice(2, -2) };
      }
      if (segment.startsWith('_') && segment.endsWith('_')) {
        return { kind: 'emphasis', text: segment.slice(1, -1) };
      }
      return { kind: 'text', text: segment };
    });
}

export function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function buildOntologyEmbedSnippet(catalogueId: string, baseUrl: string): string {
  const safeId = escapeHtmlAttribute(catalogueId);
  const safeBaseUrl = escapeHtmlAttribute(baseUrl);
  return `<div class="ontology-embed" data-catalogue-id="${safeId}" data-catalogue-base-url="${safeBaseUrl}" data-theme="dark" data-height="500px"></div>\n<script src="${safeBaseUrl}embed/ontology-embed.js"></script>`;
}
