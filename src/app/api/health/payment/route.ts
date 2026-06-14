import { NextResponse } from "next/server";
import {
  getBankTransferConfig,
  isBankTransferConfigured,
  isBankTransferOnlyMode,
} from "@/lib/payment/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const bank = getBankTransferConfig();
  const configured = isBankTransferConfigured();
  const hasServerAccount = Boolean(process.env.CAMBA_BANK_ACCOUNT?.trim());
  const hasPublicAccount = Boolean(process.env.NEXT_PUBLIC_CAMBA_BANK_ACCOUNT?.trim());

  return NextResponse.json({
    ok: configured,
    bankTransferOnly: isBankTransferOnlyMode(),
    bank: configured
      ? {
          name: bank.bankName,
          bin: bank.bankBin,
          accountLast4: bank.accountNumber.slice(-4),
          holder: bank.accountName,
        }
      : null,
    debug: {
      hasServerAccount,
      hasPublicAccount,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    },
    hint: configured
      ? undefined
      : "CAMBA_BANK_ACCOUNT missing at runtime. Add on Vercel Production, then Redeploy (build must see the vars).",
  });
}
