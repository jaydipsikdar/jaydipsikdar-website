-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Adds the AI Readiness Overlay columns to the existing
-- maturity_score_submissions table (see create-maturity-score-tables.sql).
-- Does not restructure the existing table, only adds columns.

ALTER TABLE maturity_score_submissions
  ADD COLUMN ai_readiness_score NUMERIC(3, 1),
  ADD COLUMN ai_readiness_stage TEXT,
  ADD COLUMN aq1 SMALLINT,
  ADD COLUMN aq2 SMALLINT,
  ADD COLUMN aq3 SMALLINT,
  ADD COLUMN aq4 SMALLINT,
  ADD COLUMN aq5 SMALLINT;
