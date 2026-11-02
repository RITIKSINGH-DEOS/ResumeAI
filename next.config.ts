import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  serverExternalPackages: [
    "canvas",
    "tesseract.js",
  ],
};

export default nextConfig;
