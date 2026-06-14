/** Normalize Vietnamese mobile numbers to E.164 (+84...) */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("84")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 9 || !/^[35789]/.test(digits)) {
    return null;
  }

  return `+84${digits}`;
}

export function formatPhoneDisplay(phone: string): string {
  if (phone.startsWith("+84") && phone.length === 12) {
    return `0${phone.slice(3)}`;
  }
  return phone;
}

export function isPhoneInput(value: string): boolean {
  const v = value.trim();
  if (!v || v.includes("@")) return false;
  return /^[\d\s+\-().]+$/.test(v);
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}
