"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form";
import type { UserProfileData } from "@/lib/actions/profile";

interface DashboardTabsProps {
  overview: React.ReactNode;
  profile: UserProfileData;
  referralCode?: string | null;
  defaultTab?: "overview" | "profile";
}

export function DashboardTabs({ overview, profile, referralCode, defaultTab = "overview" }: DashboardTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border-2 border-purple-100 bg-purple-50/60 p-1">
        <TabsTrigger
          value="overview"
          className="rounded-xl px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-purple-800"
        >
          📊 Tổng quan
        </TabsTrigger>
        <TabsTrigger
          value="profile"
          className="rounded-xl px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-purple-800"
        >
          👤 Hồ sơ của tôi
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="profile">
        <ProfileSettingsForm profile={profile} referralCode={referralCode} />
      </TabsContent>
    </Tabs>
  );
}
