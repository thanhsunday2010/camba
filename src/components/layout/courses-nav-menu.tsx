"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlacementOpenLink } from "@/components/placement/placement-open-button";
import { parsePlacementHref } from "@/lib/placement/picker-url";
import { COURSES_NAV } from "@/lib/site/courses-nav";

type CoursesNavMenuProps = {
  vertical?: boolean;
  onNavigate?: () => void;
  linkClass?: (colors: string) => string;
};

function CourseNavHref({
  href,
  className,
  children,
  onNavigate,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  const placementPreset = parsePlacementHref(href);
  if (placementPreset !== null) {
    return (
      <PlacementOpenLink
        className={className}
        preset={placementPreset}
        onNavigate={onNavigate}
      >
        {children}
      </PlacementOpenLink>
    );
  }

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}

export function CoursesNavMenu({ vertical = false, onNavigate, linkClass }: CoursesNavMenuProps) {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vertical) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [vertical]);

  const itemClass =
    linkClass?.("text-emerald-700 hover:bg-emerald-100") ??
    "rounded-full px-3 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100";

  const handleNavigate = () => {
    onNavigate?.();
    setOpen(false);
  };

  if (vertical) {
    return (
      <div className="space-y-1">
        <p className="px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          Khóa học
        </p>
        {COURSES_NAV.map((group) => (
          <div key={group.id} className="px-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-left text-base font-bold text-emerald-800 hover:bg-emerald-50"
              onClick={() =>
                setExpandedGroup((g) => (g === group.id ? null : group.id))
              }
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedGroup === group.id && "rotate-180"
                )}
              />
            </button>
            {expandedGroup === group.id && (
              <div className="mb-2 ml-2 space-y-0.5 border-l-2 border-emerald-100 pl-3">
                {group.href && (
                  <CourseNavHref
                    href={group.href}
                    className="block rounded-lg px-2 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                    onNavigate={onNavigate}
                  >
                    Tổng quan
                  </CourseNavHref>
                )}
                {group.children.map((child) => (
                  <CourseNavHref
                    key={child.href + child.label}
                    href={child.href}
                    className="block rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-emerald-50 hover:text-emerald-800"
                    onNavigate={onNavigate}
                  >
                    {child.label}
                  </CourseNavHref>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(itemClass, "inline-flex items-center gap-1")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        📚 Khóa học
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border-2 border-emerald-100 bg-white p-2 shadow-xl md:w-80">
          {COURSES_NAV.map((group) => (
            <div key={group.id} className="rounded-xl p-1">
              {group.href ? (
                <CourseNavHref
                  href={group.href}
                  className="block rounded-lg px-3 py-2 text-sm font-extrabold text-emerald-800 hover:bg-emerald-50"
                  onNavigate={handleNavigate}
                >
                  {group.label}
                </CourseNavHref>
              ) : (
                <p className="px-3 py-2 text-sm font-extrabold text-emerald-800">{group.label}</p>
              )}
              <div className="ml-1 space-y-0.5 border-l-2 border-emerald-100 pl-2">
                {group.children.map((child) => (
                  <CourseNavHref
                    key={child.href + child.label}
                    href={child.href}
                    className="block rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-emerald-50 hover:text-emerald-900"
                    onNavigate={handleNavigate}
                  >
                    {child.label}
                  </CourseNavHref>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
