// app/hunt/[index]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Flags from "country-flag-icons/react/3x2";
import { EXTRA_COUNTRIES } from "@/app/lib/countries";

type Scholarship = {
  name: string;
  country: string;
  amount: string;
  deadline: string;
  benefits?: string;
  why_it_fits?: string;
  strategy_tip?: string;
};

type ReportPayload = {
  id: string;
  scholarships: Scholarship[];
};

// Tiny flag component
function FlagIcon({ code, size = 16 }: { code: string; size?: number }) {
  const upper = code.toUpperCase();
  const Flag =
    (Flags as Record<string, React.ComponentType<any>>)[upper] || null;
  if (!Flag) return null;
  return (
    <span className="inline-block align-middle" style={{ height: size }}>
      <Flag
        title={upper}
        style={{
          height: size,
          width: (size * 3) / 2,
          borderRadius: 2,
          display: "block",
        }}
      />
    </span>
  );
}

// Shared country → code mapping
function countryToCode(country: string): string | null {
  if (!country) return null;
  const normalized = country.replace(/\(.*\)/, "").trim();

  if (normalized === "USA") return "US";
  if (normalized === "UK") return "GB";
  if (normalized.toLowerCase() === "europe") return null;

  const exact = EXTRA_COUNTRIES.find((c) => c.name === normalized);
  if (exact) return exact.code;

  const ci = EXTRA_COUNTRIES.find(
    (c) => c.name.toLowerCase() === normalized.toLowerCase()
  );
  return ci ? ci.code : null;
}

export default function ScholarshipDetailsPage() {
  const params = useParams<{ index: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const index = Number(params.index);
  const reportIdFromQuery = searchParams.get("id");

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);

        let reportId = reportIdFromQuery;
        if (!reportId && typeof window !== "undefined") {
          reportId = sessionStorage.getItem("lastReportId");
        }
        if (!reportId) {
          setError("No report ID provided.");
          return;
        }

        const res = await fetch(`/api/report?id=${reportId}`);
        if (!res.ok) {
          const body = await res.text();
          console.error("report fetch failed:", res.status, body);
          throw new Error("Report fetch failed");
        }

        const data = await res.json();
        const scholarships: Scholarship[] = (data.scholarships || []).map(
          (s: any) => ({
            name: s.name || "",
            country: s.country || "",
            amount:
              typeof s.amount === "number"
                ? s.amount.toString()
                : s.amount || "",
            deadline: s.deadline || "",
            benefits:
              s.description ||
              s.benefits ||
              "Tuition support + stipend + additional perks based on profile fit.",
            why_it_fits: s.why_it_fits || s.whyItFits || "",
            strategy_tip: s.strategy_tip || s.strategyTip || "",
          })
        );

        setReport({ id: reportId, scholarships });
      } catch (err: any) {
        console.error(err);
        setError("Error loading scholarship details");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [reportIdFromQuery, index]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-white flex items-center justify-center">
        <p className="text-sm text-slate-300">Loading scholarship…</p>
      </main>
    );
  }

  if (error || !report || Number.isNaN(index)) {
    return (
      <main className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        {error || "Something went wrong"}
      </main>
    );
  }

  const scholarship = report.scholarships[index];
  if (!scholarship) {
    return (
      <main className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        Scholarship not found
      </main>
    );
  }

  const code = countryToCode(scholarship.country);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const detailsUrl = `${baseUrl}/hunt/${index}?id=${report.id}`;

  const shareText = `Papa, check this out - I found a scholarship based on my profile. Read this: ${detailsUrl}`;
  const shareLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const mentorNumber = "9199999999";
  const mentorText = `Hey, I just saw my scholarship report (ID: ${report.id}). I want to target "${scholarship.name}". Can you help me?`;
  const mentorLink = `https://wa.me/${mentorNumber}?text=${encodeURIComponent(
    mentorText
  )}`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1120,_#020617)] text-white px-4 py-8 flex justify-center">
      <div className="w-full max-w-3xl space-y-6 relative pb-24">
        {/* glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

        {/* back + top share */}
        <div className="relative z-10 flex items-center justify-between mb-2">
          <button
            onClick={() => router.back()}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            ← Back to matches
          </button>

          <a
            href={shareLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold rounded-full bg-slate-900 border border-slate-700 px-3 py-1.5 hover:border-cyan-400 hover:text-cyan-200 transition-colors"
          >
            <span>📲</span>
            <span>Share with Dad</span>
          </a>
        </div>

        {/* main card */}
        <section className="relative z-10 rounded-3xl border border-cyan-400/25 bg-slate-950/80 backdrop-blur-2xl p-5 md:p-7 shadow-[0_0_40px_rgba(15,23,42,0.9)] space-y-5">
          {/* tiny funding header like old design */}
          <div className="flex items-center justify-between gap-3 text-[0.7rem] text-slate-400">
            <div className="uppercase tracking-[0.18em] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Funding roadmap</span>
            </div>
          </div>

          <header className="space-y-2 mt-1">
            <h1 className="text-xl md:text-2xl font-semibold">
              {scholarship.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700">
                {code && <FlagIcon code={code} size={14} />}
                <span>📍 {scholarship.country}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/50 text-emerald-300">
                🎓 Funding: {scholarship.amount}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/50 text-amber-200">
                📅 Deadline: {scholarship.deadline || "Varies"}
              </span>
            </div>
          </header>

          <div className="space-y-4 text-sm text-slate-200">
            {/* Why this works for you */}
            {scholarship.why_it_fits && (
              <div className="rounded-2xl border border-sky-500/40 bg-sky-500/5 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-sky-300 mb-1">
                  Why this works for you
                </p>
                <p>{scholarship.why_it_fits}</p>
              </div>
            )}

            {/* Benefits snapshot */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-400 mb-1">
                Benefits snapshot
              </p>
              <p>{scholarship.benefits}</p>
            </div>

            {/* Desi strategy to win */}
            {scholarship.strategy_tip && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-emerald-300 mb-1">
                  Desi strategy to win
                </p>
                <p>{scholarship.strategy_tip}</p>
              </div>
            )}

            {/* Deadline line at bottom of card */}
            <p className="text-[0.75rem] text-amber-200 font-medium">
              Deadline:{" "}
              <span className="text-amber-100">
                {scholarship.deadline || "Varies by intake"}
              </span>
            </p>
          </div>
        </section>

        {/* bottom fixed CTA bar with mentor copy */}
        <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/80 to-transparent px-4 pb-4 pt-3">
          <div className="mx-auto w-full max-w-3xl flex flex-col gap-2">
            <div className="text-[0.75rem] text-slate-200 font-medium">
              Don&apos;t write the essay alone.
            </div>
            <div className="text-[0.7rem] text-slate-400">
              Get personalized guidance from our mentors.
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <a
                href={mentorLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-semibold rounded-full bg-emerald-500 text-black px-4 py-2.5 hover:brightness-110 transition-all"
              >
                💬 Chat with a Mentor on WhatsApp
              </a>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-semibold rounded-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-2.5 hover:border-cyan-400 hover:text-cyan-200 transition-colors"
              >
                📲 Share with Dad
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
