import type { Appointment } from "@/lib/types";

const pill = "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export function StatusBadge({ status }: Pick<Appointment, "status">) {
  switch (status) {
    case "booked":
      return (
        <span className={`${pill} bg-sky-50 text-sky-700 ring-sky-200`}>
          <span aria-hidden className="size-1.5 rounded-full bg-sky-500" />
          Booked
        </span>
      );
    case "completed":
      return (
        <span className={`${pill} bg-emerald-50 text-emerald-700 ring-emerald-200`}>
          <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
          Completed
        </span>
      );
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
