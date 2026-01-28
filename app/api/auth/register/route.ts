
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, password, role } = body;
        const email = body.email?.toLowerCase();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        const newUser = await User.create({
            name,
            email,
            password, // In real app, hash this!
            role
        });

        return NextResponse.json({ message: "User created", user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
