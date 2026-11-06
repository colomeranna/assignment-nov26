"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { OutcomeDetails } from "@/components/outcome-details";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { StatusBadge } from "@/components/status-badge";
import { formatDay } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import type { Appointment, Doctor } from "@/lib/types";

const byDateTime = (a: Appointment, b: Appointment) =>
  `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);

type CardProps = { appointment: Appointment; doctor: Doctor | undefined };

function AppointmentCard({ appointment, doctor }: CardProps) {
  return (
    <li className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {formatDay(appointment.date)} at {appointment.time}
          </p>
          <p className="text-sm text-slate-600">
            {doctor ? `${doctor.name} · ${doctor.specialty}` : "Unknown doctor"}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      {appointment.reason && <p className="text-sm text-slate-600">Reason: {appointment.reason}</p>}
      {appointment.status === "completed" && <OutcomeDetails outcome={appointment.outcome} />}
    </li>
  );
}

function MyAppointments() {
  const demo = useDemo();
  const bookedId = useSearchParams().get("booked");

  if (demo.kind === "loading") return <p className="text-slate-500">Loading…</p>;
  const session = demo.session;
  if (session?.role !== "patient") return <SignInPrompt role="patient" />;

  const { doctors, appointments } = demo.data;
  const findDoctor = (id: string) => doctors.find((d) => d.id === id);
  const mine = appointments.filter((a) => a.patientId === session.patientId);
  const upcoming = mine.filter((a) => a.status === "booked").sort(byDateTime);
  const completed = mine.filter((a) => a.status === "completed").sort(byDateTime).reverse();
  const justBooked = mine.find((a) => a.id === bookedId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My appointments</h1>
        <Link
          href="/patient/book"
          className="rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800"
        >
          Book an appointment
        </Link>
      </div>

      {justBooked && (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          Appointment booked with {findDoctor(justBooked.doctorId)?.name ?? "your doctor"} on{" "}
          {formatDay(justBooked.date)} at {justBooked.time}.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">
            No upcoming appointments.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} appointment={a} doctor={findDoctor(a.doctorId)} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Completed</h2>
        {completed.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">
            No completed consultations yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {completed.map((a) => (
              <AppointmentCard key={a.id} appointment={a} doctor={findDoctor(a.doctorId)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function PatientPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
      <MyAppointments />
    </Suspense>
  );
}
