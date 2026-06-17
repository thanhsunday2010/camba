"use client";

import Link from "next/link";
import { PlacementOpenLink } from "@/components/placement/placement-open-button";
import { parsePlacementHref } from "@/lib/placement/picker-url";

export function FooterNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const placementPreset = parsePlacementHref(href);
  if (placementPreset !== null) {
    return (
      <PlacementOpenLink className={className} preset={placementPreset}>
        {children}
      </PlacementOpenLink>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
