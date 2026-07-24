import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "canvas",
    "tesseract.js",
  ],
};

export default nextConfig;
