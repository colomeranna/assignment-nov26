"use client";

import { ArrowRight, Stethoscope, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { ReactNode } from "react";
import { ResetDemoButton } from "@/components/reset-demo-button";
import { Banner, Select, card, primaryButton, secondaryButton } from "@/components/ui";
import { DEMO_PATIENT_ID } from "@/lib/seed";
import { setSession, useDemo } from "@/lib/store";
import type { Session } from "@/lib/types";
import { homePath } from "./header";

const STEPS = [
  "Continue as Laura and book an appointment with any doctor.",
  "Use the role switcher in the header to become that doctor, and find the booking in the dashboard.",
  "Open the record and complete the consultation with a diagnosis and prescription.",
  "Switch back to Laura to see the outcome.",
] as const;

function ResetNotice() {
  const wasReset = useSearchParams().get("reset") === "1";
  if (!wasReset) return null;
  return <Banner tone="success">Demo data reset.</Banner>;
}

type RoleCardProps = { icon: ReactNode; title: string; description: string; children: ReactNode };

function RoleCard({ icon, title, description, children }: RoleCardProps) {
  return (
    <section className={`${card} flex flex-col gap-4 p-6`}>
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
        {icon}
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <div className="mt-auto space-y-3">{children}</div>
    </section>
  );
}

function HowToTry() {
  return (
    <section className={`${card} space-y-4 p-6`}>
      <h2 className="text-base font-semibold text-slate-900">How to try it</h2>
      <ol className="space-y-3">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-slate-700">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <p className="border-t border-slate-100 pt-3 text-sm text-slate-500">
        Data is saved in this browser only, so each tester has their own copy.
      </p>
    </section>
  );
}

export default function StartPage() {
  const demo = useDemo();
  const router = useRouter();
  const [doctorId, setDoctorId] = useState("");

  function continueAs(session: Session) {
    setSession(session);
    router.push(homePath(session));
  }

  if (demo.kind === "loading") return <p className="text-sm text-slate-500">Loading…</p>;

  const selectedDoctorId = doctorId || (demo.data.doctors[0]?.id ?? "");

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:py-4">
      <Suspense fallback={null}>
        <ResetNotice />
      </Suspense>

      <div className="space-y-2 py-2 text-center sm:py-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Clinic Portal</h1>
        <p className="text-base text-slate-600">A clickable prototype with simulated sign-in: pick who you want to be.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <RoleCard
          icon={<UserRound aria-hidden className="size-5" />}
          title="Patient"
          description="Book appointments and see your consultation outcomes."
        >
          <button
            type="button"
            onClick={() => continueAs({ role: "patient", patientId: DEMO_PATIENT_ID })}
            className={`${primaryButton} w-full`}
          >
            Continue as patient (Laura Martín)
            <ArrowRight aria-hidden className="size-4" />
          </button>
        </RoleCard>

        <RoleCard
          icon={<Stethoscope aria-hidden className="size-5" />}
          title="Doctor"
          description="See your schedule and complete consultations."
        >
          <label htmlFor="doctor-picker" className="sr-only">
            Doctor
          </label>
          <Select id="doctor-picker" value={selectedDoctorId} onChange={(e) => setDoctorId(e.target.value)}>
            {demo.data.doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} · {d.specialty}
              </option>
            ))}
          </Select>
          <button
            type="button"
            disabled={selectedDoctorId === ""}
            onClick={() => continueAs({ role: "doctor", doctorId: selectedDoctorId })}
            className={`${secondaryButton} w-full`}
          >
            Continue as doctor
            <ArrowRight aria-hidden className="size-4" />
          </button>
        </RoleCard>
      </div>

      <HowToTry />

      <div className="flex justify-center">
        <ResetDemoButton />
      </div>
    </div>
  );
}
