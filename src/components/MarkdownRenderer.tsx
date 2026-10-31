import React from 'react';

export type ReadingTheme = 'sepia' | 'light' | 'dark';
export type DirectionMode = 'auto' | 'rtl' | 'ltr';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  theme?: ReadingTheme;
  forceDirection?: DirectionMode;
}

/**
 * Detects whether a string is primarily Arabic/Darija or primarily Latin/English.
 * Follows the user rule:
 * "إذا شفتي أن الأغلبية ديال الحروف كاينين باللغة العربية، خلي دوك الكلمات ديال اللاتينية هما اللي كاينين الوسط. الفورمات ولا الطريقة باش مكتوب داك الشيء يكون غادي من اليمين لليسار."
 * If significant Arabic letters exist (>= 3 chars, or >= 12% of alphabetics), direction is RTL.
 */
export function detectTextDirection(text: string, force?: DirectionMode): 'rtl' | 'ltr' {
  if (force === 'rtl') return 'rtl';
  if (force === 'ltr') return 'ltr';
  if (!text) return 'ltr';

  // Strip markdown markers, numbers, emojis, punctuation
  const clean = text.replace(/[*_#`\[\]()>~:\-0-9\s.,!?"'«»/|@=+\\^$;{}]/g, '');
  if (!clean) return 'ltr';

  // Arabic characters unicode block
  const arabicMatches = clean.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;

  // If there are at least 3 Arabic letters, or Arabic count is > 12% of alphabetical characters:
  if (arabicCount >= 3 || (arabicCount > 0 && arabicCount / clean.length >= 0.12)) {
    return 'rtl';
  }

  return 'ltr';
}

/**
 * Wraps embedded Latin phrases, numbers with units (e.g. +40,000 DH, 83K),
 * and parenthetical Latin words inside an RTL text run with <bdi dir="ltr">
 * so that surrounding Arabic punctuation (quotes, colons, parentheses) does not flip or distort.
 */
function renderTextWithLatinIsolates(
  text: string,
  isContainerRtl: boolean,
  theme: ReadingTheme
): React.ReactNode[] {
  if (!isContainerRtl) {
    return [text];
  }

  // Regex matching Latin capsules:
  // 1. Parenthetical Latin: e.g. (Target Profile & Audit), (The Monetization Gap), (Identity)
  // 2. Numbers with units: e.g. +40,000 DH, 400 DH, 83K, 60k, 75%, 39€
  // 3. Quotes with Latin: e.g. "DM « COACHING » pour commencer"
  // 4. Consecutive Latin phrases: e.g. Growth Operator, Skool, Men’s Transformation...
  const isolateRegex = /(\([a-zA-Z0-9\s,&'’/+\-%#.:!]+\)|"[^"]*[a-zA-Z][^"]*"|'[^']*[a-zA-Z][^']*'|[+]?[0-9,.]+\s*(?:DH|EUR|USD|K|M|k|m|%|\$|€|£)?|[a-zA-Z][a-zA-Z0-9\s,&'’/+\-%#.:]*[a-zA-Z0-9]|[a-zA-Z])/g;

  const parts = text.split(isolateRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Check if this part is an isolated Latin run
    const hasLatin = /[a-zA-Z]/.test(part);
    const hasArabic = /[\u0600-\u06FF]/.test(part);

    if (hasLatin && !hasArabic) {
      return (
        <bdi
          key={`iso_${idx}`}
          dir="ltr"
          className="inline px-0.5 font-medium tracking-normal"
        >
          {part}
        </bdi>
      );
    }

    return <React.Fragment key={`txt_${idx}`}>{part}</React.Fragment>;
  });
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and links.
 * Isolates mixed BiDi tokens cleanly and applies high-contrast theme typography.
 */
function renderInlineMarkdown(
  text: string,
  isRtl: boolean,
  theme: ReadingTheme
): React.ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  // Theme-specific styles
  const strongClass =
    theme === 'sepia'
      ? 'text-[#2D1402] font-black'
      : theme === 'light'
        ? 'text-[#0F172A] font-extrabold'
        : 'text-amber-300 font-bold';

  const italicClass =
    theme === 'sepia'
      ? 'italic font-semibold text-[#422207]'
      : theme === 'light'
        ? 'italic font-medium text-neutral-800'
        : 'italic font-medium text-amber-200';

  const codeClass =
    theme === 'sepia'
      ? 'font-mono text-[0.88em] px-2 py-0.5 rounded border border-[#C6B69E] bg-[#EBE2D0] text-[#1C160F] font-bold shadow-xs inline-block mx-0.5'
      : theme === 'light'
        ? 'font-mono text-[0.88em] px-2 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-900 font-bold shadow-xs inline-block mx-0.5'
        : 'font-mono text-[0.88em] px-2 py-0.5 rounded border border-neutral-700 bg-neutral-800 text-amber-200 font-bold shadow-xs inline-block mx-0.5';

  const linkClass =
    theme === 'sepia'
      ? 'text-blue-800 underline font-semibold hover:opacity-80'
      : theme === 'light'
        ? 'text-blue-700 underline font-semibold hover:opacity-80'
        : 'text-blue-400 underline font-semibold hover:opacity-80';

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      const innerDir = detectTextDirection(inner);
      return (
        <strong key={`b_${index}`} className={strongClass}>
          <bdi dir={innerDir}>
            {renderTextWithLatinIsolates(inner, isRtl, theme)}
          </bdi>
        </strong>
      );
    }

    // Italic *...*
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const inner = part.slice(1, -1);
      const innerDir = detectTextDirection(inner);
      return (
        <em key={`i_${index}`} className={italicClass}>
          <bdi dir={innerDir}>
            {renderTextWithLatinIsolates(inner, isRtl, theme)}
          </bdi>
        </em>
      );
    }

    // Code `...`
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <bdi key={`c_${index}`} dir="ltr">
          <code className={codeClass}>
            {inner}
          </code>
        </bdi>
      );
    }

    // Link [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url = linkMatch[2];
      return (
        <a
          key={`l_${index}`}
          href={url}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
          dir={detectTextDirection(label)}
        >
          <bdi>{label}</bdi>
        </a>
      );
    }

    // Regular plain text
    return (
      <React.Fragment key={`p_${index}`}>
        {renderTextWithLatinIsolates(part, isRtl, theme)}
      </React.Fragment>
    );
  });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  fontSize = 'lg',
  theme = 'sepia',
  forceDirection = 'auto',
}) => {
  if (!content || !content.trim()) {
    return (
      <div className="py-12 text-center opacity-60 font-mono text-sm">
        No Dossier Markdown text added yet. Paste Markdown content to display here.
      </div>
    );
  }

  const fontClasses: Record<string, string> = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
    '2xl': 'text-2xl leading-loose',
  };

  // Color mappings based on active reading theme
  const themeColors = {
    sepia: {
      h1: 'text-[#1C160F] border-[#C8B89E]',
      h2: 'text-[#3B1904] border-[#D9CEB8]',
      h3: 'text-[#1C160F]',
      h4: 'text-[#3B1904]',
      h5: 'text-[#4A2306]',
      quoteBg: 'bg-[#F2E8D5] text-[#1C160F]',
      quoteBorder: 'border-[#7C4A1D]',
      bullet: 'bg-[#7C4A1D]',
      numbers: 'text-[#5C2E0B]',
      hr: 'border-[#C8B89E]',
    },
    light: {
      h1: 'text-[#111111] border-neutral-300',
      h2: 'text-[#0F172A] border-neutral-200',
      h3: 'text-[#111111]',
      h4: 'text-[#1E293B]',
      h5: 'text-[#334155]',
      quoteBg: 'bg-neutral-100 text-neutral-900',
      quoteBorder: 'border-neutral-800',
      bullet: 'bg-neutral-800',
      numbers: 'text-black',
      hr: 'border-neutral-300',
    },
    dark: {
      h1: 'text-white border-neutral-700',
      h2: 'text-amber-400 border-neutral-800',
      h3: 'text-white',
      h4: 'text-amber-300',
      h5: 'text-amber-200',
      quoteBg: 'bg-neutral-900/90 text-neutral-100',
      quoteBorder: 'border-amber-500',
      bullet: 'bg-amber-400',
      numbers: 'text-amber-400',
      hr: 'border-neutral-700',
    },
  }[theme];

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  // Blockquote state
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  // Flush blockquote helper
  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      // Group contiguous lines into paragraphs separated by empty lines
      const paragraphs: string[] = [];
      let currentPara: string[] = [];

      blockquoteLines.forEach((l) => {
        if (!l.trim()) {
          if (currentPara.length > 0) {
            paragraphs.push(currentPara.join(' '));
            currentPara = [];
          }
        } else {
          currentPara.push(l);
        }
      });
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
      }

      // Detect general direction of the entire quote block
      const fullQuoteText = blockquoteLines.join(' ');
      const isQuoteRtl = detectTextDirection(fullQuoteText, forceDirection) === 'rtl';

      elements.push(
        <blockquote
          key={`bq_${elements.length}`}
          className={`my-4 p-4.5 rounded-lg shadow-xs font-sans ${themeColors.quoteBg} ${
            isQuoteRtl
              ? `border-r-4 ${themeColors.quoteBorder} pr-5 pl-4 text-right rounded-l-lg rounded-r-none`
              : `border-l-4 ${themeColors.quoteBorder} pl-5 pr-4 text-left rounded-r-lg rounded-l-none`
          }`}
          dir={isQuoteRtl ? 'rtl' : 'ltr'}
        >
          <div className="space-y-3">
            {paragraphs.map((para, pIdx) => {
              const paraDir = detectTextDirection(para, forceDirection);
              const isParaRtl = paraDir === 'rtl';
              return (
                <p
                  key={pIdx}
                  className={`leading-relaxed text-inherit font-normal ${
                    isParaRtl ? 'text-right' : 'text-left'
                  }`}
                  dir={paraDir}
                >
                  {renderInlineMarkdown(para, isParaRtl, theme)}
                </p>
              );
            })}
          </div>
        </blockquote>
      );
      blockquoteLines = [];
    }
    inBlockquote = false;
  };

  lines.forEach((line, idx) => {
    const rawTrimmed = line.trim();

    // Check Blockquote (> )
    if (rawTrimmed.startsWith('>')) {
      inBlockquote = true;
      blockquoteLines.push(rawTrimmed.replace(/^>\s?/, ''));
      return;
    } else if (inBlockquote && rawTrimmed !== '') {
      // Check if subsequent non-prefixed lines belong to quote (markdown quote continuation)
      // If starts with heading or list, flush quote first
      if (/^#{1,6}\s+/.test(rawTrimmed) || /^[*|-]\s+/.test(rawTrimmed) || /^\d+\.\s+/.test(rawTrimmed)) {
        flushBlockquote();
      } else {
        blockquoteLines.push(rawTrimmed);
        return;
      }
    } else if (inBlockquote && rawTrimmed === '') {
      // Empty line could be within blockquote; we only flush if the next line is not a blockquote
      const nextLine = lines[idx + 1]?.trim() || '';
      if (!nextLine.startsWith('>')) {
        flushBlockquote();
      } else {
        blockquoteLines.push('');
        return;
      }
    }

    if (inBlockquote) flushBlockquote();

    // Empty line spacer
    if (rawTrimmed === '') {
      elements.push(<div key={`sp_${idx}`} className="h-3" />);
      return;
    }

    // Horizontal Rule (---, ***, ___)
    if (rawTrimmed === '---' || rawTrimmed === '***' || rawTrimmed === '___') {
      elements.push(
        <hr
          key={`hr_${idx}`}
          className={`my-6 border-t-2 border-dashed ${themeColors.hr}`}
        />
      );
      return;
    }

    // Headings: H1 through H6
    const headingMatch = rawTrimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingContent = headingMatch[2];
      const isHeadingRtl = detectTextDirection(headingContent, forceDirection) === 'rtl';

      if (level === 1) {
        elements.push(
          <h1
            key={`h1_${idx}`}
            className={`text-2xl sm:text-3xl font-serif font-black tracking-tight my-6 pb-2 border-b-2 ${
              themeColors.h1
            } ${isHeadingRtl ? 'text-right' : 'text-left'}`}
            dir={isHeadingRtl ? 'rtl' : 'ltr'}
          >
            {renderInlineMarkdown(headingContent, isHeadingRtl, theme)}
          </h1>
        );
        return;
      }

      if (level === 2) {
        elements.push(
          <h2
            key={`h2_${idx}`}
            className={`text-xl sm:text-2xl font-serif font-bold tracking-tight mt-7 mb-3 border-b pb-1 ${
              themeColors.h2
            } ${isHeadingRtl ? 'text-right' : 'text-left'}`}
            dir={isHeadingRtl ? 'rtl' : 'ltr'}
          >
            {renderInlineMarkdown(headingContent, isHeadingRtl, theme)}
          </h2>
        );
        return;
      }

      if (level === 3) {
        elements.push(
          <h3
            key={`h3_${idx}`}
            className={`text-lg sm:text-xl font-sans font-extrabold tracking-tight mt-6 mb-2.5 ${
              themeColors.h3
            } ${isHeadingRtl ? 'text-right' : 'text-left'}`}
            dir={isHeadingRtl ? 'rtl' : 'ltr'}
          >
            {renderInlineMarkdown(headingContent, isHeadingRtl, theme)}
          </h3>
        );
        return;
      }

      if (level === 4) {
        // H4 heading (Fixes raw #### from user screenshot!)
        elements.push(
          <h4
            key={`h4_${idx}`}
            className={`text-base sm:text-lg font-sans font-bold tracking-tight mt-5 mb-2 ${
              themeColors.h4
            } ${isHeadingRtl ? 'text-right' : 'text-left'}`}
            dir={isHeadingRtl ? 'rtl' : 'ltr'}
          >
            {renderInlineMarkdown(headingContent, isHeadingRtl, theme)}
          </h4>
        );
        return;
      }

      if (level >= 5) {
        elements.push(
          <h5
            key={`h5_${idx}`}
            className={`text-sm sm:text-base font-sans font-bold tracking-tight mt-4 mb-1.5 ${
              themeColors.h5
            } ${isHeadingRtl ? 'text-right' : 'text-left'}`}
            dir={isHeadingRtl ? 'rtl' : 'ltr'}
          >
            {renderInlineMarkdown(headingContent, isHeadingRtl, theme)}
          </h5>
        );
        return;
      }
    }

    // Numbered List Items (1. , 2. , etc.)
    const numberMatch = rawTrimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      const num = numberMatch[1];
      const itemText = numberMatch[2];
      const isNumRtl = detectTextDirection(itemText, forceDirection) === 'rtl';

      elements.push(
        <div
          key={`num_${idx}`}
          className={`my-2 flex items-start gap-2.5 ${isNumRtl ? 'text-right' : 'text-left'}`}
          dir={isNumRtl ? 'rtl' : 'ltr'}
        >
          <span
            className={`font-mono font-black text-sm shrink-0 mt-0.5 select-none ${themeColors.numbers}`}
          >
            {num}.
          </span>
          <div className="flex-1 text-inherit font-normal leading-relaxed">
            {renderInlineMarkdown(itemText, isNumRtl, theme)}
          </div>
        </div>
      );
      return;
    }

    // Unordered List Items (* or -)
    const bulletMatch = rawTrimmed.match(/^([*|-])\s+(.*)$/);
    if (bulletMatch) {
      const itemText = bulletMatch[2];
      const isBulletRtl = detectTextDirection(itemText, forceDirection) === 'rtl';

      // Detect sub-indentation from raw un-trimmed line
      const leadingSpaces = line.search(/\S|$/);
      const isIndented = leadingSpaces >= 2;
      const indentClass = isIndented
        ? isBulletRtl
          ? 'mr-5 sm:mr-8'
          : 'ml-5 sm:ml-8'
        : '';

      elements.push(
        <div
          key={`li_${idx}`}
          className={`my-2 flex items-start gap-2.5 ${indentClass} ${
            isBulletRtl ? 'text-right' : 'text-left'
          }`}
          dir={isBulletRtl ? 'rtl' : 'ltr'}
        >
          <span
            className={`w-2 h-2 rounded-full mt-2.5 shrink-0 select-none ${themeColors.bullet}`}
          />
          <div className="flex-1 text-inherit font-normal leading-relaxed">
            {renderInlineMarkdown(itemText, isBulletRtl, theme)}
          </div>
        </div>
      );
      return;
    }

    // Regular Paragraph
    const isParaRtl = detectTextDirection(rawTrimmed, forceDirection) === 'rtl';
    elements.push(
      <p
        key={`p_${idx}`}
        className={`my-3 font-sans text-inherit font-normal leading-relaxed ${
          isParaRtl ? 'text-right' : 'text-left'
        }`}
        dir={isParaRtl ? 'rtl' : 'ltr'}
      >
        {renderInlineMarkdown(rawTrimmed, isParaRtl, theme)}
      </p>
    );
  });

  // Flush any lingering blockquote
  if (inBlockquote) flushBlockquote();

  return (
    <div
      className={`space-y-1 font-sans selection:bg-amber-300 selection:text-black ${fontClasses[fontSize]} ${className}`}
    >
      {elements}
    </div>
  );
};
