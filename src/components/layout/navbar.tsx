import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SoundToggle } from "@/components/kids/sound-toggle";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { logoutAction } from "@/lib/actions/auth";
import { Sparkles } from "lucide-react";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-purple-200/60 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-extrabold text-purple-700 transition-transform hover:scale-105"
        >
          <CambaMascot size="sm" mood="happy" className="rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-0.5 shadow-md transition-transform group-hover:animate-wiggle" />
          <span className="text-xl kid-gradient-text">Camba</span>
          <Sparkles className="h-4 w-4 text-sunshine-400 animate-pulse-soft" />
        </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          <SoundToggle />
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-purple-700 transition-colors hover:bg-purple-100"
                >
                  🏠 Trang chủ
                </Link>
                <Link
                  href="/placement"
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-100"
                >
                  🎯 Test trình độ
                </Link>
                <Link
                  href="/exams/KET"
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  📚 Luyện thi
                </Link>
                {user.role === "ADMIN" && (
                  <>
                    <Link href="/admin/questions" className="text-sm font-medium hover:text-purple-600">
                      Câu hỏi
                    </Link>
                    <Link href="/admin/papers" className="text-sm font-medium hover:text-purple-600">
                      Đề thi
                    </Link>
                  </>
                )}
                {user.role === "TEACHER" && (
                  <Link href="/teacher" className="text-sm font-medium hover:text-purple-600">
                    Giáo viên
                  </Link>
                )}
                <form action={logoutAction}>
                  <Button variant="outline" size="sm" type="submit" className="rounded-full border-2">
                    Đăng xuất
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full font-bold">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild size="sm" className="kid-btn-fun rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Link href="/register">Đăng ký miễn phí ✨</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
