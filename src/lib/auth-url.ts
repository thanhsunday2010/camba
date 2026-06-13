/** Ensure Auth.js uses the correct public URL on Vercel when NEXTAUTH_URL is unset or still localhost. */
export function ensureAuthPublicUrl(): void {
  const current = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (current && !current.includes("localhost")) return;

  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    process.env.AUTH_URL = url;
    process.env.NEXTAUTH_URL = url;
  }
}
