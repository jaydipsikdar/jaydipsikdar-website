// CMO Boardroom Kit — existing default group. Kept as the fallback so the
// Kit's signup form (which doesn't pass a `group`) keeps working unchanged.
const KIT_GROUP_ID = '191412705135953404'

// Vendor Contract Assessment — group created manually in MailerLite.
const VENDOR_CHECK_GROUP_ID = '192702998964602139'

// Marketing Decision Advisor — group created manually in MailerLite.
const MARKETING_ADVISOR_GROUP_ID = '193314253973751516'

// Marketing Maturity Score — group created manually in MailerLite.
const MATURITY_SCORE_GROUP_ID = '193980625736173142'

// Content Office — group created manually in MailerLite.
const CONTENT_OFFICE_GROUP_ID = '194163307787060328'

function resolveGroupId(group?: string): string {
  if (group === 'vendor-check') return VENDOR_CHECK_GROUP_ID
  if (group === 'marketing-advisor') return MARKETING_ADVISOR_GROUP_ID
  if (group === 'maturity-score') return MATURITY_SCORE_GROUP_ID
  if (group === 'content-office') return CONTENT_OFFICE_GROUP_ID
  if (group === 'kit' || !group) return KIT_GROUP_ID
  return group
}

export type SubscribeResult =
  | { ok: true; isNewSubscriber: boolean }
  | { ok: false; status: number; detail: string }

export async function subscribeToMailerLite(params: {
  email: string
  group?: string
  fields?: Record<string, string>
}): Promise<SubscribeResult> {
  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) {
    console.error('[mailerlite] MAILERLITE_API_KEY is not set')
    return { ok: false, status: 500, detail: 'Server misconfigured' }
  }

  const groupId = resolveGroupId(params.group)

  console.log('[mailerlite] Attempting to subscribe:', params.email, 'to group:', groupId)

  let res: Response
  try {
    res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: params.email,
        groups: [groupId],
        ...(params.fields ? { fields: params.fields } : {}),
      }),
    })
  } catch (err) {
    console.error('[mailerlite] Network error reaching MailerLite:', err)
    return { ok: false, status: 503, detail: 'Could not reach email provider' }
  }

  const responseBody = await res.text()

  if (!res.ok) {
    if (indicatesExistingSubscriber(responseBody)) {
      console.log(
        '[mailerlite] Subscriber already exists in group, treating as success:',
        params.email,
        groupId
      )
      return { ok: true, isNewSubscriber: false }
    }

    console.error('[mailerlite] MailerLite returned error:', res.status, responseBody)
    return { ok: false, status: 502, detail: `Subscription failed (${res.status})` }
  }

  // The Connect API returns 201 Created for a brand-new subscriber and
  // 200 OK when it upserted an existing one.
  const isNewSubscriber = res.status === 201

  console.log('[mailerlite] Success:', res.status, responseBody)
  return { ok: true, isNewSubscriber }
}

// The Connect API upserts subscribers (200 for both new and existing), so a
// returning user hitting the same group should never fail. This is a
// defensive net in case an account/plan quirk ever surfaces a duplicate as
// an error response instead of the documented upsert.
function indicatesExistingSubscriber(responseBody: string): boolean {
  const normalized = responseBody.toLowerCase()
  return normalized.includes('already') && (normalized.includes('exist') || normalized.includes('subscri'))
}
