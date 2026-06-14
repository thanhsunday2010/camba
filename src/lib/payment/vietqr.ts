import { getBankTransferConfig } from "@/lib/payment/config";

export function getVietQrImageUrl(params: {
  amount: number;
  transferCode: string;
}): string | null {
  const { bankBin, accountNumber, accountName } = getBankTransferConfig();
  if (!bankBin || !accountNumber) {
    return null;
  }

  const addInfo = encodeURIComponent(params.transferCode.slice(0, 25));
  const name = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.jpg?amount=${params.amount}&addInfo=${addInfo}&accountName=${name}`;
}
