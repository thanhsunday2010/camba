import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { getEnabledOAuthProviders } from "@/lib/auth/providers";

export const revalidate = 3600;

export default function LoginPage() {
  const oauthProviders = getEnabledOAuthProviders();

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Suspense>
        <LoginForm oauthProviders={oauthProviders} />
      </Suspense>
    </div>
  );
}
