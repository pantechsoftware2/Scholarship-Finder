"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  "Scanning 450+ university endowments...",
  "Filtering for Indian citizen eligibility...",
  "Removing expired deadlines...",
  "Verifying GRE waivers..."
];

export default function LoadingPage() {
  const router = useRouter();
  const [text, setText] = useState(steps[0]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setText(steps[i]);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      router.push("/report/demo");
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center text-xl animate-pulse">
      {text}
    </main>
  );
}
