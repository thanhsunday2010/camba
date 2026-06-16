"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXAM_LEVELS } from "@/lib/constants";
import { registerAction } from "@/lib/actions/auth";
import { redirectAfterAuth } from "@/lib/auth/safe-callback-url";
import { OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons";
import type { OAuthProviderId } from "@/lib/auth/providers";
import { cn } from "@/lib/utils";

interface RegisterFormProps {
  oauthProviders: OAuthProviderId[];
  hasReferralInvite?: boolean;
  callbackUrl?: string;
}

type RegisterMode = "email" | "phone";

export function RegisterForm({
  oauthProviders,
  hasReferralInvite = false,
  callbackUrl = "/dashboard",
}: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [targetExam, setTargetExam] = useState("KET");
  const [mode, setMode] = useState<RegisterMode>("phone");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("targetExam", targetExam);
    if (mode === "email") formData.set("phone", "");
    else formData.set("email", "");

    const password = String(formData.get("password") ?? "");
    const result = await registerAction(formData);

    if (result.error) {
      setLoading(false);
      toast.error(result.error);
      return;
    }

    if (!result.identifier) {
      setLoading(false);
      toast.error("Đăng ký thành công nhưng không thể đăng nhập tự động. Hãy thử đăng nhập thủ công.");
      return;
    }

    const signInResult = await signIn("credentials", {
      identifier: result.identifier,
      password,
      redirect: false,
    });
    setLoading(false);

    if (signInResult?.error) {
      toast.error("Đăng ký thành công nhưng đăng nhập thất bại. Hãy thử đăng nhập thủ công.");
    } else {
      if (result.referralBonus) {
        toast.success("Đăng ký thành công! Bạn đã nhận Camba Pro 1 tháng miễn phí 🎁");
      } else {
        toast.success("Đăng ký thành công!");
      }
      redirectAfterAuth(callbackUrl);
    }
  }

  return (
    <Card className="w-full max-w-md border-2 border-purple-100">
      <CardHeader>
        <CardTitle>Đăng ký</CardTitle>
        <CardDescription>
          {hasReferralInvite
            ? "Tạo tài khoản mới để nhận Camba Pro 1 tháng miễn phí"
            : "Tạo tài khoản học sinh Camba — miễn phí"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OAuthSignInButtons providers={oauthProviders} callbackUrl={callbackUrl} mode="register" />

        <div className="inline-flex w-full rounded-full border-2 border-purple-100 bg-purple-50/50 p-1">
          <button
            type="button"
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-bold transition-colors",
              mode === "phone" ? "bg-white text-purple-800 shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setMode("phone")}
          >
            📱 Số điện thoại
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-bold transition-colors",
              mode === "email" ? "bg-white text-purple-800 shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setMode("email")}
          >
            📧 Email
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Họ tên</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          {mode === "email" ? (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
          ) : (
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0912345678"
                required
                autoComplete="tel"
              />
              <p className="mt-1 text-xs text-muted-foreground">Số di động Việt Nam (10 số)</p>
            </div>
          )}
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="grade">Lớp (tuỳ chọn)</Label>
            <Input id="grade" name="grade" placeholder="VD: Lớp 8" />
          </div>
          <div>
            <Label>Mục tiêu thi</Label>
            <Select value={targetExam} onValueChange={setTargetExam}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXAM_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full kid-btn-fun rounded-full" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-bold text-purple-700 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
