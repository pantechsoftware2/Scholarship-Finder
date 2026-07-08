// app/hunt/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import UnlockForm from "./UnlockForm";
import * as Flags from "country-flag-icons/react/3x2";
import SiteFooter from "@/app/components/SiteFooter";
import { EXTRA_COUNTRIES } from "@/app/lib/countries";

// ---------- FX + helpers ----------
const FX_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
  CHF: 95,
  CAD: 62,
};

function parseCurrencyToInr(amount: string): number {
  if (!amount) return 0;

  let val = amount.trim();
  let currency = "INR";

  if (/^\$/.test(val)) {
    currency = "USD";
    val = val.replace(/^\$/, "");
  } else if (/^£/.test(val)) {
    currency = "GBP";
    val = val.replace(/^£/, "");
  } else if (/^€/.test(val)) {
    currency = "EUR";
    val = val.replace(/^€/, "");
  } else if (/^CHF/i.test(val)) {
    currency = "CHF";
    val = val.replace(/^CHF\s*/i, "");
  } else if (/^CAD/i.test(val)) {
    currency = "CAD";
    val = val.replace(/^CAD\s*/i, "");
  } else if (/^₹/.test(val)) {
    currency = "INR";
    val = val.replace(/^₹/, "");
  }

  const numeric = parseFloat(val.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric)) return 0;

  const rate = FX_TO_INR[currency] ?? 1;
  return numeric * rate;
}

function getCountdown(deadline: string): string {
  if (!deadline) return "";
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) return "";

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Deadline passed";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days === 0 && hours === 0) return "Less than 1 hour left";
  if (days === 0) return `${hours}h left`;
  return `${days}d ${hours}h left`;
}

// ---------- flags ----------
function FlagIcon({ code, size = 14 }: { code: string; size?: number }) {
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

// ---------- types ----------
type Scholarship = {
  name: string;
  country: string;
  amount: string;
  amountInInr?: number;
  deadline: string;
  benefits?: string;
};

type ReportPayload = {
  id: string;
  scholarships: Scholarship[];
  total_value_found?: number;
  user_name?: string;
};

const MAX_FREE = 2;

// ---------- inner content using hooks ----------
function HuntPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [selectedScholarship, setSelectedScholarship] =
    useState<Scholarship | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [userName, setUserName] = useState("Anonymous");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = window.localStorage.getItem("userName");
      if (storedName && storedName.trim().length > 0) {
        setUserName(storedName.trim());
      }
    }
  }, []);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);

        let reportId = searchParams.get("id");
        if (!reportId && typeof window !== "undefined") {
          reportId = sessionStorage.getItem("lastReportId");
        }

        if (!reportId) {
          setError("No report ID provided. Please start a new search.");
          setReport(null);
          return;
        }

        setError("");

        const repRes = await fetch(`/api/report?id=${reportId}`);
        if (!repRes.ok) {
          const body = await repRes.text();
          console.error("report fetch failed:", repRes.status, body);
          throw new Error("Report fetch failed");
        }

        const repData = await repRes.json();

        const scholarships: Scholarship[] = (repData.scholarships || []).map(
          (s: any) => {
            const amt =
              typeof s.amount === "number"
                ? s.amount.toString()
                : s.amount || "";
            const amountInInr =
              typeof s.amount_in_inr === "number" &&
              !Number.isNaN(s.amount_in_inr)
                ? s.amount_in_inr
                : parseCurrencyToInr(amt);

            return {
              name: s.name || "",
              country: s.country || "",
              amount: amt,
              amountInInr,
              deadline: s.deadline || "",
              benefits:
                s.description ||
                s.benefits ||
                s.why_it_fits ||
                "Tuition support + stipend + additional perks based on profile fit.",
            };
          }
        );

        const total_value_found: number | undefined =
          typeof repData.total_value_found === "number" &&
          !Number.isNaN(repData.total_value_found)
            ? repData.total_value_found
            : scholarships.reduce(
                (sum, s) =>
                  typeof s.amountInInr === "number" &&
                  !Number.isNaN(s.amountInInr)
                    ? sum + s.amountInInr
                    : sum,
                0
              );

        const repJson: ReportPayload = {
          id: repData.id || reportId,
          scholarships,
          total_value_found,
          user_name: repData.user_name,
        };

        setReport(repJson);

        if (typeof window !== "undefined") {
          sessionStorage.setItem("lastReportId", repJson.id);
        }
      } catch (err: any) {
        console.error("Hunt error:", err);
        setError("Error loading scholarships");
        setReport(null);
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [searchParams]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <p className="text-sm md:text-base">Mapping your funding universe…</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center">
        {error || "Something went wrong"}
      </main>
    );
  }

  const data = report.scholarships || [];
  const totalMatches = data.length;

  if (totalMatches === 0) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <p className="text-sm md:text-base">
          No scholarships found for this report. Try running the hunt again from
          the flow page.
        </p>
      </main>
    );
  }

  const totalInInr =
    typeof report.total_value_found === "number" &&
    !Number.isNaN(report.total_value_found) &&
    report.total_value_found > 0
      ? report.total_value_found
      : data.reduce(
          (sum, s) =>
            typeof s.amountInInr === "number" && !Number.isNaN(s.amountInInr)
              ? sum + s.amountInInr
              : sum,
          0
        );

  const lakhs = totalInInr / 100000;
  const headerLakhsLabel =
    lakhs >= 1 ? `${lakhs.toFixed(1)} Lakhs` : "Under 1 Lakh";

  const displayName = report.user_name || userName;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-white px-4 py-10 flex justify-center relative overflow-x-hidden">
      <div className="w-full max-w-5xl space-y-8 relative">
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

        {/* header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 relative z-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Funding Roadmap for {displayName}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
              Your high‑probability matches.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md">
              These matches are tuned to your profile. Tap any card to see why
              it fits and exactly how to play it like a desi.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-cyan-400/30 backdrop-blur-xl text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase tracking-[0.16em] text-slate-300">
                ₹{headerLakhsLabel} found · {totalMatches} matches
              </span>
            </div>
            <p className="text-[0.65rem] text-slate-500">
              Some scholarships pay in foreign currency; this total is converted
              into approximate INR so everything lives in one number.
            </p>
          </div>
        </header>

        {/* cards grid */}
        <section className="relative z-10">
          <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/70 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] px-4 py-6 md:px-6 md:py-7">
            <div className="grid gap-5 md:grid-cols-2">
              {data.map((s, index) => {
                const locked = !unlocked && index >= MAX_FREE;
                const code = countryToCode(s.country);
                const countdown = getCountdown(s.deadline);

                const handleClick = () => {
                  if (locked) {
                    setSelectedScholarship(s);
                    setShowUnlock(true);
                    return;
                  }
                  router.push(`/hunt/${index}?id=${report.id}`);
                };

                return (
                  <div
                    key={`${s.name}-${index}`}
                    onClick={handleClick}
                    className="relative group rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 overflow-hidden transition-all duration-200 hover:border-cyan-400/60 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-fuchsia-500/10 blur-2xl transition-opacity" />

                    <div
                      className={
                        "relative space-y-3 " + (locked ? "select-none" : "")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <h2
                            className={
                              "text-lg font-semibold leading-snug " +
                              (locked ? "blur-sm" : "")
                            }
                          >
                            {s.name}
                          </h2>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-[0.65rem] px-2 py-1 uppercase tracking-[0.14em]">
                          Match #{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-2">
                          {code && !locked && (
                            <FlagIcon code={code} size={16} />
                          )}
                          <span className={locked ? "blur-[2px]" : ""}>
                            {s.country}
                          </span>
                        </span>
                        <span className="flex flex-col items-end">
                          <span className="text-emerald-400 font-semibold text-sm">
                            {s.amount}
                          </span>
                          {typeof s.amountInInr === "number" &&
                            s.amountInInr > 0 && (
                              <span className="text-[0.65rem] text-slate-400">
                                (~₹
                                {Math.round(
                                  s.amountInInr
                                ).toLocaleString("en-IN")}
                                )
                              </span>
                            )}
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

                      <div className="flex items-center justify-between text-[0.7rem]">
                        <p className="text-amber-300 font-semibold flex items-center gap-1">
                          <span>📅 Deadline:</span>
                          <span className={locked ? "blur-[2px]" : ""}>
                            {s.deadline}
                          </span>
                        </p>
                        {countdown && (
                          <p className="text-[0.7rem] text-sky-300">
                            {countdown}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>

      {/* UnlockForm for locked cards */}
      {showUnlock && selectedScholarship && report && (
        <UnlockForm
          reportId={report.id}
          scholarshipTitle={selectedScholarship.name}
          onClose={() => {
            setShowUnlock(false);
            setSelectedScholarship(null);
          }}
          onUnlocked={() => {
            setUnlocked(true);
            setShowUnlock(false);
            setSelectedScholarship(null);
          }}
        />
      )}
    </main>
  );
}

// ---------- Suspense wrapper ----------
export default function HuntPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
          <p className="text-sm md:text-base">Loading your scholarships…</p>
        </main>
      }
    >
      <HuntPageContent />
    </Suspense>
  );
}
