import { Driver, FareDetails, RideBooking, RideEvent, RideStatus, StoreState } from './types';

// 3 Indian dummy drivers strictly conforming to the specification
const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'driver-1',
    name: 'Rajesh',
    vehicle: 'Swift Dzire',
    seats: 4,
    available: true,
    rating: 4.9,
    avatar: 'Rajesh',
    plate: 'UP 14 AB 1234',
  },
  {
    id: 'driver-2',
    name: 'Amit',
    vehicle: 'Ertiga',
    seats: 6,
    available: true,
    rating: 4.8,
    avatar: 'Amit',
    plate: 'DL 1C XY 5678',
  },
  {
    id: 'driver-3',
    name: 'Suresh',
    vehicle: 'Innova',
    seats: 7,
    available: true,
    rating: 4.95,
    avatar: 'Suresh',
    plate: 'UP 16 CD 9012',
  },
];

// Valid state machine transitions
const VALID_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  idle: ['requested'],
  requested: ['confirmed', 'unfulfilled'],
  confirmed: ['recovery_in_progress', 'completed', 'cancelled'],
  recovery_in_progress: ['confirmed', 'unfulfilled'],
  completed: ['idle'],
  unfulfilled: ['idle'],
  cancelled: ['idle'],
};

// Global singleton container for Next.js hot reload safety
declare global {
  // eslint-disable-next-line no-var
  var __ridewise_store: StoreState | undefined;
}

function getInitialState(): StoreState {
  return {
    drivers: JSON.parse(JSON.stringify(INITIAL_DRIVERS)),
    currentRide: null,
    rideHistory: [],
    stats: {
      totalBookings: 0,
      recoveriesAttempted: 0,
      recoveriesSucceeded: 0,
      tripsCompleted: 0,
    },
  };
}

if (!globalThis.__ridewise_store) {
  globalThis.__ridewise_store = getInitialState();
}

const store = globalThis.__ridewise_store;

export class StateTransitionError extends Error {
  constructor(public currentStatus: RideStatus, public targetStatus: RideStatus) {
    super(
      `Invalid state transition: Cannot move from "${currentStatus}" to "${targetStatus}". Backend state machine rejected request.`
    );
    this.name = 'StateTransitionError';
  }
}

export function assertValidTransition(current: RideStatus, next: RideStatus): void {
  const allowed = VALID_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new StateTransitionError(current, next);
  }
}

/**
 * Backend distance and fare calculation
 * Fare = ₹50 base + (distance x ₹18 per km)
 * Estimated duration: ~2.5 mins per km in typical city traffic + 5 mins buffer
 */
export function calculateFare(
  pickup: string,
  destination: string,
  passengers: number = 1
): FareDetails {
  const baseFare = 50.0; // ₹50 base fare
  const ratePerKm = 18.0; // ₹18 per km

  // Deterministic realistic distance calculation based on input characters
  const seedString = `${pickup.trim().toLowerCase()}_to_${destination.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) & 0xffffffff;
  }
  const positiveHash = Math.abs(hash);
  // Realistic distance in km, e.g. between 8.0 and 38.5 km
  const distanceKm = parseFloat(((positiveHash % 305) / 10 + 8.0).toFixed(1));

  const calculatedTotal = baseFare + distanceKm * ratePerKm;
  const totalFare = parseFloat(calculatedTotal.toFixed(2));

  const distanceMiles = parseFloat((distanceKm * 0.621371).toFixed(1));
  const ratePerMile = parseFloat((ratePerKm / 0.621371).toFixed(2));
  const estimatedDurationMinutes = Math.round(distanceKm * 2.5 + 5);

  return {
    baseFare,
    distanceKm,
    ratePerKm,
    totalFare,
    estimatedDurationMinutes,
    distanceMiles,
    ratePerMile,
  };
}

function createEvent(
  type: RideEvent['type'],
  title: string,
  description: string,
  badge: RideEvent['badge']
): RideEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type,
    title,
    description,
    badge,
  };
}

export const RideWiseStore = {
  getState(): StoreState {
    return store;
  },

  getDrivers(): Driver[] {
    return store.drivers;
  },

  getCurrentRide(): RideBooking | null {
    return store.currentRide;
  },

  /**
   * Book a ride:
   * Assigns the first eligible driver whose seats >= passengers and available == true
   */
  bookRide(params: {
    pickup: string;
    destination: string;
    time: string;
    passengers: number;
  }): { success: boolean; ride?: RideBooking; error?: string } {
    const { pickup, destination, time, passengers } = params;

    if (!pickup || !destination) {
      return { success: false, error: 'Pickup and destination are required' };
    }
    const paxCount = Math.max(1, passengers || 1);
    const fare = calculateFare(pickup, destination, paxCount);

    const rideId = `ride-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const events: RideEvent[] = [
      createEvent(
        'CREATED',
        'Ride Requested',
        `Booking submitted for ${paxCount} passenger(s) from "${pickup}" to "${destination}" at ${time}. Fare calculated: ₹${fare.totalFare.toFixed(2)}.`,
        'info'
      ),
    ];

    // Find first eligible driver: seats >= passengers and available === true
    const eligibleDriverIndex = store.drivers.findIndex(
      (d) => d.available && d.seats >= paxCount
    );

    if (eligibleDriverIndex === -1) {
      assertValidTransition('requested', 'unfulfilled');
      const unfulfilledRide: RideBooking = {
        id: rideId,
        pickup,
        destination,
        time,
        passengers: paxCount,
        fare,
        status: 'unfulfilled',
        currentDriver: null,
        cancelledDriverIds: [],
        events: [
          ...events,
          createEvent(
            'RECOVERY_FAILED',
            'No Eligible Drivers Available',
            `No drivers currently available with capacity for ${paxCount} passenger(s).`,
            'danger'
          ),
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
        unfulfilledReason: `No fleet driver currently available with at least ${paxCount} seats.`,
      };
      store.currentRide = unfulfilledRide;
      return {
        success: false,
        ride: unfulfilledRide,
        error: `No driver currently available with >= ${paxCount} seats`,
      };
    }

    assertValidTransition('requested', 'confirmed');
    const assignedDriver = store.drivers[eligibleDriverIndex];
    assignedDriver.available = false;

    events.push(
      createEvent(
        'ASSIGNED',
        'Driver Assigned & Confirmed',
        `${assignedDriver.name} (${assignedDriver.vehicle}, ${assignedDriver.seats} seats) assigned to your ride. Status: confirmed.`,
        'success'
      )
    );

    const confirmedRide: RideBooking = {
      id: rideId,
      pickup,
      destination,
      time,
      passengers: paxCount,
      fare,
      status: 'confirmed',
      currentDriver: assignedDriver,
      cancelledDriverIds: [],
      events,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.currentRide = confirmedRide;
    store.stats.totalBookings += 1;

    return { success: true, ride: confirmedRide };
  },

  /**
   * Driver Cancels flow:
   * status goes confirmed -> recovery_in_progress -> confirmed (if replacement found)
   * or recovery_in_progress -> unfulfilled (if none left)
   */
  simulateDriverCancel(): {
    success: boolean;
    ride: RideBooking;
    message: string;
  } {
    const ride = store.currentRide;
    if (!ride) {
      throw new Error('No active ride found to cancel driver.');
    }

    assertValidTransition(ride.status, 'recovery_in_progress');

    ride.status = 'recovery_in_progress';
    const oldDriver = ride.currentDriver;
    const oldDriverName = oldDriver ? oldDriver.name : 'Assigned Driver';

    if (oldDriver) {
      ride.cancelledDriverIds.push(oldDriver.id);
      const driverInFleet = store.drivers.find((d) => d.id === oldDriver.id);
      if (driverInFleet) {
        driverInFleet.available = false;
      }
    }

    ride.events.push(
      createEvent(
        'DRIVER_CANCELLED',
        'Driver Cancelled',
        `${oldDriverName} cancelled the trip. RideWise AI Autonomous Recovery initiated. Status: recovery_in_progress.`,
        'warning'
      )
    );

    ride.events.push(
      createEvent(
        'RECOVERY_STARTED',
        'Searching Next Eligible Driver',
        `Filtering fleet for available drivers with capacity >= ${ride.passengers} passenger(s) excluding previous cancelled drivers...`,
        'info'
      )
    );

    store.stats.recoveriesAttempted += 1;

    const nextDriver = store.drivers.find(
      (d) =>
        d.available &&
        d.seats >= ride.passengers &&
        !ride.cancelledDriverIds.includes(d.id)
    );

    if (nextDriver) {
      assertValidTransition('recovery_in_progress', 'confirmed');
      nextDriver.available = false;
      ride.currentDriver = nextDriver;
      ride.status = 'confirmed';
      ride.updatedAt = new Date().toISOString();

      ride.events.push(
        createEvent(
          'REASSIGNED',
          'Autonomous Recovery Succeeded',
          `Found replacement driver! Reassigned to ${nextDriver.name} (${nextDriver.vehicle}, ${nextDriver.seats} seats). Fare remains locked at ₹${ride.fare.totalFare.toFixed(2)}. Status: confirmed.`,
          'success'
        )
      );

      store.stats.recoveriesSucceeded += 1;

      return {
        success: true,
        ride,
        message: `Recovery successful: ${nextDriver.name} reassigned to your ride.`,
      };
    } else {
      assertValidTransition('recovery_in_progress', 'unfulfilled');
      ride.currentDriver = null;
      ride.status = 'unfulfilled';
      ride.updatedAt = new Date().toISOString();
      const honestMsg = `All 3 fleet drivers have either cancelled or lack the required capacity. No replacement driver is currently available.`;
      ride.unfulfilledReason = honestMsg;

      ride.events.push(
        createEvent(
          'RECOVERY_FAILED',
          'Autonomous Recovery Unfulfilled',
          honestMsg,
          'danger'
        )
      );

      return {
        success: false,
        ride,
        message: honestMsg,
      };
    }
  },

  /**
   * Complete trip:
   * status goes confirmed -> completed
   */
  completeTrip(): { success: boolean; ride: RideBooking; message: string } {
    const ride = store.currentRide;
    if (!ride) {
      throw new Error('No active ride found to complete.');
    }

    assertValidTransition(ride.status, 'completed');

    ride.status = 'completed';
    ride.updatedAt = new Date().toISOString();

    if (ride.currentDriver) {
      const driverInFleet = store.drivers.find((d) => d.id === ride.currentDriver?.id);
      if (driverInFleet) {
        driverInFleet.available = true;
      }
    }

    ride.events.push(
      createEvent(
        'COMPLETED',
        'Trip Completed',
        `Trip to ${ride.destination} completed successfully. Fare: ₹${ride.fare.totalFare.toFixed(2)}. Driver is now marked available.`,
        'success'
      )
    );

    store.stats.tripsCompleted += 1;

    // Archive in history (FR-13)
    if (!store.rideHistory) {
      store.rideHistory = [];
    }
    store.rideHistory.unshift(JSON.parse(JSON.stringify(ride)));

    return {
      success: true,
      ride,
      message: 'Trip completed successfully.',
    };
  },

  getRideHistory(): RideBooking[] {
    return store.rideHistory || [];
  },

  /**
   * Reset store
   */
  resetDemo(): StoreState {
    store.drivers = JSON.parse(JSON.stringify(INITIAL_DRIVERS));
    if (store.currentRide) {
      store.currentRide.events.push(
        createEvent(
          'RESET',
          'Demo Store Reset',
          'Demo state and all 3 drivers have been restored to initial available status.',
          'info'
        )
      );
    }
    store.currentRide = null;
    store.rideHistory = [];
    return store;
  },
};
