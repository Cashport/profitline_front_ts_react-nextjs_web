/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
  // `yarn build:check` sets NEXT_DIST_DIR so verification builds don't overwrite the
  // `.next/` a running dev server depends on (causes "Cannot find module './NNNN.js'").
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")]
  },
  images: {
    // Disable the server-side image optimizer (/_next/image). Product images come from
    // arbitrary third-party hosts (sometimes), so the optimizer + wildcard remotePatterns would act as
    // an open image proxy (SSRF/bandwidth abuse). With unoptimized, <Image> renders as a
    // client-side <img> governed by the CSP img-src, and the server never fetches remotes.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  swcMinify: false,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    // Force every dayjs import (including AntD's bundled copy under
    // node_modules/antd/node_modules/dayjs) to resolve to the project-level
    // dayjs so plugins extended in src/app/layout.tsx (weekday, weekOfYear,
    // etc.) are visible to AntD's DatePicker calendar grid — otherwise it
    // throws "clone.weekday is not a function".
    config.resolve.alias.dayjs = path.resolve(__dirname, "node_modules/dayjs");
    return config;
  }
};

module.exports = nextConfig;
