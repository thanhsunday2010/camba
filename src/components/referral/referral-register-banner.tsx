interface ReferralRegisterBannerProps {
  referrerName: string;
}

export function ReferralRegisterBanner({ referrerName }: ReferralRegisterBannerProps) {
  return (
    <div className="mb-4 w-full max-w-md rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-sm shadow-sm">
      <p className="font-extrabold text-emerald-900">🎁 {referrerName} mời bạn tham gia Camba!</p>
      <p className="mt-1 text-emerald-800">
        Đăng ký <strong>tài khoản mới</strong> để nhận{" "}
        <strong>Camba Pro 1 tháng miễn phí</strong>.
      </p>
    </div>
  );
}
