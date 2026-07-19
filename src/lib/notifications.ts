import { Resend } from 'resend'

const REVIEW_NOTIFICATION_EMAIL = 'jaydip@unstoppable.club'

export async function sendReviewNotificationEmail(params: {
  productSlug: string
  rating: number
  reviewerName: string
  reviewerTitle: string | null
  reviewerCompany: string | null
  reviewText: string | null
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[notifications] RESEND_API_KEY is not set — skipping review notification email')
    return
  }

  const body = [
    'New review submitted on jaydipsikdar.com',
    '',
    `Tool: ${params.productSlug}`,
    `Rating: ${params.rating} / 5`,
    `Name: ${params.reviewerName}`,
    `Role: ${params.reviewerTitle ?? 'Not provided'}`,
    `Company: ${params.reviewerCompany ?? 'Not provided'}`,
    `Review: ${params.reviewText ?? 'No text provided'}`,
    '',
    'To approve, go to Supabase → Table Editor → product_reviews → set is_approved to TRUE.',
  ].join('\n')

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: 'Jaydip Sikdar Website <onboarding@resend.dev>',
    to: REVIEW_NOTIFICATION_EMAIL,
    subject: `New review submitted — ${params.productSlug}`,
    text: body,
  })

  if (error) throw error
}
