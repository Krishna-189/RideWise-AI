import { NextRequest, NextResponse } from 'next/server';
import { calculateFare } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickup = '', destination = '', passengers = 1 } = body;

    const fare = calculateFare(pickup, destination, Number(passengers) || 1);

    return NextResponse.json({
      success: true,
      fare,
      formula: 'Fare = ₹50 Base + (Distance x ₹18/km)',
      isDemo: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to calculate fare';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
