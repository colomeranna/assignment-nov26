import { LogIn } from "lucide-react";
import Link from "next/link";
import { card, primaryButton } from "./ui";

type Props = { role: "patient" | "doctor" };

export function SignInPrompt({ role }: Props) {
  return (
    <div className={`${card} mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center`}>
      <LogIn aria-hidden className="size-6 text-slate-400" />
      <p className="text-sm text-slate-600">This page is for signed-in {role}s.</p>
      <Link href="/" className={primaryButton}>
        Go to the start page
      </Link>
    </div>
  );
}
