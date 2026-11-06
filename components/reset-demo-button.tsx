"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { resetDemoData, signOut } from "@/lib/store";
import { dangerButton, quietButton, secondaryButton } from "./ui";

/** Icon button that confirms in a small popover anchored underneath it. */
export function ResetDemoButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }
    function onPointerDown(e: PointerEvent) {
      if (e.target instanceof Node && !wrapperRef.current?.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  function reset() {
    resetDemoData();
    signOut();
    setIsOpen(false);
    router.push("/?reset=1");
  }

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Reset demo data"
        title="Reset demo data"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`${quietButton} px-2`}
      >
        <RotateCcw aria-hidden className="size-4" />
      </button>

      {isOpen && (
        <div
          role="alertdialog"
          aria-label="Reset demo data"
          className="absolute top-full right-0 z-20 mt-2 flex w-[280px] max-w-[calc(100vw-16px)] gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-md"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-rose-600" />
          <div className="space-y-3">
            <p>This clears your bookings and consultations and restores the sample data.</p>
            <div className="flex gap-2">
              <button type="button" onClick={reset} className={`${dangerButton} px-3 py-1.5`}>
                Reset
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setIsOpen(false)}
                className={`${secondaryButton} px-3 py-1.5`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
