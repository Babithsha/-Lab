import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { createMockModel } from '@/lib/local-db';

const Experiment = createMockModel('Experiment', {});

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    const { id } = params;
    const data = await req.json();

    const updated = await Experiment.findByIdAndUpdate(id, data);

    if (!updated) {
        return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    const { id } = params;

    const deleted = await Experiment.findByIdAndDelete(id);

    if (!deleted) {
        return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Experiment deleted successfully" });
}
