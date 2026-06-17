"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startPlacementAttemptAction } from "@/lib/actions/placement";
import { notifyGuestPlacementLimitHit } from "@/lib/promo/events";
import { useMascotToast } from "@/components/kids/mascot-toast-provider";
import { mascotPlacementOpeningWaitMessage } from "@/lib/kids/mascot-messages";
import { usePlacementSession } from "@/components/placement/use-placement-session";

export function usePlacementStart(initialIsLoggedIn = false) {
  const router = useRouter();
  const { showMascot, hideMascot } = useMascotToast();
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, sessionPending } = usePlacementSession(initialIsLoggedIn);

  const startPlacement = useCallback(
    async (paperId: string, guest?: { fullName: string; phone: string }) => {
      if (sessionPending) {
        toast.message("Đang kiểm tra phiên đăng nhập…");
        return { ok: false as const };
      }

      setLoading(true);
      showMascot(mascotPlacementOpeningWaitMessage());
      try {
        const res = await startPlacementAttemptAction(paperId, guest);

        if (res.error || !res.attemptId) {
          hideMascot();
          if (!isLoggedIn && res.error?.includes("trong tháng")) {
            notifyGuestPlacementLimitHit();
            return { ok: false as const, error: res.error };
          }
          toast.error(res.error ?? "Không thể bắt đầu bài test");
          return { ok: false as const, error: res.error };
        }

        if (res.resumed) {
          toast.info("Tiếp tục bài placement đang dở");
        }

        hideMascot();
        router.push(`/placement/take/${paperId}?attemptId=${res.attemptId}`);
        return { ok: true as const, attemptId: res.attemptId };
      } catch {
        hideMascot();
        toast.error("Không thể bắt đầu bài test");
        return { ok: false as const };
      } finally {
        setLoading(false);
      }
    },
    [hideMascot, isLoggedIn, router, sessionPending, showMascot]
  );

  return { startPlacement, loading, isLoggedIn, sessionPending };
}
