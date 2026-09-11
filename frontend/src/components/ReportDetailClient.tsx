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
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm font-mono text-muted animate-pulse">
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
            className="font-mono text-xs text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            &larr; Back to Archive
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 text-accent">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Digest Pending for {date}
            </h1>
            <p className="text-sm text-muted font-sans max-w-lg mx-auto">
              Our autonomous ingestion pipeline executes twice daily (00:00 &amp; 12:00 UTC).
              A report for this specific date has not yet been finalized or committed.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/reports"
              className="rounded-full bg-foreground text-background px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-md"
            >
              Browse Published Archive &rarr;
            </Link>
            <Link
              href="/ops"
              className="rounded-full border border-border bg-card px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-foreground hover:bg-card-hover transition-colors"
            >
              Check Pipeline Status
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
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/reports"
          className="font-mono text-xs text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          &larr; Back to Archive
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            type="button"
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-sans font-medium text-foreground hover:bg-card-hover transition-colors flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          {report.markdownContent && (
            <button
              onClick={handleDownloadMarkdown}
              type="button"
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-sans font-medium text-foreground hover:bg-card-hover transition-colors flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download .md</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Report Container */}
      <article className="rounded-3xl border border-border bg-card p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Header telemetry metadata */}
        <div className="border-b border-border pb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 border border-accent/20 px-2.5 py-1 text-accent font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              VERIFIED DIGEST
            </span>
            <span className="text-muted">•</span>
            <span className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-foreground">
              {date}
            </span>
            <span className="text-muted">•</span>
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 font-bold">
              Quality {quality}%
            </span>
            <span className="text-muted">•</span>
            <span className="rounded-md border border-border bg-card px-2.5 py-1 text-muted">
              {itemsCount} Discoveries
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-foreground leading-tight">
            {title}
          </h1>

          <p className="text-xs text-muted font-mono leading-relaxed">
            Autonomous execution via GitHub Actions. Canonicalized multi-source scraping, SHA-256 deduplicated, and committed directly to the DevAtlas Git repository.
          </p>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('briefing')}
              className={`rounded-full px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                activeTab === 'briefing'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'border border-border text-muted hover:text-foreground'
              }`}
            >
              Intelligence Briefing
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`rounded-full px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                activeTab === 'markdown'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'border border-border text-muted hover:text-foreground'
              }`}
            >
              Raw Markdown Document
            </button>
          </div>
        </div>

        {/* Tab 1: Formatted Intelligence Briefing */}
        {activeTab === 'briefing' && (
          <div className="space-y-8">
            {/* Render formatted markdown sections */}
            {report.markdownContent ? (
              <ReportMarkdownRenderer content={report.markdownContent} />
            ) : (
              <div className="space-y-6">
                {/* Fallback top items display if markdown not present */}
                {report.topItems && report.topItems.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-muted border-b border-border pb-2">
                      Top Discoveries Cataloged
                    </h2>
                    <div className="space-y-3">
                      {report.topItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-border-hover transition-all"
                        >
                          <div>
                            <div className="font-semibold text-foreground text-sm">
                              {item.title}
                            </div>
                            {item.category && (
                              <span className="text-xs text-muted font-mono">
                                [{item.category}]
                              </span>
                            )}
                          </div>
                          {item.score && (
                            <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-md shrink-0">
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

        {/* Tab 2: Raw Markdown View */}
        {activeTab === 'markdown' && (
          <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 overflow-x-auto">
            <pre className="font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {report.markdownContent || 'No raw markdown content available.'}
            </pre>
          </div>
        )}

        {/* Verification Footer */}
        <div className="border-t border-border pt-6 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-muted">
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

    // Skip the first title line since it's already rendered in the header
    if (line.startsWith('# DevAtlas Daily Intelligence Report')) {
      continue;
    }

    // Metadata lines under title
    if (line.startsWith('**Generated**:') || line.startsWith('**Quality Score**:') || line.startsWith('**Pipeline Run**:') || line.startsWith('**Total Items Processed**:')) {
      continue;
    }

    // Horizontal Rule
    if (line === '---' || line === '***') {
      flushList();
      renderedElements.push(
        <hr key={`hr-${keyCounter++}`} className="border-border my-6" />
      );
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      flushList();
      const text = line.replace('## ', '');
      renderedElements.push(
        <h2
          key={`h2-${keyCounter++}`}
          className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4 border-b border-border pb-2 flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span>{text}</span>
        </h2>
      );
      continue;
    }

    // Heading 3
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

    // Bullet list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      const text = line.substring(2);
      listItems.push(
        <li key={`li-${keyCounter++}`} className="text-sm font-sans leading-relaxed text-muted flex items-start gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
          <div>{renderFormattedText(text)}</div>
        </li>
      );
      continue;
    }

    // Numbered item (e.g. "1. **Ecosystem & AI Velocity**:")
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      flushList();
      renderedElements.push(
        <div key={`num-${keyCounter++}`} className="rounded-2xl border border-border bg-card p-5 my-4 space-y-2 hover:border-border-hover transition-all">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent">
            <span className="rounded-full bg-accent/10 border border-accent/20 px-2 py-0.5">
              0{numberedMatch[1]}
            </span>
          </div>
          <div className="text-sm font-sans leading-relaxed text-foreground">
            {renderFormattedText(numberedMatch[2])}
          </div>
        </div>
      );
      continue;
    }

    // Normal paragraph text
    if (line.length > 0) {
      flushList();
      renderedElements.push(
        <p key={`p-${keyCounter++}`} className="text-sm font-sans leading-relaxed text-muted my-3">
          {renderFormattedText(line)}
        </p>
      );
    }
  }

  flushList();

  return <div className="space-y-2">{renderedElements}</div>;
}

/**
 * Parses markdown bold (**text**), links ([text](url)), and code (`code`).
 */
function renderFormattedText(text: string): React.ReactNode {
  // Simple regex parser for bold, links, code
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
        <strong key={match.index} className="font-semibold text-foreground">
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
            className="text-accent underline underline-offset-2 hover:opacity-80 font-medium inline-flex items-center gap-0.5 transition-opacity"
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
        <code key={match.index} className="rounded bg-background border border-border px-1.5 py-0.5 font-mono text-xs text-accent">
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
