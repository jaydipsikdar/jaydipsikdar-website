// One-off diagnostic: send the welcome email and print Resend's raw response
// (message id on success, or the exact error). Uses the same content and
// from/reply-to that production uses.
//   npx tsx scripts/send-welcome-diag.ts you@example.com

import * as fs from 'fs'
import * as path from 'path'
import { Resend } from 'resend'
import { buildNewsletterWelcomeEmail } from '../src/lib/newsletterEmail'

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!(k in process.env)) process.env[k] = v
  }
}

async function main() {
  loadEnvLocal()
  const to = process.argv[2]
  if (!to || !to.includes('@')) { console.error('Pass a recipient email'); process.exit(1) }

  const from = process.env.RESEND_FROM_EMAIL || 'The Workbench <onboarding@resend.dev>'
  const replyTo = process.env.RESEND_REPLY_TO || 'theworkbench@jaydipsikdar.com'
  const { subject, html, text } = buildNewsletterWelcomeEmail()

  console.log(`From:    ${from}`)
  console.log(`To:      ${to}`)
  console.log(`ReplyTo: ${replyTo}`)
  console.log(`Subject: ${subject}\n`)

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({ from, to, replyTo, subject, html, text })

  console.log('RAW RESPONSE:')
  console.log('  data: ', JSON.stringify(data))
  console.log('  error:', JSON.stringify(error))
  process.exit(error ? 1 : 0)
}

main()
