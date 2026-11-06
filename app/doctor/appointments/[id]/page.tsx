"use client";

import Link from "next/link";
import { use, useState } from "react";
import { OutcomeDetails } from "@/components/outcome-details";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { StatusBadge } from "@/components/status-badge";
import { validateConsultation } from "@/lib/consultation";
import type { ConsultationErrors, ConsultationForm } from "@/lib/consultation";
import { ageOn, formatDay, formatLongDate } from "@/lib/dates";
import { completeConsultation, useDemo } from "@/lib/store";
import type { Appointment, BookedAppointment, DemoData, Patient } from "@/lib/types";

const card = "space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm";
const input = "w-full rounded-md border border-slate-300 px-3 py-2";

function BackLink() {
  return (
    <Link href="/doctor" className="text-sm text-teal-700 underline">
      ← Back to dashboard
    </Link>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  if (message === undefined) return null;
  return <p className="text-sm text-red-700">{message}</p>;
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
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="diagnosis" className="font-medium">
          Diagnosis <span className="font-normal text-slate-500">(required)</span>
        </label>
        <textarea
          id="diagnosis"
          rows={3}
          value={form.diagnosis}
          onChange={update("diagnosis")}
          aria-invalid={errors.diagnosis !== undefined}
          className={input}
        />
        <FieldError message={errors.diagnosis} />
      </div>

      <fieldset className="space-y-3 rounded-md border border-slate-200 p-4">
        <legend className="px-1 font-medium">
          Prescription <span className="font-normal text-slate-500">(optional)</span>
        </legend>
        <div className="space-y-1">
          <label htmlFor="medication" className="text-sm">Medication</label>
          <input id="medication" value={form.medication} onChange={update("medication")} placeholder="e.g. Amoxicillin" aria-invalid={errors.medication !== undefined} className={input} />
          <FieldError message={errors.medication} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="dosage" className="text-sm">Dosage</label>
            <input id="dosage" value={form.dosage} onChange={update("dosage")} placeholder="e.g. 500 mg, twice a day" aria-invalid={errors.dosage !== undefined} className={input} />
            <FieldError message={errors.dosage} />
          </div>
          <div className="space-y-1">
            <label htmlFor="duration" className="text-sm">Duration</label>
            <input id="duration" value={form.duration} onChange={update("duration")} placeholder="e.g. 7 days" className={input} />
          </div>
        </div>
      </fieldset>

      {saveError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {saveError}
        </p>
      )}
      <button type="submit" className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800">
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
    .flatMap((a) => (a.status === "completed" && a.patientId === appointment.patientId && a.id !== appointment.id ? [a] : []))
    .sort((a, b) => b.outcome.completedAt.localeCompare(a.outcome.completedAt));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <BackLink />
        <h1 className="text-2xl font-semibold tracking-tight">Patient record</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className={card}>
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Patient</h2>
          {patient ? (
            <div>
              <p className="text-lg font-medium">{patient.name}</p>
              <p className="text-sm text-slate-600">
                Born {formatLongDate(patient.dateOfBirth)} · {ageOn(patient.dateOfBirth, now)} years
              </p>
            </div>
          ) : (
            <p className="text-slate-500">Unknown patient</p>
          )}
        </section>

        <section className={card}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">This appointment</h2>
            <StatusBadge status={appointment.status} />
          </div>
          <dl className="grid grid-cols-[4.5rem_1fr] gap-1 text-sm">
            <dt className="text-slate-500">Date</dt>
            <dd>{formatDay(appointment.date)}</dd>
            <dt className="text-slate-500">Time</dt>
            <dd>{appointment.time}</dd>
            <dt className="text-slate-500">Doctor</dt>
            <dd>{doctor ? `${doctor.name} (${doctor.specialty})` : "Unknown doctor"}</dd>
            <dt className="text-slate-500">Reason</dt>
            <dd>{appointment.reason || "—"}</dd>
          </dl>
        </section>
      </div>

      <section className={card}>
        <h2 className="text-lg font-medium">Consultation</h2>
        {justCompleted && (
          <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-800">
            Consultation completed and shared with {patient?.name ?? "the patient"}.
          </p>
        )}
        {appointment.status === "booked" ? (
          <ConsultationFormCard appointment={appointment} onCompleted={() => setJustCompleted(true)} />
        ) : (
          <OutcomeDetails outcome={appointment.outcome} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          Consultation history <span className="text-slate-400">· {history.length}</span>
        </h2>
        {history.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">
            No earlier consultations for this patient.
          </p>
        ) : (
          <ul className="space-y-3">
            {history.map((a) => {
              const historyDoctor = findDoctor(a.doctorId);
              return (
                <li key={a.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium">
                    {historyDoctor ? `${historyDoctor.name} · ${historyDoctor.specialty}` : "Unknown doctor"}
                  </p>
                  <OutcomeDetails outcome={a.outcome} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

type PageProps = { params: Promise<{ id: string }> };

export default function AppointmentRecordPage({ params }: PageProps) {
  const { id } = use(params);
  const demo = useDemo();
  if (demo.kind === "loading") return <p className="text-slate-500">Loading…</p>;

  const session = demo.session;
  if (session?.role !== "doctor") return <SignInPrompt role="doctor" />;

  // Another doctor's appointment gets the same message as a missing one.
  const appointment = demo.data.appointments.find((a) => a.id === id && a.doctorId === session.doctorId);
  if (appointment === undefined) {
    return (
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-medium">Appointment not found</h1>
        <p className="text-slate-600">This appointment doesn&apos;t exist or isn&apos;t one of yours.</p>
        <BackLink />
      </div>
    );
  }

  const patient = demo.data.patients.find((p) => p.id === appointment.patientId);
  return <PatientRecord key={appointment.id} data={demo.data} appointment={appointment} patient={patient} />;
}
