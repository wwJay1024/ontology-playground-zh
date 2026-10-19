import { describe, expect, it } from 'vitest';
import {
  buildOntologyEmbedSnippet,
  escapeHtmlAttribute,
  parseInlineEmphasis,
} from './contentSafety';

describe('content safety helpers', () => {
  it('parses supported emphasis while leaving HTML payloads as text', () => {
    expect(parseInlineEmphasis('**Name** <img src=x onerror=alert(1)> _note_')).toEqual([
      { kind: 'strong', text: 'Name' },
      { kind: 'text', text: ' <img src=x onerror=alert(1)> ' },
      { kind: 'emphasis', text: 'note' },
    ]);
  });

  it('escapes values copied into HTML attributes', () => {
    expect(escapeHtmlAttribute(`id"><script>alert('x')</script>&`))
      .toBe('id&quot;&gt;&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;&amp;');

    const snippet = buildOntologyEmbedSnippet(
      'community/user"><img src=x onerror=alert(1)>',
      'https://example.test/?value="unsafe"&',
    );
    expect(snippet).not.toContain('"><img');
    expect(snippet).toContain('community/user&quot;&gt;&lt;img');
    expect(snippet).toContain('value=&quot;unsafe&quot;&amp;');
  });
});
