import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { GraduationCap } from "lucide-react";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-cambridge-700">
          <GraduationCap className="h-7 w-7" />
          <span className="text-xl">Camba</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-cambridge-600">
                Dashboard
              </Link>
              <Link href="/placement" className="text-sm font-medium hover:text-cambridge-600">
                Test trình độ
              </Link>
              <Link href="/exams/KET" className="text-sm font-medium hover:text-cambridge-600">
                Luyện thi
              </Link>
              {user.role === "ADMIN" && (
                <>
                  <Link href="/admin/questions" className="text-sm font-medium hover:text-cambridge-600">
                    Câu hỏi
                  </Link>
                  <Link href="/admin/papers" className="text-sm font-medium hover:text-cambridge-600">
                    Đề thi
                  </Link>
                </>
              )}
              {user.role === "TEACHER" && (
                <Link href="/teacher" className="text-sm font-medium hover:text-cambridge-600">
                  Giáo viên
                </Link>
              )}
              <form action={logoutAction}>
                <Button variant="outline" size="sm" type="submit">
                  Đăng xuất
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
