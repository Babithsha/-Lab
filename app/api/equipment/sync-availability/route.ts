import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Equipment, Booking } from '@/lib/models';

/**
 * POST /api/equipment/sync-availability
 *
 * Recalculates the `available` count for every piece of equipment
 * from the ground truth of active (Approved) bookings in the database.
 *
 * Available = Total Quantity − Number of currently Approved bookings
 *
 * Call this endpoint once to fix any equipment records that have
 * incorrect available counts due to historical data issues.
 */
export async function POST(req: NextRequest) {
    await dbConnect();

    const allEquipment = await Equipment.find();
    const results: { name: string; quantity: number; active: number; newAvailable: number }[] = [];

    for (const item of allEquipment) {
        // Count active bookings (Pending or Approved) for this equipment
        const activeCount = await Booking.countDocuments({
            equipmentId: item._id.toString(),
            status: { $in: ['Approved', 'Pending'] },
        });

        const quantity = item.quantity ?? 1;
        const newAvailable = Math.max(0, quantity - activeCount);

        await Equipment.findByIdAndUpdate(item._id, { available: newAvailable });

        results.push({
            name: item.name,
            quantity,
            active: activeCount,
            newAvailable,
        });
    }

    return NextResponse.json({
        message: 'Equipment availability synced successfully',
        updated: results.length,
        details: results,
    });
}
