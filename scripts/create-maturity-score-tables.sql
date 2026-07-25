-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Creates the table used by /api/maturity-score-submit and
-- /api/maturity-score-pdf to store every Marketing Maturity Score
-- submission for analytics and follow-up.

CREATE TABLE maturity_score_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Qualifiers (do not affect scoring, used for segmentation)
  role TEXT NOT NULL,
  stage TEXT NOT NULL,
  funding TEXT NOT NULL,

  -- Raw answers: { [questionId]: score }
  answers JSONB NOT NULL,

  -- Computed scores: { [dimensionId]: score }
  dimension_scores JSONB NOT NULL,
  overall_score NUMERIC(3, 1) NOT NULL,
  maturity_tier TEXT NOT NULL,
  weakest_dimension TEXT NOT NULL,

  -- Set once the visitor passes the email gate for the full report.
  -- NULL means they saw the ungated preview but didn't request the PDF.
  email TEXT,
  pdf_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maturity_score_created_at ON maturity_score_submissions (created_at DESC);
CREATE INDEX idx_maturity_score_email ON maturity_score_submissions (email) WHERE email IS NOT NULL;

-- Enable RLS
ALTER TABLE maturity_score_submissions ENABLE ROW LEVEL SECURITY;

-- No public read/write policies: this table is written only by the server
-- (API routes use the Supabase service role key, which bypasses RLS).
