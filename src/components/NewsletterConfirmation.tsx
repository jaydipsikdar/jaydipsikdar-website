// The post-signup message, shared by every newsletter capture point on the
// site (the /newsletter form, the inline writing promo, the article sidebar).
// One source of truth so the confirmation - including the deliverability nudge -
// reads identically everywhere.

const SUCCESS_TITLE = "You're in. A welcome email is on its way."
const SUCCESS_BODY =
  "If it's not in your inbox, check Promotions or spam and move it to your main inbox so you don't miss the next newsletter or essay from me. Have a question? Just reply, I read every email."
const RETURNING_TITLE = "You're on the list."

export default function NewsletterConfirmation({
  state,
  compact = false,
  className = '',
}: {
  state: 'success' | 'returning'
  compact?: boolean
  className?: string
}) {
  const isSuccess = state === 'success'
  return (
    <div
      className={`rounded-xl border border-primary/30 bg-primary-subtle/25 text-left ${
        compact ? 'px-4 py-3.5' : 'px-5 py-4'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
        <span className="text-sm font-normal text-ink-900">
          {isSuccess ? SUCCESS_TITLE : RETURNING_TITLE}
        </span>
      </div>
      {isSuccess && (
        <p className="mt-2 text-sm font-light leading-relaxed text-ink-500">{SUCCESS_BODY}</p>
      )}
    </div>
  )
}
