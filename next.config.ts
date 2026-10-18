import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // basePath нужен только если сайт будет лежать в подпапке,
  // например на GitHub Pages: basePath: "/loading-logo",
};

export default nextConfig;
