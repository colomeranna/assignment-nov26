"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetDemoData, signOut } from "@/lib/store";
import { focusRing, quietButton } from "./ui";

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
      className="flex w-full flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:w-auto sm:max-w-sm"
    >
      <p>This clears your bookings and consultations and restores the sample data.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className={`rounded-lg bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-700 ${focusRing}`}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className={`rounded-lg border border-amber-300 bg-white px-3 py-1.5 hover:bg-amber-100 ${focusRing}`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
