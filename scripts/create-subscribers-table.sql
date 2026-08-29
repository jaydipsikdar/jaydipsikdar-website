-- Unified subscriber store for jaydipsikdar.com.
--
-- Replaces MailerLite as the source of truth for everyone who gives us their
-- email - through a tool (marketing-advisor, vendor-check, maturity-score,
-- content-office, kit), a downloadable guide (vendor-guide), or the newsletter
-- signup. Delivery (guide emails, newsletter broadcasts) runs through Resend;
-- this table records WHO subscribed, from WHERE, and whether they opted into
-- the newsletter.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  -- Every capture surface this email has come through, e.g.
  -- {'marketing-advisor','vendor-guide'}. Appended to, never overwritten.
  sources text[] not null default '{}',
  -- The most recent surface, handy for "where did they last come from".
  last_source text,
  -- Merge fields captured by the tools (PDF urls, role, stage, etc.), the
  -- equivalent of MailerLite's subscriber fields. Merged on repeat submits.
  fields jsonb not null default '{}'::jsonb,
  -- TRUE only for people who explicitly asked for the newsletter / new-post
  -- alerts. Lead-magnet downloaders are false unless they also opt in, so we
  -- never email a newsletter to someone who only grabbed a guide.
  newsletter_opt_in boolean not null default false,
  unsubscribed boolean not null default false,
  -- The contact id returned by Resend once added to the newsletter audience.
  resend_contact_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fast lookups by email (also enforced unique above) and a partial index for
-- pulling the newsletter segment when composing a broadcast.
create index if not exists subscribers_email_idx on subscribers (email);
create index if not exists subscribers_newsletter_idx
  on subscribers (newsletter_opt_in)
  where newsletter_opt_in = true;
