"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HuntPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const countries = ["USA 🇺🇸", "UK 🇬🇧", "Canada 🇨🇦", "Europe 🇪🇺"];

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 px-4">
      <h2 className="text-3xl font-bold">Where are we flying? ✈️</h2>

      <div className="grid grid-cols-2 gap-4">
        {countries.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`px-6 py-5 rounded-xl border text-lg transition-all ${
              selected === c
                ? "border-fuchsia-500 shadow-lg shadow-fuchsia-500/40"
                : "border-gray-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={() => router.push("/loading")}
        className="px-6 py-3 rounded-full bg-fuchsia-500 text-black font-semibold disabled:opacity-40"
      >
        Continue →
      </button>
    </main>
  );
}
