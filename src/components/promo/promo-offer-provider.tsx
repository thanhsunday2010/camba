"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getPromoOfferAction } from "@/lib/actions/promo";
import { FREE_LIMIT_HIT_EVENT } from "@/lib/promo/events";
import type { PromoOfferPayload } from "@/lib/promo/service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SESSION_LOGIN_KEY = "camba-promo-login-shown";
const ACTIVE_MS_INTERVAL = 5 * 60 * 1000;

export function PromoOfferProvider() {
  const { data: session, status } = useSession();
  const [offer, setOffer] = useState<PromoOfferPayload | null>(null);
  const [open, setOpen] = useState(false);
  const activeMsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const offerRef = useRef<PromoOfferPayload | null>(null);

  const loadOffer = useCallback(async () => {
    if (status !== "authenticated") return null;
    const res = await getPromoOfferAction();
    const next = res.offer ?? null;
    setOffer(next);
    offerRef.current = next;
    return next;
  }, [status]);

  const showPopup = useCallback(async () => {
    const current = offerRef.current ?? (await loadOffer());
    if (current) setOpen(true);
  }, [loadOffer]);

  useEffect(() => {
    if (status !== "authenticated") {
      setOffer(null);
      offerRef.current = null;
      setOpen(false);
      return;
    }

    void loadOffer();
  }, [status, session?.user?.id, loadOffer]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const loginKey = `${SESSION_LOGIN_KEY}:${session?.user?.id ?? "anon"}`;
    if (!sessionStorage.getItem(loginKey)) {
      sessionStorage.setItem(loginKey, "1");
      const timer = window.setTimeout(() => {
        void showPopup();
      }, 800);
      return () => window.clearTimeout(timer);
    }
  }, [status, session?.user?.id, showPopup]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        lastTickRef.current = Date.now();
      } else if (lastTickRef.current != null) {
        activeMsRef.current += Date.now() - lastTickRef.current;
        lastTickRef.current = null;
      }
    };

    const onInterval = () => {
      if (document.visibilityState !== "visible") return;
      if (lastTickRef.current == null) {
        lastTickRef.current = Date.now();
        return;
      }
      const now = Date.now();
      activeMsRef.current += now - lastTickRef.current;
      lastTickRef.current = now;

      if (activeMsRef.current >= ACTIVE_MS_INTERVAL) {
        activeMsRef.current = 0;
        void showPopup();
      }
    };

    lastTickRef.current = Date.now();
    document.addEventListener("visibilitychange", onVisibility);
    const interval = window.setInterval(onInterval, 30_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, [status, showPopup]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const onLimitHit = () => {
      void showPopup();
    };

    window.addEventListener(FREE_LIMIT_HIT_EVENT, onLimitHit);
    return () => window.removeEventListener(FREE_LIMIT_HIT_EVENT, onLimitHit);
  }, [status, showPopup]);

  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{offer.title}</DialogTitle>
          <DialogDescription className="pt-2 text-left">{offer.message}</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 px-4 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-purple-600">Mã của bạn</p>
          <p className="text-2xl font-extrabold tracking-widest text-purple-800">{offer.code}</p>
          <p className="mt-1 text-sm text-purple-700">{offer.benefit}</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
            Để sau
          </Button>
          <Button asChild className="kid-btn-fun rounded-full">
            <Link href={offer.subscribeUrl} onClick={() => setOpen(false)}>
              Dùng mã ngay ✨
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
