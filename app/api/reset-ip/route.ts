
import { NextResponse, type NextRequest } from 'next/server';
import { readIpUsage, writeIpUsage } from '@/app/api/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const ip = request.ip ?? '127.0.0.1';

    try {
        const ipUsageData = await readIpUsage();

        if (ipUsageData[ip]) {
            delete ipUsageData[ip];
            await writeIpUsage(ipUsageData);
            return NextResponse.json({ message: `Usage data for IP ${ip} has been reset.` });
        } else {
            return NextResponse.json({ message: `No usage data found for IP ${ip}. Nothing to do.` });
        }
    } catch (error) {
        console.error("API route /api/reset-ip failed to modify DB:", error);
        
        let message = "Service is temporarily unavailable due to a database error during reset.";
        if (error instanceof Error && error.message.includes('@vercel/kv: Missing required environment variable')) {
            message = "Configuration Error: The application is missing required Vercel KV database environment variables. Please check your project's deployment settings.";
        }
        
        return NextResponse.json(
            { message },
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
