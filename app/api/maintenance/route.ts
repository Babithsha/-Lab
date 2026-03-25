import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { MaintenanceLog } from '@/lib/models';

export async function GET(req: NextRequest) {
    await dbConnect();
    const logs = await MaintenanceLog.find().sort({ date: -1 });
    return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
    await dbConnect();
    const data = await req.json();
    const newLog = await MaintenanceLog.create(data);
    return NextResponse.json(newLog, { status: 201 });
}
