"use client";

import type { ReactNode } from "react";
import { EditableText } from "@/components/inline-edit/editable-text";
import { CardDescription, CardTitle } from "@/components/ui/card";

export function PricingPageHero() {
  return (
    <>
      <EditableText
        contentKey="pricing.hero.title"
        defaultValue="Bảng giá Camba"
        as="h1"
        className="page-title"
      />
      <EditableText
        contentKey="pricing.hero.subtitle"
        defaultValue="Chọn gói phù hợp — luyện Cambridge & AI chấm Writing/Speaking."
        as="p"
        multiline
        className="page-subtitle mx-auto text-center"
      />
    </>
  );
}

export function PlacementPageHero() {
  return (
    <>
      <EditableText
        contentKey="placement.hero.title"
        defaultValue="Test trình độ"
        as="h1"
        className="page-title"
      />
      <EditableText
        contentKey="placement.hero.intro"
        defaultValue="Chọn chương trình và bắt đầu ngay."
        as="p"
        multiline
        className="page-subtitle mx-auto text-center"
      />
    </>
  );
}

export function PlacementGuestBanner() {
  return (
    <p className="mb-6 rounded-xl border-2 border-purple-100 bg-purple-50/80 px-4 py-3 text-sm font-medium text-purple-900">
      <EditableText
        contentKey="placement.guest.banner"
        defaultValue="Khách: 1 lượt placement/tháng."
        as="span"
      />{" "}
      <a href="/register" className="font-bold underline">
        Đăng ký miễn phí
      </a>{" "}
      <EditableText
        contentKey="placement.guest.bannerSuffix"
        defaultValue="để làm thêm (2 lượt/tuần)."
        as="span"
      />
    </p>
  );
}

export function DashboardGreeting({ userName }: { userName: string }) {
  return (
    <h1 className="page-title">
      <EditableText contentKey="dashboard.greeting.prefix" defaultValue="Xin chào," as="span" />{" "}
      {userName}
      <EditableText contentKey="dashboard.greeting.suffix" defaultValue="! 👋" as="span" />
    </h1>
  );
}

export function CambridgeLevelHubHeader({
  level,
  levelLabel,
}: {
  level: string;
  levelLabel: string;
}) {
  return (
    <>
      <EditableText
        contentKey={`exams.level.${level}.heading`}
        defaultValue={levelLabel}
        as="h1"
        className="page-title"
      />
      <EditableText
        contentKey={`exams.level.${level}.subtitle`}
        defaultValue="Luyện tập hoặc thi mock theo kỹ năng"
        as="p"
        multiline
        className="page-subtitle"
      />
    </>
  );
}

export function CambridgeSpeakingHubHeader({
  level,
  levelLabel,
  emoji,
}: {
  level: string;
  levelLabel: string;
  emoji: string;
}) {
  const defaultTitle = `Speaking ${levelLabel} ${emoji}`;
  return (
    <>
      <EditableText
        contentKey={`exams.${level}.speaking.title`}
        defaultValue={defaultTitle}
        as="h1"
        className="page-title"
      />
      <EditableText
        contentKey={`exams.${level}.speaking.subtitle`}
        defaultValue="Luyện từng Part hoặc mock full · AI chấm ngay"
        as="p"
        multiline
        className="page-subtitle"
      />
    </>
  );
}

export function CambridgeWritingHubHeader({
  level,
  levelLabel,
  emoji,
}: {
  level: string;
  levelLabel: string;
  emoji: string;
}) {
  const defaultTitle = `Writing ${levelLabel} ${emoji}`;
  return (
    <>
      <EditableText
        contentKey={`exams.${level}.writing.title`}
        defaultValue={defaultTitle}
        as="h1"
        className="page-title"
      />
      <EditableText
        contentKey={`exams.${level}.writing.subtitle`}
        defaultValue="Luyện từng câu hoặc mock full · AI chấm sau nộp"
        as="p"
        multiline
        className="page-subtitle"
      />
    </>
  );
}

export function IeltsAcademicHubHeader({
  skill,
  defaultTitle,
  defaultDescription,
  badge,
}: {
  skill: "speaking" | "writing";
  defaultTitle: string;
  defaultDescription: string;
  badge?: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <EditableText
          contentKey={`ielts.academic.${skill}.title`}
          defaultValue={defaultTitle}
          as="h1"
          className="page-title"
        />
        {badge}
      </div>
      <EditableText
        contentKey={`ielts.academic.${skill}.description`}
        defaultValue={defaultDescription}
        as="p"
        multiline
        className="page-subtitle"
      />
    </>
  );
}

export function SubscribePageHeader() {
  return (
    <>
      <EditableText
        contentKey="pricing.subscribe.title"
        defaultValue="Thanh toán gói"
        as="h1"
        className="page-title"
      />
      <EditableText
        contentKey="pricing.subscribe.subtitle"
        defaultValue="Bước cuối để nâng cấp tài khoản"
        as="p"
        multiline
        className="page-subtitle"
      />
    </>
  );
}

export function PaymentPageTitle() {
  return (
    <EditableText
      contentKey="pricing.payment.title"
      defaultValue="Thanh toán"
      as="h1"
      className="page-title mb-6"
    />
  );
}

export function TeacherPageTitle() {
  return (
    <EditableText
      contentKey="teacher.dashboard.title"
      defaultValue="Dashboard Giáo viên"
      as="h1"
      className="page-title mb-6 sm:mb-8"
    />
  );
}

export function LoginFormHeader() {
  return (
    <>
      <CardTitle>
        <EditableText contentKey="auth.login.title" defaultValue="Đăng nhập" />
      </CardTitle>
      <CardDescription>
        <EditableText
          contentKey="auth.login.description"
          defaultValue="Email, số điện thoại hoặc mạng xã hội"
        />
      </CardDescription>
    </>
  );
}

export function RegisterFormHeader({ hasReferralInvite }: { hasReferralInvite?: boolean }) {
  return (
    <>
      <CardTitle>
        <EditableText contentKey="auth.register.title" defaultValue="Đăng ký" />
      </CardTitle>
      <CardDescription>
        <EditableText
          contentKey={
            hasReferralInvite ? "auth.register.descriptionReferral" : "auth.register.description"
          }
          defaultValue={
            hasReferralInvite
              ? "Tạo tài khoản để nhận Camba Pro 1 tháng"
              : "Tạo tài khoản học sinh — miễn phí"
          }
        />
      </CardDescription>
    </>
  );
}
