import fs from 'node:fs';
import path from 'node:path';

// Locate root directory whether called from root or frontend workspace
let rootDir = process.cwd();
if (rootDir.endsWith('frontend')) {
  rootDir = path.resolve(rootDir, '..');
}

const sourceDataDir = path.join(rootDir, 'data');
const targetDataDir = path.join(rootDir, 'frontend', 'public', 'data');

if (!fs.existsSync(targetDataDir)) {
  fs.mkdirSync(targetDataDir, { recursive: true });
}

if (fs.existsSync(sourceDataDir)) {
  const files = fs.readdirSync(sourceDataDir).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const src = path.join(sourceDataDir, file);
    const dest = path.join(targetDataDir, file);
    try {
      fs.copyFileSync(src, dest);
      console.log(`[Sync Data] Copied ${file} -> frontend/public/data/${file}`);
    } catch (err) {
      console.warn(`[Sync Data Warning] Failed to copy ${file}:`, err);
    }
  }
}
