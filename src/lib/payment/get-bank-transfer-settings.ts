import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  BANK_TRANSFER_SETTING_KEY,
  DEFAULT_BANK_TRANSFER_SETTINGS,
  bankTransferSettingsSchema,
  normalizeBankAccountNumber,
  type BankTransferSettings,
} from "@/lib/payment/bank-transfer-settings";

export const BANK_TRANSFER_CACHE_SECONDS = 3600;

function readBankFromEnv(): BankTransferSettings | null {
  const accountNumber = normalizeBankAccountNumber(
    process.env.CAMBA_BANK_ACCOUNT?.trim() ||
      process.env.NEXT_PUBLIC_CAMBA_BANK_ACCOUNT?.trim() ||
      ""
  );
  if (!accountNumber) return null;

  return {
    bankName:
      process.env.CAMBA_BANK_NAME?.trim() ||
      process.env.NEXT_PUBLIC_CAMBA_BANK_NAME?.trim() ||
      DEFAULT_BANK_TRANSFER_SETTINGS.bankName,
    bankBin:
      process.env.CAMBA_BANK_BIN?.trim() ||
      process.env.NEXT_PUBLIC_CAMBA_BANK_BIN?.trim() ||
      DEFAULT_BANK_TRANSFER_SETTINGS.bankBin,
    accountNumber,
    accountName:
      process.env.CAMBA_BANK_HOLDER?.trim() ||
      process.env.NEXT_PUBLIC_CAMBA_BANK_HOLDER?.trim() ||
      DEFAULT_BANK_TRANSFER_SETTINGS.accountName,
    branch:
      process.env.CAMBA_BANK_BRANCH?.trim() ||
      process.env.NEXT_PUBLIC_CAMBA_BANK_BRANCH?.trim() ||
      "",
  };
}

async function fetchBankTransferFromDb(): Promise<BankTransferSettings> {
  try {
    const row = await db.siteSetting.findUnique({
      where: { key: BANK_TRANSFER_SETTING_KEY },
    });
    if (!row) return DEFAULT_BANK_TRANSFER_SETTINGS;

    const parsed = bankTransferSettingsSchema.safeParse(row.value);
    if (!parsed.success) return DEFAULT_BANK_TRANSFER_SETTINGS;

    return {
      ...parsed.data,
      accountNumber: normalizeBankAccountNumber(parsed.data.accountNumber),
      branch: parsed.data.branch ?? "",
    };
  } catch {
    return DEFAULT_BANK_TRANSFER_SETTINGS;
  }
}

export async function getBankTransferSettings(): Promise<BankTransferSettings> {
  const fromEnv = readBankFromEnv();
  if (fromEnv) return fromEnv;

  return unstable_cache(
    fetchBankTransferFromDb,
    ["bank-transfer-settings"],
    { revalidate: BANK_TRANSFER_CACHE_SECONDS, tags: ["bank-transfer-settings"] }
  )();
}

export async function isBankTransferConfiguredAsync(): Promise<boolean> {
  const { bankBin, accountNumber } = await getBankTransferSettings();
  return Boolean(bankBin && accountNumber);
}
