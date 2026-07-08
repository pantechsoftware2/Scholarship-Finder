// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const tickerItems = [
  "🔥 Rohan (Delhi) just unlocked ₹12L for ASU",
  "🚀 Priya (Bangalore) found a 100% waiver for UK",
  "🌍 Ayaan (Mumbai) matched 3 fully funded EU programs",
  "📚 Kavya (Hyderabad) unlocked ₹18L for Canada",
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <section className="max-w-3xl text-center space-y-6">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">
            Scholarship Finder 2.0
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
            Your ₹50 Lakh Scholarship is Hiding.
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto">
            AI‑powered funding hunter for Indian students. We find the money
            others miss so your study‑abroad dream does not die on Google.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/flow")}
            className="relative inline-flex items-center justify-center px-10 py-3.5 rounded-full text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 shadow-[0_0_30px_rgba(56,189,248,0.7)]"
          >
            <span className="absolute inset-0 rounded-full bg-cyan-400/40 blur-xl animate-pulse" />
            <span className="relative z-10">Start the Hunt</span>
          </motion.button>

          <p className="text-[0.7rem] text-slate-500">
            No PDFs. No agents. Just live AI search tuned for Indian Gen Z.
          </p>
        </section>
      </div>

      {/* social proof ticker */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-black/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl overflow-hidden py-2">
          <div className="flex items-center gap-2 text-[0.7rem] text-slate-300">
            <span className="px-2 py-1 rounded-full bg-slate-900 text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
              Live unlocks
            </span>
            <div className="relative flex-1 overflow-hidden">
              <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 30,
                  ease: "linear",
                }}
              >
                {[...tickerItems, ...tickerItems].map((item, idx) => (
                  <span key={idx}>{item}</span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
