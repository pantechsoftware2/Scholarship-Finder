// app/components/SiteFooter.tsx
"use client";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-800/80 pt-6 pb-4 text-[0.7rem] text-slate-400">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold text-slate-200 text-xs">
            desiScholarshipMap
          </p>
          <p className="max-w-xs">
            Curating high‑probability, legit scholarships for Indian students
            dreaming of USA, UK, Canada, Europe and beyond.
          </p>
          <p className="text-slate-500">
            Not a university or agent. We just do the homework for you.
          </p>
        </div>

        <div className="flex gap-8 text-[0.7rem]">
          <div className="space-y-1">
            <p className="font-semibold text-slate-200 text-xs">Scholarships</p>
            <button className="block text-left hover:text-cyan-300">
              Masters Funding
            </button>
            <button className="block text-left hover:text-cyan-300">
              Fully‑funded Programs
            </button>
            <button className="block text-left hover:text-cyan-300">
              Need‑based & Merit‑based
            </button>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-200 text-xs">Support</p>
            <button className="block text-left hover:text-cyan-300">
              FAQ
            </button>
            <button className="block text-left hover:text-cyan-300">
              Email us
            </button>
            <button className="block text-left hover:text-cyan-300">
              Privacy & Terms
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-slate-500">
        <p>© {new Date().getFullYear()} desiScholarshipMap. All rights reserved.</p>
        <p>
          Built in India for students who want to study abroad without burning
          their parents&apos; savings.
        </p>
      </div>
    </footer>
  );
}
