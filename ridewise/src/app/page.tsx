import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col justify-between py-12 px-4 sm:px-6">
      <main className="max-w-3xl mx-auto w-full space-y-10">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Autonomous Dispatch & Driver Drop Recovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Every ride needs a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">Plan B.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            RideWise AI eliminates driver cancellation anxiety with conversational booking, guaranteed price locks, and instantaneous autonomous re-dispatch to backup drivers.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link
            href="/book"
            className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3.5 px-6 text-sm text-center transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
          >
            Book a Ride with Natural Language →
          </Link>
          <Link
            href="/ride"
            className="rounded-xl border border-[#1E293B] bg-[#111C30] hover:bg-[#1E293B] hover:border-slate-600 text-slate-200 font-medium py-3.5 px-6 text-sm text-center transition-all hover:-translate-y-0.5"
          >
            Open Live Ride Monitor
          </Link>
        </div>

        {/* How Plan B Recovery Works */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white">
              The Autonomous Resilience Architecture
            </h2>
            <p className="text-xs text-slate-400">
              Three-tier recovery mechanism ensuring passengers never get stranded.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#1E293B] bg-[#0B1220] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900/60 text-blue-300 text-xs font-bold font-mono">1</span>
                <span className="font-semibold text-white text-sm">Natural Language</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parse English & Hinglish prompts (e.g., <em>&quot;Cab from Koramangala to Airport for 3&quot;</em>) into structured booking payloads.
              </p>
            </div>

            <div className="rounded-xl border border-[#1E293B] bg-[#0B1220] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900/60 text-blue-300 text-xs font-bold font-mono">2</span>
                <span className="font-semibold text-white text-sm">Capacity Dispatch</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic matching against available fleet (Rajesh 4-seat, Amit 6-seat, Suresh 7-seat) at transparent ₹50 + ₹18/km pricing.
              </p>
            </div>

            <div className="rounded-xl border border-rose-900/30 bg-[#0B1220] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-950/80 text-rose-300 text-xs font-bold font-mono">3</span>
                <span className="font-semibold text-rose-200 text-sm">Plan B Recovery</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                If the driver cancels, server automatically locks original fare and reassigns to backup driver in milliseconds.
              </p>
            </div>
          </div>
        </div>

        {/* PRD Metrics & Fleet Spec */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            System Specifications & Fleet Readiness
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-xl bg-[#0B1220] border border-[#1E293B] p-3">
              <div className="text-lg font-bold text-white">₹50</div>
              <div className="text-[11px] text-slate-400">Base Fare</div>
            </div>
            <div className="rounded-xl bg-[#0B1220] border border-[#1E293B] p-3">
              <div className="text-lg font-bold text-white">₹18/km</div>
              <div className="text-[11px] text-slate-400">Distance Rate</div>
            </div>
            <div className="rounded-xl bg-[#0B1220] border border-[#1E293B] p-3">
              <div className="text-lg font-bold text-emerald-400">100%</div>
              <div className="text-[11px] text-slate-400">Price Lock on Drop</div>
            </div>
            <div className="rounded-xl bg-[#0B1220] border border-[#1E293B] p-3">
              <div className="text-lg font-bold text-blue-400">3 Drivers</div>
              <div className="text-[11px] text-slate-400">Active Fleet</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
