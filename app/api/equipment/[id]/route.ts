import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Equipment } from '@/lib/models';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    const { id } = params;
    const data = await req.json();

    const updatedItem = await Equipment.findByIdAndUpdate(id, data, { new: true });

    if (!updatedItem) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    const { id } = params;

    const deletedItem = await Equipment.findByIdAndDelete(id);

    if (!deletedItem) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item deleted successfully" });
}
