type PaperSkeletonProps = {
  variant?: 'edition' | 'listing';
};

/** Newspaper-shaped loading state used for route changes and uncached editions. */
export function PaperSkeleton({ variant = 'edition' }: PaperSkeletonProps) {
  return (
    <section className={`paper-skeleton paper-skeleton-${variant}`} role="status" aria-live="polite" aria-busy="true" aria-label="Loading the edition">
      <span className="sr-only">Loading the daily edition…</span>
      <div className="skeleton-dateline">
        <span className="skeleton-block skeleton-kicker" />
        <span className="skeleton-block skeleton-date" />
      </div>
      <div className="skeleton-paper-grid">
        <div className="skeleton-main-column">
          <span className="skeleton-block skeleton-category" />
          <span className="skeleton-block skeleton-headline" />
          <span className="skeleton-block skeleton-headline skeleton-headline-short" />
          <span className="skeleton-block skeleton-deck" />
          <span className="skeleton-block skeleton-deck skeleton-deck-short" />
          <div className="skeleton-byline">
            <span className="skeleton-block skeleton-meta" />
            <span className="skeleton-block skeleton-meta skeleton-meta-short" />
          </div>
          <span className="skeleton-block skeleton-art" />
        </div>
        <aside className="skeleton-briefing" aria-hidden="true">
          <span className="skeleton-block skeleton-aside-title" />
          {[0, 1, 2].map((item) => (
            <div className="skeleton-briefing-item" key={item}>
              <span className="skeleton-block skeleton-category" />
              <span className="skeleton-block skeleton-briefing-line" />
              <span className="skeleton-block skeleton-briefing-line skeleton-briefing-short" />
            </div>
          ))}
        </aside>
      </div>
      <div className="skeleton-lower" aria-hidden="true">
        <span className="skeleton-block skeleton-section-title" />
        <div className="skeleton-lower-grid">
          {[0, 1, 2].map((item) => <span className="skeleton-block skeleton-card" key={item} />)}
        </div>
      </div>
    </section>
  );
}
