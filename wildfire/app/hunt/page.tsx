"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import UnlockForm from "./UnlockForm";

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

export default function HuntPage() {
  const searchParams = useSearchParams();

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedScholarship, setSelectedScholarship] =
    useState<Scholarship | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);

        // Get reportId from query params or sessionStorage
        let reportId = searchParams.get("id");
        
        if (!reportId && typeof window !== "undefined") {
          reportId = sessionStorage.getItem("lastReportId");
        }

        if (!reportId) {
          setError("No report ID provided. Please start a new search.");
          return;
        }

        const repRes = await fetch(`/api/report?id=${reportId}`);
        if (!repRes.ok) {
          const body = await repRes.text();
          console.error("report fetch failed:", repRes.status, body);
          throw new Error("Report fetch failed");
        }

        const repData = await repRes.json();
        
        // Transform the data structure to match what the page expects
        const scholarships = (repData.scholarships || []).map((s: any) => ({
          name: s.name || "",
          country: s.country || "",
          amount: typeof s.amount === "number" ? s.amount.toString() : (s.amount || ""),
          deadline: s.deadline || "",
          benefits: s.description || s.benefits || "Tuition support + stipend + additional perks based on profile fit.",
        }));

        const repJson: ReportPayload = {
          id: reportId,
          scholarships: scholarships,
        };
        
        setReport(repJson);
      } catch (err: any) {
        console.error("Hunt error:", err);
        setError("Error loading scholarships");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [searchParams]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#020617)] text-white flex items-center justify-center">
        <p className="text-sm text-slate-300">
          Mapping your funding universe…
        </p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        {error || "Something went wrong"}
      </main>
    );
  }

  const data = report.scholarships || [];
  const totalMatches = data.length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-5xl space-y-8 relative">
        {/* glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

        {/* header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 relative z-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Funding Roadmap
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
              Your high‑probability matches.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md">
              You&apos;re seeing real scholarships calibrated to your academic
              profile and study‑abroad dream.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-cyan-400/30 backdrop-blur-xl text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase tracking-[0.16em] text-slate-300">
                {totalMatches} high‑probability matches
              </span>
            </div>
            <p className="text-[0.65rem] text-slate-500">
              Top 2 are fully visible. The rest stay blurred until you unlock.
            </p>
          </div>
        </header>

        {/* list */}
        <section className="relative z-10">
          <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/70 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] px-4 py-6 md:px-6 md:py-7">
            <div className="grid gap-5 md:grid-cols-2">
              {data.map((s, index) => {
                const locked = index >= 2;

                return (
                  <div
                    key={`${s.name}-${index}`}
                    className="relative group rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 overflow-hidden transition-all duration-200 hover:border-cyan-400/60 hover:-translate-y-0.5"
                  >
                    {/* hover glow */}
                    <div className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-fuchsia-500/10 blur-2xl transition-opacity" />

                    {/* content */}
                    <div
                      className={
                        "relative space-y-3 " + (locked ? "select-none" : "")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h2
                          className={
                            "text-lg font-semibold leading-snug " +
                            (locked ? "blur-sm" : "")
                          }
                        >
                          {s.name}
                        </h2>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-[0.65rem] px-2 py-1 uppercase tracking-[0.14em]">
                          Match #{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span>📍</span>
                          <span className={locked ? "blur-[2px]" : ""}>
                            {s.country}
                          </span>
                        </span>
                        <span className="text-emerald-400 font-semibold text-sm">
                          {s.amount}
                        </span>
                      </div>

                      <div className="bg-slate-950/70 p-3 rounded-xl text-xs text-slate-200 border border-slate-800/80">
                        <p className="font-semibold text-[0.7rem] uppercase tracking-[0.16em] text-slate-400 mb-1">
                          Benefits snapshot
                        </p>
                        <p className={locked ? "blur-[2px]" : ""}>
                          {s.benefits ??
                            "Tuition support + stipend + additional perks based on profile fit."}
                        </p>
                      </div>

                      <p className="text-[0.7rem] text-amber-300 font-semibold flex items-center gap-1">
                        <span>📅 Deadline:</span>
                        <span className={locked ? "blur-[2px]" : ""}>
                          {s.deadline}
                        </span>
                      </p>
                    </div>

                    {/* lock overlay */}
                    {locked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10 rounded-2xl">
                        <div className="relative w-full max-w-xs rounded-2xl border border-cyan-400/40 bg-slate-950/95 px-5 py-4 text-center shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
                            Locked insight
                          </p>
                          <p className="text-sm text-slate-100 mb-3 font-medium">
                            We found more matches like this.
                          </p>
                          <p className="text-[0.7rem] text-slate-400 mb-4">
                            Unlock the full roadmap to reveal names, deadlines,
                            and best‑fit notes.
                          </p>

                          <button
                            onClick={() => {
                              setSelectedScholarship(s);
                              setShowUnlock(true);
                            }}
                            className="w-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black text-xs font-semibold py-2.5 rounded-full shadow-[0_0_24px_rgba(236,72,153,0.6)] hover:brightness-110 transition-all cursor-pointer"
                          >
                            Unlock Report 🔓
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {showUnlock && selectedScholarship && (
          <UnlockForm
            reportId={report.id}
            scholarshipTitle={selectedScholarship.name}
            onClose={() => {
              setShowUnlock(false);
              setSelectedScholarship(null);
            }}
          />
        )}
      </div>
    </main>
  );
}
