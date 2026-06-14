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
    hint: configured
      ? undefined
      : "Set CAMBA_BANK_ACCOUNT (and redeploy) on Vercel Production. Accepts 83993998 or 8399.3998.",
  });
}
