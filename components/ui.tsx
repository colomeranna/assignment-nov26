"use client";

import { ChevronDown, CircleAlert, CircleCheck, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";

// Shared design tokens as class strings, so every screen uses the same look.
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";
export const card = "rounded-xl border border-slate-200 bg-white shadow-sm";
export const primaryButton = `inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${focusRing}`;
export const secondaryButton = `inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`;
export const quietButton = `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 ${focusRing}`;
export const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/30";

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
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-semibold tracking-normal text-slate-600 tabular-nums">
          {count}
        </span>
      )}
    </Heading>
  );
}

type BannerProps = { tone: "success" | "error"; children: ReactNode; onDismiss?: () => void };

/** Success or error message with an icon. Dismissible: by the caller via onDismiss, or on its own. */
export function Banner({ tone, children, onDismiss }: BannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  if (isDismissed) return null;

  const isSuccess = tone === "success";
  const Icon = isSuccess ? CircleCheck : CircleAlert;
  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
      }`}
    >
      <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${isSuccess ? "text-emerald-600" : "text-rose-600"}`} />
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

export function NewTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-teal-200 ring-inset">
      {children}
    </span>
  );
}

type EmptyStateProps = { icon: ReactNode; text: string };

export function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
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
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-teal-50 font-semibold text-teal-700 ring-1 ring-teal-100 ${AVATAR_SIZES[size]}`}
    >
      {initialsOf(name)}
    </span>
  );
}
