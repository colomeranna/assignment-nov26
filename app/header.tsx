"use client";

import { LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResetDemoButton } from "@/components/reset-demo-button";
import { Avatar, Select, focusRing, quietButton } from "@/components/ui";
import { DEMO_PATIENT_ID } from "@/lib/seed";
import { setSession, signOut, useDemo, useIsInMemory } from "@/lib/store";
import type { DemoData, Session } from "@/lib/types";

type Identity = { key: string; name: string; role: string; label: string; session: Session };

function sessionKey(session: Session): string {
  return session.role === "patient" ? `patient:${session.patientId}` : `doctor:${session.doctorId}`;
}

function listIdentities(data: DemoData): Identity[] {
  const patient = data.patients.find((p) => p.id === DEMO_PATIENT_ID);
  const patients: Identity[] = patient
    ? [
        {
          key: `patient:${patient.id}`,
          name: patient.name,
          role: "Patient",
          label: `${patient.name} · Patient`,
          session: { role: "patient", patientId: patient.id },
        },
      ]
    : [];
  const doctors: Identity[] = data.doctors.map((d) => ({
    key: `doctor:${d.id}`,
    name: d.name,
    role: d.specialty,
    label: `${d.name} · ${d.specialty}`,
    session: { role: "doctor", doctorId: d.id },
  }));
  return [...patients, ...doctors];
}

export function homePath(session: Session): string {
  return session.role === "patient" ? "/patient" : "/doctor";
}

function Logo() {
  return (
    <span aria-hidden className="inline-flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
      <Plus className="size-5" strokeWidth={3} />
    </span>
  );
}

export function Header() {
  const demo = useDemo();
  const isInMemory = useIsInMemory();
  const router = useRouter();

  const identities = demo.kind === "ready" ? listIdentities(demo.data) : [];
  const session = demo.kind === "ready" ? demo.session : null;
  const current = session === null ? undefined : identities.find((i) => i.key === sessionKey(session));

  function switchTo(key: string) {
    const identity = identities.find((i) => i.key === key);
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
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className={`flex items-center gap-2.5 rounded-lg text-base font-semibold text-slate-900 ${focusRing}`}>
          <Logo />
          Clinic Portal
        </Link>

        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2">
          {current !== undefined && (
            <>
              <div className="flex min-w-0 items-center gap-2.5 pr-1">
                <Avatar name={current.name} size="sm" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-medium text-slate-900">{current.name}</p>
                  <p className="truncate text-xs text-slate-500">{current.role}</p>
                </div>
              </div>
              <label htmlFor="role-switcher" className="sr-only">
                Switch role
              </label>
              <Select
                id="role-switcher"
                value={current.key}
                onChange={(e) => switchTo(e.target.value)}
                className="w-full min-w-0 sm:w-64"
              >
                {identities.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </Select>
              <button type="button" onClick={handleSignOut} className={quietButton}>
                <LogOut aria-hidden className="size-4" />
                Sign out
              </button>
            </>
          )}
          {demo.kind === "ready" && demo.session === null && (
            <span className="px-2.5 text-sm text-slate-500">Not signed in</span>
          )}
          <ResetDemoButton />
        </div>
      </div>
      <div className="border-t border-amber-100 bg-amber-50/70 px-4 py-1 text-center text-xs text-amber-800">
        Prototype: simulated sign-in. Data is saved in this browser only.
        {isInMemory && (
          <span className="block font-medium sm:ml-1 sm:inline">
            Your browser blocked storage, so changes will be lost on reload.
          </span>
        )}
      </div>
    </header>
  );
}
