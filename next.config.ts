import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repo = "loading-logo";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
