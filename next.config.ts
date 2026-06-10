import withPWA from '@ducanh2912/next-pwa'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
}

// Changes on every build so Workbox re-fetches and re-caches the HTML on SW update.
const buildRevision = String(Date.now())

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    additionalManifestEntries: [
      { url: '/', revision: buildRevision },
      { url: '/add', revision: buildRevision },
      { url: '/settings', revision: buildRevision },
      { url: '/offline', revision: buildRevision },
    ],
  },
})(nextConfig)
