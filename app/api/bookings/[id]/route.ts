import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking } from '@/lib/models';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    const { id } = params;
    const data = await req.json();

    // Support for adding damage fine information
    const updateData: any = { ...data };

    // If damage fine is being added, include timestamp
    if (data.damageFine && !data.damageFineAddedAt) {
        updateData.damageFineAddedAt = new Date().toISOString();
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData);

    if (!updatedBooking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBooking);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    const { id } = params;

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Booking deleted successfully", booking: deletedBooking });
}
