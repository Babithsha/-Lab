import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking } from '@/lib/models';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const query = userId ? { userId } : {};
  const bookings = await Booking.find(query);

  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const booking = await Booking.create(data);
  return NextResponse.json(booking, { status: 201 });
}

