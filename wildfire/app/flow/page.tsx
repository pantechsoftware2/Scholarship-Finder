// app/flow/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Flags from "country-flag-icons/react/3x2";
import SiteFooter from "@/app/components/SiteFooter";

// Small flag component (emoji-like size)
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

const COUNTRIES = ["USA", "UK", "Canada", "Europe"] as const;
type Country = (typeof COUNTRIES)[number];

const SPECIAL_POWERS = ["ResearchPaper", "Sports", "NGO_Work", "None"] as const;
type SpecialPower = (typeof SPECIAL_POWERS)[number];

const majorsList = [
  "Computer Science",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Software Engineering",
  "Information Technology",
  "Cyber Security",
  "Electronics and Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biomedical Engineering",
  "Biotechnology",
  "Physics",
  "Mathematics",
  "Statistics",
  "Economics",
  "Business Administration",
  "Finance",
  "Marketing",
  "Accounting",
  "Psychology",
  "Sociology",
  "Political Science",
  "International Relations",
  "Law",
  "Medicine",
  "Nursing",
  "Public Health",
  "Pharmacy",
  "Architecture",
  "Design",
  "Media Studies",
  "Journalism",
  "Environmental Science",
  "Materials Science",
];

// many countries with ISO 3166‑1 alpha‑2 codes
const EXTRA_COUNTRIES = [
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Argentina", code: "AR" },
  { name: "Armenia", code: "AM" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Bangladesh", code: "BD" },
  { name: "Belarus", code: "BY" },
  { name: "Belgium", code: "BE" },
  { name: "Bhutan", code: "BT" },
  { name: "Bolivia", code: "BO" },
  { name: "Bosnia and Herzegovina", code: "BA" },
  { name: "Botswana", code: "BW" },
  { name: "Brazil", code: "BR" },
  { name: "Bulgaria", code: "BG" },
  { name: "Cambodia", code: "KH" },
  { name: "Cameroon", code: "CM" },
  { name: "Canada", code: "CA" },
  { name: "Chile", code: "CL" },
  { name: "China", code: "CN" },
  { name: "Colombia", code: "CO" },
  { name: "Costa Rica", code: "CR" },
  { name: "Croatia", code: "HR" },
  { name: "Czechia", code: "CZ" },
  { name: "Denmark", code: "DK" },
  { name: "Dominican Republic", code: "DO" },
  { name: "Ecuador", code: "EC" },
  { name: "Egypt", code: "EG" },
  { name: "Estonia", code: "EE" },
  { name: "Ethiopia", code: "ET" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Georgia", code: "GE" },
  { name: "Germany", code: "DE" },
  { name: "Ghana", code: "GH" },
  { name: "Greece", code: "GR" },
  { name: "Hong Kong", code: "HK" },
  { name: "Hungary", code: "HU" },
  { name: "Iceland", code: "IS" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Iran", code: "IR" },
  { name: "Iraq", code: "IQ" },
  { name: "Ireland", code: "IE" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" },
  { name: "Jamaica", code: "JM" },
  { name: "Japan", code: "JP" },
  { name: "Jordan", code: "JO" },
  { name: "Kenya", code: "KE" },
  { name: "Kuwait", code: "KW" },
  { name: "Laos", code: "LA" },
  { name: "Latvia", code: "LV" },
  { name: "Lebanon", code: "LB" },
  { name: "Lithuania", code: "LT" },
  { name: "Luxembourg", code: "LU" },
  { name: "Madagascar", code: "MG" },
  { name: "Malaysia", code: "MY" },
  { name: "Maldives", code: "MV" },
  { name: "Malta", code: "MT" },
  { name: "Mexico", code: "MX" },
  { name: "Moldova", code: "MD" },
  { name: "Monaco", code: "MC" },
  { name: "Mongolia", code: "MN" },
  { name: "Morocco", code: "MA" },
  { name: "Mozambique", code: "MZ" },
  { name: "Myanmar", code: "MM" },
  { name: "Namibia", code: "NA" },
  { name: "Nepal", code: "NP" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Nigeria", code: "NG" },
  { name: "North Korea", code: "KP" },
  { name: "Norway", code: "NO" },
  { name: "Oman", code: "OM" },
  { name: "Pakistan", code: "PK" },
  { name: "Panama", code: "PA" },
  { name: "Peru", code: "PE" },
  { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Qatar", code: "QA" },
  { name: "Romania", code: "RO" },
  { name: "Russia", code: "RU" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Senegal", code: "SN" },
  { name: "Serbia", code: "RS" },
  { name: "Singapore", code: "SG" },
  { name: "Slovakia", code: "SK" },
  { name: "Slovenia", code: "SI" },
  { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" },
  { name: "Spain", code: "ES" },
  { name: "Sri Lanka", code: "LK" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Taiwan", code: "TW" },
  { name: "Tanzania", code: "TZ" },
  { name: "Thailand", code: "TH" },
  { name: "Tunisia", code: "TN" },
  { name: "Turkey", code: "TR" },
  { name: "Uganda", code: "UG" },
  { name: "Ukraine", code: "UA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "Uruguay", code: "UY" },
  { name: "Uzbekistan", code: "UZ" },
  { name: "Venezuela", code: "VE" },
  { name: "Vietnam", code: "VN" },
  { name: "Yemen", code: "YE" },
  { name: "Zambia", code: "ZM" },
  { name: "Zimbabwe", code: "ZW" },
];

type FormState = {
  targetCountries: string[];
  major: string;
  gpa: number;
  specialPowers: (SpecialPower | string)[];
};

const STEPS = ["countries", "major", "gpa", "powers"] as const;
type Step = (typeof STEPS)[number];

const LOADER_LINES = [
  "Scanning 450+ university endowments…",
  "Filtering for Indian citizen eligibility…",
  "Removing expired deadlines…",
  "Verifying GRE waivers…",
];

const MIN_LOADER_MS = 5000;

export default function FlowPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("countries");
  const [form, setForm] = useState<FormState>({
    targetCountries: [],
    major: "",
    gpa: 8.0,
    specialPowers: [],
  });

  const [countryQuery, setCountryQuery] = useState("");
  const [majorQuery, setMajorQuery] = useState("");

  const [otherPowerActive, setOtherPowerActive] = useState(false);
  const [otherPowerText, setOtherPowerText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaderIndex, setLoaderIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(
      () => setLoaderIndex((p) => (p + 1) % LOADER_LINES.length),
      1200
    );
    return () => clearInterval(id);
  }, [loading]);

  function nextStep() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function prevStep() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function handleSubmit() {
    setError("");

    if (form.targetCountries.length === 0) {
      setStep("countries");
      setError("Pick at least one country");
      return;
    }
    if (!form.major.trim()) {
      setStep("major");
      setError("Tell me your major");
      return;
    }

    try {
      setLoading(true);
      const start = Date.now();

      const res = await fetch("/api/start-hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCountries: form.targetCountries,
          major: form.major,
          gpa: form.gpa,
          specialPowers: form.specialPowers,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("start-hunt failed:", res.status, body);
        throw new Error("Search failed");
      }

      const { reportId } = await res.json();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("lastReportId", reportId);
      }

      const elapsed = Date.now() - start;
      const remaining = MIN_LOADER_MS - elapsed;
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      router.push(`/hunt?id=${reportId}`);
    } catch (err: any) {
      console.error("Flow submit error:", err);
      setError(err.message || "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  function toggleCountry(c: string) {
    setForm((prev) => {
      const exists = prev.targetCountries.includes(c);
      return {
        ...prev,
        targetCountries: exists
          ? prev.targetCountries.filter((x) => x !== c)
          : [...prev.targetCountries, c],
      };
    });
  }

  function togglePower(p: SpecialPower) {
    if (p === "None") {
      setForm((prev) => ({
        ...prev,
        specialPowers: prev.specialPowers.includes("None") ? [] : ["None"],
      }));
      setOtherPowerActive(false);
      setOtherPowerText("");
      return;
    }
    setForm((prev) => {
      const base = prev.specialPowers.filter((x) => x !== "None");
      const exists = base.includes(p);
      return {
        ...prev,
        specialPowers: exists ? base.filter((x) => x !== p) : [...base, p],
      };
    });
  }

  function handleOtherPowerSave() {
    if (!otherPowerText.trim()) return;
    setForm((prev) => ({
      ...prev,
      specialPowers: [
        ...prev.specialPowers.filter((x) => x !== "None"),
        otherPowerText.trim(),
      ],
    }));
  }

  const filteredMajors = majorsList.filter((m) =>
    m.toLowerCase().includes(majorQuery.toLowerCase())
  );
  const filteredExtraCountries = EXTRA_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase())
  );

  const stepTitle: Record<Step, string> = {
    countries: "Where are we flying?",
    major: "What’s the major?",
    gpa: "What’s your GPA?",
    powers: "Any special powers?",
  };

  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#020617,_#000000)] text-white flex flex-col">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* centered card area */}
      <div className="relative flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md rounded-[28px] border border-slate-800/80 bg-slate-950/75 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] p-6 space-y-6">
          <div className="pointer-events-none absolute -top-24 -left-20 h-40 w-40 rounded-full bg-cyan-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-3xl" />

          <header className="space-y-2 relative z-10">
            <p className="text-[0.65rem] uppercase tracking-[0.26em] text-slate-400">
              Funding intake
            </p>
            <h1 className="text-xl font-semibold">{stepTitle[step]}</h1>
            <p className="text-[0.7rem] text-slate-400">
              Step {STEPS.indexOf(step) + 1} of {STEPS.length}
            </p>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 space-y-4"
            >
              {/* STEP 1: COUNTRIES */}
              {step === "countries" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {COUNTRIES.map((c) => {
                      const active = form.targetCountries.includes(c);
                      const code =
                        c === "USA"
                          ? "US"
                          : c === "UK"
                          ? "GB"
                          : c === "Canada"
                          ? "CA"
                          : "EU";
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCountry(c)}
                          className={`rounded-2xl border px-3 py-3 text-sm text-left transition-all flex items-center justify-between ${
                            active
                              ? "border-cyan-400/80 bg-cyan-400/10 shadow-[0_0_22px_rgba(34,211,238,0.55)]"
                              : "border-slate-700/80 bg-slate-900/70 hover:border-slate-500"
                          }`}
                        >
                          <span>{c}</span>
                          {code !== "EU" && <FlagIcon code={code} size={14} />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.75rem] text-slate-400">
                      Or search any other country
                    </label>
                    <input
                      type="text"
                      value={countryQuery}
                      onChange={(e) => setCountryQuery(e.target.value)}
                      placeholder="Start typing: India, Germany, Brazil…"
                      className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60"
                    />

                    {countryQuery && (
                      <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/95 text-xs">
                        {filteredExtraCountries.length === 0 && (
                          <p className="px-3 py-2 text-slate-500">
                            No country found. Try another spelling.
                          </p>
                        )}
                        {filteredExtraCountries.map((c) => {
                          const selected =
                            form.targetCountries.includes(c.name);
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                toggleCountry(c.name);
                                setCountryQuery("");
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-slate-800/70"
                            >
                              <span className="flex items-center gap-2">
                                <FlagIcon code={c.code} size={14} />
                                <span>{c.name}</span>
                              </span>
                              {selected && (
                                <span className="text-[0.65rem] text-emerald-400">
                                  Selected
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {form.targetCountries.length > 0 && (
                    <p className="text-[0.7rem] text-slate-400">
                      Selected: {form.targetCountries.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* STEP 2: MAJOR */}
              {step === "major" && (
                <div className="space-y-3">
                  <label className="text-[0.75rem] text-slate-400">
                    Type or pick your intended major.
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60"
                    placeholder="e.g. Computer Science"
                    value={form.major}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((prev) => ({ ...prev, major: v }));
                      setMajorQuery(v);
                    }}
                  />
                  {majorQuery && (
                    <div className="max-h-40 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/95 text-xs">
                      {filteredMajors.length === 0 && (
                        <p className="px-3 py-2 text-slate-500">
                          No suggestions. Free‑type is fine.
                        </p>
                      )}
                      {filteredMajors.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, major: m }));
                            setMajorQuery("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800/80"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: GPA */}
              {step === "gpa" && (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-slate-300">
                      Current GPA (10‑point scale)
                    </span>
                    <span className="text-sm font-semibold text-cyan-300">
                      {form.gpa.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={10}
                    step={0.1}
                    value={form.gpa}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        gpa: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[0.7rem] text-slate-500">
                    <span>6.0</span>
                    <span>8.0</span>
                    <span>10.0</span>
                  </div>
                </div>
              )}

              {/* STEP 4: POWERS */}
              {step === "powers" && (
                <div className="space-y-3">
                  <p className="text-[0.75rem] text-slate-400">
                    Pick anything that makes you stand out. It helps the AI aim
                    higher.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIAL_POWERS.map((p) => {
                      const active = form.specialPowers.includes(p);
                      const label =
                        p === "ResearchPaper"
                          ? "#ResearchPaper"
                          : p === "NGO_Work"
                          ? "#NGO_Work"
                          : p === "Sports"
                          ? "#StateLevelSports"
                          : "#None";
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePower(p)}
                          className={`rounded-full px-3 py-1.5 text-xs border transition-all ${
                            active
                              ? "border-cyan-400 bg-cyan-400/10"
                              : "border-slate-700 bg-slate-900/70 hover:border-slate-500"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        setOtherPowerActive((prev) => !prev)
                      }
                      className={`rounded-full px-3 py-1.5 text-xs border transition-all ${
                        otherPowerActive
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-slate-700 bg-slate-900/70 hover:border-slate-500"
                      }`}
                    >
                      #Other
                    </button>
                  </div>

                  {otherPowerActive && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={otherPowerText}
                        onChange={(e) => setOtherPowerText(e.target.value)}
                        placeholder="e.g. National hackathon winner, startup founder…"
                        className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60"
                        onBlur={handleOtherPowerSave}
                      />
                      <p className="text-[0.7rem] text-slate-500">
                        This will be added as a custom power for matching.
                      </p>
                    </div>
                  )}

                  {form.specialPowers.length > 0 && (
                    <p className="text-[0.7rem] text-slate-400">
                      Selected: {form.specialPowers.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-2xl relative z-10">
              {error}
            </p>
          )}

          <footer className="flex items-center justify-between pt-2 relative z-10">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === "countries" || loading}
              className="text-xs text-slate-400 disabled:opacity-30"
            >
              ← Back
            </button>

            {step !== "powers" && (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="text-xs px-4 py-2 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50"
              >
                Next →
              </button>
            )}

            {step === "powers" && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-semibold shadow-[0_0_24px_rgba(236,72,153,0.7)] hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Scanning your universe…" : "Start the Hunt 🔍"}
              </button>
            )}
          </footer>
        </div>
      </div>

      {/* footer at bottom, appears after scroll when content taller */}
      <div className="relative z-10 px-4 py-4 mt-auto">
        <div className="max-w-5xl mx-auto">
          <SiteFooter />
        </div>
      </div>

      {/* global loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl px-4"
          >
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 mb-6 flex items-center justify-center">
              <div className="radar-parallax absolute inset-[-10%] rounded-full border border-cyan-500/20" />
              <div className="relative w-32 h-32 sm:w-36 h-36 rounded-full border border-cyan-400/40 bg-slate-950/80 overflow-hidden flex items-center justify-center">
                <div className="radar-pulse absolute inset-[-15%]" />
                <div className="absolute inset-4 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-8 rounded-full border border-cyan-500/25" />
                <div className="absolute inset-12 rounded-full border border-cyan-500/30" />
                <div className="radar-sweep absolute inset-0 rounded-full">
                  <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,rgba(34,211,238,0.4),transparent_40deg,transparent_360deg)]" />
                </div>
                <div
                  className="radar-dot"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <div className="radar-dot" style={{ top: "22%", left: "68%" }} />
                <div
                  className="radar-dot"
                  style={{ top: "72%", left: "30%", animationDelay: "0.7s" }}
                />
                <div
                  className="radar-dot"
                  style={{ top: "36%", left: "18%", animationDelay: "1.2s" }}
                />
              </div>
            </div>

            <motion.p
              key={loaderIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-sm text-slate-200 text-center"
            >
              {LOADER_LINES[loaderIndex]}
            </motion.p>

            <p className="mt-2 text-[0.7rem] text-slate-500 text-center">
              Matching you with high‑probability scholarships…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
