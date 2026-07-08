// app/scan/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const messages = [
  "Scanning 450+ University Endowments...",
  "Filtering for Indian Citizen eligibility...",
  "Removing expired deadlines...",
  "Verifying GRE waivers...",
];

export default function ScanPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [reportId, setReportId] = useState<string | null>(null);

  // Read rid from the URL query string on the client, no useSearchParams
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const rid = url.searchParams.get("rid");
    setReportId(rid);
  }, []);

  useEffect(() => {
    // rotate message text every second
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      1000
    );

    // after ~5 seconds go to gate
    const timeout = setTimeout(() => {
      if (reportId) {
        router.replace(`/gate/${reportId}`);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [reportId, router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* radar circle */}
        <div className="relative h-40 w-40 rounded-full border border-cyan-400/60 flex items-center justify-center">
          <motion.div
            className="absolute inset-4 rounded-full border border-purple-500/60"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="h-4 w-4 bg-cyan-400 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.8)]" />
        </div>

        <p className="text-sm text-zinc-300">{messages[index]}</p>
        <p className="text-[0.7rem] text-zinc-500">
          Finding only active, Indian‑eligible funding for your profile…
        </p>
      </div>
    </main>
  );
}
