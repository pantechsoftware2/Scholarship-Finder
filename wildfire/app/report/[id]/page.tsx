"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("Invalid report ID");
      setLoading(false);
      return;
    }

    console.log("Fetching report for ID:", id);

    const fetchReport = async () => {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Supabase error:", error);
        setError("Report not found.");
      } else {
        setData(data);
      }

      setLoading(false);
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
  <main className="min-h-screen bg-black text-white p-10">
    <h1 className="text-4xl font-bold mb-6">
      {data.title}
    </h1>

    <div className="space-y-3 text-lg">
      <p><span className="font-semibold">Country:</span> {data.country}</p>
      <p>
        <span className="font-semibold">Funding:</span>{" "}
        {data.funding_amount} {data.funding_currency}
      </p>
      <p>
        <span className="font-semibold">Benefits:</span>{" "}
        {data.benefits}
      </p>
      <p>
        <span className="font-semibold">Deadline:</span>{" "}
        {data.deadline}
      </p>
    </div>
  </main>
);

}
