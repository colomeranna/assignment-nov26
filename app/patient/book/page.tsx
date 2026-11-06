"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { formatDay, formatShortDay } from "@/lib/dates";
import { getBookableDays, getSlots } from "@/lib/schedule";
import type { SlotStatus } from "@/lib/schedule";
import { bookAppointment, useDemo } from "@/lib/store";
import type { DemoData } from "@/lib/types";

const card = "space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm";

function choiceClass(selected: boolean): string {
  return selected
    ? "border-teal-700 bg-teal-50 text-teal-900 ring-1 ring-teal-700"
    : "border-slate-200 bg-white hover:border-teal-600";
}

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
      <div className="space-y-1">
        <Link href="/patient" className="text-sm text-teal-700 underline">
          ← My appointments
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Book an appointment</h1>
      </div>

      <section className={card}>
        <h2 className="font-medium">1. Choose a doctor</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.doctors.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={d.id === doctorId}
              onClick={() => chooseDoctor(d.id)}
              className={`rounded-lg border p-3 text-left ${choiceClass(d.id === doctorId)}`}
            >
              <span className="block font-medium">{d.name}</span>
              <span className="block text-sm text-slate-600">{d.specialty}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-medium">2. Choose a day</h2>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              aria-pressed={day === date}
              onClick={() => chooseDay(day)}
              className={`rounded-md border px-3 py-2 text-sm ${choiceClass(day === date)}`}
            >
              {formatShortDay(day)}
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-medium">3. Choose a time</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-slate-500">Choose a doctor and a day to see available times.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
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
                  className={`rounded-md border px-2 py-2 text-sm ${choiceClass(slot.time === time)}`}
                >
                  {slot.time}
                </button>
              ) : (
                <button
                  key={slot.time}
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-sm text-slate-400"
                >
                  <span className="block line-through">{slot.time}</span>
                  <span className="block text-xs">{UNAVAILABLE_LABEL[slot.status]}</span>
                </button>
              ),
            )}
          </div>
        )}
      </section>

      <section className={card}>
        <label htmlFor="reason" className="font-medium">
          Reason for visit <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="reason"
          type="text"
          maxLength={120}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Follow-up on blood test"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </section>

      <section className={card}>
        <h2 className="font-medium">Summary</h2>
        <dl className="grid grid-cols-[5rem_1fr] gap-1 text-sm">
          <dt className="text-slate-500">Doctor</dt>
          <dd>{doctor ? `${doctor.name} (${doctor.specialty})` : "—"}</dd>
          <dt className="text-slate-500">Day</dt>
          <dd>{date ? formatDay(date) : "—"}</dd>
          <dt className="text-slate-500">Time</dt>
          <dd>{time ?? "—"}</dd>
          <dt className="text-slate-500">Reason</dt>
          <dd>{reason.trim() || "—"}</dd>
        </dl>
        {error && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        {missing.length > 0 && (
          <p className="text-sm text-slate-600">Choose {joinWithAnd(missing)} to continue.</p>
        )}
        <button
          type="button"
          disabled={missing.length > 0}
          onClick={confirm}
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Confirm booking
        </button>
      </section>
    </div>
  );
}

export default function BookPage() {
  const demo = useDemo();
  if (demo.kind === "loading") return <p className="text-slate-500">Loading…</p>;
  const session = demo.session;
  if (session?.role !== "patient") return <SignInPrompt role="patient" />;
  return <BookingForm data={demo.data} patientId={session.patientId} />;
}
