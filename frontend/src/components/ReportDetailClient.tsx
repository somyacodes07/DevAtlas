'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReportItem } from '@/lib/reports';

interface ReportDetailClientProps {
  initialReport: ReportItem | null;
  date: string;
}

export function ReportDetailClient({ initialReport, date }: ReportDetailClientProps) {
  const [report, setReport] = useState<ReportItem | null>(initialReport);
  const [loading, setLoading] = useState<boolean>(!initialReport);
  const [activeTab, setActiveTab] = useState<'briefing' | 'markdown'>('briefing');
  const [copied, setCopied] = useState<boolean>(false);

  // If report wasn't available at build time, fetch it client-side from the API
  useEffect(() => {
    if (!report) {
      let isMounted = true;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://devatlas-api.somyacodes.workers.dev/api/v1';
      fetch(`${apiUrl}/reports/${date}`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then((json) => {
          if (isMounted && json.data) {
            setReport(json.data);
          }
        })
        .catch(() => {
          // Keep null if truly not found
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [date, report]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!report?.markdownContent) return;
    const blob = new Blob([report.markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devatlas-report-${date}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 xl:px-12 py-12 text-center">
        <div className="inline-flex items-center gap-3 border border-border px-5 py-3 font-mono text-[10px] tracking-wider uppercase text-muted animate-pulse">
          <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
          <span>Syncing intelligence digest for {date}...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="w-full px-4 md:px-8 xl:px-12 py-12 space-y-6">
        <div>
          <Link
            href="/reports"
            className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            ← Back to Archive
          </Link>
        </div>

        <div className="border border-border bg-card p-8 sm:p-12 text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex h-16 w-16 items-center justify-center border border-border text-accent">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-foreground">
              Digest Pending for {date}
            </h1>
            <p className="font-editorial text-sm text-muted max-w-lg mx-auto leading-relaxed">
              Our autonomous ingestion pipeline executes twice daily (00:00 &amp; 12:00 UTC).
              A report for this specific date has not yet been finalized or committed.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/reports" className="tear-off-btn">
              BROWSE ARCHIVE →
            </Link>
            <Link href="/ops" className="tear-off-btn">
              PIPELINE STATUS →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rawTitle = report.title || `DevAtlas Daily Intelligence Report — ${date}`;
  // Strip "DevAtlas Daily Intelligence Report —" prefix if it exists to make a punchier newspaper headline
  const headline = rawTitle.replace(/^DevAtlas Daily Intelligence Report —\s*/i, '');
  
  const quality = report.structuredSummary?.dataQualityScore ?? 100;
  const itemsCount = report.structuredSummary?.itemsDiscovered ?? 80;

  return (
    <div className="w-full px-4 md:px-8 xl:px-12 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <Link
          href="/reports"
          className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          ← Back to Archive
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            type="button"
            className="border border-border px-3.5 py-1.5 font-mono text-[10px] tracking-wider uppercase text-foreground hover:bg-card-hover transition-colors flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copied ? 'Copied!' : 'Share Dispatch'}</span>
          </button>

          {report.markdownContent && (
            <button
              onClick={handleDownloadMarkdown}
              type="button"
              className="border border-border px-3.5 py-1.5 font-mono text-[10px] tracking-wider uppercase text-foreground hover:bg-card-hover transition-colors flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download .md</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Report — Editorial Article Spread */}
      <article className="border border-border bg-card">
        {/* Massive Editorial Header */}
        <header className="px-6 py-12 sm:px-12 sm:py-16 text-center space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] tracking-wider">
            <span className="stamp-badge">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              VERIFIED DIGEST
            </span>
            <span className="text-dateline">•</span>
            <span className="font-bold text-foreground border border-border px-2.5 py-1">
              VOL. {date.replace(/-/g, '.')}
            </span>
            <span className="text-dateline">•</span>
            <span className="font-bold text-accent border border-accent/30 px-2.5 py-1">
              Q-SCORE {quality}%
            </span>
          </div>

          <div className="py-8 border-y-[3px] border-double-rule relative">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.85] tracking-tighter uppercase mx-auto max-w-[90%] break-words">
              {headline}
            </h1>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline mt-8 max-w-2xl mx-auto">
              Autonomous execution via GitHub Actions. SHA-256 deduplicated, and committed directly to the DevAtlas Git repository.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center gap-0 border border-border w-fit">
              <button
                onClick={() => setActiveTab('briefing')}
                className={`px-6 py-2 font-mono text-[10px] font-bold tracking-wider uppercase transition-colors ${
                  activeTab === 'briefing'
                    ? 'bg-foreground text-background'
                    : 'text-muted hover:text-foreground hover:bg-card-hover'
                }`}
              >
                Intelligence Briefing
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-6 py-2 font-mono text-[10px] font-bold tracking-wider uppercase transition-colors border-l border-border ${
                  activeTab === 'markdown'
                    ? 'bg-foreground text-background'
                    : 'text-muted hover:text-foreground hover:bg-card-hover'
                }`}
              >
                Raw Markdown
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="border-t border-border p-6 sm:p-12">
          {/* Briefing Tab (Multi-column Broadsheet) */}
          {activeTab === 'briefing' && (
            <div className="max-w-screen-2xl mx-auto">
              {report.markdownContent ? (
                <div className="columns-1 md:columns-2 xl:columns-3 gap-8 md:gap-12">
                  <ReportMarkdownRenderer content={report.markdownContent} />
                </div>
              ) : (
                <div className="space-y-6">
                  {report.topItems && report.topItems.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-dateline border-b border-rule pb-2">
                        Top Discoveries Cataloged
                      </h2>
                      <div className="space-y-0 border border-border">
                        {report.topItems.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-card-hover transition-colors ${
                              idx < report.topItems!.length - 1 ? 'border-b border-border' : ''
                            }`}
                          >
                            <div>
                              <div className="font-serif font-bold text-foreground text-sm">{item.title}</div>
                              {item.category && (
                                <span className="font-mono text-[9px] text-dateline tracking-wider uppercase">[{item.category}]</span>
                              )}
                            </div>
                            {item.score && (
                              <span className="font-mono text-[10px] font-bold text-accent border border-accent/30 px-2.5 py-1 shrink-0 tracking-wider">
                                Score {item.score}/100
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Raw Markdown Tab */}
          {activeTab === 'markdown' && (
            <div className="border border-border bg-background p-6 sm:p-10 overflow-x-auto max-w-screen-xl mx-auto">
              <pre className="font-mono text-[11px] sm:text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {report.markdownContent || 'No raw markdown content available.'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Imprint */}
        <footer className="border-t border-rule p-4 sm:p-6 bg-card-hover">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[9px] tracking-[0.15em] uppercase text-dateline text-center sm:text-left">
            <span>Engine: DevAtlas Ingestion Runner v1.2</span>
            <span>Integrity Gate: SHA-256 Verified • End of Dispatch</span>
          </div>
        </footer>
      </article>
    </div>
  );
}

/**
 * Editorial Markdown Renderer for DevAtlas reports.
 * Employs CSS multi-column layouts, justified text, drop caps, and newspaper typography.
 */
function ReportMarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let keyCounter = 0;
  let isFirstParagraph = true;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${keyCounter++}`} className="space-y-3 pl-2 my-5 break-inside-avoid">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line.startsWith('# DevAtlas Daily Intelligence Report')) continue;

    if (line.startsWith('**Generated**:') || line.startsWith('**Quality Score**:') || line.startsWith('**Pipeline Run**:') || line.startsWith('**Total Items Processed**:')) {
      continue;
    }

    if (line === '---' || line === '***') {
      flushList();
      renderedElements.push(
        <div key={`hr-${keyCounter++}`} className="w-full flex justify-center my-8 break-inside-avoid">
          <span className="font-serif text-lg tracking-[0.5em] text-rule text-center">⁂</span>
        </div>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      const text = line.replace('## ', '');
      renderedElements.push(
        <h2
          key={`h2-${keyCounter++}`}
          className="font-serif text-2xl sm:text-3xl font-black text-foreground mt-10 mb-4 border-b-[3px] border-double-rule-bottom pb-2 tracking-tight uppercase break-after-avoid"
        >
          {text}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      const text = line.replace('### ', '');
      renderedElements.push(
        <h3
          key={`h3-${keyCounter++}`}
          className="font-serif text-xl font-bold text-foreground mt-8 mb-3 uppercase tracking-wide break-after-avoid flex items-center gap-2"
        >
          <span className="h-1.5 w-1.5 bg-accent inline-block shrink-0" />
          {text}
        </h3>
      );
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      const text = line.substring(2);
      listItems.push(
        <li key={`li-${keyCounter++}`} className="font-editorial text-[15px] leading-[1.6] text-foreground flex items-start gap-3">
          <span className="mt-2 h-1 w-1 bg-foreground shrink-0 rounded-full" />
          <div className="text-justify">{renderFormattedText(text)}</div>
        </li>
      );
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      flushList();
      renderedElements.push(
        <div key={`num-${keyCounter++}`} className="border border-border bg-card-hover p-5 my-5 space-y-2 hover:bg-background transition-colors break-inside-avoid">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-accent tracking-wider">
            <span className="border border-accent/30 px-2 py-0.5 shadow-sm">
              ITEM #{String(numberedMatch[1]).padStart(2, '0')}
            </span>
          </div>
          <div className="font-editorial text-[15px] leading-[1.6] text-foreground text-justify">
            {renderFormattedText(numberedMatch[2])}
          </div>
        </div>
      );
      continue;
    }

    if (line.length > 0) {
      flushList();
      
      const dropCapClasses = isFirstParagraph 
        ? "first-letter:float-left first-letter:text-[5.5rem] sm:first-letter:text-[6.5rem] first-letter:font-black first-letter:font-serif first-letter:pr-3 first-letter:pt-2 first-letter:leading-[0.7] first-letter:text-foreground"
        : "";
        
      renderedElements.push(
        <p key={`p-${keyCounter++}`} className={`font-editorial text-[15px] leading-[1.6] text-foreground my-5 text-justify break-inside-avoid-page ${dropCapClasses}`}>
          {renderFormattedText(line)}
        </p>
      );
      isFirstParagraph = false;
    }
  }

  flushList();

  return <>{renderedElements}</>;
}

function renderFormattedText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|\`.*?\`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(
        <strong key={match.index} className="font-bold text-foreground tracking-tight">
          {boldText}
        </strong>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-bold text-foreground border-b-2 border-accent/40 hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-0.5"
          >
            {label}
            <svg className="h-[0.75em] w-[0.75em] inline opacity-70 ml-0.5 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      }
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const codeText = token.slice(1, -1);
      parts.push(
        <code key={match.index} className="border border-border/60 px-1 py-0.5 font-mono text-[0.85em] font-bold text-accent bg-card-hover rounded-sm">
          {codeText}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}
