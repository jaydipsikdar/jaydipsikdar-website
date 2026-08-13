import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: 'https://jaydipsikdar.com',
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://jaydipsikdar.com/contact',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://jaydipsikdar.com/resources',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://jaydipsikdar.com/newsletter',
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://jaydipsikdar.com/resources/vendor-contract-assessment',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://jaydipsikdar.com/resources/marketing-advisor',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
