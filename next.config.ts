import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Documents can be uploaded up to 20MB (see MAX_DOCUMENT_BYTES in
      // src/app/(app)/documents/actions.ts); the default 1MB Server Action
      // body limit is too small for that.
      bodySizeLimit: '20mb',
    },
  },
}

export default nextConfig
