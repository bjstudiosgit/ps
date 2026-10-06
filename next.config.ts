import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: '/products/**' }]
  },
  outputFileTracingIncludes: {
    '/verified': ['./public/products/**/*']
  }
};

export default nextConfig;
