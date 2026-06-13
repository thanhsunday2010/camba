"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/admin/admin-nav";
import type { PlacementReport } from "@/lib/placement/evaluate";

interface PlacementAttemptRow {
  id: string;
  guestFullName: string | null;
  guestPhone: string | null;
  score: number | null;
  maxScore: number | null;
  submittedAt: Date | null;
  placementReport: PlacementReport | null;
  paper: { title: string };
  user: { name: string | null; email: string } | null;
}

export function AdminPlacementClient({ attempts }: { attempts: PlacementAttemptRow[] }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNav currentPath="/admin/placement" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kết quả Placement Test</h1>
        <p className="text-muted-foreground">
          {attempts.length} bài đã nộp (học sinh đăng nhập + khách không tài khoản)
        </p>
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Chưa có ai làm placement test.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Họ tên</th>
                <th className="px-4 py-3 font-semibold">SĐT / Email</th>
                <th className="px-4 py-3 font-semibold">Loại</th>
                <th className="px-4 py-3 font-semibold">Bài test</th>
                <th className="px-4 py-3 font-semibold">Điểm</th>
                <th className="px-4 py-3 font-semibold">CEFR</th>
                <th className="px-4 py-3 font-semibold">Cambridge</th>
                <th className="px-4 py-3 font-semibold">Thời gian</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => {
                const pct =
                  a.score !== null && a.maxScore
                    ? Math.round((a.score / a.maxScore) * 100)
                    : null;
                const name = a.user?.name ?? a.guestFullName ?? "—";
                const contact = a.guestPhone ?? a.user?.email ?? "—";
                const isGuest = !a.user;

                return (
                  <tr key={a.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3">{contact}</td>
                    <td className="px-4 py-3">
                      <Badge variant={isGuest ? "secondary" : "outline"}>
                        {isGuest ? "Khách" : "Tài khoản"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{a.paper.title}</td>
                    <td className="px-4 py-3">
                      {pct !== null ? `${pct}%` : "—"}
                    </td>
                    <td className="px-4 py-3">{a.placementReport?.cefrLevel ?? "—"}</td>
                    <td className="px-4 py-3">{a.placementReport?.cambridgeLevel ?? "—"}</td>
                    <td className="px-4 py-3">
                      {a.submittedAt
                        ? new Date(a.submittedAt).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/placement/results/${a.id}`}
                        className="font-medium text-cambridge-600 hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
