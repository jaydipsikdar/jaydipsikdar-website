// Guide registry — the single source of truth for every gated guide landing
// page. Each entry drives one page rendered by the shared GuideLanding
// template at /[guideSlug]. To add a new guide: drop its PDF in
// public/downloads, create a MailerLite group and wire it in mailerlite.ts,
// then add one entry here. No new page code required.

export type GuideBullet = {
  label: string
  detail: string
}

export type GuideCrossSellItem = {
  label: string
  description: string
  href: string
  external?: boolean
}

export type Guide = {
  /** URL slug and route param. Keep it short and speakable. */
  slug: string
  /** MailerLite group key, mapped in lib/mailerlite.ts resolveGroupId(). */
  mailerLiteGroup: string
  /** Public path to the downloadable PDF in /public/downloads. */
  pdfHref: string

  eyebrow: string
  title: string
  subtitle: string

  metaTitle: string
  metaDescription: string

  /** Short "why" paragraphs, shown after the hook. */
  intro: string[]

  whatsInsideHeading: string
  whatsInside: GuideBullet[]

  /** Optional one-line proof point. */
  proof?: string

  form: {
    heading: string
    subcopy: string
    buttonIdle: string
    buttonLoading: string
    successNew: string
    successReturning: string
    downloadLabel: string
  }

  crossSellHeading: string
  crossSell: GuideCrossSellItem[]
}

const YOUTUBE_WORKBENCH =
  'https://www.youtube.com/watch?v=YWkJzI8xfVc&list=PLDRiPzpWfnc4u3YA9vBK41tOYIwAm0Csl'

export const GUIDES: Record<string, Guide> = {
  'vendor-guide': {
    slug: 'vendor-guide',
    mailerLiteGroup: 'vendor-guide',
    pdfHref: '/downloads/vendor-contract-assessor-guide.pdf',

    eyebrow: 'Free guide',
    title: 'Build your own vendor contract checker in 15 minutes',
    subtitle:
      'The exact prompts from the video. Paste them into Claude and you get a tool that scores any contract before you sign. No code. No API key.',

    metaTitle: 'Build your own vendor contract checker | Free guide',
    metaDescription:
      'The free guide from the video: four prompts that build a tool to score any vendor contract before you sign. No code, no API key. Includes a real contract scored 41 out of 100.',

    intro: [
      'I built this after a three-month retainer delivered almost nothing, and the contract was written to make that fine. So I made a checker that reads a contract the way a careful buyer would, and tells me where I am exposed before I sign.',
      'This guide hands you the whole thing. Not a summary of it. The actual prompts, so you can build the same tool and run it on your own contracts today.',
    ],

    whatsInsideHeading: 'What is inside',
    whatsInside: [
      {
        label: 'The four build prompts',
        detail:
          'Copy, paste, and you have a working tool. Nothing to install, nothing to pay for.',
      },
      {
        label: 'The five checks',
        detail:
          'Deliverable clarity, performance accountability, data ownership, exit terms, and payment alignment. What a fair contract looks like on each one.',
      },
      {
        label: 'The scoring logic',
        detail:
          'How the 100 points break down, and why a lower score means higher risk, not lower.',
      },
      {
        label: 'A real worked example',
        detail:
          'A marketing contract that scored 41 out of 100, and the three fixes that mattered most before signing.',
      },
    ],

    proof:
      'The sample contract in the guide scored 41 out of 100. High risk. The guide shows you exactly why, category by category.',

    form: {
      heading: 'Get the guide',
      subcopy: 'Enter your email and download it right here. No waiting on your inbox.',
      buttonIdle: 'Download the guide',
      buttonLoading: 'One sec...',
      successNew: 'You are in. Your download should have started. If not, use the button below.',
      successReturning:
        'Welcome back. Your download should have started. If not, use the button below.',
      downloadLabel: 'Download the guide',
    },

    crossSellHeading: 'While you are here',
    crossSell: [
      {
        label: 'Try the AI version',
        description:
          'Paste a contract and get the full scored report back, no building required.',
        href: '/resources/vendor-contract-assessment',
      },
      {
        label: 'More Work Bench builds',
        description:
          'Watch how each of these tools gets made, start to finish, on YouTube.',
        href: YOUTUBE_WORKBENCH,
        external: true,
      },
      {
        label: 'Get the newsletter',
        description:
          'One practical marketing tool or framework at a time. No filler.',
        href: '/newsletter',
      },
    ],
  },
}

export function getGuide(slug: string): Guide | undefined {
  return GUIDES[slug]
}

export function getAllGuideSlugs(): string[] {
  return Object.keys(GUIDES)
}
