import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { AppToaster } from "@/components/layout/app-toaster";
import { Navbar } from "@/components/layout/navbar";
import { FloatingDecor } from "@/components/kids/floating-decor";
import { MascotBuddyWrapper } from "@/components/kids/mascot-buddy-wrapper";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { SoundProvider } from "@/components/kids/sound-provider";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Camba - Học tiếng Anh vui nhộn!",
  description: "Luyện thi Cambridge cho trẻ em với game, âm thanh và AI chấm bài thông minh",
};

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
            <FloatingDecor />
            <div className="relative z-10">
              <Navbar />
              <main>{children}</main>
              <MascotBuddyWrapper />
            </div>
            <AppToaster />
          </SoundProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
