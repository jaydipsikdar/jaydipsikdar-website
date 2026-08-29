import { Resend } from 'resend'
import { getAllArticles } from '@/lib/writing'

const SITE = 'https://jaydipsikdar.com'

// The from-address for subscriber-facing mail. Sending to real subscribers
// needs a domain verified in Resend; until RESEND_FROM_EMAIL is set to an
// address on that domain, this falls back to Resend's test sender (which only
// delivers to the account owner), so welcome mail is effectively a no-op in
// production until the domain is live. See docs / setup notes.
function resolveFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'The Workbench <onboarding@resend.dev>'
}

function articleListHtml(): string {
  const items = getAllArticles()
    .slice(0, 3)
    .map(
      (a) =>
        `<li style="margin:0 0 12px 0;">
          <a href="${SITE}/writing/${a.slug}" style="color:#e84500;text-decoration:none;font-weight:400;">${a.title}</a>
          <div style="color:#34465d;font-size:14px;line-height:1.5;">${a.description}</div>
        </li>`
    )
    .join('')
  return items ? `<ul style="list-style:none;padding:0;margin:0 0 24px 0;">${items}</ul>` : ''
}

function articleListText(): string {
  return getAllArticles()
    .slice(0, 3)
    .map((a) => `- ${a.title}\n  ${SITE}/writing/${a.slug}`)
    .join('\n')
}

// Sends the one-time welcome to a newly opted-in subscriber. Best-effort: the
// caller must not let a failure here block the signup response. Returns true if
// Resend accepted the send.
export async function sendNewsletterWelcomeEmail(params: { email: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[newsletter] RESEND_API_KEY not set, skipping welcome email')
    return false
  }

  const recentHtml = articleListHtml()
  const recentText = articleListText()

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#13233d;">
  <p style="font-size:18px;font-weight:300;margin:0 0 16px 0;">Welcome to The Workbench.</p>
  <p style="font-size:15px;line-height:1.6;color:#34465d;margin:0 0 16px 0;">
    You're on the list. Every week I send one thing I built, one lesson from building it, and one insight you can use, drawn from 20 years across enterprise tech and startups.
  </p>
  ${
    recentHtml
      ? `<p style="font-size:15px;line-height:1.6;color:#34465d;margin:0 0 12px 0;">While you wait for the first issue, here is some recent writing:</p>${recentHtml}`
      : ''
  }
  <p style="font-size:15px;line-height:1.6;color:#34465d;margin:0 0 16px 0;">
    You can always read the archive at <a href="${SITE}/writing" style="color:#e84500;text-decoration:none;">jaydipsikdar.com/writing</a>.
  </p>
  <p style="font-size:15px;line-height:1.6;color:#34465d;margin:24px 0 0 0;">Jaydeepp</p>
</div>`

  const text = `Welcome to The Workbench.

You're on the list. Every week I send one thing I built, one lesson from building it, and one insight you can use, drawn from 20 years across enterprise tech and startups.
${recentText ? `\nWhile you wait for the first issue, here is some recent writing:\n${recentText}\n` : ''}
Read the archive anytime at ${SITE}/writing

Jaydeepp`

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: resolveFromAddress(),
      to: params.email,
      replyTo: process.env.RESEND_REPLY_TO || 'theworkbench@unstoppable.club',
      subject: 'Welcome to The Workbench',
      html,
      text,
    })
    if (error) {
      console.error('[newsletter] welcome email failed:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('[newsletter] welcome email threw:', err)
    return false
  }
}
