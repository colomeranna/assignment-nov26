import type { Appointment } from "@/lib/types";

const pill = "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium";
const dot = <span aria-hidden className="size-1.5 rounded-full bg-current" />;

export function StatusBadge({ status }: Pick<Appointment, "status">) {
  switch (status) {
    case "booked":
      return (
        <span className={`${pill} border-sky-200 bg-sky-50 text-sky-700`}>
          {dot}
          Booked
        </span>
      );
    case "completed":
      return (
        <span className={`${pill} border-emerald-200 bg-emerald-50 text-emerald-700`}>
          {dot}
          Completed
        </span>
      );
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
