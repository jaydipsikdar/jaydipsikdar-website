// Preview or send a test of the newsletter welcome email.
//
// Usage:
//   npx tsx scripts/send-test-welcome.ts --preview            write HTML to a file, no send
//   npx tsx scripts/send-test-welcome.ts you@example.com      send a real test to that address
//
// Requires in .env.local: RESEND_API_KEY, RESEND_FROM_EMAIL (address on the
// verified domain), and optionally RESEND_REPLY_TO. Sending needs the domain
// verified in Resend.

import * as fs from 'fs'
import * as path from 'path'
import { buildNewsletterWelcomeEmail, sendNewsletterWelcomeEmail } from '../src/lib/newsletterEmail'

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
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

async function main(): Promise<void> {
  loadEnvLocal()
  const arg = process.argv[2]

  if (!arg || arg === '--preview') {
    const { subject, html } = buildNewsletterWelcomeEmail()
    const out = path.join(process.cwd(), 'scripts', 'welcome-preview.html')
    fs.writeFileSync(out, html, 'utf8')
    console.log(`Subject: ${subject}`)
    console.log(`From:    ${process.env.RESEND_FROM_EMAIL ?? '(fallback onboarding@resend.dev)'}`)
    console.log(`ReplyTo: ${process.env.RESEND_REPLY_TO ?? 'theworkbench@jaydipsikdar.com'}`)
    console.log(`Preview written to: ${out}`)
    return
  }

  if (!arg.includes('@')) {
    console.error(`Not a valid email or --preview: "${arg}"`)
    process.exit(1)
  }

  console.log(`Sending test welcome to ${arg} ...`)
  const ok = await sendNewsletterWelcomeEmail({ email: arg })
  console.log(ok ? '✓ Resend accepted the send.' : '✗ Send failed — check the logs above.')
  process.exit(ok ? 0 : 1)
}

main()
