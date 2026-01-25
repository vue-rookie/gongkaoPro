import { NextResponse } from 'next/server';
import { MEMBERSHIP_PLANS } from '@/config/membershipPlans';

export async function GET() {
  return NextResponse.json({
    success: true,
    plans: MEMBERSHIP_PLANS
  });
}
