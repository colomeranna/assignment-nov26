"use client";

import { ChevronDown, CircleAlert, CircleCheck, HeartPulse, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";

// ---- Palette. Every colour in the app comes from here:
// brand = teal, neutrals = slate, statuses = sky (booked) / emerald (completed),
// feedback = emerald (success) / rose (error, destructive). Nothing else.

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2";

/** Soft brand surface: icon tiles, avatars, date blocks. */
export const brandSoft = "border border-teal-100 bg-teal-50 text-teal-800";

export const card = "rounded-xl border border-slate-200 bg-white shadow-sm";

/** Selectable chips and cards (day pills, time slots, doctor cards). */
export const choiceIdle = "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50";
export const choiceSelected = "border-teal-600 bg-teal-600 text-white shadow-sm";
export const choiceSelectedCard = "border-teal-600 bg-teal-50 ring-2 ring-teal-600";
export const choiceUnavailable = "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400";

export const primaryButton = `inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none ${focusRing}`;
export const secondaryButton = `inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`;
export const quietButton = `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 ${focusRing}`;
export const dangerButton = `inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 ${focusRing}`;
export const linkClass = `rounded font-medium text-teal-700 hover:text-teal-800 ${focusRing}`;

const fieldBox = "block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700";
export const inputClass = `${fieldBox} py-2 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 aria-[invalid=true]:border-rose-300 aria-[invalid=true]:focus:ring-rose-600/20`;
export const textareaClass = inputClass.replace("h-10 ", "");

// ---- Components

export function Logo() {
  return (
    <span aria-hidden className={`inline-flex size-9 items-center justify-center rounded-lg ${brandSoft}`}>
      <HeartPulse className="size-5 text-teal-600" />
    </span>
  );
}

export function Select({ className = "", children, ...props }: ComponentProps<"select">) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className={`${inputClass} appearance-none pr-10`}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

type ReadOnlyFieldProps = { id: string; value: string; icon: ReactNode };

/** Looks like a select, but the value is fixed. */
export function ReadOnlyField({ id, value, icon }: ReadOnlyFieldProps) {
  return (
    <div className="relative">
      <input id={id} readOnly value={value} className={`${inputClass} pr-10`} />
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 [&_svg]:size-4">
        {icon}
      </span>
    </div>
  );
}

type LabelProps = { htmlFor: string; required?: boolean; children: ReactNode };

export function Label({ htmlFor, required = false, children }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required && (
        <span aria-hidden className="ml-0.5 text-rose-600">
          *
        </span>
      )}
    </label>
  );
}

export function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (message === undefined) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm text-rose-600">
      <CircleAlert aria-hidden className="size-4 shrink-0" />
      {message}
    </p>
  );
}

type SectionTitleProps = { title: string; count?: number; as?: "h2" | "h3" };

export function SectionTitle({ title, count, as: Heading = "h2" }: SectionTitleProps) {
  return (
    <Heading className="flex items-center gap-2 text-sm font-medium tracking-wide text-slate-500 uppercase">
      {title}
      {count !== undefined && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tracking-normal text-slate-700 tabular-nums">
          {count}
        </span>
      )}
    </Heading>
  );
}

const BANNER_TONES = {
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: "text-emerald-600", Icon: CircleCheck },
  error: { box: "border-rose-200 bg-rose-50 text-rose-800", icon: "text-rose-600", Icon: CircleAlert },
} as const;

type BannerProps = { tone: keyof typeof BANNER_TONES; children: ReactNode; onDismiss?: () => void };

/** Success or error message with an icon. Dismissible: by the caller via onDismiss, or on its own. */
export function Banner({ tone, children, onDismiss }: BannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  if (isDismissed) return null;

  const { box, icon, Icon } = BANNER_TONES[tone];
  return (
    <div role={tone === "success" ? "status" : "alert"} className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${box}`}>
      <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${icon}`} />
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => (onDismiss ? onDismiss() : setIsDismissed(true))}
        className={`-m-1 rounded-md p-1 opacity-70 hover:opacity-100 ${focusRing}`}
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

/** Highlights something created in this session; deliberately unlike the status badges. */
export function NewTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-teal-600 bg-teal-600 px-2.5 py-0.5 text-xs font-medium text-white">
      {children}
    </span>
  );
}

type EmptyStateProps = { icon: ReactNode; text: string };

export function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
      <span className="text-slate-400 [&_svg]:size-6">{icon}</span>
      {text}
    </div>
  );
}

function initialsOf(name: string): string {
  const words = name.replace(/^Dr\.\s*/, "").split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
} as const;

type AvatarProps = { name: string; size?: keyof typeof AVATAR_SIZES };

export function Avatar({ name, size = "md" }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${brandSoft} ${AVATAR_SIZES[size]}`}
    >
      {initialsOf(name)}
    </span>
  );
}
