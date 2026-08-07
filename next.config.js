/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")]
  },
  images: {
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
