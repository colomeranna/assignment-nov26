import Link from "next/link";

type Props = { role: "patient" | "doctor" };

export function SignInPrompt({ role }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-slate-600">This page is for signed-in {role}s.</p>
      <Link href="/" className="mt-3 inline-block font-medium text-teal-700 underline">
        Go to the start page
      </Link>
    </div>
  );
}
