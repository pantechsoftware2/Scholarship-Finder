"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BottomSheet } from "@/app/components/MobileOptimized";

type UnlockFormProps = {
  reportId: string;
  scholarshipTitle: string;
  onClose: () => void;
  onUnlocked: (args: { email: string; name: string }) => void;
};

export default function UnlockForm({
  reportId,
  scholarshipTitle,
  onClose,
  onUnlocked,
}: UnlockFormProps) {
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
      setError("Enter valid WhatsApp: +91 + 10 digits");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/unlock-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("unlock-report failed:", res.status, body);
        throw new Error("Failed to save your details. Try again.");
      }

      const { magicLink } = await res.json();

      if (typeof window !== "undefined") {
        window.localStorage.setItem("userName", name.trim());
      }

      onUnlocked({ email: email.trim(), name: name.trim() });

      setTimeout(() => {
        router.push(magicLink);
      }, 500);
    } catch (err: any) {
      console.error("Unlock error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // If the title looks like "Demo Scholarship X", hide it in the copy
  const isDemo =
    scholarshipTitle.toLowerCase().startsWith("demo scholarship");

  const content = (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          We found matches
        </p>
        <h2 className="text-lg md:text-2xl font-semibold">
          Get your <span className="text-cyan-300">Funding Roadmap</span>
        </h2>
        <p className="text-xs text-slate-400">
          {isDemo ? (
            <>Send your full scholarship report to your inbox and WhatsApp.</>
          ) : (
            <>
              Send full report for{" "}
              <span className="text-cyan-200 font-medium">
                {scholarshipTitle}
              </span>{" "}
              to your inbox and WhatsApp.
            </>
          )}
        </p>
      </div>

      {/* Social login row (UI only) */}
      <div className="space-y-2">
        <p className="text-[0.7rem] text-slate-400 text-center">
          Continue with
        </p>
        <div className="grid grid-cols-4 gap-2">
          {/* Google */}
          <button
            type="button"
            disabled={loading}
            className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/80 py-2 hover:border-slate-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-4 w-4"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 31.9 29.3 35 24 35 16.8 35 11 29.2 11 22S16.8 9 24 9c3.3 0 6.3 1.2 8.6 3.3L38.4 6.5C34.9 3.4 29.8 1.5 24 1.5 11.9 1.5 2 11.4 2 23.5S11.9 45.5 24 45.5 46 35.6 46 23.5c0-1.1-.1-2.1-.4-3z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.5 15.5 18.9 12 24 12c3.3 0 6.3 1.2 8.6 3.3l5.8-5.8C34.9 6.4 29.8 4.5 24 4.5 15.5 4.5 8.4 9.5 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 42.5c5.2 0 10.1-2 13.7-5.3L31.7 32C29.4 33.7 26.8 34.5 24 34.5c-5.2 0-9.6-3.1-11.4-7.6l-6.5 5C8.4 37.5 15.5 42.5 24 42.5z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5.3-5.6 6.9l6 5.2C39.9 36.4 42 30.3 42 23.5c0-1.1-.1-2.1-.4-3z"
              />
            </svg>
          </button>

          {/* Facebook */}
          <button
            type="button"
            disabled={loading}
            className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/80 py-2 hover:border-slate-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4"
            >
              <path
                fill="#1877F2"
                d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078v-3.49h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.492 0-1.957.93-1.957 1.887v2.262h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.1 24 12.073z"
              />
            </svg>
          </button>

          {/* LinkedIn */}
          <button
            type="button"
            disabled={loading}
            className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/80 py-2 hover:border-slate-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4"
            >
              <path
                fill="#0A66C2"
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.367-1.85 3.6 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.225.792 24 1.771 24h20.451C23.2 24 24 23.225 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
              />
            </svg>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            disabled={loading}
            className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/80 py-2 hover:border-slate-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 1227"
              className="h-4 w-4"
            >
              <path
                fill="#fff"
                d="M714.163 519.284L1160.89 0H1055.03L668.027 450.887 364.225 0H0L469.555 681.821 0 1226.37H105.868L515.138 748.68 835.776 1226.37H1200L714.137 519.284H714.163ZM566.338 686.087L520.83 619.445 144.279 79.694h166.018L552.33 442.369 597.838 509.011 989.51 1147.68H823.492L566.338 686.113V686.087Z"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-[0.65rem] text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleUnlock} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300">Full Name</label>
          <motion.input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Priya Sharma"
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-3 text-sm md:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-300">Email</label>
          <motion.input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-3 text-sm md:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-300">WhatsApp</label>
          <motion.input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-3 text-sm md:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <p className="text-[0.65rem] text-slate-500">
            Auto‑validated for +91. No spam, only this report & key updates.
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-xl"
          >
            ⚠ {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          className="w-full min-h-[44px] bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black py-3 rounded-full text-sm font-semibold shadow-[0_0_28px_rgba(236,72,153,0.6)] disabled:opacity-60 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                ⚙️
              </motion.span>
              Unlocking…
            </span>
          ) : (
            "Unlock Report 🔓"
          )}
        </motion.button>
      </form>

      <p className="text-[0.65rem] text-slate-500 text-center">
        By unlocking, you agree to receive this report on email and WhatsApp.
      </p>
    </div>
  );

  return (
    <BottomSheet isOpen={true} onClose={onClose} title="Unlock Scholarships">
      {content}
    </BottomSheet>
  );
}
