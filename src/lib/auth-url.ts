/** Ensure Auth.js uses the correct public URL on Vercel when NEXTAUTH_URL is unset or still localhost. */
export function ensureAuthPublicUrl(): void {
  const current = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (current && !current.includes("localhost")) return;

  const fromPublicApp = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const fromVercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const url = fromPublicApp?.startsWith("http") ? fromPublicApp : fromPublicApp ? `https://${fromPublicApp}` : fromVercel;

  if (url) {
    process.env.AUTH_URL = url;
    process.env.NEXTAUTH_URL = url;
  }
}
