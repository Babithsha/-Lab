
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Announcement } from '@/lib/models';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    const { id } = params;
    const data = await req.json();

    const updated = await Announcement.findByIdAndUpdate(id, data);
    if (!updated) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    const { id } = params;

    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted successfully" });
}
