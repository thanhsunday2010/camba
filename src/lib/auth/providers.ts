export type OAuthProviderId = "google" | "facebook";

export function getEnabledOAuthProviders(): OAuthProviderId[] {
  const providers: OAuthProviderId[] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push("google");
  }
  if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
    providers.push("facebook");
  }
  return providers;
}

export function isOAuthConfigured(): boolean {
  return getEnabledOAuthProviders().length > 0;
}
