export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devatlas.pages.dev';
export const REPO_URL = 'https://github.com/somyacodes07/DevAtlas';
export const PRESS_TZ = 'Asia/Kolkata';

const atNoon = (date: string) => new Date(`${date}T12:00:00Z`);

export const longDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(atNoon(date));

export const shortDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(atNoon(date));

export const pressTime = (iso: string) =>
  `${new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: PRESS_TZ }).format(new Date(iso))} IST`;

export const slotName = (slot: 'morning' | 'evening') => (slot === 'morning' ? 'Morning edition' : 'Evening edition');

export const num = (n: number) => n.toLocaleString('en-US');

export const plural = (n: number, one: string, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;

/** How long before press time something was posted: "3 hours", "2 days". */
export function before(iso: string, press: string): string {
  const hours = Math.max(0, (Date.parse(press) - Date.parse(iso)) / 3_600_000);
  if (hours < 1) return 'under an hour';
  if (hours < 36) return plural(Math.round(hours), 'hour');
  return plural(Math.round(hours / 24), 'day');
}
