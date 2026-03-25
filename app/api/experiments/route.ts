import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Experiment } from '@/lib/models';

export async function GET(req: NextRequest) {
    await dbConnect();
    const experiments = await Experiment.find();
    return NextResponse.json(experiments);
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const data = await req.json();
        const experiment = await Experiment.create(data);
        return NextResponse.json(experiment);
    } catch (error: any) {
        console.error("Experiment Save Error:", error);
        return NextResponse.json({ error: error.message || "Failed to save experiment" }, { status: 500 });
    }
}
