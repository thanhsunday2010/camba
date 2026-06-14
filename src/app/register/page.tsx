import { RegisterForm } from "@/components/auth/register-form";
import { getEnabledOAuthProviders } from "@/lib/auth/providers";

export const revalidate = 3600;

export default function RegisterPage() {
  const oauthProviders = getEnabledOAuthProviders();

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <RegisterForm oauthProviders={oauthProviders} />
    </div>
  );
}
