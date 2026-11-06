"use client";

import { ArrowLeft, Check, ClipboardList, SearchX } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { OutcomeDetails, PrescriptionText } from "@/components/outcome-details";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { StatusBadge } from "@/components/status-badge";
import {
  Avatar,
  Banner,
  EmptyState,
  FieldError,
  Label,
  SectionTitle,
  card,
  inputClass,
  linkClass,
  primaryButton,
  textareaClass,
} from "@/components/ui";
import { validateConsultation } from "@/lib/consultation";
import type { ConsultationErrors, ConsultationForm } from "@/lib/consultation";
import { ageOn, formatDay, formatLongDate } from "@/lib/dates";
import { completeConsultation, useDemo } from "@/lib/store";
import type { Appointment, BookedAppointment, DemoData, Patient } from "@/lib/types";

function BackLink() {
  return (
    <Link
      href="/doctor"
      className={`inline-flex items-center gap-1.5 text-sm ${linkClass}`}
    >
      <ArrowLeft aria-hidden className="size-4" />
      Back to dashboard
    </Link>
  );
}

type FormProps = { appointment: BookedAppointment; onCompleted: () => void };

function ConsultationFormCard({ appointment, onCompleted }: FormProps) {
  const [form, setForm] = useState<ConsultationForm>({ diagnosis: "", medication: "", dosage: "", duration: "" });
  const [errors, setErrors] = useState<ConsultationErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const update = (field: keyof ConsultationForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateConsultation(form);
    if (validation.kind === "invalid") {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    const result = completeConsultation({
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      outcome: validation.outcome,
    });
    switch (result.kind) {
      case "completed":
        onCompleted();
        return;
      case "not-found":
        setSaveError("This appointment no longer exists.");
        return;
      case "already-completed":
        setSaveError("This consultation was already completed elsewhere.");
        return;
      default: {
        const _exhaustive: never = result;
        return _exhaustive;
      }
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <Label htmlFor="diagnosis" required>
          Diagnosis
        </Label>
        <textarea
          id="diagnosis"
          rows={4}
          value={form.diagnosis}
          onChange={update("diagnosis")}
          aria-invalid={errors.diagnosis !== undefined}
          aria-describedby={errors.diagnosis ? "diagnosis-error" : undefined}
          className={textareaClass}
        />
        <FieldError id="diagnosis-error" message={errors.diagnosis} />
      </div>

      <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">
          Prescription <span className="font-normal text-slate-500">(optional)</span>
        </legend>
        <p className="-mt-1 text-xs text-slate-500">If you add one, medication and dosage are required.</p>
        <div>
          <Label htmlFor="medication">Medication</Label>
          <input
            id="medication"
            value={form.medication}
            onChange={update("medication")}
            placeholder="e.g. Amoxicillin"
            aria-invalid={errors.medication !== undefined}
            aria-describedby={errors.medication ? "medication-error" : undefined}
            className={inputClass}
          />
          <FieldError id="medication-error" message={errors.medication} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dosage">Dosage</Label>
            <input
              id="dosage"
              value={form.dosage}
              onChange={update("dosage")}
              placeholder="e.g. 500 mg, twice a day"
              aria-invalid={errors.dosage !== undefined}
              aria-describedby={errors.dosage ? "dosage-error" : undefined}
              className={inputClass}
            />
            <FieldError id="dosage-error" message={errors.dosage} />
          </div>
          <div>
            <Label htmlFor="duration">Duration</Label>
            <input
              id="duration"
              value={form.duration}
              onChange={update("duration")}
              placeholder="e.g. 7 days"
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {saveError && (
        <Banner tone="error" onDismiss={() => setSaveError(null)}>
          {saveError}
        </Banner>
      )}
      <button type="submit" className={`${primaryButton} w-full sm:w-auto`}>
        <Check aria-hidden className="size-4" />
        Complete consultation
      </button>
    </form>
  );
}

type RecordProps = { data: DemoData; appointment: Appointment; patient: Patient | undefined };

function PatientRecord({ data, appointment, patient }: RecordProps) {
  const [now] = useState(() => new Date());
  const [justCompleted, setJustCompleted] = useState(false);
  const findDoctor = (id: string) => data.doctors.find((d) => d.id === id);
  const doctor = findDoctor(appointment.doctorId);

  const history = data.appointments
    .flatMap((a) =>
      a.status === "completed" && a.patientId === appointment.patientId && a.id !== appointment.id ? [a] : [],
    )
    .sort((a, b) => b.outcome.completedAt.localeCompare(a.outcome.completedAt));

  const details: [string, string][] = [
    ["Date", formatDay(appointment.date)],
    ["Time", appointment.time],
    ["Doctor", doctor ? `${doctor.name} · ${doctor.specialty}` : "Unknown doctor"],
    ["Reason", appointment.reason || "—"],
  ];

  return (
    <div className="space-y-6">
      <BackLink />

      <section className={`${card} grid gap-6 p-5 sm:p-6 md:grid-cols-[1fr_1.4fr]`}>
        <div className="flex items-center gap-4">
          <Avatar name={patient?.name ?? "?"} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Patient record</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
              {patient?.name ?? "Unknown patient"}
            </h1>
            {patient && (
              <p className="text-sm text-slate-500">
                Born {formatLongDate(patient.dateOfBirth)} · {ageOn(patient.dateOfBirth, now)} years
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-slate-100 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <SectionTitle title="This appointment" />
            <StatusBadge status={appointment.status} />
          </div>
          <dl className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <section className={`${card} space-y-4 p-5 sm:p-6`}>
          <h2 className="text-base font-semibold text-slate-900">Consultation</h2>
          {justCompleted && (
            <Banner tone="success">Consultation completed and shared with {patient?.name ?? "the patient"}.</Banner>
          )}
          {appointment.status === "booked" ? (
            <ConsultationFormCard appointment={appointment} onCompleted={() => setJustCompleted(true)} />
          ) : (
            <OutcomeDetails outcome={appointment.outcome} />
          )}
        </section>

        <section className="space-y-3">
          <SectionTitle title="Consultation history" count={history.length} />
          {history.length === 0 ? (
            <EmptyState icon={<ClipboardList aria-hidden />} text="No earlier consultations for this patient." />
          ) : (
            <ol className={`${card} space-y-0 p-5`}>
              {history.map((a, index) => {
                const historyDoctor = findDoctor(a.doctorId);
                const isLast = index === history.length - 1;
                return (
                  <li key={a.id} className="relative pb-6 pl-6 last:pb-0">
                    {!isLast && <span aria-hidden className="absolute top-3 bottom-0 left-[5px] w-px bg-slate-200" />}
                    <span aria-hidden className="absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-teal-600 bg-white" />
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                      {formatDay(a.outcome.completedAt.slice(0, 10))}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {historyDoctor ? historyDoctor.name : "Unknown doctor"}
                      {historyDoctor && <span className="font-normal text-slate-500"> · {historyDoctor.specialty}</span>}
                    </p>
                    <dl className="mt-2 space-y-1.5 text-sm">
                      <div>
                        <dt className="text-xs text-slate-500">Diagnosis</dt>
                        <dd className="text-slate-700">{a.outcome.diagnosis}</dd>
                      </div>
                      {a.outcome.prescription && (
                        <div>
                          <dt className="text-xs text-slate-500">Prescription</dt>
                          <dd>
                            <PrescriptionText prescription={a.outcome.prescription} />
                          </dd>
                        </div>
                      )}
                    </dl>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

type PageProps = { params: Promise<{ id: string }> };

export default function AppointmentRecordPage({ params }: PageProps) {
  const { id } = use(params);
  const demo = useDemo();
  if (demo.kind === "loading") return <p className="text-sm text-slate-500">Loading…</p>;

  const session = demo.session;
  if (session?.role !== "doctor") return <SignInPrompt role="doctor" />;

  // Another doctor's appointment gets the same message as a missing one.
  const appointment = demo.data.appointments.find((a) => a.id === id && a.doctorId === session.doctorId);
  if (appointment === undefined) {
    return (
      <div className={`${card} mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center`}>
        <SearchX aria-hidden className="size-6 text-slate-400" />
        <h1 className="text-lg font-semibold text-slate-900">Appointment not found</h1>
        <p className="text-sm text-slate-500">This appointment doesn&apos;t exist or isn&apos;t one of yours.</p>
        <BackLink />
      </div>
    );
  }

  const patient = demo.data.patients.find((p) => p.id === appointment.patientId);
  return <PatientRecord key={appointment.id} data={demo.data} appointment={appointment} patient={patient} />;
}
