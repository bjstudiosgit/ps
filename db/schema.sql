CREATE TABLE IF NOT EXISTS registrations (
  email text PRIMARY KEY NOT NULL
);
CREATE TABLE IF NOT EXISTS batches (
  code text PRIMARY KEY NOT NULL CHECK (code ~ '^[A-Z0-9][A-Z0-9-]{2,63}$'),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  details text NOT NULL DEFAULT '',
  links jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(links) = 'array'),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS batches_created_at_idx ON batches (created_at DESC, code);
