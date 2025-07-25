
import { NextResponse } from 'next/server';
import { readStats } from '@/app/api/lib/db';

export const dynamic = 'force-dynamic'; // Ensures the route is always executed dynamically.

export async function GET() {
    try {
        const stats = await readStats();
        return NextResponse.json(stats);
    } catch (error) {
         console.error("API route /api/stats failed to read DB:", error);
         
         let message = "Service is temporarily unavailable due to a database error.";
         // Check for a specific configuration error message from @vercel/kv
         if (error instanceof Error && error.message.includes('@vercel/kv: Missing required environment variable')) {
             message = "Configuration Error: The application is missing required Vercel KV database environment variables. Please check your project's deployment settings.";
         }

         return NextResponse.json(
            { message },
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
