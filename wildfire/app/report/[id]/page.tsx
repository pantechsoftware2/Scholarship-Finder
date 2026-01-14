// app/report/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Scholarship = {
  name: string;
  country: string;
  amount: string;
  deadline: string;
  benefits?: string;
};

type ReportPayload = {
  id: string;
  scholarships: Scholarship[];
};

export default function ReportPage() {
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId) {
      setError("Invalid report ID");
      setLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        const res = await fetch(`/api/report?id=${reportId}`);
        if (!res.ok) {
          setError("Unable to load your report.");
          setLoading(false);
          return;
        }
        const data = (await res.json()) as ReportPayload;
        setReport(data);
      } catch (err) {
        console.error("Report fetch error:", err);
        setError("Unable to load your report.");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-slate-200">
        Loading your Funding Roadmap...
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-red-400">
        {error || "Report not found."}
      </main>
    );
  }

  const scholarships = report.scholarships || [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#020617,_#000000)] text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-8 relative">
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <header className="relative z-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Funding Roadmap
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
            Your unlocked matches.
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg">
            Here&apos;s your full set of high‑probability scholarships, with amounts,
            countries and deadlines so you can plan applications like a pro.
          </p>
        </header>

        <section className="relative z-10 rounded-3xl border border-cyan-400/20 bg-slate-950/80 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] px-5 py-6 md:px-7 md:py-8 space-y-5">
          <div className="grid gap-5">
            {scholarships.map((s, index) => (
              <div
                key={`${s.name}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Match #{index + 1}
                    </p>
                    <h2 className="text-lg md:text-xl font-semibold text-slate-100">
                      {s.name}
                    </h2>
                  </div>
                  <p className="text-sm font-semibold text-emerald-300">
                    {s.amount}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>📍 {s.country}</span>
                  <span className="text-amber-300">
                    📅 Deadline: {s.deadline}
                  </span>
                </div>

                <p className="text-sm text-slate-100">
                  {s.benefits ??
                    "Tuition support + stipend + extra perks for strong profiles."}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs text-slate-500 max-w-md">
              Start with 2–3 priority options where deadlines are nearest, then
              expand to the rest. Keep this roadmap handy when talking to mentors.
            </p>
            <a
              href="https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%20just%20viewed%20my%20Funding%20Roadmap%20and%20need%20help%20with%20applications."
              target="_blank"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold bg-emerald-400 text-black hover:bg-emerald-300 transition-colors"
            >
              Chat with a mentor
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
