"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetDemoData, signOut } from "@/lib/store";

export function ResetDemoButton() {
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
        className="rounded-md border border-slate-300 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
      >
        Reset demo data
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label="Reset demo data" className="w-full space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 sm:w-auto">
      <p>This clears your bookings and consultations and restores the sample data.</p>
      <div className="flex gap-2">
        <button type="button" onClick={reset} className="rounded-md bg-amber-700 px-3 py-1 font-medium text-white hover:bg-amber-800">
          Reset
        </button>
        <button type="button" onClick={() => setIsConfirming(false)} className="rounded-md border border-amber-300 px-3 py-1 hover:bg-amber-100">
          Cancel
        </button>
      </div>
    </div>
  );
}
