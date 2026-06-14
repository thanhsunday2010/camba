import { NextResponse } from "next/server";
import {
  getBankTransferSettings,
  isBankTransferConfiguredAsync,
} from "@/lib/payment/get-bank-transfer-settings";
import { isBankTransferOnlyMode } from "@/lib/payment/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const bank = await getBankTransferSettings();
  const configured = await isBankTransferConfiguredAsync();

  return NextResponse.json({
    ok: configured,
    bankTransferOnly: isBankTransferOnlyMode(),
    source: configured ? "settings" : "none",
    bank: configured
      ? {
          name: bank.bankName,
          bin: bank.bankBin,
          accountLast4: bank.accountNumber.slice(-4),
          holder: bank.accountName,
        }
      : null,
  });
}
