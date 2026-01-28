
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Lab } from '@/lib/models';

export async function GET(req: NextRequest) {
    await dbConnect();
    const labs = await Lab.find();
    return NextResponse.json(labs);
}

export async function POST(req: NextRequest) {
    await dbConnect();
    const data = await req.json();
    const lab = await Lab.create({
        ...data,
        equipment: 0 // Default equipment count
    });
    return NextResponse.json(lab, { status: 201 });
}
