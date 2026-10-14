'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { parseBookingSentence } from '@/lib/parseBookingPrompt';
import { FareDetails } from '@/lib/types';

const PRESET_EXAMPLES = [
  {
    label: 'Ghaziabad to NDLS (3 passengers)',
    text: 'Kal subah 7 baje Ghaziabad se New Delhi Railway Station, 3 passengers',
  },
  {
    label: 'Noida to IGI Airport (2 passengers)',
    text: 'Noida to IGI Airport, 2 passengers',
  },
  {
    label: 'Indirapuram to Connaught Place (1 passenger)',
    text: 'Indirapuram to Connaught Place, 1 passenger',
  },
  {
    label: 'Ghaziabad to Jaipur (6 passengers)',
    text: 'Ghaziabad to Jaipur, 6 passengers',
  },
];

interface DummyDriverPreview {
  id: string;
  name: string;
  vehicle: string;
  seats: number;
  available: boolean;
}

export default function BookPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Natural language sentence with Indian default
  const [promptText, setPromptText] = useState(
    'Kal subah 7 baje Ghaziabad se New Delhi Railway Station, 3 passengers'
  );

  // Form states with Indian defaults & date/time
  const [pickup, setPickup] = useState('Ghaziabad');
  const [destination, setDestination] = useState('New Delhi Railway Station');
  const [time, setTime] = useState('Tomorrow, 7:00 AM');
  const [passengers, setPassengers] = useState<number>(3);

  // Fare calculation state
  const [fare, setFare] = useState<FareDetails | null>(null);
  const [loadingFare, setLoadingFare] = useState(false);

  // Fleet state
  const [drivers, setDrivers] = useState<DummyDriverPreview[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Reset demo state & message
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleParse = (textToParse: string) => {
    const parsed = parseBookingSentence(textToParse);
    if (parsed.pickup) setPickup(parsed.pickup);
    if (parsed.destination) setDestination(parsed.destination);
    if (parsed.time) setTime(parsed.time);
    if (parsed.passengers) setPassengers(parsed.passengers);
    setErrorBanner(null);
  };

  const fetchDrivers = () => {
    fetch('/api/ride')
      .then((res) => res.json())
      .then((data) => {
        if (data.drivers) setDrivers(data.drivers);
      })
      .catch((err) => console.error('Failed to load fleet info', err));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleReset = async () => {
    setResetLoading(true);
    setErrorBanner(null);
    setResetMessage(null);
    try {
      const res = await fetch('/api/ride/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.state?.drivers) {
          setDrivers(data.state.drivers);
        } else {
          fetchDrivers();
        }
        setResetMessage('Demo reset: all 3 drivers available, booking and events cleared.');
        setTimeout(() => setResetMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to reset demo', err);
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    if (!pickup.trim() || !destination.trim()) {
      setFare(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingFare(true);
      try {
        const res = await fetch('/api/fare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pickup,
            destination,
            passengers,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setFare(data.fare);
        }
      } catch (err) {
        console.error('Failed to calculate fare', err);
      } finally {
        setLoadingFare(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [pickup, destination, passengers]);

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setBookingLoading(true);

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          destination,
          time,
          passengers,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorBanner(
          data.error || 'No eligible drivers currently available with sufficient seating.'
        );
        fetchDrivers();
        return;
      }

      startTransition(() => {
        router.push('/ride');
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Booking failed';
      setErrorBanner(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const expectedDriver = drivers.find((d) => d.available && d.seats >= passengers);

  return (
    <div className="min-h-screen bg-[#0B1220] text-white py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with Title and Reset demo button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Book a Ride
            </h1>
            <p className="text-sm text-slate-400">
              Enter a ride sentence or edit the fields below to calculate fare and match an eligible driver.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetLoading}
              className="rounded-xl border border-[#1E293B] bg-[#111C30] px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer disabled:opacity-50"
            >
              {resetLoading ? 'Resetting...' : 'Reset demo'}
            </button>
          </div>
        </div>

        {/* Short confirmation message */}
        {resetMessage && (
          <div className="rounded-xl border border-[#1E293B] bg-[#111C30] p-4 text-xs text-slate-200">
            <span className="font-semibold block text-white">Confirmation:</span>
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Card 1: Smart Booking Assistant */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="prompt-input" className="text-sm font-medium text-slate-200">
              Ride Request
            </label>
            <span className="text-xs text-slate-400 font-mono">Smart Booking Assistant</span>
          </div>

          <textarea
            id="prompt-input"
            rows={2}
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              handleParse(e.target.value);
            }}
            placeholder="e.g. Kal subah 7 baje Ghaziabad se New Delhi Railway Station, 3 passengers"
            className="w-full rounded-xl border border-[#1E293B] bg-[#0B1220] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors resize-none"
          />

          {/* Quick preset Indian routes */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium block">Sample Routes:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_EXAMPLES.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPromptText(preset.text);
                    handleParse(preset.text);
                  }}
                  className="rounded-lg border border-[#1E293B] bg-[#111C30] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-[#2563EB] hover:bg-[#1E293B] transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parsed summary */}
          <div className="pt-3 border-t border-[#1E293B] flex flex-wrap gap-4 text-xs text-slate-400">
            <div>
              <span className="text-slate-500">Pickup:</span>{' '}
              <span className="text-slate-200 font-medium">{pickup || 'None'}</span>
            </div>
            <div>
              <span className="text-slate-500">Destination:</span>{' '}
              <span className="text-slate-200 font-medium">{destination || 'None'}</span>
            </div>
            <div>
              <span className="text-slate-500">Pickup Time:</span>{' '}
              <span className="text-slate-200 font-medium">{time || 'Tomorrow, 7:00 AM'}</span>
            </div>
            <div>
              <span className="text-slate-500">Passengers:</span>{' '}
              <span className="text-slate-200 font-medium">{passengers}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Editable Form + Fare Estimate */}
        <form onSubmit={handleBookRide} className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#1E293B] pb-4">
            <h2 className="text-base font-medium text-white">Ride Details & Fare Estimate</h2>
            <p className="text-xs text-slate-400 mt-1">
              Confirm your route, date, and passenger count.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pickup-input" className="text-xs font-medium text-slate-300">
                Pickup Location
              </label>
              <input
                id="pickup-input"
                type="text"
                required
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full rounded-xl border border-[#1E293B] bg-[#0B1220] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-colors"
                placeholder="e.g. Ghaziabad"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="destination-input" className="text-xs font-medium text-slate-300">
                Destination
              </label>
              <input
                id="destination-input"
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-[#1E293B] bg-[#0B1220] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-colors"
                placeholder="e.g. New Delhi Railway Station"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="time-input" className="text-xs font-medium text-slate-300">
                Pickup Date & Time
              </label>
              <input
                id="time-input"
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-[#1E293B] bg-[#0B1220] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-colors"
                placeholder="e.g. Tomorrow, 7:00 AM"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="passengers-input" className="text-xs font-medium text-slate-300">
                  Passengers
                </label>
                <span className="text-[11px] text-slate-500">Fleet max: 7 seats</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="passengers-input"
                  type="number"
                  min={1}
                  max={7}
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-xl border border-[#1E293B] bg-[#0B1220] px-3 py-2.5 text-sm text-center font-medium text-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-colors"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPassengers(num)}
                      className={`px-3 py-2 text-xs rounded-xl border transition-colors cursor-pointer ${
                        passengers === num
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-[#111C30] text-slate-300 border-[#1E293B] hover:text-white hover:bg-[#1E293B]'
                      }`}
                    >
                      {num} {num === 1 ? 'pax' : 'pax'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fare Estimate Breakdown */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0B1220] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">Fare Estimate</span>
                <span className="rounded bg-[#111C30] border border-[#1E293B] px-2 py-0.5 text-[10px] text-amber-300 font-medium">
                  Illustrative Estimate
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">base (₹50) + distance × ₹18/km</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 block">Base Fare</span>
                <span className="font-medium text-white">₹50.00</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Distance</span>
                <span className="font-medium text-white">
                  {loadingFare ? '...' : fare ? `${fare.distanceKm} km` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Est. Duration</span>
                <span className="font-medium text-white">
                  {loadingFare ? '...' : fare?.estimatedDurationMinutes ? `~${fare.estimatedDurationMinutes} mins` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Rate / km</span>
                <span className="font-medium text-white">₹18.00</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Fare</span>
                <span className="font-semibold text-white text-sm">
                  {loadingFare ? '...' : fare ? `₹${fare.totalFare.toFixed(2)}` : '₹0.00'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-[#1E293B]/60">
              * Illustrative estimate — calculated deterministically for demo purposes (PRD FR-04). Price remains locked if driver cancels.
            </p>
          </div>

          {/* Error notice */}
          {errorBanner && (
            <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-3.5 text-xs text-red-200">
              <span className="font-semibold block text-red-100">Booking Error:</span>
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Large primary book button */}
          <button
            type="submit"
            disabled={bookingLoading || !pickup.trim() || !destination.trim()}
            className="w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium py-3.5 px-6 text-sm sm:text-base transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {bookingLoading ? 'Assigning Eligible Driver...' : 'Book Ride'}
          </button>
        </form>

        {/* Card 3: Driver Fleet Overview */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#1E293B] pb-3">
            <div>
              <h3 className="text-sm font-medium text-white">Fleet Capacity (3 Drivers)</h3>
              <p className="text-xs text-slate-400">
                Rule: Assigns first available driver with seats ≥ {passengers}.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Target Driver:{' '}
              <span className="font-medium text-white">
                {expectedDriver ? `${expectedDriver.name} (${expectedDriver.seats} seats)` : 'None available'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {drivers.map((driver) => {
              const hasCapacity = driver.seats >= passengers;
              const isEligible = driver.available && hasCapacity;
              const isNextMatch = expectedDriver?.id === driver.id;

              return (
                <div
                  key={driver.id}
                  className={`rounded-xl border p-4 space-y-2 transition-colors ${
                    isNextMatch
                      ? 'border-[#2563EB] bg-[#111C30]'
                      : !driver.available
                      ? 'border-[#1E293B]/60 bg-[#0B1220]/50 opacity-50'
                      : 'border-[#1E293B] bg-[#0B1220]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{driver.name}</span>
                    {isNextMatch && (
                      <span className="rounded bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Next
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{driver.vehicle}</div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1E293B]/60 text-slate-400">
                    <span>{driver.seats} seats</span>
                    <span>
                      {!driver.available
                        ? 'Unavailable'
                        : isEligible
                        ? 'Eligible'
                        : 'Insufficient seats'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
