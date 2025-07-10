
import { NextResponse } from 'next/server';
import { readStats } from '@/app/api/lib/db';

const defaultStats = { og_bonkgang: 0, hung_hing: 0, street_gang: 0 };

export async function GET() {
    try {
        const stats = await readStats();
        return NextResponse.json(stats);
    } catch (error) {
         console.error("Failed to read stats DB:", error);
         return NextResponse.json(defaultStats, { 
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
