"use client";

import { CalendarX, Clock, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { OutcomeDetails } from "@/components/outcome-details";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { StatusBadge } from "@/components/status-badge";
import { Banner, EmptyState, NewTag, SectionTitle, card, primaryButton } from "@/components/ui";
import { dateParts, formatDay } from "@/lib/dates";
import { isNewOutcome } from "@/lib/seed";
import { useDemo } from "@/lib/store";
import type { Appointment, Doctor } from "@/lib/types";

const byDateTime = (a: Appointment, b: Appointment) =>
  `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);

function DateBlock({ date }: { date: string }) {
  const { day, month } = dateParts(date);
  return (
    <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
      <span className="text-xl leading-none font-semibold tabular-nums">{day}</span>
      <span className="mt-0.5 text-xs font-medium uppercase">{month}</span>
    </div>
  );
}

type CardProps = { appointment: Appointment; doctor: Doctor | undefined; seededAt: string };

function AppointmentCard({ appointment, doctor, seededAt }: CardProps) {
  return (
    <li className={`${card} space-y-4 p-4 sm:p-5`}>
      <div className="flex items-start gap-4">
        <DateBlock date={appointment.date} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-medium text-slate-900">
              {doctor ? (
                <>
                  {doctor.name} <span className="font-normal text-slate-500">· {doctor.specialty}</span>
                </>
              ) : (
                "Unknown doctor"
              )}
            </p>
            <span className="flex items-center gap-2">
              {appointment.status === "completed" && isNewOutcome(appointment, seededAt) && <NewTag>New outcome</NewTag>}
              <StatusBadge status={appointment.status} />
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <Clock aria-hidden className="size-4 text-slate-400" />
            {formatDay(appointment.date)} at {appointment.time}
          </p>
          {appointment.reason && <p className="text-sm text-slate-600">Reason: {appointment.reason}</p>}
        </div>
      </div>
      {appointment.status === "completed" && <OutcomeDetails outcome={appointment.outcome} />}
    </li>
  );
}

function MyAppointments() {
  const demo = useDemo();
  const bookedId = useSearchParams().get("booked");

  if (demo.kind === "loading") return <p className="text-sm text-slate-500">Loading…</p>;
  const session = demo.session;
  if (session?.role !== "patient") return <SignInPrompt role="patient" />;

  const { doctors, appointments } = demo.data;
  const findDoctor = (id: string) => doctors.find((d) => d.id === id);
  const mine = appointments.filter((a) => a.patientId === session.patientId);
  const upcoming = mine.filter((a) => a.status === "booked").sort(byDateTime);
  const completed = mine
    .flatMap((a) => (a.status === "completed" ? [a] : []))
    .sort((a, b) => b.outcome.completedAt.localeCompare(a.outcome.completedAt));
  const justBooked = mine.find((a) => a.id === bookedId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My appointments</h1>
        <Link href="/patient/book" className={primaryButton}>
          <Plus aria-hidden className="size-4" />
          Book an appointment
        </Link>
      </div>

      {justBooked && (
        <Banner tone="success">
          Appointment booked with {findDoctor(justBooked.doctorId)?.name ?? "your doctor"} on{" "}
          {formatDay(justBooked.date)} at {justBooked.time}.
        </Banner>
      )}

      <section className="space-y-3">
        <SectionTitle title="Upcoming" count={upcoming.length} />
        {upcoming.length === 0 ? (
          <EmptyState icon={<CalendarX aria-hidden />} text="No upcoming appointments." />
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} appointment={a} doctor={findDoctor(a.doctorId)} seededAt={demo.data.seededAt} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle title="Completed" count={completed.length} />
        {completed.length === 0 ? (
          <EmptyState icon={<ClipboardList aria-hidden />} text="No completed consultations yet." />
        ) : (
          <ul className="space-y-3">
            {completed.map((a) => (
              <AppointmentCard key={a.id} appointment={a} doctor={findDoctor(a.doctorId)} seededAt={demo.data.seededAt} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function PatientPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <MyAppointments />
    </Suspense>
  );
}
