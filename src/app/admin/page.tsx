import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const links = [
    {
      href: "/admin/questions",
      title: "Câu hỏi",
      desc: "Tạo và sửa câu hỏi (MCQ, gap fill, writing, speaking)",
    },
    {
      href: "/admin/papers",
      title: "Đề thi",
      desc: "Luyện tập, mock test, placement — tạo đề và gắn câu hỏi",
    },
    {
      href: "/admin/users",
      title: "Tài khoản",
      desc: "Tạo và sửa học sinh, giáo viên, admin",
    },
    {
      href: "/admin/placement",
      title: "Kết quả Placement",
      desc: "Xem kết quả test trình độ (guest + đăng nhập)",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-extrabold kid-gradient-text">Quản trị Camba</h1>
      <p className="mb-6 text-muted-foreground">
        Xin chào {session.user.name ?? session.user.email}
      </p>
      <AdminNav currentPath="/admin" />

      <div className="grid gap-4 md:grid-cols-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
