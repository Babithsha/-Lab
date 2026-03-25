
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Equipment, Booking, User } from '@/lib/models';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const equipments = await Equipment.find();
        const bookings = await Booking.find();
        const users = await User.find({ role: 'Student' });

        // 1. Total Bookings
        const totalBookings = bookings.length;

        // 2. Active Users (Students)
        const activeStudents = users.length;

        // 3. Equipment Stats
        const totalEquipment = equipments.length;
        const maintenanceCount = equipments.filter((e: any) => e.status === 'Maintenance').length;

        // 4. Utilization (Bookings count vs Equipment count roughly, or just simple ratio)
        // If no equipment, 0 utilization.
        const utilizationRate = totalEquipment > 0
            ? Math.round((bookings.filter((b: any) => b.status === 'Approved' || b.status === 'Ongoing').length / totalEquipment) * 100)
            : 0;

        // 5. Top Equipment (Aggregation)
        const equipmentUsage: Record<string, number> = {};
        bookings.forEach((b: any) => {
            const name = b.equipmentName || "Unknown";
            equipmentUsage[name] = (equipmentUsage[name] || 0) + 1;
        });

        const topEquipment = Object.entries(equipmentUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => {
                // Find total qty of this equipment to calc specific utilization if possible
                const item = equipments.find((e: any) => e.name === name);
                const totalQty = item?.quantity ?? 1;
                const util = Math.round((count / (totalQty * 10 || 1)) * 100); // Rough estimate
                return {
                    name,
                    bookings: count,
                    utilization: `${util}%`
                };
            });

        return NextResponse.json({
            totalBookings,
            activeStudents,
            totalEquipment,
            maintenanceCount,
            utilizationRate,
            topEquipment
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
    }
}
