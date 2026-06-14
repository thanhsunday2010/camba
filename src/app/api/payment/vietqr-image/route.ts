import { NextRequest, NextResponse } from "next/server";

function isAllowedVietQrUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "img.vietqr.io" && parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target || !isAllowedVietQrUrl(target)) {
    return NextResponse.json({ error: "Invalid QR URL" }, { status: 400 });
  }

  const res = await fetch(target, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch QR image" }, { status: 502 });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
