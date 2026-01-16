// app/gate/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UnlockForm from "@/app/hunt/UnlockForm";

type Scholarship = {
  name: string;
  country: string;
  amount: string;
  deadline: string;
};

type ReportPayload = {
  id: string;
  total_value_found?: string;
  scholarships: Scholarship[];
};

export default function GatePage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string | undefined;

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reportId) {
      setError("Invalid report ID");
      setLoading(false);
      return;
    }

    async function loadReport() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/report?id=${reportId}`);
        if (!res.ok) {
          const body = await res.text();
          console.error("report fetch failed:", res.status, body);
          throw new Error("Failed to load report");
        }

        const json = await res.json();
        setReport({ ...json, id: reportId });
      } catch (err: any) {
        console.error("Gate load error:", err);
        setError("Unable to load scholarships");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [reportId]);

  if (!reportId) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-red-400">
        Invalid report link
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-white flex items-center justify-center">
        <p className="text-sm text-slate-300">Preparing your matches…</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-red-400">
        {error || "Something went wrong"}
      </main>
    );
  }

  const data = report.scholarships || [];
  const totalMatches = data.length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#020617,_#000000)] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-8 relative">
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 relative z-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Scholarship radar
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
              We found {totalMatches} high‑probability matches.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md">
              You can see the amounts, but the scholarship names and strategy
              notes are blurred until you unlock your full report.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-cyan-400/30 backdrop-blur-xl text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase tracking-[0.16em] text-slate-300">
                Locked preview
              </span>
            </div>
            {report.total_value_found && (
              <p className="text-[0.7rem] text-slate-400">
                Estimated total value:{" "}
                <span className="text-cyan-300 font-semibold">
                  {report.total_value_found}
                </span>
              </p>
            )}
          </div>
        </header>

        <section className="relative z-10 grid gap-4 md:grid-cols-[2fr,1.3fr] items-start">
          {/* blurred list */}
          <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/70 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] px-4 py-6 md:px-6 md:py-7">
            <div className="space-y-4">
              {data.map((s, index) => (
                <div
                  key={`${s.name ?? "sch"}-${index}`}
                  className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3 last:border-none"
                >
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-0.5">
                      Match #{index + 1}
                    </p>
                    <p className="text-sm font-semibold blur-sm select-none">
                      {s.name || "High‑value scholarship"}
                    </p>
                    <p className="text-[0.7rem] text-slate-500 mt-1 flex items-center gap-1">
                      <span>📍</span>
                      <span className="blur-[2px] select-none">
                        {s.country}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">Amount</p>
                    <p className="text-emerald-400 font-semibold text-sm">
                      {s.amount}
                    </p>
                    <p className="text-[0.65rem] text-amber-300 mt-1">
                      Deadline:{" "}
                      <span className="blur-[2px] select-none">
                        {s.deadline}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[0.7rem] text-slate-500">
              Full scholarship names, deadlines, and strategy notes unlock after
              you drop your contact.
            </p>
          </div>

          {/* unlock panel using existing UnlockForm */}
          <div className="relative">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/30 blur-3xl" />
            <div className="relative rounded-3xl border border-cyan-400/40 bg-slate-950/90 px-5 py-5 shadow-[0_0_26px_rgba(56,189,248,0.6)] space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
                Unlock full report
              </p>
              <p className="text-sm text-slate-100 font-medium">
                Send the full unlocked report to my:
              </p>
              <p className="text-[0.7rem] text-slate-400">
                Get the scholarship names, deadlines, and best‑fit notes
                customized to your profile.
              </p>

              <UnlockForm
                reportId={report.id}
                scholarshipTitle="high‑probability matches"
                onClose={() => {
                  // after successful unlock, send to magic-link report page
                  router.push(`/report/${report.id}`);
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
