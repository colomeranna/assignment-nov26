import { formatDay } from "@/lib/dates";
import type { ConsultationOutcome, Prescription } from "@/lib/types";

export function PrescriptionText({ prescription }: { prescription: Prescription | undefined }) {
  if (prescription === undefined) return <span className="text-slate-500">None</span>;
  const details = [prescription.dosage, prescription.duration && `for ${prescription.duration}`].filter(Boolean);
  return (
    <span>
      <span className="font-medium text-slate-900">{prescription.medication}</span>
      {details.length > 0 && <span className="text-slate-500"> · {details.join(" · ")}</span>}
    </span>
  );
}

type Props = { outcome: ConsultationOutcome };

export function OutcomeDetails({ outcome }: Props) {
  const { diagnosis, prescription, completedAt } = outcome;
  return (
    <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-3">
      <div>
        <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Consultation date</dt>
        <dd className="mt-0.5 text-slate-900">{formatDay(completedAt.slice(0, 10))}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Diagnosis</dt>
        <dd className="mt-0.5 whitespace-pre-line text-slate-900">{diagnosis}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Prescription</dt>
        <dd className="mt-0.5">
          <PrescriptionText prescription={prescription} />
        </dd>
      </div>
    </dl>
  );
}
