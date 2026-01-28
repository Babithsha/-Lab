
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Announcement } from '@/lib/models';

export async function GET(req: NextRequest) {
    await dbConnect();
    const announcements = await Announcement.find();
    // Sort by date descending (newest first)
    announcements.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
    await dbConnect();
    const data = await req.json();
    const announcement = await Announcement.create({
        ...data,
        date: new Date().toISOString().split('T')[0] // Auto set date to today
    });
    return NextResponse.json(announcement, { status: 201 });
}
