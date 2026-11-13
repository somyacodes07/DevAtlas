-- One row per printed edition. `body` holds the whole edition as JSON so a
-- front page is a single-row read; the columns beside it exist for listing.
CREATE TABLE editions (
  id           TEXT PRIMARY KEY,
  date         TEXT NOT NULL,
  slot         TEXT NOT NULL CHECK (slot IN ('morning', 'evening')),
  number       INTEGER NOT NULL,
  generated_at TEXT NOT NULL,
  headline     TEXT NOT NULL,
  story_count  INTEGER NOT NULL,
  body         TEXT NOT NULL
);
CREATE INDEX editions_by_date ON editions (date DESC, id DESC);

-- Stories are also stored one per row so they can be searched.
CREATE TABLE stories (
  edition_id   TEXT NOT NULL REFERENCES editions (id) ON DELETE CASCADE,
  id           TEXT NOT NULL,
  position     INTEGER NOT NULL,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  domain       TEXT NOT NULL DEFAULT '',
  blurb        TEXT NOT NULL DEFAULT '',
  source       TEXT NOT NULL,
  desk         TEXT NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0,
  published_at TEXT NOT NULL,
  PRIMARY KEY (edition_id, id)
);
CREATE INDEX stories_by_id ON stories (id);

-- The jobs board is replaced as a whole on every ingest.
CREATE TABLE jobs (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  company    TEXT NOT NULL,
  location   TEXT NOT NULL,
  mode       TEXT NOT NULL,
  level      TEXT NOT NULL,
  region     TEXT NOT NULL,
  salary     TEXT,
  tags       TEXT NOT NULL DEFAULT '[]',
  blurb      TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL,
  via        TEXT NOT NULL,
  direct     INTEGER NOT NULL DEFAULT 0,
  board      TEXT NOT NULL,
  posted_at  TEXT NOT NULL,
  first_seen TEXT NOT NULL
);
CREATE INDEX jobs_by_posted ON jobs (posted_at DESC);
CREATE INDEX jobs_by_region_level ON jobs (region, level, posted_at DESC);

-- Full-text indexes, rebuilt on every ingest. Prefix matching is on so
-- "kube" finds "Kubernetes" while someone is still typing.
CREATE VIRTUAL TABLE stories_fts USING fts5 (
  story_id UNINDEXED, edition_id UNINDEXED, title, blurb, source,
  tokenize = 'unicode61 remove_diacritics 2', prefix = '2 3'
);
CREATE VIRTUAL TABLE jobs_fts USING fts5 (
  job_id UNINDEXED, title, company, location, tags,
  tokenize = 'unicode61 remove_diacritics 2', prefix = '2 3'
);
