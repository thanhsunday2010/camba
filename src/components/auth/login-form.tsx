"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons";
import type { OAuthProviderId } from "@/lib/auth/providers";
import { isPhoneInput, isValidPhone } from "@/lib/auth/phone";

interface LoginFormProps {
  oauthProviders: OAuthProviderId[];
}

export function LoginForm({ oauthProviders }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!identifier || password.length < 6) {
      setLoading(false);
      toast.error("Email/SĐT hoặc mật khẩu không hợp lệ");
      return;
    }

    if (isPhoneInput(identifier) && !isValidPhone(identifier)) {
      setLoading(false);
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    const result = await signIn("credentials", {
      identifier: isPhoneInput(identifier) ? identifier : identifier.toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Email/SĐT hoặc mật khẩu không đúng");
    } else {
      toast.success("Đăng nhập thành công!");
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md border-2 border-purple-100">
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Email, số điện thoại hoặc mạng xã hội</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OAuthSignInButtons providers={oauthProviders} callbackUrl={callbackUrl} mode="login" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="identifier">Email hoặc số điện thoại</Label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="email@example.com hoặc 0912345678"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full kid-btn-fun rounded-full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-purple-700 hover:underline">
            Đăng ký miễn phí
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
