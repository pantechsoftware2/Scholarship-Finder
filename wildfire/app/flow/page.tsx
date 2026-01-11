"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAJORS = [
  "Computer Science",
  "Data Science",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Economics",
  "Electrical Engineering",
];

const POWER_OPTIONS = [
  "#ResearchPaper",
  "#StateLevelSports",
  "#NGO_Work",
  "#None",
];

const LOADER_MESSAGES = [
  "Scanning 450+ university endowments...",
  "Filtering for Indian citizen eligibility...",
  "Removing expired deadlines...",
  "Verifying GRE waivers...",
];

export default function FlowPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [major, setMajor] = useState("");
  const [gpa, setGpa] = useState(8.0);
  const [powers, setPowers] = useState<string[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const toggleCountry = (country: string) => {
    setTargetCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const togglePower = (tag: string) => {
    setPowers((prev) => {
      if (tag === "#None") {
        return prev.includes("#None") ? [] : ["#None"];
      }
      const withoutNone = prev.filter((p) => p !== "#None");
      return withoutNone.includes(tag)
        ? withoutNone.filter((p) => p !== tag)
        : [...withoutNone, tag];
    });
  };

  const startLoader = () => {
    setStep(5);
    setLoadingIndex(0);

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setLoadingIndex((prev) => (prev + 1) % LOADER_MESSAGES.length);
      if (i >= 4) clearInterval(interval);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      router.push("/hunt");
    }, 4500);
  };

  const totalSteps = 4;
  const currentStep = Math.min(step, 4);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#020617)] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8 relative">
        {/* background glow */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

        {/* top section: logo + progress pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-xs font-semibold tracking-[0.18em]">
              <span>AI</span>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Funding Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Step {currentStep} / {totalSteps}
            </span>
            <div className="h-1.5 w-24 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero */}
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
            Your ₹50 Lakh Scholarship is hiding.
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg">
            Answer a few sharp questions and let the engine hunt **money** you never knew existed.
          </p>
        </header>

        {/* QUESTIONS WRAPPED IN GLASS CARD */}
        <section className="relative">
          <div className="relative rounded-3xl border border-cyan-400/15 bg-slate-950/70 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] px-6 py-7 md:px-8 md:py-8 overflow-hidden">
            {/* inner gradient glow */}
            <div className="pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />

            {/* STEP 1: Where are we flying? */}
            {step === 1 && (
              <div className="relative space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-semibold">
                    Where are we flying?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pick all regions you&apos;re actually considering. No pressure, no visa yet.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { code: "USA", label: "🇺🇸 USA" },
                    { code: "UK", label: "🇬🇧 UK" },
                    { code: "Canada", label: "🇨🇦 Canada" },
                    { code: "Europe", label: "🇪🇺 Europe" },
                  ].map((c) => {
                    const active = targetCountries.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => toggleCountry(c.code)}
                        className={
                          "h-24 rounded-2xl border text-lg font-semibold " +
                          "bg-slate-900/60 backdrop-blur-md flex items-center justify-center " +
                          "transition-all duration-200 " +
                          (active
                            ? "border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.7)] scale-[1.02]"
                            : "border-slate-700 hover:border-slate-400 hover:bg-slate-900/80")
                        }
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => targetCountries.length && setStep(2)}
                    className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
                    disabled={targetCountries.length === 0}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: What's the major? */}
            {step === 2 && (
              <div className="relative space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-semibold">
                    What&apos;s the major?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Use your target major, not necessarily your current department title.
                  </p>
                </div>

                <div className="relative">
                  <input
                    className="w-full rounded-2xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-sm md:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60"
                    placeholder="Start typing – e.g. Computer Science, Data Science..."
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                  {major.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-950/95 border border-slate-700 rounded-2xl max-h-48 overflow-y-auto shadow-xl">
                      {MAJORS.filter((m) =>
                        m.toLowerCase().includes(major.toLowerCase())
                      ).map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setMajor(m)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 text-white"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={!major.trim()}
                    onClick={() => major.trim() && setStep(3)}
                    className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: GPA slider */}
            {step === 3 && (
              <div className="relative space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-semibold">
                    Be honest, what&apos;s the GPA?
                  </h2>
                  <p className="text-xs text-slate-400">
                    This only helps us match you to realistic money. You&apos;re not being judged here.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={6.0}
                      max={10.0}
                      step={0.1}
                      value={gpa}
                      onChange={(e) => setGpa(parseFloat(e.target.value))}
                      className="flex-1 accent-cyan-400"
                    />
                    <span className="text-2xl font-bold text-cyan-400 tabular-nums">
                      {gpa.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[0.65rem] text-slate-500 uppercase tracking-[0.18em]">
                    <span>6.0</span>
                    <span>10.0</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Any special powers? */}
            {step === 4 && (
              <div className="relative space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-semibold">
                    Any special powers?
                  </h2>
                  <p className="text-xs text-slate-400">
                    These are the little flexes that make committees look twice at your profile.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {POWER_OPTIONS.map((tag) => {
                    const active = powers.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => togglePower(tag)}
                        className={
                          "px-4 py-2 rounded-full text-xs md:text-sm border transition-all duration-150 " +
                          (active
                            ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.5)]"
                            : "border-slate-700 text-slate-200 hover:border-slate-400 hover:bg-slate-900/80")
                        }
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={startLoader}
                    className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black px-6 py-2 rounded-full text-sm font-semibold shadow-[0_0_30px_rgba(236,72,153,0.5)]"
                  >
                    Start the Hunt 🚀
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Psychology loader (your neon radar) */}
            {step === 5 && (
              <div className="flex flex-col items-center justify-center py-4 animate-fade-in">
                {/* Glassmorphism card */}
                <div className="relative w-full max-w-md rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-slate-900/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(56,189,248,0.3)] px-6 py-8 flex flex-col items-center gap-6">
                  {/* subtle glow halo */}
                  <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-blue-500/10 blur-2xl" />

                  {/* content layer */}
                  <div className="relative flex flex-col items-center gap-5">
                    {/* Radar container */}
                    <div className="relative w-52 h-52">
                      {/* outer glow ring */}
                      <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-3xl" />

                      {/* base circle */}
                      <div className="absolute inset-0 rounded-full bg-slate-950/80 border border-cyan-400/40 shadow-[0_0_30px_rgba(8,47,73,0.9)] overflow-hidden" />

                      {/* slow parallax ring */}
                      <div className="absolute inset-0 radar-parallax">
                        <div className="absolute inset-3 rounded-full border border-cyan-400/20" />
                      </div>

                      {/* concentric rings */}
                      <div className="absolute inset-5 rounded-full border border-cyan-400/30" />
                      <div className="absolute inset-9 rounded-full border border-cyan-400/20" />
                      <div className="absolute inset-13 rounded-full border border-cyan-400/10" />

                      {/* central brand core */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-300/60 shadow-[0_0_20px_rgba(34,211,238,0.8)]">
                          <span className="text-[0.65rem] tracking-[0.2em] text-cyan-100 uppercase">
                            AI
                          </span>
                        </div>
                      </div>

                      {/* pulsating wave */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="radar-pulse" />
                      </div>

                      {/* rotating sweep */}
                      <div className="absolute inset-0 radar-sweep">
                        <div className="absolute left-1/2 top-0 w-0.5 h-1/2 bg-cyan-300 rounded-full shadow-[0_0_14px_rgba(34,211,238,1)]" />
                        {/* gradient cone to feel like a real sweep */}
                        <div className="absolute left-1/2 top-0 origin-bottom-left h-1/2 w-[120%] bg-[conic-gradient(from_180deg,_rgba(34,211,238,0.7),_transparent_60deg)] opacity-70" />
                      </div>

                      {/* random blips */}
                      <div className="absolute inset-0">
                        <span className="radar-dot" style={{ top: "16%", left: "28%" }} />
                        <span className="radar-dot" style={{ top: "62%", left: "68%" }} />
                        <span className="radar-dot" style={{ top: "42%", left: "78%" }} />
                        <span className="radar-dot" style={{ top: "72%", left: "24%" }} />
                        <span className="radar-dot" style={{ top: "30%", left: "55%" }} />
                      </div>
                    </div>

                    {/* dynamic text */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-cyan-100 text-center">
                        {LOADER_MESSAGES[loadingIndex]}
                      </p>
                      <p className="text-xs text-gray-400 text-center">
                        Calibrating profile fit, endowment quirks, and hidden fee waivers…
                      </p>
                    </div>

                    {/* tiny progress bar */}
                    <div className="mt-2 w-full">
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 shimmer-bar" />
                      </div>
                      <p className="mt-2 text-[0.7rem] text-gray-500 text-center uppercase tracking-[0.2em]">
                        Funding map in progress
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
