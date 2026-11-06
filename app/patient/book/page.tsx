"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { Avatar, Banner, Label, card, focusRing, inputClass, primaryButton } from "@/components/ui";
import { dateParts, formatDay } from "@/lib/dates";
import { getBookableDays, getSlots } from "@/lib/schedule";
import type { SlotStatus } from "@/lib/schedule";
import { bookAppointment, useDemo } from "@/lib/store";
import type { DemoData } from "@/lib/types";

const UNAVAILABLE_LABEL: Record<Exclude<SlotStatus, "available">, string> = {
  taken: "Taken",
  past: "Unavailable",
};

function listMissing(choice: { doctorId: string | null; date: string | null; time: string | null }): string[] {
  const missing: string[] = [];
  if (choice.doctorId === null) missing.push("a doctor");
  if (choice.date === null) missing.push("a day");
  if (choice.time === null) missing.push("a time");
  return missing;
}

function joinWithAnd(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function StepNumber({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
        done ? "bg-teal-600 text-white" : "bg-white text-slate-500 ring-1 ring-slate-300"
      }`}
    >
      {done ? <Check aria-hidden className="size-4" strokeWidth={3} /> : n}
    </span>
  );
}

function Stepper({ steps }: { steps: { label: string; done: boolean }[] }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {steps.map((step, index) => (
        <li key={step.label} className="flex flex-1 items-center gap-2 sm:gap-3">
          <StepNumber n={index + 1} done={step.done} />
          <span className={`text-sm font-medium ${step.done ? "text-slate-900" : "text-slate-500"}`}>{step.label}</span>
          {index < steps.length - 1 && <span aria-hidden className="h-px flex-1 bg-slate-200" />}
        </li>
      ))}
    </ol>
  );
}

type StepCardProps = { n: number; title: string; done: boolean; children: ReactNode };

function StepCard({ n, title, done, children }: StepCardProps) {
  return (
    <section className={`${card} space-y-4 p-5`}>
      <h2 className="flex items-center gap-3 text-base font-semibold text-slate-900">
        <StepNumber n={n} done={done} />
        {title}
      </h2>
      {children}
    </section>
  );
}

const selectedRing = "border-teal-600 bg-teal-50/60 ring-2 ring-teal-600";

type FormProps = { data: DemoData; patientId: string };

function BookingForm({ data, patientId }: FormProps) {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const days = getBookableDays(now);
  const slots =
    doctorId !== null && date !== null ? getSlots({ appointments: data.appointments, doctorId, date, now }) : [];
  const doctor = data.doctors.find((d) => d.id === doctorId);
  const missing = listMissing({ doctorId, date, time });

  function chooseDoctor(id: string) {
    setDoctorId(id);
    setTime(null);
    setError(null);
  }

  function chooseDay(day: string) {
    setDate(day);
    setTime(null);
    setError(null);
  }

  function confirm() {
    if (doctorId === null || date === null || time === null) return;
    const trimmedReason = reason.trim();
    const result = bookAppointment({
      patientId,
      doctorId,
      date,
      time,
      reason: trimmedReason === "" ? undefined : trimmedReason,
    });
    switch (result.kind) {
      case "booked":
        router.push(`/patient?booked=${encodeURIComponent(result.appointment.id)}`);
        return;
      case "unavailable":
        setError(`Sorry, ${time} is no longer available. Please choose another time.`);
        setTime(null);
        setNow(new Date());
        return;
      default: {
        const _exhaustive: never = result;
        return _exhaustive;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href="/patient" className={`inline-flex items-center gap-1.5 rounded text-sm font-medium text-teal-700 hover:text-teal-800 ${focusRing}`}>
          <ArrowLeft aria-hidden className="size-4" />
          My appointments
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Book an appointment</h1>
      </div>

      <Stepper
        steps={[
          { label: "Doctor", done: doctorId !== null },
          { label: "Day", done: date !== null },
          { label: "Time", done: time !== null },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <StepCard n={1} title="Choose a doctor" done={doctorId !== null}>
            <div className="grid gap-3 sm:grid-cols-3">
              {data.doctors.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={d.id === doctorId}
                  onClick={() => chooseDoctor(d.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${focusRing} ${
                    d.id === doctorId ? selectedRing : "border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50"
                  }`}
                >
                  <Avatar name={d.name} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">{d.name}</span>
                    <span className="block truncate text-xs text-slate-500">{d.specialty}</span>
                  </span>
                </button>
              ))}
            </div>
          </StepCard>

          <StepCard n={2} title="Choose a day" done={date !== null}>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => {
                const { weekday, day: dayNumber, month } = dateParts(day);
                const isSelected = day === date;
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => chooseDay(day)}
                    className={`inline-flex items-baseline gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${focusRing} ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-teal-400"
                    }`}
                  >
                    <span className={isSelected ? "text-teal-100" : "text-slate-500"}>{weekday}</span>
                    <span className="font-medium">
                      {dayNumber} {month}
                    </span>
                  </button>
                );
              })}
            </div>
          </StepCard>

          <StepCard n={3} title="Choose a time" done={time !== null}>
            {slots.length === 0 ? (
              <p className="text-sm text-slate-500">Choose a doctor and a day to see available times.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {slots.map((slot) =>
                  slot.status === "available" ? (
                    <button
                      key={slot.time}
                      type="button"
                      aria-pressed={slot.time === time}
                      onClick={() => {
                        setTime(slot.time);
                        setError(null);
                      }}
                      className={`h-12 rounded-lg border text-sm font-medium tabular-nums transition-colors ${focusRing} ${
                        slot.time === time
                          ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-50/50"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ) : (
                    <button
                      key={slot.time}
                      type="button"
                      disabled
                      className="h-12 cursor-not-allowed rounded-lg border border-slate-100 bg-slate-100 text-sm text-slate-400"
                    >
                      <span className="block leading-tight tabular-nums line-through">{slot.time}</span>
                      <span className="block text-[11px] leading-tight">{UNAVAILABLE_LABEL[slot.status]}</span>
                    </button>
                  ),
                )}
              </div>
            )}
          </StepCard>

          <section className={`${card} p-5`}>
            <Label htmlFor="reason">
              Reason for visit <span className="font-normal text-slate-500">(optional)</span>
            </Label>
            <input
              id="reason"
              type="text"
              maxLength={120}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up on blood test"
              aria-describedby="reason-help"
              className={inputClass}
            />
            <p id="reason-help" className="mt-1.5 text-xs text-slate-500">
              A few words help the doctor prepare.
            </p>
          </section>
        </div>

        <aside className={`${card} space-y-4 p-5 lg:sticky lg:top-6`}>
          <h2 className="text-base font-semibold text-slate-900">Summary</h2>
          <dl className="space-y-3 text-sm">
            {[
              ["Doctor", doctor ? `${doctor.name} · ${doctor.specialty}` : "—"],
              ["Day", date ? formatDay(date) : "—"],
              ["Time", time ?? "—"],
              ["Reason", reason.trim() || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          {error && (
            <Banner tone="error" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          )}
          {missing.length > 0 && <p className="text-sm text-slate-500">Choose {joinWithAnd(missing)} to continue.</p>}
          <button type="button" disabled={missing.length > 0} onClick={confirm} className={`${primaryButton} w-full`}>
            Confirm booking
          </button>
        </aside>
      </div>
    </div>
  );
}

export default function BookPage() {
  const demo = useDemo();
  if (demo.kind === "loading") return <p className="text-sm text-slate-500">Loading…</p>;
  const session = demo.session;
  if (session?.role !== "patient") return <SignInPrompt role="patient" />;
  return <BookingForm data={demo.data} patientId={session.patientId} />;
}
