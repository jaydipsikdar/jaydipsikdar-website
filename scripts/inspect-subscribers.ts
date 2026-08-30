// Diagnostic: show the most recent subscriber rows from Supabase.
//   npx tsx scripts/inspect-subscribers.ts            most recent 15
//   npx tsx scripts/inspect-subscribers.ts you@x.com  just that email

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key)
  const arg = process.argv[2]

  let q = supabase
    .from('subscribers')
    .select('email, sources, last_source, newsletter_opt_in, resend_contact_id, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(15)
  if (arg) q = supabase
    .from('subscribers')
    .select('email, sources, last_source, newsletter_opt_in, resend_contact_id, created_at, updated_at')
    .eq('email', arg.trim().toLowerCase())

  const { data, error } = await q
  if (error) { console.error('Query failed:', error); process.exit(1) }
  console.log(`\n${data?.length ?? 0} row(s):\n`)
  for (const r of data ?? []) {
    console.log(`• ${r.email}`)
    console.log(`   opt_in=${r.newsletter_opt_in}  resend_contact_id=${r.resend_contact_id ?? '(none)'}`)
    console.log(`   sources=${JSON.stringify(r.sources)}  last=${r.last_source}`)
    console.log(`   created=${r.created_at}  updated=${r.updated_at}\n`)
  }
}

main()
