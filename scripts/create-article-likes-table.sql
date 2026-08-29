-- Like counts for Writing articles.
--
-- One row per article slug with a running like count. The increment runs
-- through a small SQL function so concurrent likes can't clobber each other.
-- Likes are throttled to one per browser on the client; this is deliberately
-- lightweight social proof, not an identity system.
--
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists article_likes (
  slug text primary key,
  likes integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Atomic "add one like and return the new total". Upserts the row on first
-- like so we never need a separate seed step.
create or replace function increment_article_likes(article_slug text)
returns integer
language plpgsql
as $$
declare
  new_count integer;
begin
  insert into article_likes (slug, likes)
    values (article_slug, 1)
  on conflict (slug)
    do update set likes = article_likes.likes + 1, updated_at = now()
  returning likes into new_count;
  return new_count;
end;
$$;
