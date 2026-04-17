import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["rss-parser", "cheerio"],
  output: "standalone",
};

export default nextConfig;
