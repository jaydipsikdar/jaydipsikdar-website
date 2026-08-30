// Announce a new Writing article to the newsletter audience via Resend
// Broadcasts (the combined newsletter + new-post-alert list).
//
// Usage:
//   npm run send-broadcast -- <article-slug>          send it
//   npm run send-broadcast -- <article-slug> --dry     preview only, no send
//
// Requires these in .env.local:
//   RESEND_API_KEY
//   RESEND_NEWSLETTER_AUDIENCE_ID   (the "Newsletter" audience in Resend)
//   RESEND_FROM_EMAIL               (an address on your verified domain,
//                                    e.g. "The Workbench <theworkbench@jaydipsikdar.com>")
//
// Sending needs a domain verified in Resend. Until then this errors clearly.

import * as fs from 'fs'
import * as path from 'path'
import { Resend } from 'resend'
import { getArticle } from '../src/lib/writing'

const SITE = 'https://jaydipsikdar.com'

// Minimal .env.local loader so this standalone script sees the same secrets the
// app does, without adding a dotenv dependency.
function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

function buildHtml(title: string, description: string, slug: string): string {
  const url = `${SITE}/writing/${slug}`
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#13233d;">
  <p style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#6d7d91;margin:0 0 8px 0;">New from The Workbench</p>
  <h1 style="font-size:24px;font-weight:300;line-height:1.2;margin:0 0 16px 0;color:#13233d;">${title}</h1>
  <p style="font-size:15px;line-height:1.6;color:#34465d;margin:0 0 24px 0;">${description}</p>
  <a href="${url}" style="display:inline-block;background:#e84500;color:#ffffff;text-decoration:none;font-size:15px;padding:11px 20px;border-radius:9999px;">Read it</a>
  <p style="font-size:14px;line-height:1.6;color:#6d7d91;margin:28px 0 0 0;">You are getting this because you subscribed at jaydipsikdar.com. {{{RESEND_UNSUBSCRIBE_URL}}}</p>
</div>`
}

async function main(): Promise<void> {
  loadEnvLocal()

  const args = process.argv.slice(2)
  const dry = args.includes('--dry')
  const slug = args.find((a) => !a.startsWith('--'))

  if (!slug) {
    console.error('Usage: npm run send-broadcast -- <article-slug> [--dry]')
    process.exit(1)
  }

  const article = getArticle(slug)
  if (!article || article.published === false) {
    console.error(`No published article found for slug "${slug}".`)
    process.exit(1)
  }

  const subject = article.title
  const html = buildHtml(article.title, article.description, slug)

  if (dry) {
    console.log('--- DRY RUN, nothing sent ---')
    console.log('Subject:', subject)
    console.log('URL:', `${SITE}/writing/${slug}`)
    console.log('\nHTML:\n', html)
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_NEWSLETTER_AUDIENCE_ID
  const from = process.env.RESEND_FROM_EMAIL
  const missing = [
    !apiKey && 'RESEND_API_KEY',
    !audienceId && 'RESEND_NEWSLETTER_AUDIENCE_ID',
    !from && 'RESEND_FROM_EMAIL',
  ].filter(Boolean)
  if (missing.length) {
    console.error(`Cannot send. Missing in .env.local: ${missing.join(', ')}.`)
    console.error('Tip: run with --dry to preview the email without these.')
    process.exit(1)
  }

  const resend = new Resend(apiKey)

  const created = await resend.broadcasts.create({
    audienceId: audienceId!,
    from: from!,
    replyTo: process.env.RESEND_REPLY_TO || 'theworkbench@jaydipsikdar.com',
    subject,
    html,
    name: `New post: ${slug}`,
  })
  if (created.error || !created.data) {
    console.error('Failed to create broadcast:', created.error)
    process.exit(1)
  }

  const sent = await resend.broadcasts.send(created.data.id)
  if (sent.error) {
    console.error('Broadcast created but send failed:', sent.error)
    console.error(`Broadcast id ${created.data.id} is saved in Resend as a draft you can send manually.`)
    process.exit(1)
  }

  console.log(`Sent broadcast for "${slug}" to the newsletter audience. Broadcast id: ${created.data.id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
