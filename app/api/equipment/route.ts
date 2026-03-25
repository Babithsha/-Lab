import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Equipment } from '@/lib/models';

export async function GET(req: NextRequest) {
  await dbConnect();
  // Seeding removed to allow clean slate
  const equipment = await Equipment.find();
  return NextResponse.json(equipment);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  // Ensure available is always set correctly — defaults to quantity if not specified
  if (data.quantity !== undefined && data.available === undefined) {
    data.available = data.quantity;
  }
  const item = await Equipment.create(data);
  return NextResponse.json(item, { status: 201 });
}

