export default function ReportPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-2">
        Funding Roadmap for You
      </h1>

      <p className="text-green-400 mb-6">
        We found ₹65 Lakhs in total funding
      </p>

      <div className="border border-gray-700 rounded-xl p-4 mb-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">
            Commonwealth Master’s Scholarship
          </h2>
          <span>🇬🇧</span>
        </div>

        <p className="mt-2">Fully Funded + Stipend</p>
        <p className="text-sm text-gray-400 mt-1">
          Deadline ends in 14 days
        </p>
      </div>
    </main>
  );
}
