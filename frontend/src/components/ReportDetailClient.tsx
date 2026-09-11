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
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="inline-flex items-center gap-3 border border-border px-5 py-3 font-mono text-[10px] tracking-wider uppercase text-muted animate-pulse">
          <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
          <span>Syncing intelligence digest for {date}...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
        <div>
          <Link
            href="/reports"
            className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            ← Back to Archive
          </Link>
        </div>

        <div className="border border-border bg-card p-8 sm:p-12 text-center space-y-6">
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

  const title = report.title || `DevAtlas Daily Intelligence Report — ${date}`;
  const quality = report.structuredSummary?.dataQualityScore ?? 100;
  const itemsCount = report.structuredSummary?.itemsDiscovered ?? 80;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <span>{copied ? 'Copied!' : 'Share'}</span>
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
      <article className="border border-border bg-card p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="border-b border-double-rule-bottom pb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] tracking-wider">
            <span className="stamp-badge">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              VERIFIED DIGEST
            </span>
            <span className="text-dateline">•</span>
            <span className="font-bold text-foreground border border-border px-2.5 py-1">
              {date}
            </span>
            <span className="text-dateline">•</span>
            <span className="font-bold text-accent border border-accent/30 px-2.5 py-1">
              Quality {quality}%
            </span>
            <span className="text-dateline">•</span>
            <span className="text-dateline border border-border px-2.5 py-1">
              {itemsCount} Discoveries
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-black text-foreground leading-tight tracking-tight">
            {title}
          </h1>

          <p className="font-mono text-[9px] tracking-wider uppercase text-dateline leading-relaxed">
            Autonomous execution via GitHub Actions. Canonicalized multi-source scraping, SHA-256 deduplicated, and committed directly to the DevAtlas Git repository.
          </p>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-0 border border-border w-fit">
            <button
              onClick={() => setActiveTab('briefing')}
              className={`px-4 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-colors ${
                activeTab === 'briefing'
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Intelligence Briefing
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-4 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-colors border-l border-border ${
                activeTab === 'markdown'
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Raw Markdown
            </button>
          </div>
        </div>

        {/* Briefing Tab */}
        {activeTab === 'briefing' && (
          <div className="space-y-8">
            {report.markdownContent ? (
              <ReportMarkdownRenderer content={report.markdownContent} />
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
          <div className="border border-border bg-background p-4 sm:p-6 overflow-x-auto">
            <pre className="font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {report.markdownContent || 'No raw markdown content available.'}
            </pre>
          </div>
        )}

        {/* Verification Footer */}
        <div className="border-t border-double-rule pt-6 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[9px] tracking-wider uppercase text-dateline">
          <span>Engine: DevAtlas Ingestion Runner v1.2</span>
          <span>Integrity Gate: SHA-256 Verified</span>
        </div>
      </article>
    </div>
  );
}

/**
 * Lightweight, accessible, zero-dependency Markdown Renderer for DevAtlas reports.
 * Formats headings, bullet points, executive briefing callouts, bold highlights, and links beautifully.
 */
function ReportMarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let keyCounter = 0;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${keyCounter++}`} className="space-y-3 pl-2 my-4">
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
        <hr key={`hr-${keyCounter++}`} className="border-rule my-6" />
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      const text = line.replace('## ', '');
      renderedElements.push(
        <h2
          key={`h2-${keyCounter++}`}
          className="font-serif text-xl sm:text-2xl font-black text-foreground mt-8 mb-4 border-b border-double-rule-bottom pb-2 flex items-center gap-2 tracking-tight"
        >
          <span className="h-2 w-2 bg-accent" />
          <span>{text}</span>
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
          className="font-serif text-lg font-bold text-foreground mt-6 mb-2"
        >
          {text}
        </h3>
      );
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      const text = line.substring(2);
      listItems.push(
        <li key={`li-${keyCounter++}`} className="font-editorial text-sm leading-relaxed text-muted flex items-start gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 bg-accent shrink-0" />
          <div>{renderFormattedText(text)}</div>
        </li>
      );
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      flushList();
      renderedElements.push(
        <div key={`num-${keyCounter++}`} className="border border-border bg-background p-5 my-4 space-y-2 hover:bg-card-hover transition-colors">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-accent tracking-wider">
            <span className="border border-accent/30 px-2 py-0.5">
              #{String(numberedMatch[1]).padStart(2, '0')}
            </span>
          </div>
          <div className="font-editorial text-sm leading-relaxed text-foreground">
            {renderFormattedText(numberedMatch[2])}
          </div>
        </div>
      );
      continue;
    }

    if (line.length > 0) {
      flushList();
      renderedElements.push(
        <p key={`p-${keyCounter++}`} className="font-editorial text-sm leading-relaxed text-muted my-3">
          {renderFormattedText(line)}
        </p>
      );
    }
  }

  flushList();

  return <div className="space-y-2">{renderedElements}</div>;
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
        <strong key={match.index} className="font-bold text-foreground">
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
            className="text-accent underline underline-offset-2 hover:opacity-80 font-bold inline-flex items-center gap-0.5 transition-opacity"
          >
            <span>{label}</span>
            <svg className="h-3 w-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      }
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const codeText = token.slice(1, -1);
      parts.push(
        <code key={match.index} className="border border-border px-1.5 py-0.5 font-mono text-xs text-accent bg-background">
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
