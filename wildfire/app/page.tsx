import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 text-center px-4">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
        Your ₹50 Lakh Scholarship is Hiding.
      </h1>

      <p className="text-gray-400 max-w-xl">
        AI-powered funding hunter for Indian students. We find the money others miss.
      </p>

      <Link
        href="/hunt"
        className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 text-black font-semibold animate-pulse"
      >
        Start the Hunt 🔥
      </Link>
    </main>
  );
}
