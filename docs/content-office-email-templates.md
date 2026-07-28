# Content Office — follow-up email templates

Three emails, triggered off the "Content Office" MailerLite group, mirroring the Marketing
Maturity Score follow-up pattern. Not wired up as a live MailerLite automation yet (see Setup
below) — this file is the copy to paste in once it is.

Merge tags referenced below come from the custom fields set on subscribe (see
`subscribeToMailerLite` call in `src/app/api/content-office-report/route.ts`):
`{$role}`, `{$audience}`, `{$pillars}`, `{$channels}`, `{$content_office_pdf_url}`,
`{$starter_post_1_idea}`, `{$starter_post_1_pillar}`, `{$starter_post_1_theme}`,
`{$top_underused_theme}`.

---

## Email 1 — Day 3

**Subject:** Your first piece from the Content Office

**Body:**

Hey,

Three days ago you got your Content Office matrix. Here's the first piece from your starter
sequence, outlined and ready to write.

**{$starter_post_1_idea}**

Pillar: {$starter_post_1_pillar}. Theme: {$starter_post_1_theme}.

Outline:
1. Open with the specific claim or number, not a warm-up sentence.
2. Give the one piece of evidence or example that makes it credible.
3. Close with what the reader should do differently because of it.

That's it. No hook formula, no seven-part framework, just the shape. Fill in your own details
and post it.

Jaydip

*No CTA. Pure value, so the next two emails land with more trust.*

---

## Email 2 — Day 7

**Subject:** You're skipping this type of content

**Body:**

Hey,

Your matrix flagged {$top_underused_theme} as the theme you're probably underusing.

That matters because it's usually the theme that separates people who post a lot from people
who post like they know something. It rewards depth over frequency, so it gets skipped when
you're moving fast.

Two hooks to try:

1. A specific number or claim tied to {$pillars}, stated plainly, no hedging.
2. A short breakdown of one thing you changed your mind about recently in this space.

Reply and tell me which one you'd try. I read every reply.

Jaydip

*Soft CTA: reply, not book.*

---

## Email 3 — Day 14

**Subject:** The content that sets you apart

**Body:**

Hey,

Two weeks in, you've probably found what's easy to create and what feels harder. The easy stuff
is your baseline. The harder pieces, the ones that need a real example, an unpopular opinion, or
a specific number, are usually the ones that differentiate you.

Your Content Office report gave you the system: {$pillars}, mapped across 10 themes and your
channels ({$channels}). The next step most people want help with is picking the 8 to 10 ideas
that will actually move their specific goal, and building the workflow around them.

If that's you, set up a 60-minute conversation. We'll review your matrix, pick your priorities,
and build your 90-day plan. Rs. 999.

[Book a 60-minute content strategy session]({$content_office_contact_link})

Jaydip

*CTA: consulting bridge, matches the tone in the report (offered, not pushed).*

---

## Setup notes

1. Create a "Content Office" group in MailerLite (Audience → Groups → Create group). Copy its
   ID into `CONTENT_OFFICE_GROUP_ID` in `src/lib/mailerlite.ts` (currently a placeholder).
2. Create the 4 custom fields referenced above if they don't already exist (MailerLite creates
   them automatically on first API subscribe call with those field keys, so this may already be
   done once the tool has run once against a valid group).
3. Build a 3-step automation triggered on "subscriber joins group: Content Office," with delays
   of 3 days, 4 days (to land Day 7), and 7 days (to land Day 14) between steps.
4. Paste the subject lines and bodies above into each step. Replace the
   `{$content_office_contact_link}` placeholder with the contact page URL plus UTM parameters:
   `https://jaydipsikdar.com/contact?utm_source=content-office&utm_medium=email&utm_campaign=day-14`.
   Do not link to Calendly directly, the payment flow lives on `/contact`.
5. If the MailerLite plan doesn't support multi-step automations yet, these can ship as 3
   one-off scheduled campaigns filtered to the Content Office group instead, until the plan
   upgrades.
