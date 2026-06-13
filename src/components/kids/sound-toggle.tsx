"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKidSound } from "./sound-provider";

export function SoundToggle() {
  const { enabled, toggle } = useKidSound();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="rounded-full hover:bg-sunshine-100"
      title={enabled ? "Tắt âm thanh" : "Bật âm thanh"}
    >
      {enabled ? (
        <Volume2 className="h-4 w-4 text-sunshine-600" />
      ) : (
        <VolumeX className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="sr-only">{enabled ? "Tắt âm thanh" : "Bật âm thanh"}</span>
    </Button>
  );
}
