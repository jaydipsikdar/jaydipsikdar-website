import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getPublishedSlugs } from '@/lib/writing'

export const runtime = 'nodejs'

function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

// Only real published articles may be liked, so the table can't fill with
// junk slugs from crafted requests.
function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && getPublishedSlugs().includes(slug)
}

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug')
  if (!isValidSlug(slug)) {
    return NextResponse.json({ likes: 0 })
  }

  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ likes: 0 })

  const { data, error } = await supabase
    .from('article_likes')
    .select('likes')
    .eq('slug', slug)
    .maybeSingle()

  // Table missing or any error → treat as zero so the UI still renders.
  if (error) {
    console.error('[likes] read failed:', error.message)
    return NextResponse.json({ likes: 0 })
  }

  return NextResponse.json({ likes: data?.likes ?? 0 })
}

export async function POST(request: Request) {
  let slug: unknown
  try {
    slug = (await request.json())?.slug
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Unknown article' }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ likes: null })

  const { data, error } = await supabase.rpc('increment_article_likes', {
    article_slug: slug,
  })

  if (error) {
    // Never fail the visitor's like - the optimistic client count stands.
    console.error('[likes] increment failed:', error.message)
    return NextResponse.json({ likes: null })
  }

  return NextResponse.json({ likes: data as number })
}
