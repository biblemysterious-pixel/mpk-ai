import React, { useState } from 'react';
import { marked, Token, Tokens } from 'marked';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayLang = (language || 'code').trim().toLowerCase();

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950/80 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/90 border-b border-neutral-800 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
          <span className="uppercase tracking-wider font-semibold text-neutral-300">
            {displayLang}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code"
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors text-xs font-sans cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono text-neutral-200">
        <pre className="selection:bg-neutral-800 selection:text-neutral-100 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  if (!content) return null;

  try {
    const tokens: Token[] = marked.lexer(content, {
      gfm: true,
      breaks: true,
    });

    return (
      <div className="space-y-3.5 leading-relaxed text-[15px] break-words">
        {tokens.map((token, index) => {
          if (token.type === 'code') {
            const codeToken = token as Tokens.Code;
            return (
              <CodeBlock
                key={`code-${index}`}
                language={codeToken.lang}
                code={codeToken.text}
              />
            );
          }

          if (token.type === 'heading') {
            const h = token as Tokens.Heading;
            const headingHtml = marked.parseInline(h.text);
            const headingContent = (
              <span dangerouslySetInnerHTML={{ __html: headingHtml }} />
            );

            if (h.depth === 1) {
              return (
                <h1
                  key={index}
                  className="text-xl sm:text-2xl font-bold text-neutral-100 mt-5 mb-3 tracking-tight"
                >
                  {headingContent}
                </h1>
              );
            }
            if (h.depth === 2) {
              return (
                <h2
                  key={index}
                  className="text-lg sm:text-xl font-semibold text-neutral-100 mt-4 mb-2 tracking-tight"
                >
                  {headingContent}
                </h2>
              );
            }
            if (h.depth === 3) {
              return (
                <h3
                  key={index}
                  className="text-base sm:text-lg font-semibold text-neutral-200 mt-3 mb-1.5"
                >
                  {headingContent}
                </h3>
              );
            }
            return (
              <h4
                key={index}
                className="text-sm sm:text-base font-semibold text-neutral-200 mt-2.5 mb-1"
              >
                {headingContent}
              </h4>
            );
          }

          if (token.type === 'paragraph') {
            const p = token as Tokens.Paragraph;
            const pHtml = marked.parseInline(p.text);
            return (
              <p
                key={index}
                className="text-neutral-200 leading-relaxed font-normal"
                dangerouslySetInnerHTML={{ __html: pHtml }}
              />
            );
          }

          if (token.type === 'list') {
            const list = token as Tokens.List;
            return (
              <div key={index} className="my-2.5 pl-2">
                {list.ordered ? (
                  <ol className="list-decimal list-outside pl-4 space-y-1.5 text-neutral-200">
                    {list.items.map((item, itemIdx) => {
                      const itemHtml = marked.parseInline(item.text);
                      return (
                        <li
                          key={itemIdx}
                          className="leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: itemHtml }}
                        />
                      );
                    })}
                  </ol>
                ) : (
                  <ul className="list-disc list-outside pl-4 space-y-1.5 text-neutral-200">
                    {list.items.map((item, itemIdx) => {
                      const itemHtml = marked.parseInline(item.text);
                      return (
                        <li
                          key={itemIdx}
                          className="leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: itemHtml }}
                        />
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          if (token.type === 'blockquote') {
            const bq = token as Tokens.Blockquote;
            const bqHtml = marked.parse(bq.text) as string;
            return (
              <blockquote
                key={index}
                className="my-3 pl-4 border-l-2 border-indigo-500/60 italic text-neutral-300 bg-neutral-900/40 py-1.5 rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: bqHtml }}
              />
            );
          }

          if (token.type === 'table') {
            const tbl = token as Tokens.Table;
            return (
              <div
                key={index}
                className="my-4 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40"
              >
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-neutral-800/60 border-b border-neutral-700/60 text-neutral-200 font-semibold">
                    <tr>
                      {tbl.header.map((head, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-4 py-2.5"
                          dangerouslySetInnerHTML={{
                            __html: marked.parseInline(head.text),
                          }}
                        />
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {tbl.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-neutral-800/20">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-4 py-2.5"
                            dangerouslySetInnerHTML={{
                              __html: marked.parseInline(cell.text),
                            }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          if (token.type === 'hr') {
            return (
              <hr
                key={index}
                className="my-5 border-t border-neutral-800/80"
              />
            );
          }

          // Fallback token rendering using marked.parse
          const rawParsed = marked.parse(token.raw) as string;
          return (
            <div
              key={index}
              className="text-neutral-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: rawParsed }}
            />
          );
        })}
      </div>
    );
  } catch (err) {
    console.error('Markdown rendering error, falling back to raw text:', err);
    return <div className="whitespace-pre-wrap text-neutral-200">{content}</div>;
  }
};
