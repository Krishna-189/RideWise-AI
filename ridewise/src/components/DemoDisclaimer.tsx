'use client';

export default function DemoDisclaimer() {
  return (
    <aside aria-label="Demo environment notice" className="border-b border-[#1E293B] bg-[#0E1726] px-4 py-2 text-xs text-slate-400">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-200">Demo Prototype</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-[11px] sm:text-xs">In-memory store, 3 simulated drivers</span>
        </div>
        <div className="text-slate-500 text-[10px] sm:text-[11px]">
          No Database • No Auth • No Live Maps
        </div>
      </div>
    </aside>
  );
}
