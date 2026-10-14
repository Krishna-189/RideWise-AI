import { NextRequest, NextResponse } from 'next/server';
import { RideWiseStore, StateTransitionError } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action parameter is required.' }, { status: 400 });
    }

    if (action === 'driver_cancel') {
      const result = RideWiseStore.simulateDriverCancel();
      return NextResponse.json({
        success: result.success,
        ride: result.ride,
        message: result.message,
        isDemo: true,
      });
    }

    if (action === 'complete') {
      const result = RideWiseStore.completeTrip();
      return NextResponse.json({
        success: result.success,
        ride: result.ride,
        message: result.message,
        isDemo: true,
      });
    }

    if (action === 'reset') {
      const newState = RideWiseStore.resetDemo();
      return NextResponse.json({
        success: true,
        message: 'Demo state and dummy fleet successfully reset [Demo].',
        state: newState,
        isDemo: true,
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action: "${action}"` }, { status: 400 });
  } catch (error: unknown) {
    if (error instanceof StateTransitionError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          currentStatus: error.currentStatus,
          targetStatus: error.targetStatus,
          isStateTransitionError: true,
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Action execution failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
