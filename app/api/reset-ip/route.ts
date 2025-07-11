

import { NextResponse, type NextRequest } from 'next/server';
import { readIpUsage, writeIpUsage } from '@/app/api/lib/db';

// Re-enabling this endpoint for testing purposes.
export async function POST(request: NextRequest) {
    const ip = request.ip ?? '127.0.0.1';

    try {
        const ipUsageData = await readIpUsage();

        // If the IP exists in the data, delete it.
        if (ipUsageData[ip]) {
            delete ipUsageData[ip];
            await writeIpUsage(ipUsageData);
            return NextResponse.json({ message: "Your submission count has been reset." });
        } else {
            // If the IP wasn't found, there's nothing to reset.
            return NextResponse.json({ message: "No submissions found for your IP address." });
        }
    } catch (error) {
        console.error("API route /api/reset-ip failed:", error);
        
        let message = "Failed to reset submission count due to a database error.";
        if (error instanceof Error && error.message.includes('@vercel/kv: Missing required environment variable')) {
            message = "Cannot reset: The application is missing required Vercel KV database environment variables.";
        }
        
        return NextResponse.json(
            { message },
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}


export async function GET(request: NextRequest) {
    return NextResponse.json(
        { message: "This endpoint only accepts POST requests." },
        { status: 405 }
    );
}