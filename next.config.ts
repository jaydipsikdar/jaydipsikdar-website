import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/resources/vendor-check',
        destination: '/resources/vendor-contract-assessment',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
