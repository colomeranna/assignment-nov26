"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEMO_PATIENT_ID } from "@/lib/seed";
import { setSession, signOut, useDemo } from "@/lib/store";
import type { DemoData, Session } from "@/lib/types";

type Identity = { key: string; label: string; session: Session };

function sessionKey(session: Session): string {
  return session.role === "patient" ? `patient:${session.patientId}` : `doctor:${session.doctorId}`;
}

function listIdentities(data: DemoData): Identity[] {
  const patient = data.patients.find((p) => p.id === DEMO_PATIENT_ID);
  const patients: Identity[] = patient
    ? [{ key: `patient:${patient.id}`, label: `${patient.name} (patient)`, session: { role: "patient", patientId: patient.id } }]
    : [];
  const doctors: Identity[] = data.doctors.map((d) => ({
    key: `doctor:${d.id}`,
    label: `${d.name} (${d.specialty})`,
    session: { role: "doctor", doctorId: d.id },
  }));
  return [...patients, ...doctors];
}

export function homePath(session: Session): string {
  return session.role === "patient" ? "/patient" : "/doctor";
}

export function Header() {
  const demo = useDemo();
  const router = useRouter();

  function switchTo(key: string) {
    if (demo.kind !== "ready") return;
    const identity = listIdentities(demo.data).find((i) => i.key === key);
    if (identity === undefined) return;
    setSession(identity.session);
    router.push(homePath(identity.session));
  }

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-teal-700">
          Clinic Portal
        </Link>
        {demo.kind === "ready" && demo.session !== null && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-slate-500">Signed in as</span>
              <select
                value={sessionKey(demo.session)}
                onChange={(e) => switchTo(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1"
              >
                {listIdentities(demo.data).map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={handleSignOut} className="text-slate-500 underline hover:text-slate-900">
              Sign out
            </button>
          </div>
        )}
        {demo.kind === "ready" && demo.session === null && (
          <span className="text-sm text-slate-500">Not signed in</span>
        )}
      </div>
      <p className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">
        Prototype: simulated sign-in. Data is saved in this browser only.
      </p>
    </header>
  );
}
