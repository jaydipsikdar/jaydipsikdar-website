-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Creates the product_reviews table used by /api/reviews and the
-- ReviewSubmissionForm / ReviewDisplay components.

CREATE TABLE product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_slug TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  reviewer_name TEXT NOT NULL,
  reviewer_title TEXT,
  reviewer_company TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching approved reviews by product
CREATE INDEX idx_reviews_product_approved ON product_reviews (product_slug, is_approved) WHERE is_approved = TRUE;

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert (submit a review), but every new row must start
-- unapproved — otherwise a direct call to the Supabase REST API with the
-- public anon key could set is_approved = true and skip moderation entirely.
CREATE POLICY "Anyone can submit an unapproved review"
  ON product_reviews FOR INSERT
  WITH CHECK (is_approved = FALSE);

-- Policy: only approved reviews are publicly readable
CREATE POLICY "Only approved reviews are visible"
  ON product_reviews FOR SELECT
  USING (is_approved = TRUE);
