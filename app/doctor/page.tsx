"use client";

import { SignInPrompt } from "@/components/sign-in-prompt";
import { useDemo } from "@/lib/store";

export default function DoctorPage() {
  const demo = useDemo();
  if (demo.kind === "loading") return <p className="text-slate-500">Loading…</p>;

  const session = demo.session;
  if (session?.role !== "doctor") return <SignInPrompt role="doctor" />;

  const doctor = demo.data.doctors.find((d) => d.id === session.doctorId);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">{doctor?.name ?? "Doctor"}</h1>
      <p className="mt-2 text-slate-600">Doctor dashboard coming in step 2.</p>
    </div>
  );
}
