import { NextRequest, NextResponse } from 'next/server';
import { RideWiseStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  // Reading req ensure dynamic evaluation under nextConfig.cacheComponents
  const _url = req.url;
  const currentRide = RideWiseStore.getCurrentRide();
  const drivers = RideWiseStore.getDrivers();
  const state = RideWiseStore.getState();

  return NextResponse.json({
    success: true,
    ride: currentRide,
    history: RideWiseStore.getRideHistory(),
    drivers,
    stats: state.stats,
    isDemo: true,
  });
}
