import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PRODUCT_SLUGS, isProductSlug, type ApprovedReview } from '@/lib/reviews'

export const runtime = 'nodejs'

interface ReviewRequestBody {
  product_slug?: string
  rating?: number
  review_text?: string
  reviewer_name?: string
  reviewer_title?: string
  reviewer_company?: string
}

// Trims, strips angle brackets/control characters, and collapses whitespace.
function sanitizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value
    .replace(/[<>]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return null
  return cleaned.slice(0, maxLength)
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null
  // Service role key — server-side only, bypasses RLS. Never expose to the client.
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: Request) {
  let body: ReviewRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isProductSlug(body.product_slug)) {
    return NextResponse.json(
      { error: `product_slug must be one of: ${PRODUCT_SLUGS.join(', ')}` },
      { status: 400 }
    )
  }

  const rating = body.rating
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be an integer between 1 and 5' }, { status: 400 })
  }

  const reviewerName = sanitizeText(body.reviewer_name, 100)
  if (!reviewerName) {
    return NextResponse.json({ error: 'reviewer_name is required' }, { status: 400 })
  }

  const reviewText = sanitizeText(body.review_text, 500)
  const reviewerTitle = sanitizeText(body.reviewer_title, 100)
  const reviewerCompany = sanitizeText(body.reviewer_company, 100)

  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error('[reviews] Supabase env vars are not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const { error } = await supabase.from('product_reviews').insert({
    product_slug: body.product_slug,
    rating,
    review_text: reviewText,
    reviewer_name: reviewerName,
    reviewer_title: reviewerTitle,
    reviewer_company: reviewerCompany,
    is_approved: false,
  })

  if (error) {
    console.error('[reviews] insert failed:', error)
    return NextResponse.json({ error: 'Could not submit review' }, { status: 502 })
  }

  return NextResponse.json(
    { success: true, message: 'Thank you! Your review will appear after moderation.' },
    { status: 201 }
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const product = searchParams.get('product')

  if (!isProductSlug(product)) {
    return NextResponse.json(
      { error: `product must be one of: ${PRODUCT_SLUGS.join(', ')}` },
      { status: 400 }
    )
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error('[reviews] Supabase env vars are not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, rating, review_text, reviewer_name, reviewer_title, reviewer_company, created_at')
    .eq('product_slug', product)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[reviews] fetch failed:', error)
    return NextResponse.json({ error: 'Could not load reviews' }, { status: 502 })
  }

  return NextResponse.json((data ?? []) as ApprovedReview[])
}
