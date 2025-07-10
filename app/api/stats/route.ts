

import { NextResponse } from 'next/server';
import { readStats } from '@/app/api/lib/db';

export const dynamic = 'force-dynamic'; // Ensures the route is always executed dynamically.

export async function GET() {
    try {
        const stats = await readStats();
        return NextResponse.json(stats);
    } catch (error) {
         console.error("API route /api/stats failed to read DB:", error);
         return NextResponse.json(
            { message: "Service is temporarily unavailable due to a database error." },
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}