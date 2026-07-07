-- Run this once in your Neon project (SQL editor) to create the leads table
-- the /api/leads route writes to.

CREATE TABLE IF NOT EXISTS leads (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text        NOT NULL,
  email       text        NOT NULL,
  phone       text        NOT NULL,
  consent     boolean     NOT NULL DEFAULT false,
  context     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
