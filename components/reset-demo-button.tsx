"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetDemoData, signOut } from "@/lib/store";
import { card, dangerButton, quietButton, secondaryButton } from "./ui";

type Props = {
  /** Icon-only below the sm breakpoint, for the phone header. */
  compact?: boolean;
};

export function ResetDemoButton({ compact = false }: Props) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  function reset() {
    resetDemoData();
    signOut();
    setIsConfirming(false);
    router.push("/?reset=1");
  }

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        aria-label={compact ? "Reset demo data" : undefined}
        title={compact ? "Reset demo data" : undefined}
        className={quietButton}
      >
        <RotateCcw aria-hidden className="size-4" />
        <span className={compact ? "hidden sm:inline" : undefined}>Reset demo data</span>
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label="Reset demo data"
      className={`${card} flex w-full gap-3 p-4 text-sm text-slate-700 sm:w-auto sm:max-w-sm`}
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-rose-600" />
      <div className="space-y-3">
        <p>This clears your bookings and consultations and restores the sample data.</p>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className={`${dangerButton} px-3 py-1.5`}>
            Reset
          </button>
          <button type="button" onClick={() => setIsConfirming(false)} className={`${secondaryButton} px-3 py-1.5`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
