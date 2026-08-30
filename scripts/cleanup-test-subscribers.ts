// Remove specific test subscriber rows from Supabase AND their contacts from
// the Resend newsletter audience. Emails to remove are passed as args.
//   npx tsx scripts/cleanup-test-subscribers.ts a@x.com b@y.com ...

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

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
  const emails = process.argv.slice(2).map((e) => e.trim().toLowerCase()).filter(Boolean)
  if (!emails.length) { console.error('Pass at least one email to remove'); process.exit(1) }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const apiKey = process.env.RESEND_API_KEY!
  const audienceId = process.env.RESEND_NEWSLETTER_AUDIENCE_ID!

  for (const email of emails) {
    // Remove from the Resend audience (by email; 404 is fine if not present).
    const res = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${apiKey}` } }
    )
    const resendStatus = res.status

    // Delete the Supabase row.
    const { error } = await supabase.from('subscribers').delete().eq('email', email)
    console.log(`${email}  supabase=${error ? 'ERROR ' + error.message : 'deleted'}  resend=${resendStatus}`)
  }

  console.log('\nRemaining rows:')
  const { data } = await supabase.from('subscribers').select('email, newsletter_opt_in').order('updated_at', { ascending: false })
  for (const r of data ?? []) console.log(`  • ${r.email} (opt_in=${r.newsletter_opt_in})`)
}

main()
