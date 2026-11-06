"use client";

import { CalendarCheck, CalendarDays, CalendarX, ChevronRight, ClipboardList, Inbox } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, EmptyState, NewTag, SectionTitle, card } from "@/components/ui";
import { dateParts, formatDay, toLocalDate } from "@/lib/dates";
import { isNewBooking } from "@/lib/seed";
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

type CountSegmentProps = { icon: ReactNode; label: string; count: number };

function CountSegment({ icon, label, count }: CountSegmentProps) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-4 px-3 py-3 sm:px-5 sm:py-4">
      <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500 uppercase sm:tracking-wide">
        <span className="hidden shrink-0 text-slate-400 sm:inline [&_svg]:size-4">{icon}</span>
        <span className="truncate">{label}</span>
      </p>
      <p className="shrink-0 text-2xl font-semibold text-slate-900 tabular-nums">{count}</p>
    </div>
  );
}

type RowProps = { appointment: Appointment; patient: Patient | undefined; showDate: boolean; isNew: boolean };

function AppointmentRow({ appointment, patient, showDate, isNew }: RowProps) {
  const { day, month } = dateParts(appointment.date);
  const name = patient?.name ?? "Unknown patient";
  return (
    <li>
      <Link
        href={`/doctor/appointments/${encodeURIComponent(appointment.id)}`}
        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:bg-teal-50 focus-visible:outline-none sm:gap-4"
      >
        <span className="w-12 shrink-0 text-sm font-semibold text-slate-900 tabular-nums">
          {showDate && (
            <span className="block text-xs font-normal text-slate-500">
              {day} {month}
            </span>
          )}
          {appointment.time}
        </span>
        <Avatar name={name} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="max-w-full truncate text-sm font-medium text-slate-900">{name}</span>
            {isNew && <NewTag>New booking</NewTag>}
          </span>
          {appointment.reason && <span className="block truncate text-sm text-slate-500">{appointment.reason}</span>}
        </span>
        <StatusBadge status={appointment.status} />
        <span className="hidden text-sm font-medium text-teal-700 md:inline">Open record</span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

const listCard = `${card} divide-y divide-slate-100 overflow-hidden`;

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={doctor.name} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{doctor.name}</h1>
          <p className="text-sm text-slate-500">
            {doctor.specialty} · {formatDay(today)}
          </p>
        </div>
      </div>

      <div className={`${card} grid grid-cols-3 divide-x divide-slate-200`}>
        <CountSegment icon={<CalendarDays aria-hidden />} label="Today" count={todays.length} />
        <CountSegment icon={<CalendarCheck aria-hidden />} label="Upcoming" count={otherBooked.length} />
        <CountSegment icon={<ClipboardList aria-hidden />} label="Completed" count={completed.length} />
      </div>

      <section className="space-y-3">
        <SectionTitle title="Today" count={todays.length} />
        {todays.length === 0 ? (
          <EmptyState icon={<CalendarX aria-hidden />} text="No appointments today." />
        ) : (
          <ul className={listCard}>
            {todays.map((a) => (
              <AppointmentRow key={a.id} appointment={a} patient={findPatient(a.patientId)} showDate={false} isNew={isNewBooking(a, data.seededAt)} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle title="Upcoming" count={otherBooked.length} />
        {otherBooked.length === 0 ? (
          <EmptyState icon={<Inbox aria-hidden />} text="No upcoming appointments." />
        ) : (
          <div className="space-y-4">
            {groupByDay(otherBooked).map((group) => (
              <div key={group.date} className={`${card} overflow-hidden`}>
                <h3 className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs font-medium text-slate-500">
                  {formatDay(group.date)}
                  {group.date < today && " · past, not completed"}
                </h3>
                <ul className="divide-y divide-slate-100">
                  {group.appointments.map((a) => (
                    <AppointmentRow key={a.id} appointment={a} patient={findPatient(a.patientId)} showDate={false} isNew={isNewBooking(a, data.seededAt)} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle title="Completed" count={completed.length} />
        {completed.length === 0 ? (
          <EmptyState icon={<ClipboardList aria-hidden />} text="No completed consultations yet." />
        ) : (
          <ul className={listCard}>
            {completed.map((a) => (
              <AppointmentRow key={a.id} appointment={a} patient={findPatient(a.patientId)} showDate isNew={isNewBooking(a, data.seededAt)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function DoctorPage() {
  const demo = useDemo();
  if (demo.kind === "loading") return <p className="text-sm text-slate-500">Loading…</p>;

  const session = demo.session;
  if (session?.role !== "doctor") return <SignInPrompt role="doctor" />;

  const doctor = demo.data.doctors.find((d) => d.id === session.doctorId);
  if (doctor === undefined) return <SignInPrompt role="doctor" />;
  return <Dashboard data={demo.data} doctor={doctor} />;
}
