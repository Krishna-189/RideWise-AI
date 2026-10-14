'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Driver, RideBooking, RideStatus } from '@/lib/types';

export default function RidePage() {
  const [ride, setRide] = useState<RideBooking | null>(null);
  const [history, setHistory] = useState<RideBooking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRideData = useCallback(async () => {
    try {
      const res = await fetch('/api/ride');
      const data = await res.json();
      if (data.success) {
        setRide(data.ride);
        setDrivers(data.drivers || []);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching ride data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRideData();
  }, [fetchRideData]);

  const handleAction = async (action: 'driver_cancel' | 'complete' | 'reset') => {
    setActionLoading(action);
    setActionError(null);
    setToastMessage(null);

    try {
      const res = await fetch('/api/ride/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isStateTransitionError) {
          setActionError(`Backend State Machine Error: ${data.error}`);
        } else {
          setActionError(data.error || 'Action failed');
        }
      } else {
        setToastMessage(data.message || 'Action executed successfully.');
      }

      await fetchRideData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setActionError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickBook = async () => {
    setActionLoading('quick_book');
    setActionError(null);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: 'Ghaziabad',
          destination: 'New Delhi Railway Station',
          time: 'Tomorrow, 7:00 AM',
          passengers: 3,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage('Sample ride booked successfully.');
        await fetchRideData();
      } else {
        setActionError(data.error || 'Failed to book sample ride');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusLabel = (status: RideStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'recovery_in_progress':
        return 'Recovery in progress';
      case 'completed':
        return 'Completed';
      case 'unfulfilled':
        return 'Unfulfilled';
      default:
        return status;
    }
  };

  const isConfirmed = ride?.status === 'confirmed';
  const isUnfulfilled = ride?.status === 'unfulfilled';
  const isCompleted = ride?.status === 'completed';

  return (
    <div className="min-h-screen bg-[#0B1220] text-white py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Title without Demo badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Ride Status & Recovery
            </h1>
            <p className="text-sm text-slate-400">
              Manage ride execution and simulate driver drop-recovery protocols.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/book"
              className="rounded-xl border border-[#1E293B] bg-[#111C30] px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors"
            >
              Back to Booking
            </Link>
            <button
              onClick={() => handleAction('reset')}
              disabled={actionLoading !== null}
              className="rounded-xl border border-[#1E293B] bg-[#111C30] px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* Notifications & Dynamic Announcements */}
        <div aria-live="polite" aria-atomic="true">
          {actionError && (
            <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-xs text-red-200 flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="font-semibold block text-red-100 mb-0.5">State Transition Error</span>
                <span>{actionError}</span>
              </div>
              <button
                onClick={() => setActionError(null)}
                className="text-red-400 hover:text-red-200 text-sm font-semibold px-1"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {toastMessage && (
            <div className="rounded-xl border border-blue-900/60 bg-blue-950/40 p-4 text-xs text-blue-200 flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="font-semibold block text-blue-100 mb-0.5">Status Update</span>
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-blue-400 hover:text-blue-200 text-sm font-semibold px-1"
                aria-label="Dismiss update"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading ride and fleet status...
          </div>
        )}

        {/* Empty state */}
        {!loading && !ride && (
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-8 sm:p-12 text-center space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-medium text-white">No Active Ride</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No ride has been requested yet. Book a ride or start a sample journey to test autonomous recovery.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/book"
                className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-5 py-3 text-sm font-medium text-white transition-colors"
              >
                Go to Booking Page
              </Link>
              <button
                onClick={handleQuickBook}
                disabled={actionLoading !== null}
                className="rounded-xl border border-[#1E293B] bg-[#111C30] hover:bg-[#1E293B] px-4 py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {actionLoading === 'quick_book' ? 'Booking Sample...' : 'Start Sample Ride'}
              </button>
            </div>
          </div>
        )}

        {/* Active Ride Content */}
        {!loading && ride && (
          <div className="space-y-6">
            {/* Interactive Simulation Controls */}
            <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">Simulation Controls</h2>
                  <p className="text-xs text-slate-400">Trigger fallback recovery or lifecycle transitions</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Current Status: <span className="text-white font-semibold">{getStatusLabel(ride.status)}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Action 1: Driver cancels */}
                <button
                  type="button"
                  id="btn-driver-cancels"
                  onClick={() => handleAction('driver_cancel')}
                  disabled={!isConfirmed || actionLoading !== null}
                  className="rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/30 hover:border-rose-500/50 p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer space-y-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Recovery Test</span>
                    {actionLoading === 'driver_cancel' && <span className="text-[10px] text-rose-300 animate-spin">⏳</span>}
                  </div>
                  <div className="text-sm font-semibold text-rose-100">Simulate Driver Cancellation</div>
                  <p className="text-xs text-rose-300/80 leading-snug">
                    Triggers autonomous re-dispatch to backup driver with price guarantee lock.
                  </p>
                </button>

                {/* Action 2: Complete trip */}
                <button
                  type="button"
                  id="btn-complete-trip"
                  onClick={() => handleAction('complete')}
                  disabled={!isConfirmed || actionLoading !== null}
                  className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer space-y-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Lifecycle</span>
                    {actionLoading === 'complete' && <span className="text-[10px] text-blue-200 animate-spin">⏳</span>}
                  </div>
                  <div className="text-sm font-semibold text-white">Complete Trip</div>
                  <p className="text-xs text-blue-100/80 leading-snug">
                    Marks journey as completed and releases driver back to fleet.
                  </p>
                </button>

                {/* Action 3: Reset demo */}
                <button
                  type="button"
                  id="btn-reset-demo"
                  onClick={() => handleAction('reset')}
                  disabled={actionLoading !== null}
                  className="rounded-xl border border-[#1E293B] bg-[#0B1220] hover:bg-[#111C30] p-4 text-left transition-all disabled:opacity-40 cursor-pointer space-y-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reset</span>
                    {actionLoading === 'reset' && <span className="text-[10px] text-slate-300 animate-spin">⏳</span>}
                  </div>
                  <div className="text-sm font-semibold text-white">Reset Demo</div>
                  <p className="text-xs text-slate-400 leading-snug">
                    Restores all 3 drivers to available and clears the booking.
                  </p>
                </button>
              </div>
            </div>

            {/* Card 2: Ride Summary with ₹ and km */}
            <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-base font-medium text-white">Ride Summary</h2>
                  <p className="text-xs text-slate-400">Active trip specifications and assigned driver.</p>
                </div>
                <div className="rounded-lg border border-[#1E293B] bg-[#111C30] px-3 py-1 text-xs font-medium text-white">
                  {getStatusLabel(ride.status)}
                </div>
              </div>

              {/* Unfulfilled Notice */}
              {isUnfulfilled && (
                <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-xs text-red-200 space-y-1">
                  <div className="font-semibold text-red-100 text-sm">Status: Unfulfilled</div>
                  <p className="leading-relaxed">
                    {ride.unfulfilledReason ||
                      'All 3 fleet drivers have either cancelled or lack the required capacity. No replacement driver is currently available.'}
                  </p>
                </div>
              )}

              {/* Completed Notice */}
              {isCompleted && (
                <div className="rounded-xl border border-[#1E293B] bg-[#111C30] p-4 text-xs text-slate-200 space-y-1">
                  <div className="font-semibold text-white text-sm">Trip Completed</div>
                  <p className="text-slate-400">
                    The ride has completed successfully and the driver is marked available.
                  </p>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Pickup</span>
                  <span className="font-medium text-white">{ride.pickup}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Destination</span>
                  <span className="font-medium text-white">{ride.destination}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Pickup Date & Time</span>
                  <span className="font-medium text-white">{ride.time}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Passengers</span>
                  <span className="font-medium text-white">{ride.passengers} passenger(s)</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Distance</span>
                  <span className="font-medium text-white font-mono">
                    {ride.fare.distanceKm ?? ride.fare.distanceMiles} km
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Est. Duration</span>
                  <span className="font-medium text-white font-mono">
                    {ride.fare.estimatedDurationMinutes ? `~${ride.fare.estimatedDurationMinutes} mins` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Total Fare (Locked)</span>
                  <span className="font-semibold text-emerald-400 font-mono text-base">
                    ₹{ride.fare.totalFare.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Driver Section */}
              <div className="pt-4 border-t border-[#1E293B] space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned Driver
                </h3>

                {ride.currentDriver ? (
                  <div className="rounded-xl border border-[#1E293B] bg-[#0B1220] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div>
                      <div className="font-medium text-white text-base">
                        {ride.currentDriver.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {ride.currentDriver.vehicle} • {ride.currentDriver.seats} seats
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between text-xs text-slate-400">
                      <div>Plate: <span className="font-mono text-white">{ride.currentDriver.plate}</span></div>
                      <div>Rating: <span className="text-white">{ride.currentDriver.rating}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#1E293B] bg-[#0B1220] p-4 text-xs text-slate-400">
                    No driver currently assigned.
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Dummy Fleet Status */}
            <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-xs text-slate-400">
                <h3 className="font-medium text-white text-sm">Fleet Status (3 Drivers)</h3>
                <span>In-Memory Server State</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {drivers.map((d) => {
                  const isCurrent = ride.currentDriver?.id === d.id;
                  const isCancelled = ride.cancelledDriverIds?.includes(d.id);

                  return (
                    <div
                      key={d.id}
                      className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${isCurrent
                          ? 'border-[#2563EB] bg-[#111C30]'
                          : isCancelled
                            ? 'border-rose-900/40 bg-[#0B1220]/40 opacity-50'
                            : 'border-[#1E293B] bg-[#0B1220]'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{d.name}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isCurrent
                            ? 'bg-blue-900/60 text-blue-200 border border-blue-700/50'
                            : isCancelled
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-900/50'
                              : d.available
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900/50'
                                : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isCurrent ? 'Active' : isCancelled ? 'Cancelled' : d.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{d.vehicle}</div>
                      <div className="text-slate-500 text-[11px]">{d.seats} seats</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 4: Event History */}
            <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <h3 className="text-sm font-medium text-white">Event History</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {ride.events.length} event(s)
                </span>
              </div>

              <div className="space-y-3">
                {ride.events.map((evt) => {
                  const badgeStyle = {
                    danger: 'bg-rose-950/50 text-rose-300 border-rose-800/60',
                    warning: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
                    success: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60',
                    info: 'bg-blue-950/50 text-blue-300 border-blue-800/60',
                  }[evt.badge || 'info'] || 'bg-[#111C30] text-slate-300 border-[#1E293B]';

                  return (
                    <div
                      key={evt.id}
                      className="rounded-xl border border-[#1E293B] bg-[#0B1220] p-4 text-xs space-y-1.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${badgeStyle}`}>
                            {evt.type}
                          </span>
                          <span className="font-semibold text-white">{evt.title}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{evt.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pt-0.5">{evt.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Card 5: Persisted Trip History (PRD FR-13) */}
        {!loading && history.length > 0 && (
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Trip History (PRD FR-13)</h3>
                <p className="text-xs text-slate-400">Archived completed journeys from this session</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{history.length} trip(s)</span>
            </div>

            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border border-[#1E293B] bg-[#0B1220] p-4 text-xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="font-semibold text-white text-sm">
                      {h.pickup} → {h.destination}
                    </div>
                    <span className="rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-900/50 px-2.5 py-0.5 text-[10px] font-medium self-start sm:self-auto">
                      Completed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Distance & Time</span>
                      <span>{h.fare.distanceKm} km ({h.time})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Fare Paid</span>
                      <span className="font-mono text-white">₹{h.fare.totalFare.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Driver</span>
                      <span>{h.currentDriver?.name ?? 'Assigned'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Passengers</span>
                      <span>{h.passengers} seat(s)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
