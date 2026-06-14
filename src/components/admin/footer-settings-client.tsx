"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  resetFooterSettingsAction,
  updateFooterSettingsAction,
} from "@/lib/actions/site-footer";
import type { FooterColumn, FooterSettings } from "@/lib/site/footer";
import { Plus, Trash2 } from "lucide-react";

interface FooterSettingsClientProps {
  initialSettings: FooterSettings;
}

function emptyColumn(): FooterColumn {
  return { title: "Menu mới", links: [{ label: "Link", href: "/" }] };
}

export function FooterSettingsClient({ initialSettings }: FooterSettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<FooterSettings>(initialSettings);
  const [pending, setPending] = useState(false);

  function updateColumn(index: number, patch: Partial<FooterColumn>) {
    setSettings((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) => (i === index ? { ...col, ...patch } : col)),
    }));
  }

  function updateLink(columnIndex: number, linkIndex: number, field: "label" | "href", value: string) {
    setSettings((prev) => ({
      ...prev,
      columns: prev.columns.map((col, ci) =>
        ci === columnIndex
          ? {
              ...col,
              links: col.links.map((link, li) =>
                li === linkIndex ? { ...link, [field]: value } : link
              ),
            }
          : col
      ),
    }));
  }

  function addLink(columnIndex: number) {
    setSettings((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === columnIndex
          ? { ...col, links: [...col.links, { label: "Link mới", href: "/" }] }
          : col
      ),
    }));
  }

  function removeLink(columnIndex: number, linkIndex: number) {
    setSettings((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === columnIndex
          ? { ...col, links: col.links.filter((_, li) => li !== linkIndex) }
          : col
      ),
    }));
  }

  async function handleSave() {
    setPending(true);
    const result = await updateFooterSettingsAction(settings);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Đã lưu chân trang!");
    router.refresh();
  }

  async function handleReset() {
    if (!confirm("Khôi phục nội dung chân trang mặc định?")) return;
    setPending(true);
    const result = await resetFooterSettingsAction();
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.settings) setSettings(result.settings);
    toast.success("Đã khôi phục mặc định");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle>Thông tin thương hiệu</CardTitle>
          <CardDescription>Mô tả ngắn và thông tin liên hệ hiển thị ở chân trang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brandDescription">Mô tả</Label>
            <Textarea
              id="brandDescription"
              value={settings.brandDescription}
              onChange={(e) => setSettings((s) => ({ ...s, brandDescription: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                value={settings.contactEmail ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Số điện thoại</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, contactPhone: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={settings.address ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="copyright">Bản quyền</Label>
            <Input
              id="copyright"
              value={settings.copyright}
              onChange={(e) => setSettings((s) => ({ ...s, copyright: e.target.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Dùng {"{year}"} để tự động thay năm hiện tại
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-purple-800">Cột menu chân trang</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setSettings((s) => ({ ...s, columns: [...s.columns, emptyColumn()] }))}
          >
            <Plus className="mr-1 h-4 w-4" />
            Thêm cột
          </Button>
        </div>

        {settings.columns.map((column, columnIndex) => (
          <Card key={columnIndex} className="border border-purple-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Input
                  value={column.title}
                  onChange={(e) => updateColumn(columnIndex, { title: e.target.value })}
                  className="max-w-xs font-bold"
                />
                {settings.columns.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        columns: s.columns.filter((_, i) => i !== columnIndex),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.links.map((link, linkIndex) => (
                <div key={linkIndex} className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[140px] flex-1">
                    <Label className="text-xs">Nhãn</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(columnIndex, linkIndex, "label", e.target.value)}
                    />
                  </div>
                  <div className="min-w-[180px] flex-[2]">
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={link.href}
                      onChange={(e) => updateLink(columnIndex, linkIndex, "href", e.target.value)}
                      placeholder="/pricing"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-600"
                    disabled={column.links.length <= 1}
                    onClick={() => removeLink(columnIndex, linkIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => addLink(columnIndex)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Thêm link
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={pending} className="rounded-full">
          {pending ? "Đang lưu..." : "Lưu chân trang"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} className="rounded-full" onClick={handleReset}>
          Khôi phục mặc định
        </Button>
      </div>
    </div>
  );
}
