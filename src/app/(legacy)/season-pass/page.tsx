"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { SeasonPassPerks } from "@/components/season-pass/SeasonPassPerks";

const SeasonPassPage = () => {
  const router = useRouter();
  const { activePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (activePlaythrough === null) {
      router.replace("/playthrough/list");
    }
  }, [activePlaythrough, router]);

  if (!activePlaythrough) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="relative h-9 w-9 shrink-0">
          <Image
            src="/images/season-pass/other/season-challenges-gold.png"
            alt="Season Pass"
            fill
            className="object-contain"
            sizes="36px"
          />
        </div>
        <div>
          <h1 className="text-[18px] font-extrabold text-primary leading-tight">Season Pass</h1>
          <p className="text-[11px] text-secondary">Gold Pass perks active this season</p>
        </div>
      </div>
      <SeasonPassPerks />
    </div>
  );
}
export default SeasonPassPage;
