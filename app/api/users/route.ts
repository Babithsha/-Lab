import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';

export async function GET(req: NextRequest) {
  await dbConnect();
  const users = await User.find();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const user = await User.create(data);
  return NextResponse.json(user, { status: 201 });
}

