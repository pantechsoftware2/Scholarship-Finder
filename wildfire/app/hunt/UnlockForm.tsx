"use client";

export default function UnlockForm({
  scholarship,
  onClose,
}: {
  scholarship: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md text-white">
        <h2 className="text-2xl font-bold mb-3">
          Unlock Scholarship Report
        </h2>

        <p className="text-gray-400 mb-4">
          Enter your details to unlock full access.
        </p>

        <input
          placeholder="Your Email"
          className="w-full p-2 mb-3 rounded bg-black border border-gray-700"
        />

        <button className="w-full bg-blue-500 py-2 rounded font-semibold">
          Unlock 🔓
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
