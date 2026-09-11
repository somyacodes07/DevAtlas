import fs from 'node:fs';
import path from 'node:path';

function sanitize(text: string = ''): string {
  if (!text) return '';
  let cleaned = text;
  for (let i = 0; i < 4; i++) {
    cleaned = cleaned
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&#039;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/gi, ' ')
      .replace(/&#[0-9]+;/g, ' ');
  }
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  cleaned = cleaned.replace(/&[a-z0-9#]+;/gi, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

const files = [
  path.resolve(__dirname, '../data/edge_items.json'),
  path.resolve(__dirname, '../data/full_catalog.json'),
  path.resolve(__dirname, '../frontend/public/data/edge_items.json'),
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const items = JSON.parse(fs.readFileSync(file, 'utf8'));
  let count = 0;

  for (const item of items) {
    const oldDesc = item.description;
    item.title = sanitize(item.title);
    item.description = sanitize(item.description);
    item.summary = sanitize(item.summary);
    if (item.job?.company) item.job.company = sanitize(item.job.company);
    if (item.job?.location) item.job.location = sanitize(item.job.location);
    if (item.job?.salary) item.job.salary = sanitize(item.job.salary);

    if (item.tags && Array.isArray(item.tags)) {
      item.tags = item.tags.map((t: string) => sanitize(t)).filter(Boolean);
    }
    if (item.job?.skills && Array.isArray(item.job.skills)) {
      item.job.skills = item.job.skills.map((s: string) => sanitize(s)).filter(Boolean);
    }

    if (oldDesc !== item.description) {
      count++;
    }
  }

  fs.writeFileSync(file, JSON.stringify(items, null, 2), 'utf8');
  console.log(`✨ Sanitized ${count} items in ${file}`);
}
