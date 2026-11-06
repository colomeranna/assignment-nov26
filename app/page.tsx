"use client";

import { Stethoscope, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { ReactNode } from "react";
import { Banner, ReadOnlyField, Select, brandSoft, card, primaryButton } from "@/components/ui";
import { DEMO_PATIENT_ID } from "@/lib/seed";
import { setSession, useDemo } from "@/lib/store";
import type { Session } from "@/lib/types";
import { homePath } from "./header";

const JOURNEY = [
  "Sign in as Laura, choose a doctor and an available time, and book.",
  "Switch to that doctor with the role switcher at the top of the page. The booking is on their dashboard.",
  "Open the patient record and add a diagnosis and a prescription.",
  "Switch back to Laura to see the consultation outcome.",
] as const;

function ResetNotice() {
  const wasReset = useSearchParams().get("reset") === "1";
  if (!wasReset) return null;
  return <Banner tone="success">Demo data reset.</Banner>;
}

type RoleCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  fieldId: string;
  field: ReactNode;
  action: ReactNode;
};

/** Both role cards share this shape, so their fields and buttons line up. */
function RoleCard({ icon, title, description, fieldId, field, action }: RoleCardProps) {
  return (
    <section className={`${card} flex h-full flex-col gap-6 p-6`}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${brandSoft} [&_svg]:text-teal-600`}>
            {icon}
          </span>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="mt-auto space-y-3">
        <div>
          <label htmlFor={fieldId} className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
            Sign in as
          </label>
          {field}
        </div>
        {action}
      </div>
    </section>
  );
}

function Journey() {
  return (
    <section className={`${card} space-y-4 p-6`}>
      <h2 className="text-base font-semibold text-slate-900">Try the full journey (about 2 minutes)</h2>
      <ol className="space-y-3">
        {JOURNEY.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-slate-700">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <p className="border-t border-slate-200 pt-3 text-sm text-slate-500">
        Data is saved in your browser only, so each tester has their own copy. Use Reset demo data at the top of the
        page to start over.
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

      <div className="mx-auto max-w-xl space-y-3 py-2 text-center sm:py-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Clinic Portal</h1>
        <p className="text-base text-slate-500">
          Patients book appointments. Doctors manage consultations. No account needed: choose a role below to sign in.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">Sign in (simulated)</p>
        <div className="grid items-stretch gap-6 sm:grid-cols-2">
          <RoleCard
            icon={<UserRound aria-hidden className="size-5" />}
            title="I'm a patient"
            description="Choose a doctor and an available time, book an appointment, and see your diagnosis and prescription once the consultation is complete."
            fieldId="patient-identity"
            field={<ReadOnlyField id="patient-identity" value="Laura Martín · Patient" icon={<UserRound />} />}
            action={
              <button
                type="button"
                onClick={() => continueAs({ role: "patient", patientId: DEMO_PATIENT_ID })}
                className={`${primaryButton} w-full`}
              >
                Sign in as patient
              </button>
            }
          />
          <RoleCard
            icon={<Stethoscope aria-hidden className="size-5" />}
            title="I'm a doctor"
            description="See today's and upcoming appointments, open patient records, and add a diagnosis and prescription."
            fieldId="doctor-picker"
            field={
              <Select id="doctor-picker" value={selectedDoctorId} onChange={(e) => setDoctorId(e.target.value)}>
                {demo.data.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.specialty}
                  </option>
                ))}
              </Select>
            }
            action={
              <button
                type="button"
                disabled={selectedDoctorId === ""}
                onClick={() => continueAs({ role: "doctor", doctorId: selectedDoctorId })}
                className={`${primaryButton} w-full`}
              >
                Sign in as doctor
              </button>
            }
          />
        </div>
      </div>

      <Journey />
    </div>
  );
}
