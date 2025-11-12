/** @type {import('next').NextConfig} */
const playwrightTracingIncludes = [
  './node_modules/.pnpm/playwright-core@*/node_modules/playwright-core/.local-browsers/**',
  './node_modules/.cache/ms-playwright/**',
];

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    outputFileTracingIncludes: {
      '/api/execute': playwrightTracingIncludes,
      '/api/execute-chain': playwrightTracingIncludes,
      '/api/screenshots': playwrightTracingIncludes,
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
