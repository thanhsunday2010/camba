import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { AppToaster } from "@/components/layout/app-toaster";
import { Navbar } from "@/components/layout/navbar";
import { FloatingDecor } from "@/components/kids/floating-decor";
import { MascotProviderWrapper } from "@/components/kids/mascot-buddy-wrapper";
import { SiteFooter } from "@/components/layout/site-footer";
import { BugReportButton } from "@/components/feedback/bug-report-button";
import { PromoOfferProvider } from "@/components/promo/promo-offer-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { SoundProvider } from "@/components/kids/sound-provider";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Camba | App học Tiếng Anh miễn phí có AI chấm sửa",
  description: "Luyện thi Cambridge cho trẻ em với game, âm thanh và AI chấm bài thông minh",
};

/** Chạy SSR/API gần Supabase (Singapore) và user VN */
export const preferredRegion = "sin1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${nunito.className} min-h-screen antialiased`}>
        <AuthSessionProvider>
          <SoundProvider>
            <MascotProviderWrapper>
              <FloatingDecor />
              <div className="relative z-10 flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
              <BugReportButton />
              <PromoOfferProvider />
            </MascotProviderWrapper>
            <AppToaster />
          </SoundProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
