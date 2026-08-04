/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
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
    return config;
  }
};

module.exports = nextConfig;
