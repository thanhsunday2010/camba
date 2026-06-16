import type { NextConfig } from "next";

const supabaseHost = process.env.SUPABASE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
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
