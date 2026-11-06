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
    <dl className="grid gap-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-[1fr_1.6fr_1.4fr] md:gap-x-10">
      <div>
        <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Consultation date</dt>
        <dd className="mt-1.5 leading-relaxed text-slate-900">{formatDay(completedAt.slice(0, 10))}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Diagnosis</dt>
        <dd className="mt-1.5 leading-relaxed whitespace-pre-line text-slate-900">{diagnosis}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Prescription</dt>
        <dd className="mt-1.5 leading-relaxed">
          <PrescriptionText prescription={prescription} />
        </dd>
      </div>
    </dl>
  );
}
