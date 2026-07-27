-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Creates the table used by /api/content-office-submit and
-- /api/content-office-report to store every Content Office submission for
-- analytics and follow-up. Mirrors create-maturity-score-tables.sql.

CREATE TABLE content_office_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Inputs (the 5 form fields)
  role TEXT NOT NULL,
  intents TEXT[] NOT NULL,
  audience TEXT NOT NULL,
  pillars TEXT[] NOT NULL,
  channels TEXT[] NOT NULL,

  -- Full generated result: profile, matrix, starter sequence, gaps,
  -- channel fit, rhythm (see ContentOfficeResult in contentOfficeData.ts)
  result JSONB NOT NULL,

  -- Set once the visitor passes the email gate for the full report.
  -- NULL means they saw the ungated preview but didn't request the PDF.
  email TEXT,
  pdf_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_office_created_at ON content_office_submissions (created_at DESC);
CREATE INDEX idx_content_office_email ON content_office_submissions (email) WHERE email IS NOT NULL;

-- Enable RLS
ALTER TABLE content_office_submissions ENABLE ROW LEVEL SECURITY;

-- No public read/write policies: this table is written only by the server
-- (API routes use the Supabase service role key, which bypasses RLS).
