import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/resources/vendor-check',
        destination: '/resources/vendor-contract-assessment',
        permanent: true,
      },
      // Clean spoken URL for the video lead magnet.
      {
        source: '/vendor-guide',
        destination: '/resources/vendor-guide',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
