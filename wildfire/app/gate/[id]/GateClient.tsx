"use client";

import UnlockForm from "@/app/hunt/UnlockForm";

type GateClientProps = {
  reportId: string;
};

export default function GateClient({ reportId }: GateClientProps) {
  return (
    <div
      className="relative z-10 w-full max-w-md p-6 rounded-3xl
      bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10
      border border-slate-800 backdrop-blur-xl"
    >
      <h2 className="text-lg font-semibold mb-3">
        Send the full unlocked report to my:
      </h2>

      <UnlockForm
        reportId={reportId}
        scholarshipTitle="High-Probability Scholarship Matches"
        onClose={() => {}}
      />
    </div>
  );
}
