import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { createMockModel } from '@/lib/local-db';

// Create Experiment model
const Experiment = createMockModel('Experiment', {});

export async function GET(req: NextRequest) {
    await dbConnect();
    const experiments = await Experiment.find();
    return NextResponse.json(experiments);
}

export async function POST(req: NextRequest) {
    await dbConnect();
    const data = await req.json();
    const experiment = await Experiment.create(data);
    return NextResponse.json(experiment);
}
