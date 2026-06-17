"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FacebookIcon, GoogleIcon } from "@/components/auth/oauth-provider-icons";
import type { OAuthProviderId } from "@/lib/auth/providers";

const PROVIDER_META: Record<
  OAuthProviderId,
  { label: string; className: string; Icon: typeof GoogleIcon }
> = {
  google: {
    label: "Google",
    className: "border-slate-200 bg-white hover:bg-slate-50 text-slate-800",
    Icon: GoogleIcon,
  },
  facebook: {
    label: "Facebook",
    className: "border-[#1877F2] bg-[#1877F2] hover:bg-[#166FE0] text-white",
    Icon: FacebookIcon,
  },
};

interface OAuthSignInButtonsProps {
  providers: OAuthProviderId[];
  callbackUrl?: string;
  mode?: "login" | "register";
}

export function OAuthSignInButtons({
  providers,
  callbackUrl = "/dashboard",
  mode = "login",
}: OAuthSignInButtonsProps) {
  const [loading, setLoading] = useState<OAuthProviderId | null>(null);

  if (providers.length === 0) return null;

  async function handleOAuth(provider: OAuthProviderId) {
    setLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      toast.error(
        `Không thể ${mode === "register" ? "đăng ký" : "đăng nhập"} bằng ${PROVIDER_META[provider].label}`
      );
      setLoading(null);
    }
  }

  const actionLabel = mode === "register" ? "Đăng ký" : "Đăng nhập";

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-purple-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 font-semibold text-muted-foreground">
            Hoặc {mode === "register" ? "đăng ký" : "đăng nhập"} bằng
          </span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {providers.map((provider) => {
          const meta = PROVIDER_META[provider];
          const { Icon } = meta;
          return (
            <Button
              key={provider}
              type="button"
              variant="outline"
              className={`w-full rounded-full border-2 font-bold ${meta.className}`}
              disabled={loading !== null}
              onClick={() => handleOAuth(provider)}
            >
              <Icon className="mr-2 h-5 w-5 shrink-0" />
              {loading === provider ? "Đang chuyển..." : `${actionLabel} ${meta.label}`}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
