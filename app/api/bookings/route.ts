import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking, Equipment } from '@/lib/models';

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

  if (data.equipmentId) {
    const equipment = await Equipment.findById(data.equipmentId);
    if (!equipment) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
    }
    
    const currentAvailable = equipment.available ?? equipment.quantity ?? 0;
    
    if (currentAvailable <= 0) {
      return NextResponse.json({ error: "Equipment is currently out of stock" }, { status: 400 });
    }
    
    // Decrement availability immediately for Pending/Approved bookings
    equipment.available = currentAvailable - 1;
    await equipment.save();
  }

  const booking = await Booking.create(data);
  return NextResponse.json(booking, { status: 201 });
}

