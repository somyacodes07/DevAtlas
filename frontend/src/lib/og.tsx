import { ImageResponse } from 'next/og';
import type { ReactNode } from 'react';
import type { Edition } from '@/lib/data';
import { SITE_URL, longDate, num, slotName } from '@/lib/format';

/**
 * Link-preview cards, drawn as a newspaper front page at build time.
 * They render with satori (next/og), so only flexbox and a small CSS subset are
 * available. Fonts are fetched from Google Fonts subset to the exact text on
 * the card, which keeps each one a few kilobytes and the build fast.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = 'image/png';

const INK = '#1b1a18';
const SOFT = '#55524b';
const SPOT = '#b4271f';
const STOCK = { morning: '#e9e7e0', evening: '#dbe5d1' } as const;

const FACES = [
  { name: 'Plate', family: 'Manufacturing+Consent', weight: 400, style: 'normal' },
  { name: 'Serif', family: 'Newsreader:opsz,wght@72,800', weight: 800, style: 'normal' },
  { name: 'Serif', family: 'Newsreader:ital,opsz,wght@1,72,500', weight: 500, style: 'italic' },
  { name: 'Cond', family: 'Barlow+Condensed:wght@600', weight: 600, style: 'normal' },
] as const;

type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 | 800; style: 'normal' | 'italic' };

async function loadFonts(text: string): Promise<Font[]> {
  const glyphs = encodeURIComponent([...new Set(`The DevAtlas MORNING EVENING No. ${SITE_URL} ${text}0123456789.,:;'’“”-–—!?()&/+▲ `)].join(''));
  const fonts = await Promise.all(
    FACES.map(async (face) => {
      try {
        const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${face.family}&text=${glyphs}`)).text();
        const src = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1];
        if (!src) return null;
        return { name: face.name, data: await (await fetch(src)).arrayBuffer(), weight: face.weight, style: face.style } as Font;
      } catch {
        return null;
      }
    }),
  );
  // With no network the cards still build, in the renderer's built-in face.
  return fonts.filter((f): f is Font => f !== null);
}

export const clip = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, '').replace(/[\s,;:.–—-]+$/, '')}…`;

function Globe({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 6px' }}>
      <g fill="none" stroke={INK} strokeWidth="3" transform="rotate(-18 50 50)">
        <circle cx="50" cy="50" r="46" strokeWidth="4.2" />
        <ellipse cx="50" cy="50" rx="16" ry="46" />
        <ellipse cx="50" cy="50" rx="33" ry="46" />
        <path d="M50 4v92M4 50h92M10 28q40 14 80 0M10 72q40-14 80 0" />
      </g>
    </svg>
  );
}

function Rule({ heavy = false }: { heavy?: boolean }) {
  return heavy ? (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ height: 4, background: INK }} />
      <div style={{ height: 3 }} />
      <div style={{ height: 1.5, background: INK }} />
    </div>
  ) : (
    <div style={{ height: 1.5, width: '100%', background: INK }} />
  );
}

interface FrameProps {
  paper: Pick<Edition, 'date' | 'slot' | 'number'> | null;
  stats: string;
  children: ReactNode;
}

function Frame({ paper, stats, children }: FrameProps) {
  const host = SITE_URL.replace(/^https?:\/\//, '');
  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', color: INK,
        backgroundColor: STOCK[paper?.slot ?? 'morning'],
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(27,26,24,0.06) 1px, transparent 1.5px)',
        backgroundSize: '7px 7px', padding: '30px 56px 0', fontFamily: 'Serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 104 }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 230, fontFamily: 'Cond', fontSize: 22, lineHeight: 1.2 }}>
          <span>{paper ? longDate(paper.date) : 'Printed twice a day'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Plate', fontSize: 84, lineHeight: 1 }}>
          <span>The Dev</span>
          <Globe size={66} />
          <span>Atlas</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: 230 }}>
          {paper ? (
            <div
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: 112, height: 112, borderRadius: 56, border: `4px solid ${SPOT}`, color: SPOT,
                fontFamily: 'Cond', transform: 'rotate(-12deg)', lineHeight: 1,
              }}
            >
              <span style={{ fontSize: 17 }}>{paper.slot === 'morning' ? 'MORNING' : 'EVENING'}</span>
              <span style={{ fontSize: 40, marginTop: 2 }}>No. {paper.number}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'flex', margin: '14px 0 0' }}>
        <Rule heavy />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 1, justifyContent: 'center', padding: '8px 0 18px', overflow: 'hidden' }}>{children}</div>
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: INK, color: STOCK[paper?.slot ?? 'morning'],
          margin: '0 -56px', padding: '0 56px', height: 64, flexShrink: 0, fontFamily: 'Cond', fontSize: 26,
        }}
      >
        <span>{stats}</span>
        <span>{host}</span>
      </div>
    </div>
  );
}

function headlineSize(text: string) {
  if (text.length <= 42) return 90;
  if (text.length <= 70) return 80;
  if (text.length <= 100) return 66;
  return 56;
}

const editionStats = (e: Edition) =>
  `${e.stories.length + 1} stories, ${e.repos.length} repositories, ${e.advisories.length} security notices, ${num(e.jobsTotal)} jobs`;

/** The front page of one edition: masthead, lead headline and its standfirst. */
export async function editionCard(e: Edition | null): Promise<ImageResponse> {
  if (!e) return siteCard();
  const headline = clip(e.lead.title, 130);
  // Short headlines leave room for three more stories beneath; long ones get the page to themselves.
  const roomy = headline.length <= 56;
  const blurb = /^https?:\/\//i.test(e.lead.blurb) || !/\s/.test(e.lead.blurb.trim()) ? '' : e.lead.blurb;
  const deck = blurb ? clip(blurb, roomy ? 92 : 150) : `From ${e.lead.source}, in the ${slotName(e.slot).toLowerCase()}.`;
  const also = roomy ? e.stories.slice(0, 3).map((s) => clip(s.title, 46)) : [];
  const stats = editionStats(e);
  const text = `${longDate(e.date)} ${headline} ${deck} ${also.join(' ')} ${stats}`;
  return new ImageResponse(
    (
      <Frame paper={e} stats={stats}>
        <div style={{ display: 'flex', fontSize: headlineSize(headline), fontWeight: 800, lineHeight: 0.98, letterSpacing: '-0.025em' }}>
          {headline}
        </div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 28, fontStyle: 'italic', fontWeight: 500, color: SOFT, lineHeight: 1.25 }}>
          {deck}
        </div>
        {also.length ? (
          <div style={{ display: 'flex', marginTop: 26, borderTop: `1.5px solid ${INK}`, paddingTop: 14 }}>
            {also.map((t, i) => (
              <div
                key={t}
                style={{
                  display: 'flex', flex: 1, fontSize: 25, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.01em',
                  padding: i === 0 ? '0 20px 0 0' : '0 20px', borderLeft: i === 0 ? 'none' : `1.5px solid ${SOFT}`,
                }}
              >
                {t}
              </div>
            ))}
          </div>
        ) : null}
      </Frame>
    ),
    { ...OG_SIZE, fonts: await loadFonts(text) },
  );
}

/** For pages with no edition behind them. */
export async function siteCard(): Promise<ImageResponse> {
  const line = 'Developer news, open source and jobs, printed twice a day from the open web.';
  const stats = 'A morning and an evening edition, free';
  return new ImageResponse(
    (
      <Frame paper={null} stats={stats}>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.02em' }}>{line}</div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: await loadFonts(`The DevAtlas Printed twice a day ${line} ${stats} ${SITE_URL}`) },
  );
}

export interface JobsCardData {
  total: number;
  direct: number;
  india: number;
  employers: Edition['employers'];
}

/** The jobs page as a page of display ads. */
export async function jobsCard(paper: Edition | null, d: JobsCardData): Promise<ImageResponse> {
  const ads = d.employers.slice(0, 4);
  const title = 'Situations vacant';
  const sub = `${num(d.total)} developer jobs, ${num(d.direct)} straight from employers’ careers pages, ${num(d.india)} in India.`;
  const stats = 'Greenhouse, Lever, Ashby and SimplifyJobs, refreshed twice a day';
  const adText = ads.map((a) => `${a.company} Now hiring ${a.roles} engineering roles, ${a.india} in India`).join(' ');
  return new ImageResponse(
    (
      <Frame paper={paper} stats={stats}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cond', fontSize: 64, lineHeight: 1 }}>{title}</span>
        </div>
        <div style={{ display: 'flex', fontSize: 28, fontStyle: 'italic', fontWeight: 500, color: SOFT, marginTop: 8 }}>{sub}</div>
        <div style={{ display: 'flex', marginTop: 24, gap: 16 }}>
          {ads.map((a, i) => (
            <div
              key={a.company}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: 186,
                border: `2px solid ${INK}`, padding: 10, background: i % 3 === 0 ? INK : 'transparent',
                color: i % 3 === 0 ? STOCK[paper?.slot ?? 'morning'] : INK,
              }}
            >
              <span style={{ fontFamily: 'Cond', fontSize: 20 }}>Now hiring</span>
              <span style={{ fontSize: a.company.length > 9 ? 33 : 42, whiteSpace: 'nowrap', fontWeight: 800, lineHeight: 1.05, textAlign: 'center', marginTop: 4 }}>{a.company}</span>
              <span style={{ fontSize: 22, fontStyle: 'italic', fontWeight: 500, marginTop: 8, textAlign: 'center' }}>
                {a.roles} engineering roles{a.india ? `, ${a.india} in India` : ''}
              </span>
            </div>
          ))}
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: await loadFonts(`${title} ${sub} ${stats} ${adText} ${paper ? longDate(paper.date) : ''} MORNING EVENING No. ${paper?.number ?? ''} ${SITE_URL}`) },
  );
}

/** The open source page as a stock-exchange table. */
export async function reposCard(paper: Edition | null): Promise<ImageResponse> {
  const repos = (paper?.repos ?? []).slice(0, 5);
  const top = Math.max(1, ...repos.map((r) => r.stars));
  const title = 'Open source exchange';
  const stats = 'Repositories under a month old with the most stars';
  const BAR = 250;
  const cell = { display: 'flex', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden' } as const;
  const rowsText = repos.map((r, i) => `${i + 1} ${r.name} ${r.language} ${num(r.stars)}`).join(' ');
  return new ImageResponse(
    (
      <Frame paper={paper} stats={stats}>
        <span style={{ fontFamily: 'Cond', fontSize: 58, lineHeight: 1, marginBottom: 14 }}>{title}</span>
        {repos.map((r, i) => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', height: 56, width: '100%', borderTop: `1.5px dashed ${SOFT}`, fontFamily: 'Cond', fontSize: 28 }}>
            <span style={{ ...cell, width: 40, color: SOFT }}>{i + 1}</span>
            <span style={{ ...cell, width: 500 }}>{clip(r.name, 34)}</span>
            <span style={{ ...cell, width: 150, color: SOFT }}>{clip(r.language, 11)}</span>
            <span style={{ ...cell, width: 120, justifyContent: 'flex-end' }}>{num(r.stars)}</span>
            <div style={{ display: 'flex', width: BAR, marginLeft: 24 }}>
              <div
                style={{
                  height: 16, width: Math.max(8, Math.round((r.stars / top) * BAR)),
                  backgroundImage: `repeating-linear-gradient(90deg, ${INK} 0px, ${INK} 3px, transparent 3px, transparent 6px)`,
                }}
              />
            </div>
          </div>
        ))}
      </Frame>
    ),
    { ...OG_SIZE, fonts: await loadFonts(`${title} ${stats} ${rowsText} ${paper ? longDate(paper.date) : ''} MORNING EVENING No. ${paper?.number ?? ''} ${SITE_URL}`) },
  );
}

/** Square app icon: the blackletter D on newsprint, framed by press rules. */
export async function iconCard(size: number): Promise<ImageResponse> {
  const s = size / 64;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: STOCK.morning, padding: `${6 * s}px` }}>
        <div style={{ height: 3 * s, width: '100%', background: INK }} />
        <div style={{ height: 1 * s, width: '100%', background: INK, marginTop: 2 * s }} />
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', fontFamily: 'Plate', fontSize: 44 * s, color: INK, lineHeight: 1 }}>D</div>
        <div style={{ height: 2 * s, width: '100%', background: INK }} />
      </div>
    ),
    { width: size, height: size, fonts: await loadFonts('D') },
  );
}
