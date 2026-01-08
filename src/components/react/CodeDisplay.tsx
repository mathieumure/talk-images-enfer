import { useMemo } from 'react';

interface CodeDisplayProps {
  code: string;
  selectedFilename?: string;
  activeSourceType?: string;
}

// Simple HTML syntax highlighter with selected filename highlighting
function highlightHTML(code: string, selectedFilename?: string, activeSourceType?: string): string {
  // First escape HTML
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Use placeholders to avoid regex conflicts
  const MARK_START = '___MARK_START___';
  const MARK_END = '___MARK_END___';
  const TAG_START = '___TAG_START___';
  const TAG_END = '___TAG_END___';
  const ATTR_START = '___ATTR_START___';
  const ATTR_END = '___ATTR_END___';
  const STR_START = '___STR_START___';
  const STR_END = '___STR_END___';
  const ACTIVE_START = '___ACTIVE_START___';
  const ACTIVE_END = '___ACTIVE_END___';

  // Highlight selected filename FIRST
  if (selectedFilename) {
    const escapedFilename = selectedFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedFilename})`, 'g');
    highlighted = highlighted.replace(regex, MARK_START + '$1' + MARK_END);
  }

  // Highlight active source tag (for art direction demo)
  if (activeSourceType === 'desktop') {
    highlighted = highlighted.replace(
      /(&lt;source[\s\S]*?1024px[\s\S]*?\/&gt;)/,
      ACTIVE_START + '$1' + ACTIVE_END
    );
  } else if (activeSourceType === 'tablet') {
    highlighted = highlighted.replace(
      /(&lt;source[\s\S]*?640px[\s\S]*?\/&gt;)/,
      ACTIVE_START + '$1' + ACTIVE_END
    );
  } else if (activeSourceType === 'mobile') {
    highlighted = highlighted.replace(
      /(&lt;img[\s\S]*?\/&gt;)/,
      ACTIVE_START + '$1' + ACTIVE_END
    );
  }

  // Apply syntax highlighting with placeholders
  highlighted = highlighted
    // Tags with closing >
    .replace(/(&lt;\/?)([a-z]+)(&gt;)/gi, TAG_START + '$1$2$3' + TAG_END)
    // Tags with space (attributes follow)
    .replace(/(&lt;)([a-z]+)(\s)/gi, TAG_START + '$1$2' + TAG_END + '$3')
    // Closing />
    .replace(/(\/)(&gt;)/g, TAG_START + '$1$2' + TAG_END)
    // Attributes
    .replace(/(\s)([a-z-]+)(=)/gi, '$1' + ATTR_START + '$2' + ATTR_END + '$3')
    // Attribute values in quotes
    .replace(/=&quot;([^&]*)&quot;/g, '=&quot;' + STR_START + '$1' + STR_END + '&quot;');

  // Replace placeholders with actual HTML
  highlighted = highlighted
    .replace(new RegExp(MARK_START, 'g'), '<mark class=\'selected-source\'>')
    .replace(new RegExp(MARK_END, 'g'), '</mark>')
    .replace(new RegExp(ACTIVE_START, 'g'), '<mark class=\'active-source-tag\'>')
    .replace(new RegExp(ACTIVE_END, 'g'), '</mark>')
    .replace(new RegExp(TAG_START, 'g'), '<span class=\'html-tag\'>')
    .replace(new RegExp(TAG_END, 'g'), '</span>')
    .replace(new RegExp(ATTR_START, 'g'), '<span class=\'html-attr\'>')
    .replace(new RegExp(ATTR_END, 'g'), '</span>')
    .replace(new RegExp(STR_START, 'g'), '<span class=\'html-string\'>')
    .replace(new RegExp(STR_END, 'g'), '</span>');

  return highlighted;
}

export default function CodeDisplay({ code, selectedFilename, activeSourceType }: CodeDisplayProps) {
  const highlightedCode = useMemo(
    () => highlightHTML(code, selectedFilename, activeSourceType),
    [code, selectedFilename, activeSourceType]
  );

  return (
    <div className="srcset-code-panel">
      <div className="srcset-code-header">Code HTML{activeSourceType && ' avec <picture>'}</div>
      <pre>
        <code
          className="language-html"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}