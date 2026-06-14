"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXAM_LEVELS, type ExamLevelValue } from "@/lib/constants";
import {
  updatePasswordAction,
  updateProfileAction,
  type UserProfileData,
} from "@/lib/actions/profile";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { ReferralShareInline } from "@/components/referral/referral-share-block";
import { REFERRAL_BUTTON_LABEL } from "@/lib/referral/constants";
import { Camera, Trash2, UserRound } from "lucide-react";

interface ProfileSettingsFormProps {
  profile: UserProfileData;
  referralCode?: string | null;
}

function AvatarPreview({ image, name }: { image: string | null; name: string | null }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "Avatar"}
        width={96}
        height={96}
        unoptimized
        className="h-24 w-24 rounded-full border-4 border-purple-200 object-cover shadow-md"
      />
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100 shadow-md">
      <UserRound className="h-10 w-10 text-purple-500" />
    </div>
  );
}

export function ProfileSettingsForm({ profile, referralCode }: ProfileSettingsFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetExam, setTargetExam] = useState<ExamLevelValue>(profile.targetExam);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.image);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  function handleAvatarChange(file: File | null) {
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast.error("Ảnh tối đa 512KB");
      return;
    }
    setRemoveAvatar(false);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("targetExam", targetExam);
    formData.set("removeAvatar", removeAvatar ? "true" : "false");

    const file = fileInputRef.current?.files?.[0];
    if (file) formData.set("avatar", file);

    const result = await updateProfileAction(formData);
    setProfileLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.profile) {
      await update({
        name: result.profile.name ?? undefined,
        image: result.profile.image,
        targetExam: result.profile.targetExam,
      });
    }

    toast.success("Đã cập nhật hồ sơ! ✨");
    setRemoveAvatar(false);
    router.refresh();
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updatePasswordAction(formData);
    setPasswordLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã đổi mật khẩu!");
    e.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      {referralCode && (
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="font-extrabold">🎁 {REFERRAL_BUTTON_LABEL}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferralShareInline referralCode={referralCode} />
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/80 to-white">
        <CardHeader>
          <CardTitle className="font-extrabold">👤 Hồ sơ của tôi</CardTitle>
          <CardDescription>Cập nhật avatar, thông tin cá nhân và level luyện thi</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative">
                {avatarPreview && !removeAvatar ? (
                  <AvatarPreview image={avatarPreview} name={profile.name} />
                ) : (
                  <div className="relative">
                    <CambaMascot size="md" mood="happy" className="rounded-full shadow-md" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-1 h-4 w-4" />
                  Đổi avatar
                </Button>
                {(profile.image || avatarPreview) && !removeAvatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-red-600"
                    onClick={() => {
                      setRemoveAvatar(true);
                      setAvatarPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Xóa avatar
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Họ tên</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={profile.name ?? ""}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={profile.dateOfBirth ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="grade">Lớp</Label>
                <Input
                  id="grade"
                  name="grade"
                  defaultValue={profile.grade ?? ""}
                  placeholder="VD: Lớp 8A"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={profile.email ?? ""}
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone ?? ""}
                  placeholder="0912345678"
                  autoComplete="tel"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Level Cambridge</Label>
                <Select value={targetExam} onValueChange={(v) => setTargetExam(v as ExamLevelValue)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="kid-btn-fun rounded-full" disabled={profileLoading}>
              {profileLoading ? "Đang lưu..." : "Lưu hồ sơ"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile.hasPassword && (
        <Card className="border-2 border-sky-200">
          <CardHeader>
            <CardTitle className="font-extrabold">🔒 Đổi mật khẩu</CardTitle>
            <CardDescription>Mật khẩu mới cần ít nhất 6 ký tự</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="grid max-w-md gap-4">
              <div>
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" variant="outline" className="rounded-full" disabled={passwordLoading}>
                {passwordLoading ? "Đang đổi..." : "Cập nhật mật khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
