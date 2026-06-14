import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    CAMBA_BANK_NAME: process.env.CAMBA_BANK_NAME,
    CAMBA_BANK_BIN: process.env.CAMBA_BANK_BIN,
    CAMBA_BANK_ACCOUNT: process.env.CAMBA_BANK_ACCOUNT,
    CAMBA_BANK_HOLDER: process.env.CAMBA_BANK_HOLDER,
    CAMBA_BANK_BRANCH: process.env.CAMBA_BANK_BRANCH,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
