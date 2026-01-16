"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type Scholarship = {
  id?: string;
  name: string;
  country: string;
  amount: number | string;
  deadline: string;
  description?: string;
  match_score?: number;
  why_it_fits?: string;
  strategy_tip?: string;
};

type ReportPayload = {
  id: string;
  input?: {
    name?: string;
    major?: string;
    gpa?: number;
    specialPowers?: string[];
    targetCountries?: string[];
  };
  total_value_found?: number;
  scholarships: Scholarship[];
};

function getFlag(country: string) {
  const countryLower = country.toLowerCase();
  if (countryLower.includes("uk") || countryLower.includes("united kingdom")) return "🇬🇧";
  if (countryLower.includes("usa") || countryLower.includes("united states") || countryLower.includes("us")) return "🇺🇸";
  if (countryLower.includes("canada")) return "🇨🇦";
  if (countryLower.includes("germany")) return "🇩🇪";
  if (countryLower.includes("australia")) return "🇦🇺";
  if (countryLower.includes("india")) return "🇮🇳";
  if (countryLower.includes("eu") || countryLower.includes("europe")) return "🇪🇺";
  return "🎓";
}

// Convert USD/GBP/CAD to INR and return in Lakhs
function convertToINRLakhs(amount: number | string, country: string): number {
  const numAmount = typeof amount === "string" ? parseFloat(amount.replace(/[^\d.]/g, "")) : amount;
  if (!Number.isFinite(numAmount) || numAmount <= 0) return 0;

  const countryLower = country.toLowerCase();
  let inrAmount = numAmount;

  // Convert to INR based on country
  if (countryLower.includes("uk") || countryLower.includes("united kingdom")) {
    inrAmount = numAmount * 105; // GBP to INR
  } else if (countryLower.includes("usa") || countryLower.includes("united states") || countryLower.includes("us")) {
    inrAmount = numAmount * 83; // USD to INR
  } else if (countryLower.includes("canada")) {
    inrAmount = numAmount * 61; // CAD to INR
  } else if (countryLower.includes("australia")) {
    inrAmount = numAmount * 54; // AUD to INR
  } else if (countryLower.includes("europe") || countryLower.includes("eu") || countryLower.includes("germany")) {
    inrAmount = numAmount * 90; // EUR to INR
  }
  // If already in INR or unknown, use as is

  return inrAmount / 100000; // Convert to Lakhs
}

// Format amount display
function formatAmount(amount: number | string, country: string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount.replace(/[^\d.]/g, "")) : amount;
  if (!Number.isFinite(numAmount) || numAmount <= 0) return "Amount varies";

  const countryLower = country.toLowerCase();
  
  // For large amounts, show "Fully Funded + Stipend"
  if (numAmount >= 20000) {
    return "Fully Funded + Stipend";
  }
  
  // Format based on country
  if (countryLower.includes("uk") || countryLower.includes("united kingdom")) {
    return `£${numAmount.toLocaleString()}`;
  } else if (countryLower.includes("usa") || countryLower.includes("united states") || countryLower.includes("us")) {
    return `$${numAmount.toLocaleString()}`;
  } else if (countryLower.includes("canada")) {
    return `C$${numAmount.toLocaleString()}`;
  } else if (countryLower.includes("australia")) {
    return `A$${numAmount.toLocaleString()}`;
  } else if (countryLower.includes("europe") || countryLower.includes("eu") || countryLower.includes("germany")) {
    return `€${numAmount.toLocaleString()}`;
  }
  
  return `₹${numAmount.toLocaleString()}`;
}

// Calculate match score (85-98%)
function calculateMatchScore(index: number, total: number): number {
  const baseScore = 85;
  const maxScore = 98;
  const range = maxScore - baseScore;
  // Higher index = slightly lower score, but still high
  const score = baseScore + (range * (1 - index / total));
  return Math.round(score);
}

// Generate "Desi" context - why it fits
function generateDesiContext(scholarship: Scholarship, userProfile: ReportPayload["input"]): string {
  const parts: string[] = [];
  
  if (userProfile?.specialPowers?.length && !userProfile.specialPowers.includes("None")) {
    const powers = userProfile.specialPowers;
    if (powers.includes("ResearchPaper")) {
      parts.push("Your research paper experience makes you stand out");
    }
    if (powers.includes("Sports")) {
      parts.push("Your state-level sports achievements add a unique dimension");
    }
    if (powers.includes("NGO_Work")) {
      parts.push("Your NGO work demonstrates the social impact they're looking for");
    }
  }
  
  if (userProfile?.gpa && userProfile.gpa >= 8.5) {
    parts.push("your strong academic record (GPA " + userProfile.gpa.toFixed(1) + ") aligns perfectly");
  }
  
  if (userProfile?.major) {
    parts.push("your " + userProfile.major + " background matches their requirements");
  }
  
  if (parts.length === 0) {
    return "Your profile aligns well with the scholarship criteria and eligibility requirements.";
  }
  
  return parts.join(", ") + ".";
}

function getCountdown(deadline: string) {
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) return "Deadline unknown";

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Deadline passed";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  return `${diffDays}d ${diffHours.toString().padStart(2, "0")}h`;
}

export default function ReportPage() {
  const params = useParams();
  const reportId = params?.id as string | undefined;

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

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
        
        // Transform scholarships to add match scores and desi context
        const transformedScholarships = (json.scholarships || []).map((s: any, index: number) => ({
          ...s,
          match_score: calculateMatchScore(index, json.scholarships?.length || 1),
          why_it_fits: generateDesiContext(s, json.input),
          amount: s.amount || 0,
        }));
        
        setReport({ 
          ...json, 
          id: reportId,
          scholarships: transformedScholarships,
        });
      } catch (e: any) {
        console.error("Report load error:", e);
        setError("Unable to load report");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [reportId]);

  const totalLakhs = useMemo(() => {
    if (!report?.scholarships?.length) return null;
    
    let totalINR = 0;
    for (const s of report.scholarships) {
      const lakhs = convertToINRLakhs(s.amount, s.country);
      totalINR += lakhs * 100000; // Convert back to INR for total
    }
    
    if (!totalINR) return null;
    const totalLakhs = totalINR / 100000;
    return `We found ₹${totalLakhs.toFixed(1)} Lakhs in total funding`;
  }, [report]);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function handleShareWithDad() {
    if (!reportId) return;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/report/${reportId}`
        : "";
    const country = report?.scholarships?.[0]?.country || "the UK";
    const text =
      `Papa, check this out - I found a full scholarship for ${country} based on my profile. Read this report: ${url}`;
    const encoded = encodeURIComponent(text);
    const whatsappUrl =
      typeof window !== "undefined" && /Android|iPhone/i.test(navigator.userAgent)
        ? `whatsapp://send?text=${encoded}`
        : `https://web.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, "_blank");
  }

  function handleTalkToMentor() {
    if (!reportId) return;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/report/${reportId}`
        : "";
    const scholarshipName = report?.scholarships?.[0]?.name || "a scholarship";
    const text =
      `Hey, I just saw my scholarship report (ID: ${reportId}). I want to target ${scholarshipName}. Can you help me? ${url}`;
    const encoded = encodeURIComponent(text);
    // Use wa.me format with phone number
    const phoneNumber = "919999999999"; // Replace with actual mentor number
    const whatsappUrl =
      typeof window !== "undefined" && /Android|iPhone/i.test(navigator.userAgent)
        ? `whatsapp://send?phone=${phoneNumber}&text=${encoded}`
        : `https://wa.me/${phoneNumber}?text=${encoded}`;
    window.open(whatsappUrl, "_blank");
  }

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
        <p className="text-sm text-slate-300">Loading your report…</p>
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

  const scholarships = report.scholarships || [];
  const name = report.input?.name || "you";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#020617,_#000000)] text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-5xl space-y-8 relative pb-32">
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

        {/* header */}
        <header className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Funding roadmap
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
            Funding Roadmap for {name}
          </h1>
          {totalLakhs && (
            <p className="text-sm text-slate-300 font-medium">{totalLakhs}</p>
          )}
          <p className="text-xs text-slate-400 max-w-xl">
            These matches are tuned to your profile. Tap any card to see why it
            fits and exactly how to play it like a desi.
          </p>
        </header>

        {/* cards */}
        <section className="relative z-10 space-y-4">
          {scholarships.map((s, index) => {
            const id = s.id ?? `sch-${index}`;
            const isOpen = openId === id;
            const flag = getFlag(s.country);
            const countdown = getCountdown(s.deadline);
            const formattedAmount = formatAmount(s.amount, s.country);
            const matchScore = s.match_score || calculateMatchScore(index, scholarships.length);

            return (
              <div
                key={id}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden relative"
              >
                {/* Country Flag - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-2xl">{flag}</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="w-full flex items-start justify-between gap-3 px-4 py-4 text-left relative"
                >
                  <div className="flex-1 pr-8">
                    {/* Match Score Badge - Green Ring */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-pulse" />
                        <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/10">
                          <span className="text-xs font-bold text-emerald-300">
                            {matchScore}%
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-300 font-medium">
                        Match Score
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base md:text-lg font-semibold mb-1 pr-2">
                      {s.name}
                    </h2>

                    {/* Amount */}
                    <p className="text-sm text-emerald-400 font-semibold mb-2">
                      {formattedAmount}
                    </p>

                    {/* Country and Countdown */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{s.country}</span>
                      </span>
                      <span className="text-amber-300 font-medium">
                        {countdown}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0 pt-1">
                    <span
                      className={`text-xs transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    >
                      ▶
                    </span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 pt-1 space-y-3 text-sm text-slate-300 border-t border-slate-800"
                    >
                      {/* Desi Context - Why it fits */}
                      {s.why_it_fits && (
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-cyan-500/20">
                          <p className="font-semibold text-cyan-300 mb-1 text-xs uppercase tracking-wide">
                            Why this works for you:
                          </p>
                          <p className="text-xs leading-relaxed">
                            {s.why_it_fits}
                          </p>
                        </div>
                      )}

                      {/* Description */}
                      {s.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {s.description}
                        </p>
                      )}

                      {/* Strategy Tip */}
                      {s.strategy_tip && (
                        <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/30">
                          <p className="font-semibold text-amber-300 mb-1 text-xs uppercase tracking-wide">
                            Desi strategy to win:
                          </p>
                          <p className="text-xs leading-relaxed">
                            {s.strategy_tip}
                          </p>
                        </div>
                      )}

                      <p className="text-[0.7rem] text-slate-500 pt-2 border-t border-slate-800">
                        Deadline: {s.deadline}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </section>

        {/* Wildfire Conversion Element - Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-4 py-4 mt-8 rounded-t-3xl">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold text-white mb-1">
                Don't write the essay alone.
              </p>
              <p className="text-xs text-slate-400">
                Get personalized guidance from our mentors
              </p>
            </div>
            <button
              type="button"
              onClick={handleTalkToMentor}
              className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black text-sm font-semibold px-6 py-3 rounded-full shadow-[0_0_24px_rgba(236,72,153,0.6)] hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>💬</span>
              <span>Chat with a Mentor on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Floating Share with Dad Button - Bottom Right */}
        <button
          type="button"
          onClick={handleShareWithDad}
          className="fixed right-4 bottom-20 md:bottom-24 z-50 bg-emerald-500 text-black text-xs font-semibold px-4 py-3 rounded-full shadow-[0_0_22px_rgba(34,211,238,0.6)] hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span>📲</span>
          <span>Share with Dad</span>
        </button>
      </div>
    </main>
  );
}
