export type OAuthProviderId = "google" | "facebook";

/** Tạm ẩn Facebook — đổi thành `true` hoặc set AUTH_FACEBOOK_ENABLED=true khi bật lại */
const FACEBOOK_OAUTH_ENABLED =
  process.env.AUTH_FACEBOOK_ENABLED === "true";

export function isFacebookOAuthEnabled(): boolean {
  return (
    FACEBOOK_OAUTH_ENABLED &&
    Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET)
  );
}

export function getEnabledOAuthProviders(): OAuthProviderId[] {
  const providers: OAuthProviderId[] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push("google");
  }
  if (isFacebookOAuthEnabled()) {
    providers.push("facebook");
  }
  return providers;
}

export function isOAuthConfigured(): boolean {
  return getEnabledOAuthProviders().length > 0;
}
