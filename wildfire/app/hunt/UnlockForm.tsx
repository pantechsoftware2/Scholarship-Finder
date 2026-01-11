"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UnlockForm({
  scholarship,
  onClose,
}: {
  scholarship: any;
  onClose: () => void;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function isValidEmail(v: string) {
    return v.includes("@") && v.includes(".");
  }

  function isValidWhatsapp(v: string) {
    if (!v.startsWith("+91")) return false;
    const digits = v.replace("+91", "").replace(/\D/g, "");
    return digits.length === 10;
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!isValidWhatsapp(whatsapp)) {
      setError("Enter a valid WhatsApp number starting with +91 and 10 digits");
      return;
    }

    try {
      setLoading(true);

      const { error: insertError } = await supabase.from("leads").insert({
        name,
        email,
        whatsapp,
        scholarship_id: scholarship.id,
      });

      if (insertError) throw insertError;

      router.push(`/report/${scholarship.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong while unlocking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 shadow-[0_0_40px_rgba(15,23,42,0.9)] px-6 py-7 md:px-7 md:py-8 animate-fade-in">
        {/* halo */}
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/15 via-fuchsia-500/15 to-blue-500/15 blur-2xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-200 text-xs"
        >
          ✕
        </button>

        <div className="relative space-y-5">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              We found matches
            </p>
            <h2 className="text-xl md:text-2xl font-semibold">
              We found{" "}
              <span className="text-cyan-300">
                6 high‑probability matches
              </span>
              .
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Send the full unlocked report for{" "}
              <span className="text-cyan-200 font-medium">
                {scholarship?.title}
              </span>{" "}
              straight to your inbox and WhatsApp.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/70"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/70"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">
                WhatsApp number (India)
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/70"
              />
              <p className="text-[0.65rem] text-slate-500">
                Auto‑validated for +91. No spam, only this report & follow‑ups.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-xl">
                ⚠ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black py-2.75 rounded-full text-sm font-semibold shadow-[0_0_28px_rgba(236,72,153,0.6)] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-1"
            >
              {loading ? "Unlocking your report…" : "Unlock Report 🔓"}
            </button>
          </form>

          <p className="text-[0.65rem] text-slate-500 text-center">
            By unlocking, you agree to receive this report on email and WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
