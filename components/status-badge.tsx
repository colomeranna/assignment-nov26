import type { Appointment } from "@/lib/types";

export function StatusBadge({ status }: Pick<Appointment, "status">) {
  switch (status) {
    case "booked":
      return <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">Booked</span>;
    case "completed":
      return <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">Completed</span>;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
