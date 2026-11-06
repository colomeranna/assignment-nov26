import { formatDay } from "@/lib/dates";
import type { ConsultationOutcome } from "@/lib/types";

type Props = { outcome: ConsultationOutcome };

export function OutcomeDetails({ outcome }: Props) {
  const { diagnosis, prescription, completedAt } = outcome;
  return (
    <dl className="grid gap-1 rounded-md bg-slate-50 p-3 text-sm sm:grid-cols-[9rem_1fr]">
      <dt className="text-slate-500">Consultation date</dt>
      <dd>{formatDay(completedAt.slice(0, 10))}</dd>
      <dt className="text-slate-500">Diagnosis</dt>
      <dd className="whitespace-pre-line">{diagnosis}</dd>
      <dt className="text-slate-500">Prescription</dt>
      <dd>
        {prescription
          ? [prescription.medication, prescription.dosage, prescription.duration && `for ${prescription.duration}`]
              .filter(Boolean)
              .join(" · ")
          : "None"}
      </dd>
    </dl>
  );
}
