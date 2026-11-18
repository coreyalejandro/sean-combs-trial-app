/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `next build` writes plain HTML/CSS/JS to ./out, which is what
  // Cloudflare Pages serves. All data comes from prisma/dev.db at build time.
  output: 'export',
  // The local dev launcher sets NEXT_DIST_DIR=.next-local; builds use .next.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
