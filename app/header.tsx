"use client";

import { ChevronDown, Info, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResetDemoButton } from "@/components/reset-demo-button";
import { Avatar, Logo, focusRing, inputClass, quietButton } from "@/components/ui";
import { DEMO_PATIENT_ID } from "@/lib/seed";
import { setSession, signOut, useDemo, useIsInMemory } from "@/lib/store";
import type { DemoData, Session } from "@/lib/types";

type Identity = { key: string; name: string; label: string; session: Session };

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
          label: `${patient.name} · Patient`,
          session: { role: "patient", patientId: patient.id },
        },
      ]
    : [];
  const doctors: Identity[] = data.doctors.map((d) => ({
    key: `doctor:${d.id}`,
    name: d.name,
    label: `${d.name} · ${d.specialty}`,
    session: { role: "doctor", doctorId: d.id },
  }));
  return [...patients, ...doctors];
}

export function homePath(session: Session): string {
  return session.role === "patient" ? "/patient" : "/doctor";
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
    <header className="bg-white">
      <div className="mx-auto flex h-16 max-w-5xl flex-nowrap items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label="Clinic Portal"
          className={`flex shrink-0 items-center gap-2.5 rounded-lg text-base font-semibold text-slate-900 ${focusRing}`}
        >
          <Logo />
          <span className="hidden sm:inline">Clinic Portal</span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-1 sm:gap-2">
          {current !== undefined && (
            <>
              <label
                htmlFor="role-switcher"
                className="sr-only shrink-0 text-xs whitespace-nowrap text-slate-500 sm:not-sr-only"
              >
                Viewing as
              </label>
              <div className="relative min-w-0 flex-1 sm:w-52 sm:flex-none md:w-72">
                <span className="pointer-events-none absolute top-1/2 left-2 hidden -translate-y-1/2 sm:inline-flex">
                  <Avatar name={current.name} size="xs" />
                </span>
                <select
                  id="role-switcher"
                  value={current.key}
                  onChange={(e) => switchTo(e.target.value)}
                  className={`${inputClass} appearance-none truncate pr-10 sm:pl-10`}
                >
                  {identities.map((i) => (
                    <option key={i.key} value={i.key}>
                      {i.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
                />
              </div>
              <span aria-hidden className="mx-1 hidden h-6 w-px shrink-0 bg-slate-200 sm:block" />
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
                className={`${quietButton} shrink-0 px-2 sm:px-2.5`}
              >
                <LogOut aria-hidden className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
          <ResetDemoButton />
        </div>
      </div>
      <div className="flex items-start justify-center gap-1.5 border-y border-t-slate-200 border-b-teal-100 bg-teal-50 px-4 py-1 text-center text-xs text-teal-800">
        <Info aria-hidden className="mt-px size-3.5 shrink-0 text-teal-600" />
        <p>
          Prototype: simulated sign-in. Data is saved in this browser only.
          {isInMemory && (
            <span className="block font-medium sm:ml-1 sm:inline">
              Your browser blocked storage, so changes will be lost on reload.
            </span>
          )}
        </p>
      </div>
    </header>
  );
}
