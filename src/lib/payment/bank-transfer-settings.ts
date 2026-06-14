import { z } from "zod";

export const bankTransferSettingsSchema = z.object({
  bankName: z.string().min(1).max(80),
  bankBin: z.string().min(6).max(6),
  accountNumber: z.string().min(4).max(30),
  accountName: z.string().min(1).max(120),
  branch: z.string().max(120).default(""),
});

export type BankTransferSettings = z.infer<typeof bankTransferSettingsSchema>;

export const BANK_TRANSFER_SETTING_KEY = "bank_transfer";

/** Fallback when env/DB unavailable — public receiving account. */
export const DEFAULT_BANK_TRANSFER_SETTINGS: BankTransferSettings = {
  bankName: "ACB",
  bankBin: "970416",
  accountNumber: "83993998",
  accountName: "NGUYEN TIEN THANH",
  branch: "",
};

export function normalizeBankAccountNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}
