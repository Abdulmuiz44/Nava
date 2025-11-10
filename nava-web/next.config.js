/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('playwright');
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Nava',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Intelligent Browser Automation',
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig
