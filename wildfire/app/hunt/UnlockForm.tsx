"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BottomSheet, useIsMobile } from "@/app/components/MobileOptimized";

export default function UnlockForm({
  scholarship,
  onClose,
}: {
  scholarship: any;
  onClose: () => void;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();

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

      console.log("🔍 Form data:", {
        name,
        email,
        whatsapp,
        scholarship_id: scholarship.id,
      });

      // 1️⃣ SAVE TO SUPABASE
      const { data, error: insertError } = await supabase
        .from("leads")
        .insert({
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          scholarship_id: scholarship.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Insert error:", insertError);
        throw insertError;
      }

      console.log("✅ Lead saved:", data);

      const reportLink =
        typeof window !== "undefined"
          ? `${window.location.origin}/report/${scholarship.id}`
          : "";

      // 2️⃣ SEND EMAIL
      console.log("📧 Sending email...");
      const emailRes = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "welcome",
          email,
          name,
          reportLink,
        }),
      });

      if (emailRes.ok) {
        console.log("✅ Email sent!");
      }

      // 3️⃣ REDIRECT
      setTimeout(() => {
        router.push(`/report/${scholarship.id}`);
      }, 800);
    } catch (err: any) {
      console.error("💥 Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          We found matches
        </p>
        <h2 className="text-lg md:text-2xl font-semibold">
          We found <span className="text-cyan-300">6 matches</span>
        </h2>
        <p className="text-xs text-slate-400">
          Send report for{" "}
          <span className="text-cyan-200 font-medium">
            {scholarship?.title}
          </span>{" "}
          to your inbox.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleUnlock} className="space-y-3">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300">Full Name</label>
          <motion.input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John wick"
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-3.5 py-3 text-sm md:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Email */}
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

        {/* WhatsApp */}
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
            Auto‑validated for +91. No spam, only this report & updates.
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-xl"
          >
            ⚠ {error}
          </motion.p>
        )}

        {/* Button */}
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

      {/* Footer */}
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
