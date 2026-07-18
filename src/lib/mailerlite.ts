// CMO Boardroom Kit — existing default group. Kept as the fallback so the
// Kit's signup form (which doesn't pass a `group`) keeps working unchanged.
const KIT_GROUP_ID = '191412705135953404'

// Vendor Contract Check — group created manually in MailerLite.
const VENDOR_CHECK_GROUP_ID = '192702998964602139'

// Marketing Decision Advisor — group created manually in MailerLite.
const MARKETING_ADVISOR_GROUP_ID = '193314253973751516'

function resolveGroupId(group?: string): string {
  if (group === 'vendor-check') return VENDOR_CHECK_GROUP_ID
  if (group === 'marketing-advisor') return MARKETING_ADVISOR_GROUP_ID
  if (group === 'kit' || !group) return KIT_GROUP_ID
  return group
}

export type SubscribeResult = { ok: true } | { ok: false; status: number; detail: string }

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
    console.error('[mailerlite] MailerLite returned error:', res.status, responseBody)
    return { ok: false, status: 502, detail: `Subscription failed (${res.status})` }
  }

  console.log('[mailerlite] Success:', res.status, responseBody)
  return { ok: true }
}
