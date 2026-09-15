import type { NextConfig } from "next";

const isExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  output: isExport ? "export" : "standalone",
  images: { unoptimized: true },
  trailingSlash: isExport,
  basePath: process.env.BASE_PATH || "",
};

export default nextConfig;
