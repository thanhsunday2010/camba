"use client";

import Link from "next/link";
import { PlacementOpenLink } from "@/components/placement/placement-open-button";

export function FooterNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (href === "/placement") {
    return (
      <PlacementOpenLink className={className}>{children}</PlacementOpenLink>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
