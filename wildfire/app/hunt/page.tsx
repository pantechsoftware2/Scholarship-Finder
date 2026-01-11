"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import UnlockForm from "./UnlockForm";

type Scholarship = {
  id: string;
  title: string;
  country: string;
  funding_amount: number;
  funding_currency: string;
  benefits: string;
  deadline: string;
};

export default function HuntPage() {
  const [data, setData] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔑 unlock states (MUST be here, before return)
  const [showUnlock, setShowUnlock] = useState(false);
  const [selectedScholarship, setSelectedScholarship] =
    useState<Scholarship | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("scholarships")
          .select("*")
          .order("deadline", { ascending: true });

        if (error) throw error;
        setData(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-10 text-white bg-black">Loading...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-500 bg-black">{error}</div>;
  }

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">
        Finding Roadmap 🚀
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {data.map((s, index) => {
          const locked = index >= 2;

          return (
            <div
              key={s.id}
              className={`relative border border-gray-800 p-6 rounded-xl bg-gray-900 ${
                locked ? "blur-sm" : "hover:border-blue-500"
              }`}
            >
              <h2 className="text-2xl font-bold">{s.title}</h2>
              <p className="text-gray-400">{s.country}</p>
              <p className="text-green-400 font-semibold">
                ₹{s.funding_amount.toLocaleString("en-IN")}
              </p>
              <p className="text-orange-400">
                Deadline: {s.deadline}
              </p>

              {locked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setSelectedScholarship(s);
                      setShowUnlock(true);
                    }}
                    className="bg-blue-500 px-5 py-2 rounded-lg font-semibold"
                  >
                    Unlock Full Report 🔓
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🔓 Unlock Modal */}
      {showUnlock && selectedScholarship && (
        <UnlockForm
          scholarship={selectedScholarship}
          onClose={() => setShowUnlock(false)}
        />
      )}
    </div>
  );
}
