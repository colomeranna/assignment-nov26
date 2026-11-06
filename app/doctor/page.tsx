"use client";

import Link from "next/link";
import { useState } from "react";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { StatusBadge } from "@/components/status-badge";
import { formatDay, toLocalDate } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import type { Appointment, DemoData, Doctor, Patient } from "@/lib/types";

const byDateTime = (a: Appointment, b: Appointment) =>
  `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);

function groupByDay(appointments: Appointment[]): { date: string; appointments: Appointment[] }[] {
  const groups: { date: string; appointments: Appointment[] }[] = [];
  for (const a of appointments) {
    const last = groups.at(-1);
    if (last?.date === a.date) last.appointments.push(a);
    else groups.push({ date: a.date, appointments: [a] });
  }
  return groups;
}

type RowProps = { appointment: Appointment; patient: Patient | undefined; showDate: boolean };

function AppointmentRow({ appointment, patient, showDate }: RowProps) {
  return (
    <li>
      <Link
        href={`/doctor/appointments/${encodeURIComponent(appointment.id)}`}
        className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-teal-600"
      >
        <span className="w-28 shrink-0 font-medium tabular-nums">
          {showDate && <span className="block text-sm font-normal text-slate-500">{formatDay(appointment.date)}</span>}
          {appointment.time}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{patient?.name ?? "Unknown patient"}</span>
          {appointment.reason && <span className="block text-sm text-slate-600">{appointment.reason}</span>}
        </span>
        <StatusBadge status={appointment.status} />
        <span className="text-sm font-medium text-teal-700">Open record →</span>
      </Link>
    </li>
  );
}

type SectionProps = { title: string; count: number; empty: string; children: React.ReactNode };

function Section({ title, count, empty, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">
        {title} <span className="text-slate-400">· {count}</span>
      </h2>
      {count === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">{empty}</p>
      ) : (
        children
      )}
    </section>
  );
}

type DashboardProps = { data: DemoData; doctor: Doctor };

function Dashboard({ data, doctor }: DashboardProps) {
  const [now] = useState(() => new Date());
  const today = toLocalDate(now);
  const findPatient = (id: string) => data.patients.find((p) => p.id === id);

  const mine = data.appointments.filter((a) => a.doctorId === doctor.id);
  const todays = mine.filter((a) => a.date === today).sort(byDateTime);
  // Booked days other than today. Earlier ones only exist if the demo was left
  // open for days; listing them keeps them reachable instead of hiding them.
  const otherBooked = mine.filter((a) => a.status === "booked" && a.date !== today).sort(byDateTime);
  const completed = mine
    .flatMap((a) => (a.status === "completed" ? [a] : []))
    .sort((a, b) => b.outcome.completedAt.localeCompare(a.outcome.completedAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{doctor.name}</h1>
        <p className="text-slate-600">
          {doctor.specialty} · {formatDay(today)}
        </p>
      </div>

      <Section title="Today" count={todays.length} empty="No appointments today.">
        <ul className="space-y-2">
          {todays.map((a) => (
            <AppointmentRow key={a.id} appointment={a} patient={findPatient(a.patientId)} showDate={false} />
          ))}
        </ul>
      </Section>

      <Section title="Upcoming" count={otherBooked.length} empty="No upcoming appointments.">
        <div className="space-y-4">
          {groupByDay(otherBooked).map((group) => (
            <div key={group.date} className="space-y-2">
              <h3 className="text-sm font-medium text-slate-500">
                {formatDay(group.date)}
                {group.date < today && " · past, not completed"}
              </h3>
              <ul className="space-y-2">
                {group.appointments.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} patient={findPatient(a.patientId)} showDate={false} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Completed" count={completed.length} empty="No completed consultations yet.">
        <ul className="space-y-2">
          {completed.map((a) => (
            <AppointmentRow key={a.id} appointment={a} patient={findPatient(a.patientId)} showDate />
          ))}
        </ul>
      </Section>
    </div>
  );
}

export default function DoctorPage() {
  const demo = useDemo();
  if (demo.kind === "loading") return <p className="text-slate-500">Loading…</p>;

  const session = demo.session;
  if (session?.role !== "doctor") return <SignInPrompt role="doctor" />;

  const doctor = demo.data.doctors.find((d) => d.id === session.doctorId);
  if (doctor === undefined) return <SignInPrompt role="doctor" />;
  return <Dashboard data={demo.data} doctor={doctor} />;
}
