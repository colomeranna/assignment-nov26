"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_PATIENT_ID } from "@/lib/seed";
import { setSession, useDemo } from "@/lib/store";
import type { Session } from "@/lib/types";
import { homePath } from "./header";

export default function StartPage() {
  const demo = useDemo();
  const router = useRouter();
  const [doctorId, setDoctorId] = useState("");

  function continueAs(session: Session) {
    setSession(session);
    router.push(homePath(session));
  }

  if (demo.kind === "loading") return <p className="text-slate-500">Loading…</p>;

  const selectedDoctorId = doctorId || (demo.data.doctors[0]?.id ?? "");

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Clinic Portal</h1>
        <p className="text-slate-600">
          A clickable prototype with simulated sign-in: pick who you want to be.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-medium">Patient</h2>
        <button
          type="button"
          onClick={() => continueAs({ role: "patient", patientId: DEMO_PATIENT_ID })}
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800"
        >
          Continue as patient (Laura Martín)
        </button>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-medium">Doctor</h2>
        <select
          aria-label="Doctor"
          value={selectedDoctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
        >
          {demo.data.doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.specialty}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={selectedDoctorId === ""}
          onClick={() => continueAs({ role: "doctor", doctorId: selectedDoctorId })}
          className="w-full rounded-md border border-teal-700 px-4 py-2.5 font-medium text-teal-700 hover:bg-teal-50"
        >
          Continue as doctor
        </button>
      </section>
    </div>
  );
}
