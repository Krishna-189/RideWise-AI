export type RideStatus =
  | 'idle'
  | 'requested'
  | 'confirmed'
  | 'recovery_in_progress'
  | 'completed'
  | 'unfulfilled'
  | 'cancelled';

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  seats: number;
  available: boolean;
  rating: number;
  avatar: string;
  plate: string;
}

export interface FareDetails {
  baseFare: number;
  distanceKm: number;
  ratePerKm: number;
  totalFare: number;
  estimatedDurationMinutes?: number;
  distanceMiles?: number;
  ratePerMile?: number;
}

export interface RideEvent {
  id: string;
  timestamp: string;
  type:
    | 'CREATED'
    | 'ASSIGNED'
    | 'DRIVER_CANCELLED'
    | 'RECOVERY_STARTED'
    | 'REASSIGNED'
    | 'RECOVERY_FAILED'
    | 'COMPLETED'
    | 'RESET';
  title: string;
  description: string;
  badge: 'info' | 'warning' | 'success' | 'danger';
}

export interface RideBooking {
  id: string;
  pickup: string;
  destination: string;
  time: string;
  passengers: number;
  fare: FareDetails;
  status: RideStatus;
  currentDriver: Driver | null;
  cancelledDriverIds: string[];
  events: RideEvent[];
  createdAt: string;
  updatedAt: string;
  unfulfilledReason?: string;
}

export interface StoreState {
  drivers: Driver[];
  currentRide: RideBooking | null;
  rideHistory: RideBooking[];
  stats: {
    totalBookings: number;
    recoveriesAttempted: number;
    recoveriesSucceeded: number;
    tripsCompleted: number;
  };
}
