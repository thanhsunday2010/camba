"use client";

import type { ReactNode } from "react";
import { EditableText } from "@/components/inline-edit/editable-text";
import { CardDescription, CardTitle } from "@/components/ui/card";

export function PricingPageHero() {
  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <EditableText
        contentKey="pricing.hero.title"
        defaultValue="Bảng giá Camba"
        as="h1"
        className="text-4xl font-extrabold kid-gradient-text"
      />
      <EditableText
        contentKey="pricing.hero.subtitle"
        defaultValue="Chọn gói phù hợp — luyện tập Cambridge, AI chấm Writing & Speaking mỗi ngày."
        as="p"
        multiline
        className="mt-3 max-w-2xl text-lg font-medium text-muted-foreground"
      />
    </div>
  );
}

export function PlacementPageHero() {
  return (
    <>
      <EditableText
        contentKey="placement.hero.title"
        defaultValue="Test trình độ"
        as="h1"
        className="text-3xl font-extrabold kid-gradient-text"
      />
      <p className="mt-2 font-semibold leading-relaxed text-muted-foreground">
        <EditableText
          contentKey="placement.hero.intro"
          defaultValue="Chọn nhóm placement phù hợp — IELTS, Cambridge hoặc General English."
          as="span"
          multiline
        />
      </p>
    </>
  );
}

export function PlacementGuestBanner() {
  return (
    <p className="mb-6 rounded-xl border-2 border-purple-100 bg-purple-50/80 px-4 py-3 text-sm font-semibold text-purple-900">
      <EditableText
        contentKey="placement.guest.banner"
        defaultValue="Khách (không đăng ký): 1 lượt placement/tháng theo số điện thoại, áp dụng mọi loại đề."
        as="span"
        multiline
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
    <>
      <h1 className="text-3xl font-extrabold kid-gradient-text">
        <EditableText contentKey="dashboard.greeting.prefix" defaultValue="Xin chào," as="span" />{" "}
        {userName}
        <EditableText contentKey="dashboard.greeting.suffix" defaultValue="! 👋" as="span" />
      </h1>
    </>
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
        className="text-3xl font-extrabold kid-gradient-text"
      />
      <EditableText
        contentKey={`exams.level.${level}.subtitle`}
        defaultValue="Chọn kỹ năng để luyện tập hoặc thi mock"
        as="p"
        multiline
        className="font-semibold text-muted-foreground"
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
        className="mt-1 text-3xl font-extrabold kid-gradient-text"
      />
      <EditableText
        contentKey={`exams.${level}.speaking.subtitle`}
        defaultValue="AI chấm sửa theo band Cambridge · mỗi lần luyện 1 câu ngẫu nhiên · mock full giống format thi thật"
        as="p"
        multiline
        className="mt-1 max-w-2xl font-semibold text-muted-foreground"
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
        className="mt-1 text-3xl font-extrabold kid-gradient-text"
      />
      <EditableText
        contentKey={`exams.${level}.writing.subtitle`}
        defaultValue="Mỗi lần luyện 1 câu ngẫu nhiên · AI chấm sửa ngay sau khi nộp · mock full giống format thi thật"
        as="p"
        multiline
        className="mt-1 max-w-2xl font-semibold text-muted-foreground"
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
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <EditableText
          contentKey={`ielts.academic.${skill}.title`}
          defaultValue={defaultTitle}
          as="h1"
          className="text-3xl font-extrabold kid-gradient-text"
        />
        {badge}
      </div>
      <EditableText
        contentKey={`ielts.academic.${skill}.description`}
        defaultValue={defaultDescription}
        as="p"
        multiline
        className="mt-1 max-w-2xl font-semibold text-muted-foreground"
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
        className="text-3xl font-extrabold kid-gradient-text"
      />
      <EditableText
        contentKey="pricing.subscribe.subtitle"
        defaultValue="Bước cuối để nâng cấp tài khoản"
        as="p"
        multiline
        className="mt-1 text-muted-foreground"
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
      className="mb-6 text-3xl font-extrabold kid-gradient-text"
    />
  );
}

export function TeacherPageTitle() {
  return (
    <EditableText
      contentKey="teacher.dashboard.title"
      defaultValue="Dashboard Giáo viên"
      as="h1"
      className="mb-8 text-3xl font-bold"
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
              ? "Tạo tài khoản mới để nhận Camba Pro 1 tháng miễn phí"
              : "Tạo tài khoản học sinh Camba — miễn phí"
          }
        />
      </CardDescription>
    </>
  );
}
