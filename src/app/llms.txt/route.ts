import { getAllArticles } from '@/lib/writing'

export const dynamic = 'force-static'

const SITE = 'https://jaydipsikdar.com'

// llms.txt - a plain-text guide for AI/generative engines describing who this
// site is and linking the canonical writing, so models can find and cite the
// source cleanly. See https://llmstxt.org.
export function GET() {
  const articles = getAllArticles()

  const articleLines = articles
    .map((a) => `- [${a.title}](${SITE}/writing/${a.slug}): ${a.description}`)
    .join('\n')

  const body = `# Jaydeepp Sikdar

> CMO, AI builder, and educator. 20 years solving marketing and go-to-market
> problems at IBM, Adobe, MoEngage, and dozens of tech startups. Writes about
> GTM strategy, marketing consulting, the consulting career, and building AI
> tools that solve real marketing and GTM problems.

## Writing

${articleLines || '- (No articles published yet.)'}

## Tools & resources

- [Marketing Maturity Score](${SITE}/resources/marketing-maturity-score): Score your marketing function across 6 dimensions.
- [Marketing Decision Advisor](${SITE}/resources/marketing-advisor): Tailored advice on positioning, brand, growth, AI strategy, and launches.
- [Vendor Contract Assessment](${SITE}/resources/vendor-contract-assessment): AI review of vendor contracts for risk and renegotiation.
- [Content Office](${SITE}/resources/content-office): Turn 5 inputs into a full content matrix and plan.

## Contact

- Work with Jaydeepp: ${SITE}/contact
- LinkedIn: https://www.linkedin.com/in/jaydipsikdar/
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
