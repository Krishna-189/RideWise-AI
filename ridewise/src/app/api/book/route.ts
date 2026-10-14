import { NextRequest, NextResponse } from 'next/server';
import { RideWiseStore, StateTransitionError } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickup, destination, time, passengers } = body;

    if (!pickup || !destination) {
      return NextResponse.json(
        { success: false, error: 'Pickup and Destination are required.' },
        { status: 400 }
      );
    }

    const pax = parseInt(passengers, 10) || 1;
    const result = RideWiseStore.bookRide({
      pickup: pickup.trim(),
      destination: destination.trim(),
      time: (time || 'Immediate').trim(),
      passengers: pax,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          ride: result.ride,
          message: 'Booking could not be assigned to any driver with sufficient seats.',
          isDemo: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      ride: result.ride,
      message: 'Driver successfully assigned. Booking confirmed [Demo].',
      isDemo: true,
    });
  } catch (error: unknown) {
    if (error instanceof StateTransitionError) {
      return NextResponse.json(
        { success: false, error: error.message, isStateError: true },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Internal booking error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
