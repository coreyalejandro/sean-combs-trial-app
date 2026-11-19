/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `next build` writes plain HTML/CSS/JS to ./out, which is what
  // Cloudflare Pages serves. All data comes from src/data/trial_days.json at build time.
  // Only for builds: `next dev` keeps normal dev behaviour.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // Every route is a folder with index.html (/day/1/), as Cloudflare Pages expects.
  trailingSlash: true,
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
