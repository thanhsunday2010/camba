import Link from "next/link";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/questions", label: "Câu hỏi" },
  { href: "/admin/papers", label: "Đề thi" },
  { href: "/admin/users", label: "Tài khoản" },
  { href: "/admin/placement", label: "Placement" },
  { href: "/admin/reports", label: "Báo lỗi" },
];

export function AdminNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 rounded-2xl border-2 border-purple-200 bg-purple-50/50 p-2">
      {LINKS.map((link) => {
        const active =
          link.exact ? currentPath === link.href : currentPath.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
              active
                ? "bg-purple-600 text-white shadow"
                : "text-purple-800 hover:bg-purple-100"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
