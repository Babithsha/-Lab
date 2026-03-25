import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking, Equipment } from '@/lib/models';

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

    // If equipment is being marked as returned, include return timestamp
    if (data.status === 'Returned' && !data.returnedAt) {
        updateData.returnedAt = new Date().toISOString();
    }

    // Fetch the existing booking to compare status
    const existingBooking = await Booking.findById(id);

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBooking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // ── Auto-update equipment available count when booking status changes ──
    if (existingBooking && data.status && existingBooking.status !== data.status) {
        const prevStatus = existingBooking.status;
        const newStatus = data.status;

        // Determine which equipment to update
        const equipmentId = existingBooking.equipmentId;
        if (equipmentId) {
            const equipment = await Equipment.findById(equipmentId);
            if (equipment) {
                let newAvailable = equipment.available ?? equipment.quantity ?? 0;

                // Moving from an active state to a released state
                const isNowReleased = ['Returned', 'Rejected', 'Cancelled', 'Denied'].includes(newStatus);
                const wasActive = ['Pending', 'Approved'].includes(prevStatus);
                
                // Moving from a released state back to an active state
                const isNowActive = ['Pending', 'Approved'].includes(newStatus);
                const wasReleased = ['Returned', 'Rejected', 'Cancelled', 'Denied'].includes(prevStatus);

                if (isNowReleased && wasActive) {
                    const maxQty = equipment.quantity ?? 1;
                    newAvailable = Math.min(maxQty, newAvailable + 1);
                } else if (isNowActive && wasReleased) {
                    newAvailable = Math.max(0, newAvailable - 1);
                }

                await Equipment.findByIdAndUpdate(equipmentId, { available: newAvailable });
            }
        }
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

    // Restore equipment availability if the deleted booking was active
    if (deletedBooking.status === 'Pending' || deletedBooking.status === 'Approved') {
        if (deletedBooking.equipmentId) {
            const equipment = await Equipment.findById(deletedBooking.equipmentId);
            if (equipment) {
                const maxQty = equipment.quantity ?? 1;
                const newAvailable = Math.min(maxQty, (equipment.available ?? maxQty) + 1);
                await Equipment.findByIdAndUpdate(deletedBooking.equipmentId, { available: newAvailable });
            }
        }
    }

    return NextResponse.json({ message: "Booking deleted successfully", booking: deletedBooking });
}
